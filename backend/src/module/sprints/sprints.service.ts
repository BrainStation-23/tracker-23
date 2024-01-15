import { TasksDatabase } from 'src/database/tasks';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  User,
  UserWorkspaceStatus,
  Session,
  Role,
  IntegrationType,
} from '@prisma/client';
import { GetSprintListQueryDto } from './dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { APIException } from '../exception/api.exception';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { JiraClientService } from '../helper/client';
import {
  NewSprintViewQueryDto,
  SprintViewReqBodyDto,
} from './dto/sprintView.dto';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
@Injectable()
export class SprintsService {
  constructor(
    private integrationsService: IntegrationsService,
    private userIntegrationDatabase: UserIntegrationDatabase,
    private workspacesService: WorkspacesService,
    private projectDatabase: ProjectDatabase,
    private sprintDatabase: SprintDatabase,
    private sprintTaskDatabase: SprintTaskDatabase,
    private tasksDatabase: TasksDatabase,
    private jiraApiCalls: JiraApiCalls,
    private jiraClient: JiraClientService,
  ) {}

  async createSprintAndTask(
    user: User,
    projectId: number,
    userIntegrationId: number,
  ) {
    const sprint_list: any[] = [];
    const issue_list: any[] = [];
    const sprintResponses: any[] = [];
    const resolvedPromiseSprintTask: any[] = [];
    const projectBoardIds: any[] = [];
    const mappedSprintWithJiraId = new Map<number, any>();

    const project = await this.projectDatabase.getProjectById(projectId);
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace)
      throw new APIException('Can not sync with jira', HttpStatus.BAD_REQUEST);
    const userIntegration = await this.sprintDatabase.getUserIntegration(
      userIntegrationId,
    );
    if (!userIntegration) {
      throw new APIException(
        'User Integration not found!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const boardUrl = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/agile/1.0/board`;
    const boardList = await this.jiraClient.CallJira(
      userIntegration,
      this.jiraApiCalls.getBoardList,
      boardUrl,
    );
    for (let index = 0; index < boardList.total; index++) {
      const board = boardList.values[index];
      if (board.location.projectId === project?.projectId) {
        projectBoardIds.push(board.id);
      }
    }

    const task_list = await this.sprintDatabase.getTaskByProjectIdAndSource(
      projectId,
    );
    for (let index = 0, len = projectBoardIds.length; index < len; index++) {
      for (let startAt = 0; ; startAt += 50) {
        const sprintUrl = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/agile/1.0/board/${projectBoardIds[index]}/sprint`;
        const sprintRes = await this.jiraClient.CallJira(
          userIntegration,
          this.jiraApiCalls.getJiraSprint,
          sprintUrl,
          { startAt, maxResults: 50 },
        );
        if (!sprintRes) {
          break;
        }
        sprintResponses.push(...sprintRes.data.values);
        if (sprintRes?.data?.isLast === true) {
          break;
        }
      }
    }

    const localDbSprints = await this.sprintDatabase.findSprintListByProjectId(
      projectId,
    );
    for (let index = 0, len = sprintResponses.length; index < len; index++) {
      const sprint = sprintResponses[index];
      if (!mappedSprintWithJiraId.has(Number(sprint.id))) {
        mappedSprintWithJiraId.set(Number(sprint.id), sprint);
      }
    }

    for (let index = 0, len = localDbSprints.length; index < len; index++) {
      const jiraSprintId = localDbSprints[index].jiraSprintId;
      const jiraSprint = mappedSprintWithJiraId.get(jiraSprintId);
      if (
        (jiraSprint?.startDate &&
          new Date(jiraSprint.startDate).getTime() !==
            localDbSprints[index]?.startDate?.getTime()) ||
        (jiraSprint?.completeDate &&
          new Date(jiraSprint.completeDate).getTime() !==
            localDbSprints[index]?.completeDate?.getTime())
      ) {
        await this.sprintDatabase.updateSprints(localDbSprints[index].id, {
          state: jiraSprint.state,
          ...(jiraSprint.startDate && { startDate: jiraSprint.startDate }),
          ...(jiraSprint.completeDate && {
            completeDate: jiraSprint.completeDate,
          }),
        });
      }
      jiraSprintId && mappedSprintWithJiraId.delete(jiraSprintId);
    }

    for (const [jiraSprintId, val] of mappedSprintWithJiraId) {
      sprint_list.push({
        jiraSprintId: jiraSprintId,
        projectId: projectId,
        state: val.state,
        name: val.name,
        startDate: val.startDate
          ? new Date(val.startDate)
          : new Date(val.createdDate),
        endDate: val.endDate ? new Date(val.endDate) : null,
        completeDate: val.completeDate
          ? new Date(val.completeDate)
          : val.endDate
          ? new Date(val.endDate)
          : null,
      });
    }

    const [crtSprint, sprints] = await Promise.all([
      await this.sprintDatabase.createSprints(sprint_list),
      await this.sprintDatabase.findSprintListByProjectId(projectId),
    ]);

    //relation between sprintId and jiraSprintId
    const mappedSprintId = new Map<number, number>();
    for (let index = 0; index < sprints.length; index++) {
      mappedSprintId.set(
        Number(sprints[index].jiraSprintId),
        sprints[index].id,
      );
    }

    //relation between taskId and integratedTaskId
    const mappedTaskId = new Map<number, number>();
    for (let index = 0; index < task_list.length; index++) {
      mappedTaskId.set(
        Number(task_list[index].integratedTaskId),
        task_list[index].id,
      );
    }
    //relation between {sprintId, taskId} and sprintTaskId
    const existingTaskOfSprintMapped = new Map<string, number>();
    for (let index = 0, len = sprints.length; index < len; index++) {
      const sprint = sprints[index];

      //jira task fetch by sprint id
      for (let startAt = 0; startAt < 5000; startAt += 50) {
        const sprintIssueUrl = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/agile/1.0/sprint/${sprint.jiraSprintId}/issue`;
        const res = await this.jiraClient.CallJira(
          userIntegration,
          this.jiraApiCalls.getSprintIssueList,
          sprintIssueUrl,
          { startAt, maxResults: 50 },
        );
        resolvedPromiseSprintTask.push(res);

        if (res.data.issues.length < 50) {
          break;
        }
      }

      for (let idx = 0; idx < sprint.sprintTask.length; idx++) {
        const sprintTask = sprint.sprintTask[idx];
        existingTaskOfSprintMapped.set(
          JSON.stringify({
            sprintId: sprintTask.sprintId,
            taskId: sprintTask.taskId,
          }),
          sprintTask.id,
        );
      }
    }

    for (
      let index = 0, len = resolvedPromiseSprintTask.length;
      index < len;
      index++
    ) {
      const res = resolvedPromiseSprintTask[index];
      const urlArray = res.config.url.split('/');
      const jiraSprintId = urlArray[urlArray.length - 2];
      const sprintId = mappedSprintId.get(Number(jiraSprintId));

      res.data.issues.map((issue: any) => {
        const taskId = mappedTaskId.get(Number(issue.id));
        if (
          taskId &&
          sprintId &&
          !existingTaskOfSprintMapped.has(
            JSON.stringify({ sprintId: sprintId, taskId: taskId }),
          )
        ) {
          issue_list.push({
            sprintId: sprintId,
            taskId: taskId,
          });
          existingTaskOfSprintMapped.set(
            JSON.stringify({ sprintId: sprintId, taskId: taskId }),
            1,
          );
        }

        if (issue?.fields?.subtasks.length) {
          for (
            let subIdx = 0, subTaskLen = issue?.fields?.subtasks.length;
            subIdx < subTaskLen;
            subIdx++
          ) {
            const subTaskId = mappedTaskId.get(
              Number(issue?.fields?.subtasks[subIdx].id),
            );
            if (
              subTaskId &&
              sprintId &&
              !existingTaskOfSprintMapped.has(
                JSON.stringify({ sprintId: sprintId, taskId: subTaskId }),
              )
            ) {
              issue_list.push({
                sprintId: sprintId,
                taskId: subTaskId,
              });

              existingTaskOfSprintMapped.set(
                JSON.stringify({ sprintId: sprintId, taskId: subTaskId }),
                1,
              );
            }
          }
        }
      });
    }

    const sprintIds: number[] = Array.from(mappedSprintId.values());
    const [createdSprintTask, sprintTasks] = await Promise.all([
      await this.sprintTaskDatabase.createSprintTask(issue_list),
      await this.sprintTaskDatabase.findSprintTaskBySprintIds(sprintIds),
    ]);

    return { total: sprintTasks.length, sprintTasks };
  }

  async getSprintList(user: User) {
    const projectIds: number[] = await this.getProjectIds(user);

    return await this.sprintDatabase.findSprintListByProjectIdList(projectIds);
  }

  async getActiveSprintTasks(user: User, reqBody: GetSprintListQueryDto) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace || !user.activeWorkspaceId)
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );

    const projectIds: number[] = await this.getProjectIds(user);
    const { priority, status, text } = reqBody;
    const priority1: any[] = (priority as unknown as string)?.split(',');
    const status1: any[] = (status as unknown as string)?.split(',');
    const st = reqBody.state as unknown as string;
    let array: string[] = [];
    array = st.split(',').map((item) => item.trim());

    const sprints = await this.sprintDatabase.getSprintList({
      projectId: { in: projectIds },
      state: { in: array },
    });

    const sprintIds = sprints.map((sprint) => Number(sprint.id));
    const taskIds = await this.getSprintTasksIds(sprintIds);

    return await this.tasksDatabase.getActiveSprintTasksWithSessions({
      taskIds,
      userWorkspaceId: userWorkspace.id,
      ...(priority1 && { priority: priority1 }),
      ...(status1 && { status: status1 }),
      ...(text && { text }),
    });
  }

  async getSprintTasksIds(sprintIds: number[]) {
    const getSprintTasks =
      await this.sprintTaskDatabase.findSprintTaskBySprintIds(sprintIds);

    const taskIds: number[] = [];
    for (let index = 0; index < getSprintTasks.length; index++) {
      const val = getSprintTasks[index];
      val && taskIds.push(val.taskId);
    }

    return taskIds;
  }

  async getProjectIds(user: User): Promise<number[] | []> {
    if (!user.activeWorkspaceId) {
      throw new APIException(
        'user workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegrations = await this.integrationsService.getUserIntegrations(
      user,
    );
    const integrationIds: any[] = [];
    const projectIds: any[] = [];

    for (let i = 0, len = userIntegrations.length; i < len; i++) {
      integrationIds.push(userIntegrations[i].integrationId);
    }

    const projects = await this.projectDatabase.getProjects({
      integrated: true,
      workspaceId: user.activeWorkspaceId,
      integration: {
        type: IntegrationType.JIRA,
      },
      integrationId: { in: integrationIds },
    });

    for (let i = 0, len = projects.length; i < len; i++) {
      projectIds.push(projects[i].id);
    }

    return projectIds;
  }

  async sprintView(user: User, query: SprintViewReqBodyDto) {
    const mappedUserWithWorkspaceId = new Map<number, any>();

    const sprint = await this.sprintDatabase.getSprintById({
      id: Number(query.sprintId),
    });
    if (!sprint) {
      throw new APIException('Sprint not found!', HttpStatus.BAD_REQUEST);
    }

    const taskIds: number[] = [];
    for (let index = 0, len = sprint?.sprintTask.length; index < len; index++) {
      taskIds.push(sprint?.sprintTask[index].taskId);
    }
    const tasks = await this.tasksDatabase.getTasks({
      id: { in: taskIds },
    });

    const getUserWorkspaceList =
      await this.sprintTaskDatabase.getUserWorkspaces({
        workspaceId: user.activeWorkspaceId,
        status: UserWorkspaceStatus.ACTIVE,
      });
    for (
      let index = 0, len = getUserWorkspaceList.length;
      index < len;
      index++
    ) {
      const userIntegration =
        sprint.project.integrationId &&
        (await this.userIntegrationDatabase.getUserIntegration({
          UserIntegrationIdentifier: {
            integrationId: sprint.project.integrationId,
            userWorkspaceId: getUserWorkspaceList[index].id,
          },
        }));
      const user = getUserWorkspaceList[index].user;
      if (userIntegration) {
        mappedUserWithWorkspaceId.set(getUserWorkspaceList[index].id, {
          userId: user.id,
          name: user.lastName
            ? user.firstName + ' ' + user.lastName
            : user.firstName,
          picture: user.picture,
          devProgress: { total: 0, done: 0 },
          assignedTasks: [],
          yesterdayTasks: [],
          todayTasks: [],
        });
      }
    }

    const data: any[] = [];
    let done = 0;
    let flag = true;

    for (
      let idx = new Date(query.startDate).getTime();
      idx <= new Date(query.endDate).getTime();
      idx += 3600 * 1000 * 24
    ) {
      for (const task of tasks) {
        if (
          task.userWorkspaceId &&
          mappedUserWithWorkspaceId.has(task.userWorkspaceId)
        ) {
          const existingUser = mappedUserWithWorkspaceId.get(
            task.userWorkspaceId,
          );

          //can not how "new Date(task.createdAt).getTime()" works
          if (new Date(task.createdAt).getTime() - 3600 * 1000 * 24 <= idx) {
            if (task.status === 'Done') existingUser.devProgress.done += 1;
            existingUser.devProgress.total += 1;
            const assignTask = {
              title: task.title,
              key: task.key,
              status: task.status,
              statusCategoryName: task.statusCategoryName,
            };
            existingUser.assignedTasks.push(assignTask);

            const doesTodayTask = this.doesTodayTask(idx, task.sessions);
            const doesYesterDayTask = this.doesTodayTask(
              idx - 3600 * 1000 * 24,
              task.sessions,
            );
            if (doesTodayTask) existingUser.todayTasks.push(assignTask);
            if (doesYesterDayTask) existingUser.yesterdayTasks.push(assignTask);
            mappedUserWithWorkspaceId.set(task.userWorkspaceId, existingUser);
          }
        }
        if (task.status === 'Done' && flag) {
          done += 1;
        }
      }
      flag = false;
      const formattedData = {
        date: new Date(idx),
        users: _.cloneDeep([...mappedUserWithWorkspaceId.values()]),
      };

      [...mappedUserWithWorkspaceId.values()].forEach((user: any) => {
        user.assignedTasks = [];
        user.todayTasks = [];
        user.yesterdayTasks = [];
        user.devProgress = { total: 0, done: 0 };
      });
      data.push(formattedData);
    }

    const sprintInfo = {
      name: sprint.name,
      projectName: sprint.project.projectName,
      total: sprint.sprintTask.length,
      done,
    };
    return { data, sprintInfo };
  }

  async newSprintView(user: User, query: NewSprintViewQueryDto) {
    const sprint = await this.sprintDatabase.getSprintById({
      id: Number(query.sprintId),
    });
    if (!sprint) {
      throw new APIException('Sprint not found!', HttpStatus.BAD_REQUEST);
    }

    const taskIds: number[] = sprint.sprintTask.map(
      (sprintTask) => sprintTask.taskId,
    );
    const tasks = await this.tasksDatabase.getTasks({
      id: { in: taskIds },
    });
    const userIds = query?.userIds;
    const arrayOfUserIds = userIds?.split(',');
    const userIdsArray = arrayOfUserIds?.map(Number);

    const userWorkspaceList = await this.sprintTaskDatabase.getUserWorkspaces({
      workspaceId: user.activeWorkspaceId,
      status: UserWorkspaceStatus.ACTIVE,
      userId: { in: userIdsArray },
    });

    const mappedUserWithWorkspaceId = await this.mapUserWorkspaces(
      userWorkspaceList,
      sprint,
    );

    const data: any[] = [];
    let done = 0;
    let flag = true;

    for (
      let idx = new Date(query.startDate).getTime();
      idx <= new Date(query.endDate).getTime();
      idx += 3600 * 1000 * 24
    ) {
      done += this.updateUserData(
        tasks,
        mappedUserWithWorkspaceId,
        idx,
        flag,
        done,
      );
      flag = false;

      const formattedData = {
        date: new Date(idx),
        users: _.cloneDeep([...mappedUserWithWorkspaceId.values()]),
      };

      this.resetUserTasks(mappedUserWithWorkspaceId);
      data.push(formattedData);
    }

    const sprintInfo = {
      name: sprint.name,
      projectName: sprint.project.projectName,
      total: sprint.sprintTask.length,
      done,
    };

    return { data, sprintInfo };
  }

  private async mapUserWorkspaces(
    userWorkspaceList: any[],
    sprint: any,
  ): Promise<Map<number, any>> {
    const mappedUserWithWorkspaceId = new Map<number, any>();

    for (const userWorkspace of userWorkspaceList) {
      const { id: userWorkspaceId, user } = userWorkspace;
      const userIntegration =
        sprint.project.integrationId &&
        (await this.userIntegrationDatabase.getUserIntegration({
          UserIntegrationIdentifier: {
            integrationId: sprint.project.integrationId,
            userWorkspaceId,
          },
        }));

      if (userIntegration) {
        mappedUserWithWorkspaceId.set(userWorkspaceId, {
          userId: user.id,
          name: user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName,
          picture: user.picture,
          devProgress: { estimatedTime: 0, spentTime: 0 },
          assignedTasks: [],
          yesterdayTasks: [],
          todayTasks: [],
        });
      }
    }

    return mappedUserWithWorkspaceId;
  }

  private updateUserData(
    tasks: any[],
    mappedUserWithWorkspaceId: Map<number, any>,
    idx: number,
    flag: boolean,
    done: number,
  ): number {
    console.log(tasks.length)
    for (const task of tasks) {
      if (
        task.userWorkspaceId &&
        mappedUserWithWorkspaceId.has(task.userWorkspaceId)
      ) {
        const existingUser = mappedUserWithWorkspaceId.get(
          task.userWorkspaceId,
        );
        const taskCreatedAtTimestamp = new Date(task.createdAt).getTime();

        if (taskCreatedAtTimestamp - 3600 * 1000 * 24 <= idx) {
          if (task.status === 'Done') existingUser.devProgress.done += 1;

          existingUser.devProgress.total += 1;
          const assignTask = {
            title: task.title,
            key: task.key,
            status: task.status,
            statusCategoryName: task.statusCategoryName,
          };

          existingUser.assignedTasks.push(assignTask);

          const doesTodayTask = this.doesTodayTask(idx, task.sessions);
          const doesYesterDayTask = this.doesTodayTask(
            idx - 3600 * 1000 * 24,
            task.sessions,
          );

          if (doesTodayTask) existingUser.todayTasks.push(assignTask);
          if (doesYesterDayTask) existingUser.yesterdayTasks.push(assignTask);

          mappedUserWithWorkspaceId.set(task.userWorkspaceId, existingUser);
        }
      }

      if (task.status === 'Done' && flag) {
        done += 1;
      }
    }
    return done;
  }

  private resetUserTasks(mappedUserWithWorkspaceId: Map<number, any>): void {
    [...mappedUserWithWorkspaceId.values()].forEach((user: any) => {
      user.assignedTasks = [];
      user.todayTasks = [];
      user.yesterdayTasks = [];
      user.devProgress = { total: 0, done: 0 };
    });
  }

  private doesTodayTask(time: number, sessions: Session[]) {
    const parsedTime = dayjs(new Date(time));
    const startTime = parsedTime.startOf('day').valueOf();
    const endTime = parsedTime.endOf('day').valueOf();
    for (let index = 0, len = sessions.length; index < len; index++) {
      const session = sessions[index];
      if (
        new Date(session.startTime).getTime() >= startTime &&
        new Date(session.startTime).getTime() <= endTime
      ) {
        return true;
      }
    }
    return false;
  }

  async getReportPageSprints(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (userWorkspace.role === Role.ADMIN) {
      const projectIds: number[] = [];
      const projectList = await this.projectDatabase.getProjects({
        integrated: true,
        workspaceId: user.activeWorkspaceId,
      });

      for (let i = 0, len = projectList.length; i < len; i++) {
        projectIds.push(projectList[i].id);
      }

      return await this.sprintDatabase.findSprintListByProjectIdList(
        projectIds,
      );
    } else if (userWorkspace.role === Role.USER) {
      return await this.getSprintList(user);
    }
  }
}

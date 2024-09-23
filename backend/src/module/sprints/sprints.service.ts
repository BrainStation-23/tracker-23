import { TasksDatabase } from 'src/database/tasks';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  User,
  UserWorkspaceStatus,
  Session,
  Role,
  IntegrationType,
  UserIntegration,
  Project,
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
    project: Project,
    userIntegration: UserIntegration,
  ) {
    const sprint_list: any[] = [];
    const issue_list: any[] = [];
    const sprintResponses: any[] = [];
    const resolvedPromiseSprintTask: any[] = [];
    const projectBoardIds: any[] = [];
    const mappedSprintWithJiraId = new Map<number, any>();

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace)
      throw new APIException('Can not sync with jira', HttpStatus.BAD_REQUEST);

    const boardUrl = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/agile/1.0/board`;
    const boardList = await this.jiraClient.CallJira(
      userIntegration,
      this.jiraApiCalls.getBoardList,
      boardUrl,
    );
    for (let index = 0; index < boardList?.total; index++) {
      const board = boardList?.values[index];
      if (board && board?.location?.projectId === project?.projectId) {
        projectBoardIds.push(board.id);
      }
    }

    const task_list = await this.sprintDatabase.getTaskByProjectIdAndSource({
      projectId: project.id,
      workspaceId: user.activeWorkspaceId,
      source: IntegrationType.JIRA,
    });
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
      project.id,
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
        projectId: project.id,
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
      await this.sprintDatabase.findSprintListByProjectId(project.id),
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
      if (!mappedTaskId.has(Number(task_list[index].integratedTaskId))) {
        mappedTaskId.set(
          Number(task_list[index].integratedTaskId),
          task_list[index].id,
        );
      }
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
    if (!userWorkspace || !user?.activeWorkspaceId)
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

    const userIntegrations =
      await this.integrationsService.getUserIntegrationsByRole(user);
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
    const oneDayMilliseconds = 3600 * 1000 * 24;

    for (
      let idx = new Date(query.startDate).getTime();
      idx <= new Date(query.endDate).getTime();
      idx += oneDayMilliseconds
    ) {
      for (const task of tasks) {
        if (
          task.userWorkspaceId &&
          mappedUserWithWorkspaceId.has(task.userWorkspaceId)
        ) {
          const existingUser = mappedUserWithWorkspaceId.get(
            task.userWorkspaceId,
          );

          if (new Date(task.createdAt).getTime() - oneDayMilliseconds <= idx) {
            if (task.status === 'Done') existingUser.devProgress.done += 1;
            existingUser.devProgress.total += 1;
            const assignTask = {
              title: task.title,
              key: task.key,
              status: task.status,
              statusCategoryName: task.statusCategoryName,
            };

            const doesTodayTask = this.doesTodayTask(idx, task.sessions);
            const doesYesterDayTask = this.doesTodayTask(
              idx - oneDayMilliseconds,
              task.sessions,
            );
            if (doesTodayTask) existingUser.todayTasks.push(assignTask);
            if (doesYesterDayTask) existingUser.yesterdayTasks.push(assignTask);

            // Use excludeUnworkedTasks property to exclude tasks that are not currently active in the session list.
            if (
              query.excludeUnworkedTasks &&
              (doesTodayTask || doesYesterDayTask)
            ) {
              existingUser.assignedTasks.push(assignTask);
            } else if (!query.excludeUnworkedTasks) {
              existingUser.assignedTasks.push(assignTask);
            }
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
    try {
      const columns: any[] = [];
      const fixedVal = 0;
      const mappedUserWDate = new Map<number, any[]>();
      const tasks = await this.getSprintTasks(Number(query.sprintId));
      const mappedUserWithWorkspaceId = await this.mapUserWorkspaces(
        query,
        user,
      );
      const {
        mappedKeyAndValueForRow,
        MappedEstimationAndSpentTimeForColumn,
        mappedSpentTimeWithDateAndUserWorkspaceId,
        dateArray,
      } = this.updateUserData(tasks, mappedUserWithWorkspaceId, query);

      //Push the real data into columns
      for (const [key, value] of MappedEstimationAndSpentTimeForColumn) {
        columns.push({
          key: Number(key) ? new Date(Number(key)) : key,
          value: {
            devProgress: {
              estimatedTime: value?.estimation
                ? Number(value?.estimation.toFixed(2))
                : Number(fixedVal?.toFixed(2)),
              spentTime: value?.spentTime
                ? Number(value.spentTime.toFixed(2))
                : Number(fixedVal?.toFixed(2)),
            },
          },
        });
      }

      //Push the real data into rows
      for (const [key, value] of mappedKeyAndValueForRow.entries()) {
        const { keyType, userW } = JSON.parse(key); // keyType is string of date. example : "2023-12-18T18:00:00.000Z"
        const data = mappedSpentTimeWithDateAndUserWorkspaceId.get(key); //if finds, that means date-wise spent-time otherwise assignTask spent-time

        //mapping dates with every userWorkspaceIds -->start
        mappedUserWDate.has(userW)
          ? mappedUserWDate
              .get(userW)
              ?.push(
                keyType === 'AssignTasks'
                  ? keyType
                  : new Date(keyType).getTime(),
              )
          : mappedUserWDate.set(userW, [
              keyType === 'AssignTasks' ? keyType : new Date(keyType).getTime(),
            ]);
        //mapping dates with every userWorkspaceIds -->end

        value.devProgress.estimatedTime = Number(
          value.devProgress.estimatedTime?.toFixed(2),
        );
        value.devProgress.spentTime = data?.spentDateWiseTime
          ? Number(data?.spentDateWiseTime.toFixed(2))
          : Number(value?.devProgress?.spentTime?.toFixed(2));
        mappedUserWithWorkspaceId.get(userW)?.data.push({
          key: keyType === 'AssignTasks' ? keyType : new Date(keyType),
          value,
        });
      }

      // Push demo data in which dates do not belong any real value
      for (let index = 0; index < dateArray.length; index++) {
        const date = dateArray[index];
        // Push demo data into columns
        if (
          !MappedEstimationAndSpentTimeForColumn.has(String(date.getTime()))
        ) {
          columns.push({
            key: date,
            value: {
              devProgress: {
                estimatedTime: Number(fixedVal?.toFixed(2)),
                spentTime: Number(fixedVal?.toFixed(2)),
              },
            },
          });
        }

        // Push demo data into rows
        for (const userW of mappedUserWDate.keys()) {
          if (!mappedUserWDate.get(userW)?.includes(date.getTime())) {
            mappedUserWithWorkspaceId.get(userW)?.data.push({
              key: date,
              value: {
                devProgress: {
                  estimatedTime: Number(fixedVal?.toFixed(2)),
                  spentTime: Number(fixedVal?.toFixed(2)),
                },
                tasks: [],
              },
            });
            mappedUserWDate.get(userW)?.push(date.getTime());
          }
        }
      }
      const col = columns.sort(
        (a: any, b: any) =>
          new Date(a.key).getTime() - new Date(b.key).getTime(),
      );
      return { columns: col, rows: [...mappedUserWithWorkspaceId.values()] };
    } catch (err) {
      console.log(
        '🚀 ~ file: sprints.service.ts:584 ~ SprintsService ~ newSprintView ~ err:',
        err,
      );
      return { columns: [], rows: [] };
    }
  }

  private async mapUserWorkspaces(
    query: NewSprintViewQueryDto,
    user: User,
  ): Promise<Map<number, any>> {
    const sprint = await this.sprintDatabase.getSprintById({
      id: Number(query.sprintId),
    });
    if (!sprint) {
      throw new APIException('Sprint not found!', HttpStatus.BAD_REQUEST);
    }
    const userIds = query?.userIds;
    const arrayOfUserIds = userIds?.split(',');
    const userIdsArray = arrayOfUserIds?.map(Number);

    const userWorkspaceList = await this.sprintTaskDatabase.getUserWorkspaces({
      workspaceId: user.activeWorkspaceId,
      status: UserWorkspaceStatus.ACTIVE,
      ...(query?.userIds && { userId: { in: userIdsArray } }),
    });
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
          email: user.email,
          data: [],
        });
      }
    }

    return mappedUserWithWorkspaceId;
  }

  async getSprintTasks(id: number) {
    const sprint = await this.sprintDatabase.getSprintById({
      id,
    });
    if (!sprint) {
      throw new APIException('Sprint not found!', HttpStatus.BAD_REQUEST);
    }

    const taskIds: number[] = sprint.sprintTask.map(
      (sprintTask) => sprintTask.taskId,
    );
    return await this.tasksDatabase.getTasks({
      id: { in: taskIds },
    });
  }

  private updateUserData(
    taskList: any[],
    mappedUserWithWorkspaceId: Map<number, any>,
    query: NewSprintViewQueryDto,
  ) {
    const dateArray: Date[] = [];
    const oneDayTime = 3600 * 1000 * 24;
    const MappedEstimationAndSpentTimeForColumn = new Map<
      string,
      { estimation: number; spentTime: number }
    >();
    const mappedSpentTimeWithDateAndUserWorkspaceId = new Map<
      string,
      { spentDateWiseTime: number }
    >();
    const {
      mappedTimeSpentWithUserWorkspaceId,
      mappedKeyAndValueForRow,
      assignTasksSessionTime,
      assignTasksEstimatedTime,
    } = this.taskSpentTime(query, taskList, mappedUserWithWorkspaceId);

    //assign the spentTime to the assignTasks
    //Column
    MappedEstimationAndSpentTimeForColumn.set('AssignTasks', {
      spentTime: assignTasksSessionTime,
      estimation: assignTasksEstimatedTime,
    });
    //Row
    for (const [key, value] of mappedKeyAndValueForRow.entries()) {
      const { userW } = JSON.parse(key);
      const sessionValue = mappedTimeSpentWithUserWorkspaceId.get(userW);
      value.devProgress.spentTime = sessionValue?.spentTime ?? 0;
    }
    //find date wise task and spent time
    for (
      let idx = new Date(query.startDate).getTime();
      idx <= new Date(query.endDate).getTime();
      idx += oneDayTime
    ) {
      dateArray.push(new Date(idx));
      for (const task of taskList) {
        const doesTodayTask = this.todayTaskWithTimeRangeAndSpentTime(
          idx,
          task.sessions,
          mappedSpentTimeWithDateAndUserWorkspaceId,
          task.status,
        );

        //Keep date wise devProgress for column start
        if (
          doesTodayTask.flag &&
          MappedEstimationAndSpentTimeForColumn.has(String(idx))
        ) {
          const data = MappedEstimationAndSpentTimeForColumn.get(String(idx));
          if (data) {
            data.estimation += task?.estimation ?? 0;
            data.spentTime += doesTodayTask?.spentTime ?? 0;
          }
        } else if (doesTodayTask.flag) {
          MappedEstimationAndSpentTimeForColumn.set(String(idx), {
            estimation: task?.estimation ?? 0,
            spentTime: doesTodayTask?.spentTime ?? 0,
          });
        }
        //Keep date wise devProgress for column end

        if (
          doesTodayTask.flag &&
          task.userWorkspaceId &&
          mappedUserWithWorkspaceId.has(task.userWorkspaceId)
        ) {
          const mapKey = JSON.stringify({
            keyType: new Date(idx),
            userW: task.userWorkspaceId,
          });
          if (mappedKeyAndValueForRow.has(mapKey)) {
            const valueData = mappedKeyAndValueForRow.get(mapKey);
            const incomingEstimationTime =
              valueData.devProgress.estimatedTime + task.estimation;
            // const incomingSpentTime =
            //   valueData.devProgress.spentTime + doesTodayTask.spentTime;

            valueData.devProgress = {
              estimatedTime: incomingEstimationTime,
              // spentTime: incomingSpentTime,
            };
            valueData.tasks.push({
              title: task.title,
              key: task.key,
              timeRange: {
                start: new Date(doesTodayTask.timeRange.start),
                end: new Date(doesTodayTask.timeRange.end),
              },
              status:
                doesTodayTask.status === 'In Progress'
                  ? 'In Progress'
                  : task.status,
              statusCategoryName:
                doesTodayTask.status === 'In Progress'
                  ? 'IN_PROGRESS'
                  : task.statusCategoryName,
            });
          } else {
            const devProgress = {
              estimatedTime: task.estimation,
              spentTime: 0,
            };
            const tasks: any[] = [];

            tasks.push({
              title: task.title,
              key: task.key,
              timeRange: {
                start: new Date(doesTodayTask.timeRange.start),
                end: new Date(doesTodayTask.timeRange.end),
              },
              status:
                doesTodayTask.status === 'In Progress'
                  ? 'In Progress'
                  : task.status,
              statusCategoryName:
                doesTodayTask.status === 'In Progress'
                  ? 'IN_PROGRESS'
                  : task.statusCategoryName,
            });
            mappedKeyAndValueForRow.set(mapKey, {
              devProgress,
              tasks,
            });
          }
        }
      }
    }

    return {
      mappedKeyAndValueForRow,
      MappedEstimationAndSpentTimeForColumn,
      mappedSpentTimeWithDateAndUserWorkspaceId,
      dateArray,
    };
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

  private todayTaskWithTimeRangeAndSpentTime(
    time: number,
    sessions: Session[],
    mappedSpentTimeWithDateAndUserWorkspaceId: Map<
      string,
      { spentDateWiseTime: number }
    >,
    taskStatus: string,
  ) {
    let flag = false;
    let sessionTimeArray: any[] = [];
    const mySet: any = new Set();
    const parsedTime = dayjs(new Date(time));
    const startTime = parsedTime.startOf('day').valueOf();
    const endTime = parsedTime.endOf('day').valueOf();
    let sessionSpentTime = 0;
    for (let index = 0; index < sessions.length; index++) {
      const session = sessions[index];
      const sessionStartTime = dayjs(session.startTime);
      mySet.add(sessionStartTime.startOf('day').valueOf());
      if (
        new Date(session.startTime).getTime() >= startTime &&
        new Date(session.startTime).getTime() <= endTime
      ) {
        flag = true;
      }
      if (session.endTime && new Date(session.startTime).getTime() <= endTime) {
        sessionSpentTime +=
          (new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime()) /
          (1000 * 3600);
      }
      const mapKey = JSON.stringify({
        keyType: new Date(time),
        userW: session.userWorkspaceId,
      });
      if (mappedSpentTimeWithDateAndUserWorkspaceId.has(mapKey)) {
        const data = mappedSpentTimeWithDateAndUserWorkspaceId.get(mapKey);
        if (data) {
          data.spentDateWiseTime += sessionSpentTime;
        }
      } else if (session.userWorkspaceId) {
        mappedSpentTimeWithDateAndUserWorkspaceId.set(mapKey, {
          spentDateWiseTime: sessionSpentTime,
        });
      }
    }

    //TimeRange figure out of a task
    sessionTimeArray = [...mySet];
    sessionTimeArray.sort((a, b) => a - b);
    if (flag) {
      const targetStartTimeIndex = sessionTimeArray.indexOf(startTime);
      let end = startTime;
      let start = startTime;
      if (taskStatus === 'Done') {
        if (sessionTimeArray.length - 1 === targetStartTimeIndex) {
          return {
            flag: true,
            timeRange: { start, end },
            spentTime: sessionSpentTime,
          };
        } else {
          for (
            let i = targetStartTimeIndex + 1;
            i < sessionTimeArray.length - 1;
            i++
          ) {
            if (sessionTimeArray[i] - end === 86400000) {
              end = sessionTimeArray[i];
            }
          }
          for (let i = targetStartTimeIndex - 1; i >= 0; i--) {
            if (start - sessionTimeArray[i] === 86400000) {
              start = sessionTimeArray[i];
            }
          }
          return {
            flag: true,
            timeRange: { start, end },
            spentTime: sessionSpentTime,
            status: 'In Progress',
          };
        }
      }
      // const targetStartTimeIndex = sessionTimeArray.indexOf(startTime);
      // let end = startTime;
      // let start = startTime;
      for (let i = targetStartTimeIndex + 1; i < sessionTimeArray.length; i++) {
        if (sessionTimeArray[i] - end === 86400000) {
          end = sessionTimeArray[i];
        }
      }
      for (let i = targetStartTimeIndex - 1; i >= 0; i--) {
        if (start - sessionTimeArray[i] === 86400000) {
          start = sessionTimeArray[i];
        }
      }
      return {
        flag: true,
        timeRange: { start, end },
        spentTime: sessionSpentTime,
      };
    }
    return { flag: false, timeRange: { start: 0, end: 0 }, spentTime: 0 };
  }

  private taskSpentTime(
    query: NewSprintViewQueryDto,
    taskList: any[],
    mappedUserWithWorkspaceId: Map<number, any>,
  ) {
    const mappedKeyAndValueForRow = new Map<string, any>();
    const mappedTimeSpentWithUserWorkspaceId = new Map<number, any>();
    let assignTasksSessionTime = 0,
      assignTasksEstimatedTime = 0;
    for (const task of taskList) {
      //check this task is eligible for processing
      if (query.excludeUnworkedTasks) {
        const validTask = this.taskValidityCheck(query, task);
        if (!validTask) continue;
      }
      const sessions = task.sessions;
      if (mappedUserWithWorkspaceId.has(task.userWorkspaceId)) {
        assignTasksEstimatedTime += task.estimation;
      }

      for (let index = 0; index < sessions.length; index++) {
        const session: Session = sessions[index];
        if (session.endTime) {
          const sessionSpentTime =
            (new Date(session.endTime).getTime() -
              new Date(session.startTime).getTime()) /
            (1000 * 3600);
          if (mappedUserWithWorkspaceId.has(task.userWorkspaceId)) {
            assignTasksSessionTime += sessionSpentTime;
          }
          if (
            session.userWorkspaceId &&
            mappedTimeSpentWithUserWorkspaceId.has(session.userWorkspaceId)
          ) {
            const spentValue = mappedTimeSpentWithUserWorkspaceId.get(
              session.userWorkspaceId,
            );
            spentValue.spentTime += sessionSpentTime;
          } else if (session.userWorkspaceId) {
            mappedTimeSpentWithUserWorkspaceId.set(session.userWorkspaceId, {
              spentTime: sessionSpentTime,
            });
          }
        }
      }

      //Find the assign tasks
      if (mappedUserWithWorkspaceId.has(task.userWorkspaceId)) {
        const mapKey = JSON.stringify({
          keyType: 'AssignTasks',
          userW: task.userWorkspaceId,
        });
        if (mappedKeyAndValueForRow.has(mapKey)) {
          const valueData = mappedKeyAndValueForRow.get(mapKey);
          valueData.devProgress = {
            estimatedTime:
              valueData.devProgress.estimatedTime + task.estimation,
          };
          valueData.tasks.push({
            title: task.title,
            key: task.key,
            status: task.status,
            statusCategoryName: task.statusCategoryName,
          });
        } else {
          const tasks: any[] = [];
          const devProgress = {
            estimatedTime: task.estimation,
            spentTime: 0,
          };

          tasks.push({
            title: task.title,
            key: task.key,
            status: task.status,
            statusCategoryName: task.statusCategoryName,
          });
          mappedKeyAndValueForRow.set(mapKey, {
            devProgress,
            tasks,
          });
        }
      }
    }
    return {
      mappedTimeSpentWithUserWorkspaceId,
      mappedKeyAndValueForRow,
      assignTasksSessionTime,
      assignTasksEstimatedTime,
    };
  }

  private taskValidityCheck(query: NewSprintViewQueryDto, task: any) {
    const sessions = task.sessions;
    for (let index = 0; index < sessions.length; index++) {
      const session: Session = sessions[index];
      if (
        new Date(session.startTime).getTime() <=
          new Date(query.endDate).getTime() &&
        new Date(session.startTime).getTime() >=
          new Date(query.startDate).getTime()
      )
        return true;
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

  async getCalenderIds(user: User): Promise<number[] | []> {
    if (!user?.activeWorkspaceId) {
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
      if (userIntegrations[i].integration?.type === IntegrationType.OUTLOOK) {
        integrationIds.push(userIntegrations[i].integrationId);
      }
    }

    const projects = await this.projectDatabase.getProjects({
      integrated: true,
      workspaceId: user.activeWorkspaceId,
      integration: {
        type: IntegrationType.OUTLOOK,
      },
      integrationId: { in: integrationIds },
    });

    for (let i = 0, len = projects.length; i < len; i++) {
      projectIds.push(projects[i].id);
    }

    return projectIds;
  }
}

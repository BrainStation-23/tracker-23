import { TasksDatabase } from 'src/database/tasks';
import axios from 'axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetSprintListQueryDto } from './dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { APIException } from '../exception/api.exception';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { JiraClientService } from '../helper/client';
@Injectable()
export class SprintsService {
  constructor(
    private integrationsService: IntegrationsService,
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

    const project = await this.projectDatabase.getProjectById(projectId);
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace)
      throw new APIException('Can not sync with jira', HttpStatus.BAD_REQUEST);
    const userIntegration = await this.sprintDatabase.getUserIntegration(
      userIntegrationId,
    );
    if (!userIntegration) {
      throw new APIException(
        'User Integration not found',
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

    for (let index = 0, len = sprintResponses.length; index < len; index++) {
      const val = sprintResponses[index];
      sprint_list.push({
        jiraSprintId: Number(val.id),
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
      for (let startAt = 0; startAt < 5000; startAt += 50) {
        const sprintIssueUrl = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/agile/1.0/sprint/${val.id}/issue`;
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
    }

    //Get all task related to the sprint
    // const resolvedPromiseSprintTask = await Promise.all(issuePromises);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [delSprint, crtSprint, sprints] = await Promise.all([
      await this.sprintDatabase.deleteSprintByProjectId(projectId),
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
        taskId &&
          issue_list.push({
            sprintId: sprintId,
            taskId: taskId,
          });
      });
    }

    const sprintIds: number[] = Array.from(mappedSprintId.values());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [DelSprintTask, CST, sprintTasks] = await Promise.all([
      await this.sprintTaskDatabase.deleteSprintTaskBySprintIds(sprintIds),
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

  async getProjectIds(user: User): Promise<number[]> {
    if (!user.activeWorkspaceId) {
      throw new APIException(
        'user workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);
    const integrationIds: any[] = [];
    const projectIds: any[] = [];

    for (let i = 0, len = getUserIntegrationList.length; i < len; i++) {
      integrationIds.push(getUserIntegrationList[i].integrationId);
    }

    const projectList = await this.projectDatabase.getProjects({
      integrated: true,
      workspaceId: user.activeWorkspaceId,
      integrationId: { in: integrationIds },
    });

    for (let i = 0, len = projectList.length; i < len; i++) {
      projectIds.push(projectList[i].id);
    }

    return projectIds;
  }
}

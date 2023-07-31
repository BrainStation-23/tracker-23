import axios from 'axios';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { HttpStatus, Injectable } from '@nestjs/common';
import { IntegrationType, User, UserIntegration } from '@prisma/client';

import { GetSprintListQueryDto } from './dto';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { APIException } from 'src/internal/exception/api.exception';
import { count } from 'console';

@Injectable()
export class SprintsService {
  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
    private workspacesService: WorkspacesService,
  ) {}

  async createSprintAndTask(
    user: User,
    projectId: number,
    userIntegrationId: number,
  ) {
    console.log(user, projectId, userIntegrationId);
    const sprint_list: any[] = [];
    const issue_list: any[] = [];
    const validSprint: any[] = [];
    const toBeUpdated: any[] = [];
    const sprintPromises: Promise<any>[] = [];
    const issuePromises: Promise<any>[] = [];

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      console.log(
        '🚀 ~ file: sprints.service.ts:41 ~ SprintsService ~ userWorkspace:',
        userWorkspace,
      );
      return [];
    }
    const updated_userIntegration =
      await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegrationId,
      );
    if (!updated_userIntegration) {
      console.log(
        '🚀 ~ file: sprints.service.ts:31 ~ SprintsService ~ createSprintAndTask ~ updated_userIntegration:',
        updated_userIntegration,
      );
      return [];
    }
    console.log(updated_userIntegration);
    const boardUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/agile/1.0/board`;
    const boardConfig = {
      method: 'get',
      url: boardUrl,
      headers: {
        Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const boardList = await (await axios(boardConfig)).data;
    console.log(
      '🚀 ~ file: sprints.service.ts:70 ~ SprintsService ~ boardList:',
      boardList,
    );
    const mappedBoardId = new Map<number, number>();
    for (let index = 0; index < boardList.total; index++) {
      const board = boardList.values[index];
      mappedBoardId.set(Number(board.location.projectId), Number(board.id));
    }

    console.log('mappedBoardId', mappedBoardId);

    const task_list = await this.prisma.task.findMany({
      where: {
        userWorkspaceId: userWorkspace.id,
        source: IntegrationType.JIRA,
      },
    });
    const boardId = project && mappedBoardId.get(project.projectId);
    console.log(
      '🚀 ~ file: sprints.service.ts:86 ~ SprintsService ~ boardId:',
      boardId,
    );

    if (!boardId) {
      return [];
    }
    const sprintUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/agile/1.0/board/${boardId}/sprint`;
    const sprintConfig = {
      method: 'get',
      url: sprintUrl,
      headers: {
        Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const res = axios(sprintConfig);
    sprintPromises.push(res);
    // }

    const sprintResponses = await Promise.all(
      sprintPromises.map((p) =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p.catch((err) => {
          console.error(
            '🚀 ~ file: tasks.service.ts:1544 ~ TasksService ~ createSprintAndTask ~ err:',
            err.config.url,
            err.message,
            'This board has no sprint!',
          );
        }),
      ),
    );

    sprintResponses.map((res) => {
      res &&
        res.data &&
        res.data.values.map((val: any) => {
          if (val) {
            // console.log(val);
            validSprint.push(val);
            if (val.startDate && val.endDate && val.completeDate) {
              sprint_list.push({
                jiraSprintId: Number(val.id),
                userWorkspaceId: userWorkspace.id,
                projectId: project.id,
                state: val.state,
                name: val.name,
                startDate: new Date(val.startDate),
                endDate: new Date(val.startDate),
                completeDate: new Date(val.startDate),
              });
            } else {
              toBeUpdated.push(val.id);
              sprint_list.push({
                jiraSprintId: Number(val.id),
                userWorkspaceId: userWorkspace.id,
                projectId: project.id,
                state: val.state,
                name: val.name,
              });
            }

            const sprintIssueUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/agile/1.0/sprint/${val.id}/issue`;
            const sprintIssueConfig = {
              method: 'get',
              url: sprintIssueUrl,
              headers: {
                Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
                'Content-Type': 'application/json',
              },
            };
            const res = axios(sprintIssueConfig);
            issuePromises.push(res);
          }
        });
    });
    //Get all task related to the sprint
    const resolvedPromiseSprintTask = await Promise.all(issuePromises);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [delSprint, crtSprint, sprints] = await Promise.all([
      await this.prisma.sprint.deleteMany({
        where: {
          userWorkspaceId: userWorkspace.id,
          projectId: project.id,
        },
      }),
      await this.prisma.sprint.createMany({
        data: sprint_list,
      }),
      await this.prisma.sprint.findMany({
        where: {
          userWorkspaceId: userWorkspace.id,
          projectId: project.id,
        },
      }),
    ]);

    //relation between sprintId and jiraSprintId
    const mappedSprintId = new Map<number, number>();
    for (let index = 0; index < sprints.length; index++) {
      mappedSprintId.set(
        Number(sprints[index].jiraSprintId),
        sprints[index].id,
      );
    }

    console.log('mappedSprintId', mappedSprintId);

    //relation between taskId and integratedTaskId
    const mappedTaskId = new Map<number, number>();
    for (let index = 0; index < task_list.length; index++) {
      mappedTaskId.set(
        Number(task_list[index].integratedTaskId),
        task_list[index].id,
      );
    }

    resolvedPromiseSprintTask.map((res: any) => {
      const urlArray = res.config.url.split('/');
      const jiraSprintId = urlArray[urlArray.length - 2];
      const sprintId = mappedSprintId.get(Number(jiraSprintId));

      res.data.issues.map((issue: any) => {
        const taskId = mappedTaskId.get(Number(issue.id));
        if (taskId) {
          issue_list.push({
            sprintId: sprintId,
            taskId: taskId,
            userWorkspaceId: userWorkspace.id,
          });
        }
      });
    });

    const sprintIds: number[] = Array.from(mappedSprintId.values());

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [DelSprintTask, CST, sprintTasks] = await Promise.all([
      await this.prisma.sprintTask.deleteMany({
        where: {
          sprintId: { in: sprintIds },
        },
      }),
      await this.prisma.sprintTask.createMany({
        data: issue_list,
      }),

      await this.prisma.sprintTask.findMany({
        where: {
          // userWorkspaceId: userWorkspace.id,
          sprintId: { in: sprintIds },
        },
      }),
    ]);

    return { total: sprintTasks.length, sprintTasks };
  }

  async getSprintList(user: User, reqBody: GetSprintListQueryDto) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        // throw new APIException(
        //   'User workspace not found',
        //   HttpStatus.BAD_REQUEST,
        // );
        return [];
      }
      const st = reqBody.state as unknown as string;
      const array =
        st &&
        st
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim());
      console.log(
        '🚀 ~ file: sprints.service.ts:278 ~ SprintsService ~ getSprintList ~ array:',
        array,
      );

      const sprintList = await this.prisma.sprint.findMany({
        where: {
          userWorkspaceId: userWorkspace.id,
        },
      });
      console.log(
        '🚀 ~ file: sprints.service.ts:276 ~ getSprintList ~ sprintList:',
        sprintList,
      );

      return sprintList || [];
    } catch (error) {
      console.log(
        '🚀 ~ file: sprints.service.ts:290 ~ SprintsService ~ getSprintList ~ error:',
        error,
      );
      return [];
    }
  }

  async getActiveSprintTasks(user: User, reqBody: GetSprintListQueryDto) {
    try {
      const getUserIntegrationList =
        await this.integrationsService.getUserIntegrations(user);
      const taskList: any[] = [];
      console.log(getUserIntegrationList.length);
      for (let i = 0, len = getUserIntegrationList.length; i < len; i++) {
        const userIntegration = getUserIntegrationList[i];
        // console.log('count');
        const array = await this.getIndividualIntegrationActiveSprintTask(
          user,
          reqBody,
          userIntegration,
        );
        taskList.push(...array);
      }
      // console.log(taskList);
      return taskList;
    } catch (err) {
      console.log(
        '🚀 ~ file: sprints.service.ts:306 ~ SprintsService ~ getActiveSprintTasks ~ err:',
        err,
      );
    }
  }

  async getIndividualIntegrationActiveSprintTask(
    user: User,
    reqBody: GetSprintListQueryDto,
    userIntegration: UserIntegration,
  ) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const { priority, status, text } = reqBody;
      const priority1: any = (priority as unknown as string)?.split(',');
      const status1: any = (status as unknown as string)?.split(',');
      const st = reqBody.state as unknown as string;
      const array = st && st.split(',').map((item) => item.trim());
      // console.log(array);

      const sprints = await this.prisma.sprint.findMany({
        where: {
          userWorkspaceId: userWorkspace.id,
          state: { in: array },
        },
      });

      const sprintIds = sprints.map((sprint) => sprint.id);
      // console.log(sprintIds);
      const taskIds = await this.getSprintTasksIds(
        userWorkspace?.id,
        sprintIds,
      );
      // console.log(taskIds);

      const taskList = await this.prisma.task.findMany({
        where: {
          assigneeId: userIntegration.jiraAccountId,
          source: IntegrationType.JIRA,
          id: { in: taskIds },
          ...(priority1 && { priority: { in: priority1 } }),
          ...(status1 && { status: { in: status1 } }),
          ...(text && {
            title: {
              contains: text,
              mode: 'insensitive',
            },
          }),
        },
        include: {
          sessions: true,
        },
      });
      // console.log(taskList);
      return taskList;
    } catch (error) {
      console.log('🚀 ~ file: sprints.service.ts:372 ~ error:', error);
      return [];
    }
  }
  async getSprintTasksIds(userWorkspaceId: number, sprintIds: number[]) {
    try {
      const getSprintTasks = await this.prisma.sprintTask.findMany({
        where: {
          userWorkspaceId: userWorkspaceId,
          sprintId: { in: sprintIds.map((id) => Number(id)) },
        },
      });
      const taskIds: number[] = [];
      for (let index = 0; index < getSprintTasks.length; index++) {
        const val = getSprintTasks[index];
        taskIds.push(val.taskId);
      }
      return taskIds;
    } catch (error) {
      return [];
    }
  }
}

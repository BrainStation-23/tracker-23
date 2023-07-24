import axios from 'axios';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { HttpStatus, Injectable } from '@nestjs/common';
import {
  Integration,
  IntegrationType,
  User,
  UserIntegration,
} from '@prisma/client';

import { GetSprintListQueryDto } from './dto';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { APIException } from 'src/internal/exception/api.exception';

@Injectable()
export class SprintsService {
  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
    private workspacesService: WorkspacesService,
  ) {}

  async createSprintAndTask(
    user: User,
    integrationID: number,
    projectId?: number,
  ) {
    const sprint_list: any[] = [];
    const issue_list: any[] = [];
    const validSprint: any[] = [];
    const toBeUpdated: any[] = [];
    const sprintPromises: Promise<any>[] = [];
    const issuePromises: Promise<any>[] = [];
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updated_integration =
      await this.integrationsService.getUpdatedUserIntegration(
        user,
        integrationID,
      );
    if (!updated_integration) {
      console.log(
        '🚀 ~ file: sprints.service.ts:31 ~ SprintsService ~ createSprintAndTask ~ updated_integration:',
        updated_integration,
      );
      return [];
    }

    const project = await this.prisma.project.findFirst({
      where: {
        projectId,
      },
    });

    const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/board`;
    const config = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${updated_integration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const boardList = await (await axios(config)).data;

    const mappedBoardId = new Map<number, number>();
    for (let index = 0; index < boardList.total; index++) {
      const board = boardList.values[index];
      mappedBoardId.set(Number(board.location.projectId), Number(board.id));
    }

    const boardId = project?.projectId && mappedBoardId.get(project.projectId);
    // console.log(boardId);
    // if (!boardId) {
    //   continue;
    // }
    const sprinturl = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/board/${boardId}/sprint`;
    const sprintConfig = {
      method: 'get',
      sprinturl,
      headers: {
        Authorization: `Bearer ${updated_integration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const res = axios(sprintConfig);
    sprintPromises.push(res);

    const task_list = await this.prisma.task.findMany({
      where: {
        userWorkspaceId: userWorkspace.id,
        source: IntegrationType.JIRA,
      },
    });

    // const projectIdList = new Set();
    // const projectIds: any[] = [];
    // for (let index = 0; index < task_list.length; index++) {
    //   const projectId = task_list[index].projectId;
    //   if (
    //     updated_integration.jiraAccountId === task_list[index].assigneeId &&
    //     !projectIdList.has(projectId)
    //   ) {
    //     projectIdList.add(projectId);
    //     projectIds.push(Number(projectId));
    //   }
    // }

    // //Relation between ProjectId and local project id
    // const project_list = await this.prisma.project.findMany({
    //   where: { integrationID: updated_integration.id },
    // });
    // const mappedProjectId = new Map<number, number>();
    // project_list.map((project: any) => {
    //   mappedProjectId.set(Number(project.id), Number(project.projectId));
    // });

    // for (let index = 0; index < projectIds.length; index++) {
    //   const projectId = mappedProjectId.get(projectIds[index]);
    //   // console.log(projectId);
    //   const boardId = projectId && mappedBoardId.get(projectId);
    //   // console.log(boardId);
    //   if (!boardId) {
    //     continue;
    //   }
    //   const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/board/${boardId}/sprint`;
    //   const config = {
    //     method: 'get',
    //     url,
    //     headers: {
    //       Authorization: `Bearer ${updated_integration?.accessToken}`,
    //       'Content-Type': 'application/json',
    //     },
    //   };
    //   const res = axios(config);
    //   sprintPromises.push(res);
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
                projectId: project?.id,
                userWorkspaceId: userWorkspace.id,
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
                projectId: project?.id,
                userWorkspaceId: userWorkspace.id,
                state: val.state,
                name: val.name,
              });
            }

            const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/sprint/${val.id}/issue`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${updated_integration?.accessToken}`,
                'Content-Type': 'application/json',
              },
            };
            const res = axios(config);
            issuePromises.push(res);
          }
        });
    });
    //Get all task related to the sprint
    const resolvedPromise = await Promise.all(issuePromises);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [delSprint, crtSprint, sprints] = await Promise.all([
      await this.prisma.sprint.deleteMany({
        where: {
          projectId: project?.id,
        },
      }),
      await this.prisma.sprint.createMany({
        data: sprint_list,
      }),
      await this.prisma.sprint.findMany({
        where: {
          projectId: project?.id,
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

    //relation between taskId and integratedTaskId
    const mappedTaskId = new Map<number, number>();
    for (let index = 0; index < task_list.length; index++) {
      mappedTaskId.set(
        Number(task_list[index].integratedTaskId),
        task_list[index].id,
      );
    }

    resolvedPromise.map((res: any) => {
      const urlArray = res.config.url.split('/');
      const jiraSprintId = urlArray[urlArray.length - 2];
      const sprintId = mappedSprintId.get(Number(jiraSprintId));

      res.data.issues.map((nestedRes: any) => {
        const taskId = mappedTaskId.get(Number(nestedRes.id));

        issue_list.push({
          sprintId: sprintId,
          taskId: taskId,
          userWorkspaceId: userWorkspace.id,
        });
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    const sprintIds: number[] = Array.from(mappedSprintId.values());
    const [DST, CST, sprintTasks] = await Promise.all([
      await this.prisma.sprintTask.deleteMany({
        where: {
          userWorkspaceId: userWorkspace.id,
        },
      }),
      await this.prisma.sprintTask.createMany({
        data: issue_list,
      }),

      await this.prisma.sprintTask.findMany({
        where: {
          userWorkspaceId: userWorkspace.id,
        },
      }),
    ]);

    return { total: sprintTasks.length, sprintTasks };
  }

  async getSprintList(projectId: number, reqBody: GetSprintListQueryDto) {
    try {
      const st = reqBody.state as unknown as string;
      const array =
        st &&
        st
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim());

      return await this.prisma.sprint.findMany({
        where: {
          projectId,
        },
      });
    } catch (error) {
      return [];
    }
  }

  async getActiveSprintTasks(user: User, reqBody: GetSprintListQueryDto) {
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);
    return getUserIntegrationList.map(async (userIntegration) => {
      await this.getAllActiveSprintTask(user, reqBody, userIntegration);
    });
  }

  async getAllActiveSprintTask(
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
    const updated_integration =
      await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegration.id,
      );
    if (!updated_integration) {
      return null;
    }

    try {
      // const integrations = await this.prisma.integration.findMany({
      //   where: { userId: user.id },
      // });
      // if (!(integrations.length > 0)) return [];
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
      const taskIds = await this.getSprintTasksIds(
        userWorkspace?.id,
        sprintIds,
      );

      return await this.prisma.task.findMany({
        where: {
          assigneeId: updated_integration.jiraAccountId,
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
    } catch (error) {
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

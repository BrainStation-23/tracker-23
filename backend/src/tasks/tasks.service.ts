import axios from 'axios';
import { coreConfig } from 'config/core';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { APIException } from 'src/internal/exception/api.exception';
import { MyGateway } from 'src/notifications/socketGateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  Integration,
  IntegrationType,
  Project,
  Role,
  SessionStatus,
  StatusDetail,
  Task,
  User,
  UserIntegration,
  UserWorkspace,
} from '@prisma/client';

import {
  CreateTaskDto,
  GetTaskQuery,
  GetTeamTaskQuery, GetTeamTaskQueryType,
  StatusEnum,
  TimeSpentReqBodyDto,
  UpdatePinDto,
} from './dto';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { SprintsService } from 'src/sprints/sprints.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private integrationsService: IntegrationsService,
    private myGateway: MyGateway,
    private workspacesService: WorkspacesService,
    private sprintService: SprintsService,
  ) {}

  async getTasks(user: User, query: GetTaskQuery): Promise<Task[]> {
    try {
      const { priority, status, text } = query;
      const sprintIds = query.sprintId as unknown as string;
      const projectIds = query.projectIds as unknown as string;
      let { startDate, endDate } = query as unknown as GetTaskQuery;
      const sprintIdArray =
        sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));
      const projectIdArray =
        projectIds && projectIds.split(',').map((item) => Number(item.trim()));
      const userWorkspace =
        user.activeWorkspaceId &&
        (await this.prisma.userWorkspace.findFirst({
          where: {
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
        }));
      if (!userWorkspace) {
        return [];
      }

      const priority1: any = (priority as unknown as string)?.split(',');
      const status1: any = (status as unknown as string)?.split(',');
      startDate = startDate && new Date(startDate);
      endDate = endDate && new Date(endDate);
      if (endDate) {
        const oneDay = 3600 * 24 * 1000;
        endDate = new Date(endDate.getTime() + oneDay);
      }
      let tasks: Task[] = [];

      if (sprintIdArray && sprintIdArray.length) {
        // const integrationId = jiraIntegration?.jiraAccountId ?? '-1';
        const taskIds = await this.sprintService.getSprintTasksIds(
          sprintIdArray,
        );

        return await this.prisma.task.findMany({
          where: {
            userWorkspaceId: userWorkspace.id,
            source: IntegrationType.JIRA,
            id: { in: taskIds },
            ...(projectIdArray && {
              projectId: { in: projectIdArray.map((id) => Number(id)) },
            }),
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
      } else {
        const databaseQuery = {
          userWorkspaceId: userWorkspace.id,
          ...(projectIdArray && {
            projectId: { in: projectIdArray.map((id) => Number(id)) },
          }),
          ...(startDate &&
            endDate && {
              createdAt: { lte: endDate },
              updatedAt: { gte: startDate },
            }),
          ...(priority1 && { priority: { in: priority1 } }),
          ...(status1 && { status: { in: status1 } }),
          ...(text && {
            title: {
              contains: text,
              mode: 'insensitive',
            },
          }),
        };

        tasks = await this.prisma.task.findMany({
          where: databaseQuery,
          include: {
            sessions: true,
          },
        });
      }
      return tasks;
    } catch (err) {
      return [];
    }
  }

  async getWorkspaceTasks(user: User, query: GetTaskQuery): Promise<Task[]> {
    try {
      const { priority, status, text } = query;
      const sprintIds = query.sprintId as unknown as string;
      // console.log(sprintIds);
      let { startDate, endDate } = query as unknown as GetTaskQuery;

      const sprintIdArray =
        sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));

      const userWorkspace =
        user.activeWorkspaceId &&
        (await this.prisma.userWorkspace.findFirst({
          where: {
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
        }));
      if (!userWorkspace) {
        return [];
      }

      if (userWorkspace.role === Role.ADMIN) {
        const priority1: any = (priority as unknown as string)?.split(',');
        const status1: any = (status as unknown as string)?.split(',');

        startDate = startDate && new Date(startDate);
        endDate = endDate && new Date(endDate);
        if (endDate) {
          const oneDay = 3600 * 24 * 1000;
          endDate = new Date(endDate.getTime() + oneDay);
        }
        let tasks: Task[] = [];

        if (sprintIdArray && sprintIdArray.length) {
          // const integrationId = jiraIntegration?.jiraAccountId ?? '-1';
          const taskIds = await this.sprintService.getSprintTasksIds(
            sprintIdArray,
          );
          console.log(taskIds);

          return await this.prisma.task.findMany({
            where: {
              workspaceId: user.activeWorkspaceId,
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
        } else {
          const databaseQuery = {
            workspaceId: user.activeWorkspaceId,
            // OR: [
            //   {
            //     userWorkspaceId: userWorkspace.id,
            //     source: IntegrationType.JIRA,
            //   },
            //   {
            //     userWorkspaceId: userWorkspace.id,
            //     source: IntegrationType.TRACKER23,
            //   },
            // ],
            ...(startDate &&
              endDate && {
                createdAt: { lte: endDate },
                updatedAt: { gte: startDate },
              }),
            ...(priority1 && { priority: { in: priority1 } }),
            ...(status1 && { status: { in: status1 } }),
            ...(text && {
              title: {
                contains: text,
                mode: 'insensitive',
              },
            }),
          };

          tasks = await this.prisma.task.findMany({
            where: databaseQuery,
            include: {
              sessions: true,
            },
          });
        }
        console.log(tasks.length);
        return tasks;
      }

      throw new APIException(
        'Only admin has this ability',
        HttpStatus.BAD_REQUEST,
      );
    } catch (err) {
      // console.log(err.message);
      return [];
    }
  }
  async createTask(user: User, dto: CreateTaskDto) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (dto.isRecurrent) {
      await this.recurrentTask(user, userWorkspace.id, dto);
    } else {
      const task = await this.prisma.task.create({
        data: {
          userWorkspaceId: userWorkspace.id,
          title: dto.title,
          description: dto.description,
          estimation: dto.estimation,
          due: dto.due,
          priority: dto.priority,
          status: dto.status,
          labels: dto.labels,
          workspaceId: user.activeWorkspaceId,
        },
      });
      return task;
    }
  }

  async recurrentTask(user: User, userWorkspaceId: number, dto: CreateTaskDto) {
    const endDate = new Date(dto.endDate);
    const timeMultiplier =
      dto.frequency === 'DAILY' ? 1 : dto.frequency === 'WEEKLY' ? 7 : 14;
    const timeInterval = timeMultiplier * 3600 * 24 * 1000;
    const oneDay = 3600 * 24 * 1000;
    let taskPromises: Promise<any>[] = [];
    try {
      for (
        let startTime = new Date(dto.startTime).getTime(),
          endTime = new Date(dto.endTime).getTime();
        endTime <= endDate.getTime() + oneDay;
        startTime += timeInterval, endTime += timeInterval
      ) {
        taskPromises.push(
          this.prisma.task
            .create({
              data: {
                userWorkspaceId: userWorkspaceId,
                title: dto.title,
                description: dto.description,
                estimation: dto.estimation,
                due: dto.due,
                priority: dto.priority,
                status: dto.status,
                labels: dto.labels,
                createdAt: new Date(startTime),
                updatedAt: new Date(endTime),
                workspaceId: user.activeWorkspaceId,
              },
            })
            .then(async (task: any) => {
              await this.prisma.session.create({
                data: {
                  startTime: new Date(startTime),
                  endTime: new Date(endTime),
                  status: SessionStatus.STOPPED,
                  taskId: task.id,
                },
              });
            }),
        );
        if (taskPromises.length > 500) {
          await Promise.allSettled(taskPromises);
          taskPromises = [];
        }
      }
      await Promise.allSettled(taskPromises);
      return { message: 'Recurrent Tasks created' };
    } catch (error) {
      throw new APIException(
        error.message || 'Session creation Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // for future use
  recurrentSession = async (user: User, dto: CreateTaskDto, task: Task) => {
    if (dto.isRecurrent) {
      const endDate = new Date(dto.endDate);
      const timeMultiplier =
        dto.frequency === 'DAILY' ? 1 : dto.frequency === 'WEEKLY' ? 7 : 14;
      const timeInterval = timeMultiplier * 3600 * 24 * 1000;
      const oneDay = 3600 * 24 * 1000;
      const sessions: any = [];
      try {
        for (
          let startTime = new Date(dto.startTime).getTime(),
            endTime = new Date(dto.endTime).getTime();
          endTime <= endDate.getTime() + oneDay;
          startTime += timeInterval, endTime += timeInterval
        ) {
          const session = await this.prisma.session.create({
            data: {
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              status: SessionStatus.STOPPED,
              taskId: task.id,
            },
          });
          if (session) sessions.push(session);
        }
      } catch (error) {
        throw new APIException(
          'Session creation Failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  };

  async updatePin(id: number, dto: UpdatePinDto): Promise<Task> {
    return await this.prisma.task.update({
      where: { id },
      data: {
        pinned: dto.pinned,
      },
    });
  }

  async deleteTask(id: number): Promise<Task> {
    return await this.prisma.task.delete({ where: { id } });
  }

  async importProjectTasks2(user: User, projId: number, res?: Response) {
    console.log('hello from importProjectTasks');

    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });
    // console.log('project', project);

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegration =
      project?.integrationId &&
      (await this.prisma.userIntegration.findUnique({
        where: {
          userIntegrationIdentifier: {
            integrationId: project?.integrationId,
            userWorkspaceId: userWorkspace.id,
          },
        },
      }));

    const updated_userIntegration =
      userIntegration &&
      (await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegration.id,
      ));

    // console.log(updated_userIntegration);
    if (!updated_userIntegration) {
      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Project Import Failed',
              description: 'Project Import Failed',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
        await this.syncCall(StatusEnum.FAILED, user);
        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
      return [];
    }

    this.setProjectStatuses(project, updated_userIntegration);
    // console.log(projectId);
    try {
      const notification =
        user.activeWorkspaceId &&
        (await this.prisma.notification.create({
          data: {
            seen: false,
            author: 'SYSTEM',
            title: 'Importing Project',
            description: 'Importing Project',
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
        }));
      this.myGateway.sendNotification(`${user.id}`, notification);
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
        error.message,
      );
    }

    try {
      const headers: any = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${updated_userIntegration.accessToken}`,
      };

      const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/search?jql=project=${project.projectId}&maxResults=1000`;
      // const fields =
      //   'summary, assignee,timeoriginalestimate,project, comment, created, updated,status,priority';
      let respTasks;
      for (let startAt = 0; startAt < 5000; startAt += 100) {
        let worklogPromises: Promise<any>[] = [];
        // let taskPromises: Promise<any>[] = [];
        const taskList: any[] = [],
          worklogsList: any[] = [],
          sessionArray: any[] = [];
        const mappedIssues = new Map<number, any>();
        respTasks = (
          await lastValueFrom(
            this.httpService.get(url, {
              headers,
              params: { startAt, maxResults: 100 },
            }),
          )
        ).data;
        if (respTasks.issues.length === 0) {
          break;
        }
        respTasks.issues.map((issue: any) => {
          mappedIssues.set(Number(issue.id), issue.fields);
        });

        const integratedTasks = await this.prisma.task.findMany({
          where: {
            workspaceId: user.activeWorkspaceId,
            integratedTaskId: { in: [...mappedIssues.keys()] },
            source: IntegrationType.JIRA,
          },
          select: {
            integratedTaskId: true,
          },
        });

        // console.log(respTasks);

        // keep the task list that doesn't exist in the database
        for (let j = 0, len = integratedTasks.length; j < len; j++) {
          const key = integratedTasks[j].integratedTaskId;
          key && mappedIssues.delete(key);
        }
        for (const [integratedTaskId, integratedTask] of mappedIssues) {
          const taskStatus = integratedTask.status.name;
          const taskPriority = this.formatPriority(
            integratedTask.priority.name,
          );
          // console.log(integratedTask);

          taskList.push({
            userWorkspaceId:
              userIntegration.jiraAccountId ===
              integratedTask.assignee?.accountId
                ? userWorkspace.id
                : null,
            workspaceId: project.workspaceId,
            title: integratedTask.summary,
            assigneeId: integratedTask.assignee?.accountId || null,
            estimation: integratedTask.timeoriginalestimate
              ? integratedTask.timeoriginalestimate / 3600
              : null,
            projectName: project.projectName,
            projectId: project.id,
            status: taskStatus,
            statusCategoryName: integratedTask.status.statusCategory.name
              .replace(' ', '_')
              .toUpperCase(),
            priority: taskPriority,
            integratedTaskId: integratedTaskId,
            createdAt: new Date(integratedTask.created),
            updatedAt: new Date(integratedTask.updated),
            jiraUpdatedAt: new Date(integratedTask.updated),
            // parentTaskId: integratedTask.parent.id,
            source: IntegrationType.JIRA,
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [t, tasks] = await Promise.all([
          await this.prisma.task.createMany({
            data: taskList,
          }),
          await this.prisma.task.findMany({
            where: {
              source: IntegrationType.JIRA,
            },
            select: {
              id: true,
              integratedTaskId: true,
            },
          }),
        ]);
        console.log(t);
        const mappedTaskId = new Map<number, number>();
        for (let index = 0; index < tasks.length; index++) {
          mappedTaskId.set(
            Number(tasks[index].integratedTaskId),
            tasks[index].id,
          );
        }
        let total = 0;
        try {
          for (const [integratedTaskId] of mappedIssues) {
            const fields = 'issueId';
            const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
                'Content-Type': 'application/json',
                fields,
              },
            };
            const res = axios(config);
            worklogPromises.push(res);
            if (worklogPromises.length >= coreConfig.promiseQuantity) {
              total += coreConfig.promiseQuantity;
              const resolvedPromise = await Promise.all(worklogPromises);
              worklogsList.push(...resolvedPromise);
              worklogPromises = [];
            }
          }

          if (worklogPromises.length) {
            const resolvedPromise = await Promise.all(worklogPromises);
            worklogsList.push(...resolvedPromise);
          }
        } catch (error) {
          console.log(total, mappedIssues.size);
          console.log('🚀 ~ file: tasks.service.ts:366 ~ syncTasks ~ error:');
        }

        for (let index = 0; index < worklogsList.length; index++) {
          const urlArray = worklogsList[index].config.url.split('/');
          const jiraTaskId = urlArray[urlArray.length - 2];
          const taskId = mappedTaskId.get(Number(jiraTaskId));

          taskId &&
            worklogsList[index].data.worklogs.map((log: any) => {
              const lastTime =
                new Date(log.started).getTime() +
                Number(log.timeSpentSeconds * 1000);
              sessionArray.push({
                startTime: new Date(log.started),
                endTime: new Date(lastTime),
                status: SessionStatus.STOPPED,
                taskId: taskId,
                integratedTaskId: Number(log.issueId),
                worklogId: Number(log.id),
                authorId: log.author.accountId,
              });
            });
        }
        try {
          await this.prisma.session.createMany({
            data: sessionArray,
          });
        } catch (error) {
          console.log(
            '🚀 ~ file: tasks.service.ts:410 ~ syncTasks ~ error:',
            error.message,
          );
          console.log('Error creating sessions');
        }
      }
      const done = await this.syncCall(StatusEnum.DONE, user);
      if (done) {
        await this.sprintService.createSprintAndTask(
          user,
          projId,
          updated_userIntegration.id,
        );
      }

      //project update to add 'integrated: true'
      await this.prisma.project.update({
        where: { id: projId },
        data: { integrated: true },
      });

      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Importing Project',
              description: 'Importing Project',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
        res?.json({ message: 'Project Imported' });
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
    } catch (err) {
      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Importing Project Failed',
              description: 'Importing Project Failed',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
      console.log(err);
      throw new APIException('Can not sync with jira', HttpStatus.BAD_REQUEST);
    }
  }

  async importProjectTasks(user: User, projId: number, res?: Response) {
    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'Can not import project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegration =
      project?.integrationId &&
      (await this.getUserIntegration(userWorkspace.id, project.integrationId));
    const updatedUserIntegration =
      userIntegration &&
      (await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegration.id,
      ));

    if (!updatedUserIntegration) {
      await this.handleIntegrationFailure(user);
      return [];
    }

    res && (await this.syncCall(StatusEnum.IN_PROGRESS, user));

    this.setProjectStatuses(project, updatedUserIntegration);

    try {
      await this.sendImportingNotification(user);
      await this.fetchAndProcessTasksAndWorklog(
        userWorkspace,
        user,
        project,
        updatedUserIntegration,
      );
      await this.sprintService.createSprintAndTask(
        user,
        projId,
        updatedUserIntegration.id,
      );
      await this.updateProjectIntegrationStatus(projId);
      res && (await this.syncCall(StatusEnum.DONE, user));
      await this.sendImportedNotification(user, res);
    } catch (error) {
      await this.handleImportFailure(user);
      console.log(
        '🚀 ~ file: tasks.service.ts:752 ~ TasksService ~ importProjectTasks ~ error:',
        error,
      );
      throw new APIException(
        'Can not import project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getUserIntegration(
    userWorkspaceId: number,
    integrationId: number,
  ) {
    return this.prisma.userIntegration.findUnique({
      where: {
        userIntegrationIdentifier: {
          integrationId,
          userWorkspaceId,
        },
      },
    });
  }

  private async handleIntegrationFailure(user: User) {
    const notification = await this.createNotification(
      user,
      'Project Import Failed',
      'Project Import Failed',
    );
    this.myGateway.sendNotification(`${user.id}`, notification);
    await this.syncCall(StatusEnum.FAILED, user);
    throw new APIException(
      'Can not import project tasks',
      HttpStatus.BAD_REQUEST,
    );
  }

  private async createNotification(
    user: User,
    title: string,
    description: string,
  ) {
    return (
      user.activeWorkspaceId &&
      this.prisma.notification.create({
        data: {
          seen: false,
          author: 'SYSTEM',
          title,
          description,
          userId: user.id,
          workspaceId: user.activeWorkspaceId,
        },
      })
    );
  }

  private async sendImportingNotification(user: User) {
    const notification = await this.createNotification(
      user,
      'Importing Project',
      'Importing Project',
    );
    this.myGateway.sendNotification(`${user.id}`, notification);
  }

  private async fetchAndProcessTasksAndWorklog(
    userWorkspace: UserWorkspace,
    user: User,
    project: Project,
    userIntegration: UserIntegration,
  ) {
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userIntegration.accessToken}`,
    };

    const url = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/api/3/search?jql=project=${project.projectId}&maxResults=1000`;
    const fields =
      'summary, assignee,timeoriginalestimate,project, comment, created, updated,status,priority';
    let respTasks;
    for (let startAt = 0; startAt < 5000; startAt += 100) {
      let worklogPromises: Promise<any>[] = [];
      // let taskPromises: Promise<any>[] = [];
      const taskList: any[] = [],
        worklogsList: any[] = [],
        sessionArray: any[] = [];
      const mappedIssues = new Map<number, any>();
      respTasks = (
        await lastValueFrom(
          this.httpService.get(url, {
            headers,
            params: { startAt, maxResults: 100, fields },
          }),
        )
      ).data;

      if (!respTasks || respTasks.issues.length === 0) {
        break;
      }
      respTasks.issues.map((issue: any) => {
        mappedIssues.set(Number(issue.id), {
          ...issue?.fields,
          key: issue?.key,
        });
      });

      const integratedTasks = await this.prisma.task.findMany({
        where: {
          workspaceId: user.activeWorkspaceId,
          integratedTaskId: { in: [...mappedIssues.keys()] },
          source: IntegrationType.JIRA,
        },
        select: {
          integratedTaskId: true,
        },
      });

      // console.log(respTasks);

      // keep the task list that doesn't exist in the database
      for (let j = 0, len = integratedTasks.length; j < len; j++) {
        const key = integratedTasks[j].integratedTaskId;
        key && mappedIssues.delete(key);
      }
      for (const [integratedTaskId, integratedTask] of mappedIssues) {
        const taskStatus = integratedTask.status.name;
        const taskPriority = this.formatPriority(integratedTask.priority.name);
        // console.log(integratedTask);

        taskList.push({
          userWorkspaceId:
            userIntegration.jiraAccountId === integratedTask.assignee?.accountId
              ? userWorkspace.id
              : null,
          workspaceId: project.workspaceId,
          title: integratedTask.summary,
          assigneeId: integratedTask.assignee?.accountId || null,
          estimation: integratedTask.timeoriginalestimate
            ? integratedTask.timeoriginalestimate / 3600
            : null,
          projectName: project.projectName,
          projectId: project.id,
          status: taskStatus,
          statusCategoryName: integratedTask.status.statusCategory.name
            .replace(' ', '_')
            .toUpperCase(),
          priority: taskPriority,
          integratedTaskId: integratedTaskId,
          createdAt: new Date(integratedTask.created),
          updatedAt: new Date(integratedTask.updated),
          jiraUpdatedAt: new Date(integratedTask.updated),
          // parentTaskId: integratedTask.parent.id,
          source: IntegrationType.JIRA,
          //@ts-ignore
          url: `${userIntegration?.integration?.site}/browse/${integratedTask?.key}`,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mappedTaskId = new Map<number, number>();
      try {
        const [t, tasks] = await Promise.all([
          await this.prisma.task.createMany({
            data: taskList,
          }),
          await this.prisma.task.findMany({
            where: {
              projectId: project.id,
              source: IntegrationType.JIRA,
            },
            select: {
              id: true,
              integratedTaskId: true,
            },
          }),
        ]);

        for (let index = 0; index < tasks.length; index++) {
          mappedTaskId.set(
            Number(tasks[index].integratedTaskId),
            tasks[index].id,
          );
        }
      } catch (err) {
        console.log(
          '🚀 ~ file: tasks.service.ts:924 ~ TasksService ~ err:',
          err,
        );
        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }
      let total = 0;
      try {
        for (const [integratedTaskId] of mappedIssues) {
          const fields = 'issueId';
          const url = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
          const config = {
            method: 'get',
            url,
            headers: {
              Authorization: `Bearer ${userIntegration?.accessToken}`,
              'Content-Type': 'application/json',
              fields,
            },
          };
          const res = axios(config);
          worklogPromises.push(res);
          if (worklogPromises.length >= coreConfig.promiseQuantity) {
            total += coreConfig.promiseQuantity;
            const resolvedPromise = await Promise.all(worklogPromises);
            worklogsList.push(...resolvedPromise);
            worklogPromises = [];
          }
        }

        if (worklogPromises.length) {
          const resolvedPromise = await Promise.all(worklogPromises);
          worklogsList.push(...resolvedPromise);
        }
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:952 ~ TasksService ~ error:',
          error,
        );
        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }

      for (let index = 0; index < worklogsList.length; index++) {
        const urlArray = worklogsList[index].config.url.split('/');
        const jiraTaskId = urlArray[urlArray.length - 2];
        const taskId = mappedTaskId.get(Number(jiraTaskId));

        taskId &&
          worklogsList[index].data.worklogs.map((log: any) => {
            const lastTime =
              new Date(log.started).getTime() +
              Number(log.timeSpentSeconds * 1000);
            sessionArray.push({
              startTime: new Date(log.started),
              endTime: new Date(lastTime),
              status: SessionStatus.STOPPED,
              taskId: taskId,
              integratedTaskId: Number(log.issueId),
              worklogId: Number(log.id),
              authorId: log.author.accountId,
            });
          });
      }
      try {
        await this.prisma.session.createMany({
          data: sessionArray,
        });
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:986 ~ TasksService ~ error:',
          error,
        );

        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async updateProjectIntegrationStatus(projId: number) {
    await this.prisma.project.update({
      where: { id: projId },
      data: { integrated: true },
    });
  }

  private async sendImportedNotification(user: User, res?: Response) {
    const notification = await this.createNotification(
      user,
      'Project Imported',
      'Project Imported',
    );
    this.myGateway.sendNotification(`${user.id}`, notification);
    res?.json({ message: 'Project tasks Imported' });
  }

  private async handleImportFailure(user: User) {
    const notification = await this.createNotification(
      user,
      'Importing Project Failed',
      'Importing Project Failed',
    );
    this.myGateway.sendNotification(`${user.id}`, notification);
  }

  async syncTasks(user: User, id: number, res?: Response) {
    const project = await this.prisma.project.findFirst({
      where: { id: id },
      include: { integration: true },
    });
    if (!project) {
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }
    const projectId = project?.projectId;
    const projectName = project?.projectName;
    console.log(
      '🚀 ~ file: tasks.service.ts:271 ~ TasksService ~ projectTasks ~ projectId:',
      projectId,
    );
    try {
      const notification =
        user.activeWorkspaceId &&
        (await this.prisma.notification.create({
          data: {
            seen: false,
            author: 'SYSTEM',
            title: 'Syncing Project ' + projectName,
            description: 'Syncing Project ' + projectName,
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
        }));
      this.myGateway.sendNotification(`${user.id}`, notification);
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
        error.message,
      );
    }

    const updated_userIntegration =
      project.integrationId &&
      (await this.integrationsService.getUpdatedUserIntegration(
        user,
        project.integrationId,
      ));

    if (!updated_userIntegration) {
      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Syncing Project ' + projectName + ' Failed',
              description: 'Syncing Project ' + projectName + ' Failed',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
        await this.syncCall(StatusEnum.FAILED, user);
        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
      return [];
    }
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${updated_userIntegration.accessToken}`,
      };

      const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/search?jql=project=${projectId}&maxResults=1000`;
      const fields =
        'summary, assignee,timeoriginalestimate,project, comment, created, updated,status,priority, parent';
      let respTasks;
      for (let startAt = 0; startAt < 5000; startAt += 100) {
        let worklogPromises: Promise<any>[] = [];
        // let taskPromises: Promise<any>[] = [];
        const taskList: any[] = [],
          worklogsList: any[] = [],
          sessionArray: any[] = [];
        const mappedIssues = new Map<number, any>();
        respTasks = (
          await lastValueFrom(
            this.httpService.get(url, {
              headers,
              params: { startAt, maxResults: 100, fields },
            }),
          )
        ).data;
        if (respTasks.issues.length === 0) {
          break;
        }
        respTasks.issues.map((issue: any) => {
          mappedIssues.set(Number(issue.id), issue.fields);
        });

        const integratedTasks = await this.prisma.task.findMany({
          where: {
            workspaceId: user.activeWorkspaceId,
            integratedTaskId: { in: [...mappedIssues.keys()] },
            source: IntegrationType.JIRA,
          },
          select: {
            integratedTaskId: true,
          },
        });

        for (let j = 0, len = integratedTasks.length; j < len; j++) {
          const key = integratedTasks[j].integratedTaskId;
          const localTask = await this.prisma.task.findFirst({
            where: {
              integratedTaskId: key,
            },
          });
          const jiraTask = mappedIssues.get(Number(key));

          if (
            localTask &&
            localTask.jiraUpdatedAt &&
            localTask.jiraUpdatedAt < new Date(jiraTask.updated)
          ) {
            const taskPriority = this.formatPriority(jiraTask.priority.name);
            // const updatedTask =
            localTask &&
              localTask.id &&
              (await this.prisma.task.update({
                where: {
                  id: localTask.id,
                },
                data: {
                  title: jiraTask.summary,
                  assigneeId: jiraTask.assignee?.accountId || null,
                  estimation: jiraTask.timeoriginalestimate
                    ? jiraTask.timeoriginalestimate / 3600
                    : null,
                  projectName: jiraTask.project.name,
                  status: jiraTask.status.name,
                  statusCategoryName: jiraTask.status.statusCategory.name
                    .replace(' ', '_')
                    .toUpperCase(),
                  priority: taskPriority,
                  updatedAt:
                    localTask.updatedAt <= new Date(jiraTask.updated)
                      ? new Date(jiraTask.updated)
                      : localTask.updatedAt,
                  jiraUpdatedAt: new Date(jiraTask.updated),
                },
              }));
            // console.log(updatedTask);

            // worklog delete
            const wklogs = await this.prisma.session.deleteMany({
              where: {
                taskId: localTask.id,
              },
            });
            console.log(wklogs);

            const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/api/3/issue/${localTask.integratedTaskId}/worklog`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
                'Content-Type': 'application/json',
                fields,
              },
            };
            const worklog = (await axios(config)).data;
            // console.log(worklog);
            worklog.worklogs.map(async (log: any) => {
              const lastTime =
                new Date(log.started).getTime() +
                Number(log.timeSpentSeconds * 1000);
              localTask?.id &&
                (await this.prisma.session.create({
                  data: {
                    startTime: new Date(log.started),
                    endTime: new Date(lastTime),
                    status: SessionStatus.STOPPED,
                    taskId: localTask.id,
                    integratedTaskId: Number(log.issueId),
                    worklogId: Number(log.id),
                    authorId: log.author.accountId,
                  },
                }));
            });
          }
          // console.log('updatedTask', updatedTask);
        }

        // keep the task list that doesn't exist in the database
        for (let j = 0, len = integratedTasks.length; j < len; j++) {
          const key = integratedTasks[j].integratedTaskId;
          key && mappedIssues.delete(key);
        }
        for (const [integratedTaskId, integratedTask] of mappedIssues) {
          const taskStatus = integratedTask.status.name;
          const taskPriority = this.formatPriority(
            integratedTask.priority.name,
          );
          taskList.push({
            userId: user.id,
            title: integratedTask.summary,
            assigneeId: integratedTask.assignee?.accountId || null,
            estimation: integratedTask.timeoriginalestimate
              ? integratedTask.timeoriginalestimate / 3600
              : null,
            projectName: integratedTask.project.name,
            projectId: project.id,
            status: taskStatus,
            statusCategoryName: integratedTask.status.statusCategory.name
              .replace(' ', '_')
              .toUpperCase(),
            priority: taskPriority,
            integratedTaskId: integratedTaskId,
            createdAt: new Date(integratedTask.created),
            updatedAt: new Date(integratedTask.updated),
            jiraUpdatedAt: new Date(integratedTask.updated),
            parentTaskId: Number(integratedTask.parent.id),
            source: IntegrationType.JIRA,
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [t, tasks] = await Promise.all([
          await this.prisma.task.createMany({
            data: taskList,
          }),
          await this.prisma.task.findMany({
            where: {
              source: IntegrationType.JIRA,
            },
            select: {
              id: true,
              integratedTaskId: true,
            },
          }),
        ]);
        const mappedTaskId = new Map<number, number>();
        for (let index = 0; index < tasks.length; index++) {
          mappedTaskId.set(
            Number(tasks[index].integratedTaskId),
            tasks[index].id,
          );
        }
        let total = 0;
        try {
          for (const [integratedTaskId] of mappedIssues) {
            const fields = 'issueId';
            const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
                'Content-Type': 'application/json',
                fields,
              },
            };
            const res = axios(config);
            worklogPromises.push(res);
            if (worklogPromises.length >= coreConfig.promiseQuantity) {
              total += coreConfig.promiseQuantity;
              const resolvedPromise = await Promise.all(worklogPromises);
              worklogsList.push(...resolvedPromise);
              worklogPromises = [];
            }
          }

          if (worklogPromises.length) {
            const resolvedPromise = await Promise.all(worklogPromises);
            worklogsList.push(...resolvedPromise);
          }
        } catch (error) {
          console.log(total, mappedIssues.size);
          console.log('🚀 ~ file: tasks.service.ts:366 ~ syncTasks ~ error:');
        }

        for (let index = 0; index < worklogsList.length; index++) {
          const urlArray = worklogsList[index].config.url.split('/');
          const jiraTaskId = urlArray[urlArray.length - 2];
          const taskId = mappedTaskId.get(Number(jiraTaskId));

          taskId &&
            worklogsList[index].data.worklogs.map((log: any) => {
              const lastTime =
                new Date(log.started).getTime() +
                Number(log.timeSpentSeconds * 1000);
              sessionArray.push({
                startTime: new Date(log.started),
                endTime: new Date(lastTime),
                status: SessionStatus.STOPPED,
                taskId: taskId,
                integratedTaskId: Number(log.issueId),
                worklogId: Number(log.id),
                authorId: log.author.accountId,
              });
            });
        }
        try {
          await this.prisma.session.createMany({
            data: sessionArray,
          });
        } catch (error) {
          console.log(
            '🚀 ~ file: tasks.service.ts:410 ~ syncTasks ~ error:',
            error.message,
          );
          console.log('Error creating sessions');
        }
      }
      res && (await this.syncCall(StatusEnum.DONE, user));
      // if (done) {
      //   await this.createSprintAndTask(user, updated_userIntegration.id);
      // }
      try {
        const projectIntegrated = await this.prisma.project.update({
          where: { id: id },
          data: { integrated: true },
        });
        console.log(
          '🚀 ~ file: tasks.service.ts:521 ~ TasksService ~ projectTasks ~ projectIntegrated:',
          projectIntegrated,
        );
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:521 ~ TasksService ~ projectTasks ~ error:',
          error,
        );
      }
      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Project ' + projectName + ' Synced',
              description: 'Project ' + projectName + ' Synced',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
        res?.json({ message: 'Project Imported' });
        if (!res) return true;
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
        if (!res) return false;
      }
    } catch (err) {
      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Importing Project Failed',
              description: 'Importing Project Failed',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
      console.log(err);
      throw new APIException('Can not sync with jira', HttpStatus.BAD_REQUEST);
    }
  }

  async syncAll(user: User) {
    // async syncTasks(user: User, id: number, res?: Response)
    await this.syncCall(StatusEnum.IN_PROGRESS, user);
    const projectIds = await this.sprintService.getProjectIds(user);
    let syncedProjects = 0;
    try {
      for (const projectId of projectIds) {
        const synced = await this.syncTasks(user, projectId);
        console.log(
          '🚀 ~ file: tasks.service.ts:1436 ~ TasksService ~ syncAll ~ synced:',
          synced,
        );
        if (synced) syncedProjects++;
      }
      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Synced all projects',
              description: 'Synced all projects',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
      await this.syncCall(StatusEnum.DONE, user);
      return { message: syncedProjects + ' Projects Imported' };
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1437 ~ TasksService ~ syncAll ~ error:',
        error,
      );
      throw new APIException(
        'Can not sync All projects : ' +
          `${syncedProjects} synced out of ${projectIds?.length} projects`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  formatStatus(status: string) {
    switch (status) {
      case 'Done':
        return 'DONE';
      case 'In Progress':
        return 'IN_PROGRESS';
      default:
        return 'TODO';
    }
  }

  formatPriority(priority: string) {
    switch (priority) {
      case 'High':
        return 'HIGH';
      case 'Medium':
        return 'MEDIUM';
      case 'Low':
        return 'LOW';
    }
  }

  async getCallSync(user: User) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const getData = await this.prisma.callSync.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
        },
      });
      if (!getData) {
        return {
          id: -1,
          status: 'Not yet synced',
          userWorkspaceId: userWorkspace.id,
        };
      }
      return getData;
    } catch (err) {
      console.log(err.message);
      throw new APIException('Not found', HttpStatus.BAD_REQUEST);
    }
  }

  async syncCall(status: string, user: User) {
    try {
      const doesExist = await this.getCallSync(user);
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!doesExist || doesExist.id === -1) {
        return await this.prisma.callSync.create({
          data: {
            status,
            userWorkspaceId: userWorkspace.id,
          },
        });
      }

      return await this.prisma.callSync.update({
        where: { id: doesExist.id },
        data: {
          status: status,
        },
      });
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }

  async updateIssueStatus(user: User, taskId: string, status: string) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const task = await this.prisma.task.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
          id: Number(taskId),
        },
        select: {
          integratedTaskId: true,
          projectId: true,
        },
      });
      if (task?.projectId === null) {
        const updatedTask = await this.prisma.task.update({
          where: {
            id: Number(taskId),
          },
          data: {
            status: status,
            statusCategoryName: getStatusCategoryName(status),
          },
        });
        return updatedTask;
      } else if (task && task.projectId) {
        const project = await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        });
        if (!project)
          throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

        const updated_userIntegration =
          project.integration?.id &&
          (await this.integrationsService.getUpdatedUserIntegration(
            user,
            project.integration.id,
          ));
        const statuses: StatusDetail[] = task?.projectId
          ? await this.prisma.statusDetail.findMany({
              where: {
                projectId: task?.projectId,
              },
            })
          : [];
        if (!updated_userIntegration)
          throw new APIException(
            'Updating Integration Failed',
            HttpStatus.BAD_REQUEST,
          );
        const statusNames = statuses?.map((status) => status.name);
        const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/api/3/issue/${task?.integratedTaskId}/transitions`;
        if (statuses[0].transitionId === null) {
          const config = {
            method: 'get',
            url,
            headers: {
              Authorization: `Bearer ${updated_userIntegration.accessToken}`,
              'Content-Type': 'application/json',
            },
          };
          const { transitions } = (await axios(config)).data;
          for (const transition of transitions) {
            if (task.projectId && statusNames.includes(transition.name)) {
              await this.prisma.statusDetail.update({
                where: {
                  tempStatusDetailIdentifier: {
                    name: transition.name,
                    projectId: task.projectId,
                  },
                },
                data: { transitionId: transition.id },
              });
            }
          }
        }

        const statusDetails = await this.prisma.statusDetail.findFirst({
          where: {
            projectId: task?.projectId,
            name: status,
          },
        });

        const statusBody = JSON.stringify({
          transition: {
            id: statusDetails?.transitionId,
          },
        });
        const config = {
          method: 'post',
          url,
          headers: {
            Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
            'Content-Type': 'application/json',
          },
          data: statusBody,
        };
        const updatedIssue = await axios(config);
        const updatedTask =
          updatedIssue &&
          (await this.prisma.task.update({
            where: {
              id: Number(taskId),
            },
            data: {
              status: status,
              statusCategoryName: statusDetails?.statusCategoryName,
            },
          }));
        if (!updatedTask) {
          throw new APIException(
            'Can not update issue status 1',
            HttpStatus.BAD_REQUEST,
          );
        }
        return updatedTask;
      } else
        throw new APIException('No Integrations Found', HttpStatus.BAD_REQUEST);
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        'Can not update issue status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateIssueEstimation(user: User, taskId: string, estimation: number) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const task = await this.prisma.task.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
          id: Number(taskId),
        },
        select: {
          integratedTaskId: true,
          projectId: true,
        },
      });
      if (task?.projectId === null) {
        const updatedTask = await this.prisma.task.update({
          where: {
            id: Number(taskId),
          },
          data: {
            estimation: estimation,
          },
        });
        return updatedTask;
      } else if (task && task.projectId) {
        const project = await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        });
        if (!project)
          throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

        const updated_userIntegration =
          project.integration?.id &&
          (await this.integrationsService.getUpdatedUserIntegration(
            user,
            project.integration.id,
          ));
        if (!updated_userIntegration)
          throw new APIException(
            'Updating Integration Failed',
            HttpStatus.BAD_REQUEST,
          );
        const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/api/3/issue/${task?.integratedTaskId}`;

        const estimationBody = JSON.stringify({
          update: {
            timetracking: [
              {
                edit: {
                  originalEstimate: estimation + 'h',
                },
              },
            ],
          },
        });
        console.log(
          '🚀 ~ file: tasks.service.ts:661 ~ TasksService ~ updateIssueEstimation ~ esmationBody:',
          estimationBody,
        );
        const config = {
          method: 'put',
          url,
          headers: {
            Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
            'Content-Type': 'application/json',
          },
          data: estimationBody,
        };
        const updatedIssue = await axios(config);
        const updatedTask =
          updatedIssue &&
          (await this.prisma.task.update({
            where: {
              id: Number(taskId),
            },
            data: {
              estimation: estimation,
            },
          }));
        if (!updatedTask) {
          throw new APIException(
            'Can not update issue estimation',
            HttpStatus.BAD_REQUEST,
          );
        }
        return updatedTask;
      } else
        throw new APIException('No Integrations Found', HttpStatus.BAD_REQUEST);
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        'Can not update issue status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // This api doesn't in use
  async addWorkLog(
    user: User,
    issueId: string,
    timeSpentReqBody: TimeSpentReqBodyDto,
  ) {
    try {
      // fix this incase u need this api
      const updated_userIntegration =
        await this.integrationsService.getUpdatedUserIntegration(user, 7);
      const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/api/3/issue/${issueId}/worklog`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: timeSpentReqBody,
      };

      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(err.message);
    }
  }

  async weeklySpentTime(user: User, query: GetTaskQuery) {
    let { startDate, endDate } = query;
    startDate = startDate && new Date(startDate);
    endDate = endDate && new Date(endDate);
    const taskList: any[] = await this.getTasks(user, query);

    let totalTimeSpent = 0;
    const map = new Map<string, number>();
    for (const task of taskList) {
      let taskTimeSpent = 0;
      task?.sessions?.forEach((session: any) => {
        const start = new Date(session.startTime);
        let end = new Date(session.endTime);
        if (end.getTime() === 0) {
          end = new Date();
        }
        let sessionTimeSpent = 0;
        if (start >= startDate && end <= endDate) {
          sessionTimeSpent = (end.getTime() - start.getTime()) / (1000 * 60);
        } else if (startDate >= start && end >= endDate) {
          sessionTimeSpent =
            (endDate.getTime() - startDate.getTime()) / (1000 * 60);
        } else if (end >= startDate) {
          sessionTimeSpent =
            Math.min(
              Math.max(endDate.getTime() - start.getTime(), 0),
              end.getTime() - startDate.getTime(),
            ) /
            (1000 * 60);
        }
        totalTimeSpent += sessionTimeSpent;
        taskTimeSpent += sessionTimeSpent;
      });

      if (!task.projectName) task.projectName = 'T23';

      if (!map.has(task.projectName)) {
        map.set(task.projectName, taskTimeSpent);
      } else {
        let getValue = map.get(task.projectName);
        if (!getValue) getValue = 0;
        map.set(task.projectName, getValue + taskTimeSpent);
      }
    }
    const ar = [];
    const iterator = map[Symbol.iterator]();
    for (const item of iterator) {
      ar.push({
        projectName: item[0],
        value: this.getHourFromMinutes(item[1]),
      });
    }

    return {
      TotalSpentTime: this.getHourFromMinutes(totalTimeSpent),
      value: ar,
    };
  }

  async getSpentTimeByDay(user: User, query: GetTaskQuery) {
    let { startDate, endDate } = query;
    startDate = startDate ? new Date(startDate) : new Date()
    endDate = endDate ? new Date(endDate) : new Date()
    try{
      const taskList: any[] = await this.getTasks(user, query);
      return this.getSpentTimePerDay(taskList, startDate, endDate);
    } catch (e) {
      console.log(e);
      throw new APIException('Could not get tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  getHourFromMinutes(min: number) {
    if (!min) return 0;
    const hour = Number((min / 60).toFixed(2));
    return hour;
  }

  async getAllStatus(user: User) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      //Lots of works to do
      const integration = await this.prisma.userIntegration.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
        },
      });
      if (!integration) {
        throw new APIException(
          'You have no integration',
          HttpStatus.BAD_REQUEST,
        );
      }
      const url = `https://api.atlassian.com/ex/jira/${integration?.siteId}//rest/api/3/statuscategory`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(err.message);
    }
  }

  async setProjectStatuses2(user: User, integration: Integration) {
    const updated_userIntegration =
      await this.integrationsService.getUpdatedUserIntegration(
        user,
        integration.id,
      );
    if (!updated_userIntegration) return [];
    // let statusList: any;
    const getStatusListUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/status`;
    const getProjectListUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/project`;

    try {
      const { data: statusList } = await axios.get(getStatusListUrl, {
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        },
      });
      const { data: projectList } = await axios.get(getProjectListUrl, {
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        },
      });

      const projectIdList = new Set();
      const projectListArray: any[] = [];
      const statusArray: StatusDetail[] = [];

      for (const project of projectList) {
        const { id: projectId, key: projectKey, name: projectName } = project;
        if (projectId) {
          if (!projectIdList.has(projectId)) {
            projectIdList.add(projectId);
            projectListArray.push({
              projectId: Number(projectId),
              projectName,
              projectKey,
              source: updated_userIntegration
                ? `${updated_userIntegration.integration?.site}/browse/${projectKey}`
                : '',
              // source: IntegrationType.JIRA,

              integrationID: updated_userIntegration.id,
              // userId: user.id,
              integrated: false,
            });
          }
        }
      }
      await this.prisma.project.createMany({
        data: projectListArray,
      });
      const projectsList = await this.prisma.project.findMany({
        where: { integrationId: updated_userIntegration.integration?.id },
        include: {
          statuses: true,
        },
      });
      const projectsWithoutStatuses = new Set();
      const mappedProjects = new Map<number, number>();
      projectsList.map((project: any) => {
        projectsWithoutStatuses.add(project.projectId);
        mappedProjects.set(project.projectId, project.id);
      });
      // for (const status of statusList) {
      //   const { name, untranslatedName, id, statusCategory } = status;
      //   console.log(name, untranslatedName, id, statusCategory);
      //   const projectId = status?.scope?.project?.id;
      //   // if (!projectId) continue;
      //   console.log(projectId);
      //   projectsWithoutStatuses.delete(projectId);
      //   const statusProjectId = mappedProjects.get(Number(projectId));
      //   const statusDetail: any = {
      //     name,
      //     untranslatedName,
      //     statusId: id,
      //     statusCategoryId: `${statusCategory.id}`,
      //     statusCategoryName: statusCategory.name
      //       .replace(' ', '_')
      //       .toUpperCase(),
      //     projectId: statusProjectId,
      //     // transitionId: null,
      //   };
      //   statusProjectId && statusArray.push(statusDetail);
      // }
      console.log('statusArray1', statusArray);
      if (projectsWithoutStatuses.size > 0) {
        for (const projectId of projectsWithoutStatuses) {
          const getStatusByProjectIdUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/project/${projectId}/statuses`;
          const { data: res } = await axios.get(getStatusByProjectIdUrl, {
            headers: {
              Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
            },
          });
          const StatusByProjectList = res.length > 0 ? res[0].statuses : [];
          for (const status of StatusByProjectList) {
            const { name, untranslatedName, id, statusCategory } = status;
            const statusProjectId = mappedProjects.get(Number(projectId));
            const statusDetail: any = {
              name,
              untranslatedName,
              statusId: id,
              statusCategoryId: `${statusCategory.id}`,
              statusCategoryName: statusCategory.name
                .replace(' ', '_')
                .toUpperCase(),
              projectId: statusProjectId,
              // transitionId: null,
            };
            statusProjectId && statusArray.push(statusDetail);
          }
          console.log('statusArray1', statusArray);
        }
      }
      try {
        console.log(statusArray);
        await this.prisma.statusDetail.createMany({
          data: statusArray,
        });
      } catch (error) {
        console.log(
          '🚀 ~ file: jira.service.ts:261 ~ setProjectStatuses ~ error:',
          error,
        );
      }

      // return await this.getProjectStatuses(user);
      // await Promise.allSettled([
      //   await this.prisma.project.createMany({
      //     data: projectListArray,
      //   }),
      //   await this.prisma.statusDetail.createMany({ data: statusArray }),
      // ]);
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:945 ~ setProjectStatuses ~ error:',
        error,
      );
      return error;
    }
  }

  async fetchAllProjects(user: User, integration: Integration) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userIntegration =
      user.activeWorkspaceId &&
      (await this.prisma.userIntegration.findUnique({
        where: {
          userIntegrationIdentifier: {
            integrationId: integration.id,
            userWorkspaceId: userWorkspace.id,
          },
        },
      }));
    const updated_userIntegration =
      userIntegration &&
      (await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegration.id,
      ));
    if (!updated_userIntegration)
      throw new APIException(
        'Updating Integration Failed',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const getProjectListUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/project`;
      const { data: projectList } = await axios.get(getProjectListUrl, {
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        },
      });
      const projectIdList = new Set();
      const projectListArray: any[] = [];

      for (const project of projectList) {
        const { id: projectId, key: projectKey, name: projectName } = project;
        if (projectId) {
          if (!projectIdList.has(projectId)) {
            projectIdList.add(projectId);
            projectListArray.push({
              projectId: Number(projectId),
              projectName,
              projectKey,
              source: updated_userIntegration
                ? `${updated_userIntegration.integration?.site}/browse/${projectKey}`
                : '',
              integrationId: integration.id,
              workspaceId: userWorkspace.workspaceId,
              integrated: false,
            });
          }
        }
      }
      await this.prisma.project.createMany({
        data: projectListArray,
      });
      return await this.prisma.project.findMany({
        where: { integrationId: updated_userIntegration.integration?.id },
        include: {
          statuses: true,
        },
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async setProjectStatuses(
    project: Project,
    updatedUserIntegration: UserIntegration,
  ) {
    const localStatus = await this.prisma.statusDetail.findMany({
      where: { projectId: project.id },
    });
    try {
      const getStatusByProjectIdUrl = `https://api.atlassian.com/ex/jira/${updatedUserIntegration.siteId}/rest/api/3/project/${project.projectId}/statuses`;
      const { data: statusList } = await axios.get(getStatusByProjectIdUrl, {
        headers: {
          Authorization: `Bearer ${updatedUserIntegration?.accessToken}`,
        },
      });

      const StatusListByProjectId =
        statusList.length > 0 ? statusList[0].statuses : [];
      const statusArray: any[] = [];
      const mappedStatuses = new Map<string, number>();
      localStatus.map((status: StatusDetail) => {
        mappedStatuses.set(status.name, status.id);
      });

      for (const status of StatusListByProjectId) {
        const { name, untranslatedName, id, statusCategory } = status;
        const statusDetail: any = {
          name,
          untranslatedName,
          statusId: id,
          statusCategoryId: `${statusCategory.id}`,
          statusCategoryName: statusCategory.name
            .replace(' ', '_')
            .toUpperCase(),
          projectId: project.id,
          // transitionId: null,
        };
        const doesExist = mappedStatuses.get(name);
        if (!doesExist) statusArray.push(statusDetail);
      }
      await this.prisma.statusDetail.createMany({
        data: statusArray,
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: jira.service.ts:261 ~ setProjectStatuses ~ error:',
        error.message,
      );
    }
  }

  async getProjectList(user: User) {
    return await this.prisma.project.findMany({
      where: {
        workspaceId: user.activeWorkspaceId,
      },
    });
  }

  async deleteProjectTasks(user: User, id: number, res: Response) {
    const project = await this.prisma.project.findFirst({
      where: { id: id },
      include: { integration: true },
    });
    if (!project) {
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.task.deleteMany({
        where: {
          projectId: id,
        },
      });
      try {
        const projectIntegrated = await this.prisma.project.update({
          where: { id: id },
          data: { integrated: false },
        });
        console.log(
          '🚀 ~ file: tasks.service.ts:1704 ~ TasksService ~ deleteProjectTasks ~ projectIntegrated:',
          projectIntegrated,
        );
        return res.status(202).json({ message: 'Project Deleted' });
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:521 ~ TasksService ~ projectTasks ~ error:',
          error,
        );
      }
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1645 ~ TasksService ~ deleteProjectTasks ~ error:',
        error,
      );
      throw new APIException('Internal server Error', HttpStatus.BAD_REQUEST);
    }
  }

  async getTimeSpentByTeam(query: GetTeamTaskQuery, user: User, type: GetTeamTaskQueryType) {
    let projectIds, projectIdArray, userIds, userIdArray;
    if(query?.projectIds) {
      projectIds = query?.projectIds as unknown as string;
      projectIdArray =
          projectIds && projectIds.split(',').map((item) => Number(item.trim()));
    }
    if(query?.userIds){
      userIds = query?.userIds as unknown as string;
      userIdArray =
          userIds && userIds.split(',').map((item) => Number(item.trim()));
    }

    if(!user?.activeWorkspaceId) throw new APIException('No user workspace detected', HttpStatus.BAD_REQUEST);

    let { startDate, endDate } = query;
    startDate = startDate ? new Date(startDate) : new Date()
    endDate = endDate ? new Date(endDate) : new Date()
    let taskList;

    if(!userIdArray || userIdArray?.length === 0){
      try {
        taskList = user?.activeWorkspaceId && await this.prisma.task.findMany({
          where: {
            workspaceId: user?.activeWorkspaceId,
            ...(projectIdArray && projectIdArray?.length !== 0 && { projectId: { in: projectIdArray } }),
            ...(query?.status && { status: query?.status }),
            sessions: {
              some: {
                startTime: {
                  gte: startDate,
                },
              },
            },
          },
          select: {
            sessions: true,
            project: true
          }
        });
      } catch (e) {
        console.log(e);
        throw new APIException('Could not get task list', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      try {
        let userWorkspaces = user?.activeWorkspaceId && await this.prisma.userWorkspace.findMany({
          where: {
            userId:{
              in: userIdArray
            },
            workspaceId: user?.activeWorkspaceId,
          },
          select: {
            id: true,
          }
        });
        //@ts-ignore
        const userWorkspaceIds: number[] = userWorkspaces?.map((userWorkspace: any) => userWorkspace?.id);

        taskList = await this.prisma.task.findMany({
          where : {
            ...(projectIdArray && projectIdArray?.length !== 0 && { projectId: { in: projectIdArray } }),
            ...(query?.status && { status: query?.status }),
            userWorkspaceId: {
              in: userWorkspaceIds,
            },
            sessions: {
              some: {
                startTime: {
                  gte: startDate,
                },
              },
            },
          },
          select: {
            sessions: true,
            project: true,
          }
        });
      } catch (e) {
        console.log(e);
        throw new APIException('Could not get task list', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    if(!taskList) return { value: 0, message: 'No tasks available'};

    return type === GetTeamTaskQueryType.DATE_RANGE
        ? this.getSpentTimeOnTasks(taskList, startDate, endDate)
        : this.getSpentTimePerDay(taskList, startDate, endDate)
  }

  //private functions
  getSpentTimeOnTasks(taskList: any, startDate: Date, endDate: Date){
    let totalTimeSpent = 0;
    const map = new Map<string, number>();
    for (const task of taskList) {
      const {project} = task;
      let taskTimeSpent = 0;
      task?.sessions?.forEach((session: any) => {
        const start = new Date(session.startTime);
        let end = new Date(session.endTime);
        if (end.getTime() === 0) {
          end = new Date();
        }
        let sessionTimeSpent = 0;
        if (start >= startDate && end <= endDate) {
          sessionTimeSpent = (end.getTime() - start.getTime()) / (1000 * 60);
        } else if (startDate >= start && end >= endDate) {
          sessionTimeSpent =
              (endDate.getTime() - startDate.getTime()) / (1000 * 60);
        } else if (end >= startDate) {
          sessionTimeSpent =
              Math.min(
                  Math.max(endDate.getTime() - start.getTime(), 0),
                  end.getTime() - startDate.getTime(),
              ) /
              (1000 * 60);
        }
        totalTimeSpent += sessionTimeSpent;
        taskTimeSpent += sessionTimeSpent;
      });
      if (!project?.projectName) project.projectName = 'T23';

      if (!map.has(project?.projectName)) {
        map.set(project?.projectName, taskTimeSpent);
      } else {
        let getValue = map.get(project?.projectName);
        if (!getValue) getValue = 0;
        map.set(project?.projectName, getValue + taskTimeSpent);
      }
    }
    const ar = [];
    const iterator = map[Symbol.iterator]();
    for (const item of iterator) {
      ar.push({
        projectName: item[0],
        value: this.getHourFromMinutes(item[1]),
      });
    }

    return {
      TotalSpentTime: this.getHourFromMinutes(totalTimeSpent),
      value: ar,
    };
  }

  getSpentTimePerDay(taskList: any, startDate: Date, endDate: Date){
    const map = new Map<Date, number>();

    let totalTimeSpent = 0;
    const oneDay = 3600 * 24 * 1000;
    for (
        let endDay = startDate.getTime() + oneDay, startDay = startDate.getTime();
        endDay <= endDate.getTime() + oneDay;
        endDay += oneDay, startDay += oneDay
    ) {
      for (const task of taskList) {
        task?.sessions?.forEach((session: any) => {
          const start = new Date(session.startTime);
          let end = new Date(session.endTime);
          if (end.getTime() === 0) {
            end = new Date();
          }

          let sessionTimeSpent = 0;
          if (start.getTime() >= startDay && end.getTime() <= endDay) {
            sessionTimeSpent = (end.getTime() - start.getTime()) / (1000 * 60);
          } else if (startDay >= start.getTime() && end.getTime() >= endDay) {
            sessionTimeSpent = (endDay - startDay) / (1000 * 60);
          } else if (end.getTime() >= startDay) {
            sessionTimeSpent =
                Math.min(
                    Math.max(endDay - start.getTime(), 0),
                    end.getTime() - startDay,
                ) /
                (1000 * 60);
          }
          totalTimeSpent += sessionTimeSpent;
        });
      }
      let tmp = map.get(new Date(startDay));
      if (!tmp) tmp = 0;
      map.set(
          new Date(startDay),
          tmp + this.getHourFromMinutes(totalTimeSpent),
      );
      totalTimeSpent = 0;
    }
    const ar = [];
    const iterator = map[Symbol.iterator]();
    for (const item of iterator) {
      ar.push({
        day: item[0],
        hour: item[1],
      });
    }
    return ar;
  }
}

const getStatusCategoryName = (status: string) => {
  switch (status) {
    case 'To Do':
      return 'TO_DO';
    case 'Done':
      return 'DONE';
    default:
      return 'IN_PROGRESS';
  }
};

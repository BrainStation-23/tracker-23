import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IntegrationType,
  SessionStatus,
  StatusDetail,
  Task,
  User,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateTaskDto,
  GetTaskQuery,
  StatusEnum,
  TimeSpentReqBodyDto,
  UpdatePinDto,
} from './dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Response } from 'express';
import { APIException } from 'src/internal/exception/api.exception';
import { coreConfig } from 'config/core';
import { MyGateway } from 'src/notifications/socketGateway';

@Injectable()
export class TasksService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private myGateway: MyGateway,
  ) {}

  async getSprintTasks(user: User, sprintIds: number[]) {
    try {
      const getSprintTasks = await this.prisma.sprintTask.findMany({
        where: {
          userId: user.id,
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

  async getTasks(user: User, query: GetTaskQuery): Promise<Task[]> {
    try {
      const { priority, status, text } = query;
      const sprintIds = query.sprintId as unknown as string;
      // console.log(sprintIds);
      let { startDate, endDate } = query as unknown as GetTaskQuery;

      const sprintIdArray =
        sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));
      // console.log(sprintIdArray);

      const jiraIntegration = await this.prisma.integration.findFirst({
        where: { userId: user.id, type: IntegrationType.JIRA },
      });

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
        const inttegrationId = jiraIntegration?.jiraAccountId ?? '-1';
        const taskIds = await this.getSprintTasks(user, sprintIdArray);
        console.log(taskIds);

        return await this.prisma.task.findMany({
          where: {
            assigneeId: inttegrationId,
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
          userId: user.id,
          OR: [
            {
              assigneeId: jiraIntegration
                ? jiraIntegration.jiraAccountId
                : '-1',
              source: IntegrationType.JIRA,
            },
            {
              source: IntegrationType.TRACKER23,
            },
          ],
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
      // console.log(err.message);
      return [];
    }
  }

  async createTask(user: User, dto: CreateTaskDto) {
    if (dto.isRecurrent) {
      await this.recurrentTask(user, dto);
    } else {
      const task: Task = await this.prisma.task.create({
        data: {
          userId: user.id,
          title: dto.title,
          description: dto.description,
          estimation: dto.estimation,
          due: dto.due,
          priority: dto.priority,
          status: dto.status,
          labels: dto.labels,
        },
      });
      return task;
    }
  }

  async recurrentTask(user: User, dto: CreateTaskDto) {
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
                userId: user.id,
                title: dto.title,
                description: dto.description,
                estimation: dto.estimation,
                due: dto.due,
                priority: dto.priority,
                status: dto.status,
                labels: dto.labels,
                createdAt: new Date(startTime),
                updatedAt: new Date(endTime),
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

  async projectTasks(user: User, projectId: number, res?: Response) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          seen: false,
          author: 'SYSTEM',
          title: 'Sync Started',
          description: 'Sync Started',
          userId: user.id,
        },
      });
      this.myGateway.sendNotification(`${user.id}`, notification);
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
        error.message,
      );
    }
    ///////////////////////////////

    console.log('hello first');
    const updated_integration = await this.updateIntegration(user);
    console.log('updated_integration', updated_integration);
    if (!updated_integration) {
      try {
        const notification = await this.prisma.notification.create({
          data: {
            seen: false,
            author: 'SYSTEM',
            title: 'Sync Failed',
            description: 'Sync Failed',
            userId: user.id,
          },
        });
        this.myGateway.sendNotification(`${user.id}`, notification);
        await this.syncCall(StatusEnum.FAILED, user.id);
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
    console.log('hello');
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${updated_integration.accessToken}`,
      };
      // headers['Authorization'] = `Bearer ${updated_integration.accessToken}`;
      if (res) {
        res.json(await this.syncCall(StatusEnum.IN_PROGRESS, user.id));
      } else {
        await this.syncCall(StatusEnum.IN_PROGRESS, user.id);
      }
      // await this.setProjectStatuses(user);

      //Relation between projectId and local project id
      const projectsList = await this.prisma.project.findMany({
        where: { integrationID: updated_integration.id },
      });
      const mappedProjects = new Map<string, number>();
      projectsList.map((project: any) => {
        mappedProjects.set(project.projectId, project.id);
      });
      const url = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/search?jql=project=${projectId}&maxResults=1000`;
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
        if (respTasks.issues.length === 0) {
          break;
        }
        respTasks.issues.map((issue: any) => {
          mappedIssues.set(Number(issue.id), issue.fields);
        });

        const integratedTasks = await this.prisma.task.findMany({
          where: {
            userId: user.id,
            integratedTaskId: { in: [...mappedIssues.keys()] },
            source: IntegrationType.JIRA,
          },
          select: {
            integratedTaskId: true,
          },
        });

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
            projectId: mappedProjects.get(integratedTask.project.id) ?? null,
            status: taskStatus,
            statusCategoryName: integratedTask.status.statusCategory.name
              .replace(' ', '_')
              .toUpperCase(),
            priority: taskPriority,
            integratedTaskId: integratedTaskId,
            createdAt: new Date(integratedTask.created),
            updatedAt: new Date(integratedTask.updated),
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
          console.log('Hello from line 1 worklog');
          for (const [integratedTaskId] of mappedIssues) {
            const fields = 'issueId';
            const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${updated_integration?.accessToken}`,
                'Content-Type': 'application/json',
                fields,
              },
            };
            const res = axios(config);
            worklogPromises.push(res);
            if (worklogPromises.length >= coreConfig.promiseQuantity) {
              total += coreConfig.promiseQuantity;
              const resolvedPromise = await Promise.all(worklogPromises);
              console.log(
                'Hello from log no 2 worklog',
                resolvedPromise.length,
              );
              worklogsList.push(...resolvedPromise);
              worklogPromises = [];
            }
          }

          if (worklogPromises.length) {
            const resolvedPromise = await Promise.all(worklogPromises);
            worklogsList.push(...resolvedPromise);
            console.log('Hello from log final worklog', resolvedPromise.length);
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
      const done = await this.syncCall(StatusEnum.DONE, user.id);
      if (done) {
        await this.createSprintAndTask(user);
      }

      try {
        const notification = await this.prisma.notification.create({
          data: {
            seen: false,
            author: 'SYSTEM',
            title: 'Sync Completed',
            description: 'Sync Completed',
            userId: user.id,
          },
        });
        this.myGateway.sendNotification(`${user.id}`, notification);
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
    } catch (err) {
      try {
        const notification = await this.prisma.notification.create({
          data: {
            seen: false,
            author: 'SYSTEM',
            title: 'Sync Failed',
            description: 'Sync Failed',
            userId: user.id,
          },
        });
        this.myGateway.sendNotification(`${user.id}`, notification);
        await this.syncCall(StatusEnum.FAILED, user.id);
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

  async syncTasks(user: User, res?: Response) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          seen: false,
          author: 'SYSTEM',
          title: 'Sync Started',
          description: 'Sync Started',
          userId: user.id,
        },
      });
      this.myGateway.sendNotification(`${user.id}`, notification);
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
        error,
      );
    }
    ///////////////////////////////
    try {
      const updated_integration = await this.updateIntegration(user);
      if (!updated_integration) return [];
      const headers: any = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${updated_integration.accessToken}`,
      };
      // headers['Authorization'] = `Bearer ${updated_integration.accessToken}`;
      if (res) {
        res.json(await this.syncCall(StatusEnum.IN_PROGRESS, user.id));
      } else {
        await this.syncCall(StatusEnum.IN_PROGRESS, user.id);
      }
      // await this.setProjectStatuses(user);

      //Relation between projectId and local project id
      const projectsList = await this.prisma.project.findMany({
        where: { integrationID: updated_integration.id },
      });
      const mappedProjects = new Map<string, number>();
      projectsList.map((project: any) => {
        mappedProjects.set(project.projectId, project.id);
      });

      const searchUrl = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/search?`;
      const fields =
        'summary, assignee,timeoriginalestimate,project, comment, created, updated,status,priority';
      for (let startAt = 0; startAt < 5000; startAt += 100) {
        let worklogPromises: Promise<any>[] = [];
        // let taskPromises: Promise<any>[] = [];
        const taskList: any[] = [],
          worklogsList: any[] = [],
          sessionArray: any[] = [];
        const mappedIssues = new Map<number, any>();
        const respTasks = (
          await lastValueFrom(
            this.httpService.get(searchUrl, {
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
            userId: user.id,
            integratedTaskId: { in: [...mappedIssues.keys()] },
            source: IntegrationType.JIRA,
          },
          select: {
            integratedTaskId: true,
          },
        });

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
            projectId: mappedProjects.get(integratedTask.project.id) ?? null,
            status: taskStatus,
            statusCategoryName: integratedTask.status.statusCategory.name
              .replace(' ', '_')
              .toUpperCase(),
            priority: taskPriority,
            integratedTaskId: integratedTaskId,
            createdAt: new Date(integratedTask.created),
            updatedAt: new Date(integratedTask.updated),
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
          console.log('Hello from line 1 worklog');
          for (const [integratedTaskId] of mappedIssues) {
            const fields = 'issueId';
            const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${updated_integration?.accessToken}`,
                'Content-Type': 'application/json',
                fields,
              },
            };
            const res = axios(config);
            worklogPromises.push(res);
            if (worklogPromises.length >= coreConfig.promiseQuantity) {
              total += coreConfig.promiseQuantity;
              const resolvedPromise = await Promise.all(worklogPromises);
              console.log(
                'Hello from log no 2 worklog',
                resolvedPromise.length,
              );
              worklogsList.push(...resolvedPromise);
              worklogPromises = [];
            }
          }

          if (worklogPromises.length) {
            const resolvedPromise = await Promise.all(worklogPromises);
            worklogsList.push(...resolvedPromise);
            console.log('Hello from log final worklog', resolvedPromise.length);
          }
        } catch (error) {
          console.log(total, mappedIssues.size);
          console.log(
            '🚀 ~ file: tasks.service.ts:366 ~ syncTasks ~ error:',
            error,
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
            '🚀 ~ file: tasks.service.ts:410 ~ syncTasks ~ error:',
            error,
          );
          console.log('Error creating sessions');
        }
      }
      const done = await this.syncCall(StatusEnum.DONE, user.id);
      if (done) {
        await this.createSprintAndTask(user);
      }

      try {
        const notification = await this.prisma.notification.create({
          data: {
            seen: false,
            author: 'SYSTEM',
            title: 'Sync Completed',
            description: 'Sync Completed',
            userId: user.id,
          },
        });
        this.myGateway.sendNotification(`${user.id}`, notification);
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error,
        );
      }
    } catch (err) {
      try {
        const notification = await this.prisma.notification.create({
          data: {
            seen: false,
            author: 'SYSTEM',
            title: 'Sync Failed',
            description: 'Sync Failed',
            userId: user.id,
          },
        });
        this.myGateway.sendNotification(`${user.id}`, notification);
        await this.syncCall(StatusEnum.FAILED, user.id);
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error,
        );
      }
      console.log(err);
      throw new APIException('Can not sync with jira', HttpStatus.BAD_REQUEST);
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

  async getCallSync(userId: number) {
    try {
      const getData = await this.prisma.callSync.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!getData) {
        return {
          id: -1,
          status: 'Not yet synced',
          userId: userId,
        };
      }
      return getData;
    } catch (err) {
      console.log(err.message);
      throw new APIException('Not found', HttpStatus.BAD_REQUEST);
    }
  }

  async syncCall(status: string, userId: number) {
    try {
      const doesExist = await this.getCallSync(userId);
      if (!doesExist || doesExist.id === -1) {
        return await this.prisma.callSync.create({
          data: {
            status,
            userId,
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

  getTransitionId(status: string) {
    switch (status) {
      case 'DONE':
        return '31';
      case 'IN_PROGRESS':
        return '21';
      case 'TODO':
        return '11';
    }
  }

  async updateIssueStatus(user: User, taskId: string, status: string) {
    try {
      const task = await this.prisma.task.findFirst({
        where: {
          userId: user.id,
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
        const updated_integration = await this.updateIntegration(user);
        const statuses: StatusDetail[] = task?.projectId
          ? await this.prisma.statusDetail.findMany({
              where: {
                projectId: task?.projectId,
              },
            })
          : [];
        const statusNames = statuses?.map((status) => status.name);
        const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${task?.integratedTaskId}/transitions`;
        if (statuses[0].transitionId === null) {
          const config = {
            method: 'get',
            url,
            headers: {
              Authorization: `Bearer ${updated_integration?.accessToken}`,
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
            Authorization: `Bearer ${updated_integration?.accessToken}`,
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
      const task = await this.prisma.task.findFirst({
        where: {
          userId: user.id,
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
        const updated_integration = await this.updateIntegration(user);

        const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${task?.integratedTaskId}`;

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
            Authorization: `Bearer ${updated_integration?.accessToken}`,
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
      const updated_integration = await this.updateIntegration(user);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${issueId}/worklog`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
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
    let { startDate, endDate } = query as unknown as GetTaskQuery;
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
    let { startDate, endDate } = query as unknown as GetTaskQuery;
    startDate = startDate && new Date(startDate);
    endDate = endDate && new Date(endDate);
    const taskList: any[] = await this.getTasks(user, query);
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
    return new Array(...map);
  }
  getHourFromMinutes(min: number) {
    if (!min) return 0;
    const hour = Number((min / 60).toFixed(2));
    return hour;
  }

  async getAllStatus(user: User) {
    try {
      const integration = await this.prisma.integration.findFirst({
        where: { userId: user.id, type: IntegrationType.JIRA },
      });
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

  async updateIntegration(user: User) {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    const integration = await this.prisma.integration.findFirst({
      where: { userId: user.id, type: IntegrationType.JIRA },
    });
    if (!integration) {
      return null;
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      refresh_token: integration?.refreshToken,
    };

    const tokenResp = (
      await lastValueFrom(this.httpService.post(tokenUrl, data, headers))
    ).data;

    const updated_integration =
      integration &&
      (await this.prisma.integration.update({
        where: { id: integration?.id },
        data: {
          accessToken: tokenResp.access_token,
          refreshToken: tokenResp.refresh_token,
        },
      }));
    return updated_integration;
  }

  async setProjectStatuses(user: User) {
    const updated_integration = await this.updateIntegration(user);
    if (!updated_integration) return [];
    // let statusList: any;
    const getStatusListUrl = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/status`;
    const getProjectListUrl = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/project`;

    try {
      const { data: statusList } = await axios.get(getStatusListUrl, {
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
        },
      });
      const { data: projectList } = await axios.get(getProjectListUrl, {
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
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
              projectId,
              projectKey,
              projectName,
              integrationID: updated_integration.id,
              userId: user.id,
              integrated: false,
            });
          }
        }
      }
      await this.prisma.project.createMany({
        data: projectListArray,
      });
      const projectsList = await this.prisma.project.findMany({
        where: { integrationID: updated_integration.id },
      });
      const projectsWithoutStatuses = new Set();
      const mappedProjects = new Map<string, number>();
      projectsList.map((project: any) => {
        projectsWithoutStatuses.add(project.projectId);
        mappedProjects.set(project.projectId, project.id);
      });
      for (const status of statusList) {
        const { name, untranslatedName, id, statusCategory } = status;
        const projectId = status?.scope?.project?.id;
        projectsWithoutStatuses.delete(projectId);
        const statusProjectId = mappedProjects.get(projectId);
        const statusDetail: any = {
          name,
          untranslatedName,
          statusId: id,
          statusCategoryId: `${statusCategory.id}`,
          statusCategoryName: statusCategory.name
            .replace(' ', '_')
            .toUpperCase(),
          projectId: statusProjectId,
          transitionId: null,
        };
        statusProjectId && statusArray.push(statusDetail);
      }
      if (projectsWithoutStatuses.size > 0) {
        for (const projectId of projectsWithoutStatuses) {
          const getStatusByProjectIdUrl = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/project/${projectId}/statuses`;
          const { data: res } = await axios.get(getStatusByProjectIdUrl, {
            headers: {
              Authorization: `Bearer ${updated_integration?.accessToken}`,
            },
          });
          const StatusByProjectList = res.length > 0 ? res[0].statuses : [];
          for (const status of StatusByProjectList) {
            const { name, untranslatedName, id, statusCategory } = status;
            const statusProjectId = mappedProjects.get(projectId as string);
            const statusDetail: any = {
              name,
              untranslatedName,
              statusId: id,
              statusCategoryId: `${statusCategory.id}`,
              statusCategoryName: statusCategory.name
                .replace(' ', '_')
                .toUpperCase(),
              projectId: statusProjectId,
              transitionId: null,
            };
            statusProjectId && statusArray.push(statusDetail);
          }
        }
      }
      try {
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

  async createSprintAndTask(user: User) {
    const sprint_list: any[] = [];
    const issue_list: any[] = [];
    const validSprint: any[] = [];
    const toBeUpdated: any[] = [];
    const sprintPromises: Promise<any>[] = [];
    const issuePromises: Promise<any>[] = [];
    const updated_integration = await this.updateIntegration(user);
    if (!updated_integration) return [];
    // console.log(formateReqBody);
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

    const task_list = await this.prisma.task.findMany({
      where: {
        userId: user.id,
        source: IntegrationType.JIRA,
      },
    });

    const projectIdList = new Set();
    const projectIds: any[] = [];
    for (let index = 0; index < task_list.length; index++) {
      const projectId = task_list[index].projectId;
      if (
        updated_integration.jiraAccountId === task_list[index].assigneeId &&
        !projectIdList.has(projectId)
      ) {
        projectIdList.add(projectId);
        projectIds.push(Number(projectId));
      }
    }

    //Relation between ProjectId and local project id
    const project_list = await this.prisma.project.findMany({
      where: { integrationID: updated_integration.id },
    });
    const mappedProjectId = new Map<number, number>();
    project_list.map((project: any) => {
      mappedProjectId.set(Number(project.id), Number(project.projectId));
    });

    for (let index = 0; index < projectIds.length; index++) {
      const projectId = mappedProjectId.get(projectIds[index]);
      // console.log(projectId);
      const boardId = projectId && mappedBoardId.get(projectId);
      // console.log(boardId);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/board/${boardId}/sprint`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };
      const res = axios(config);
      sprintPromises.push(res);
    }

    const sprintResponses = await Promise.all(
      sprintPromises.map((p) =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p.catch((err) => {
          console.error('This board has no sprint!');
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
                userId: user.id,
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
                userId: user.id,
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
    const [deS, crtSprint, sprints] = await Promise.all([
      await this.prisma.sprint.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      await this.prisma.sprint.createMany({
        data: sprint_list,
      }),
      await this.prisma.sprint.findMany({
        where: {
          userId: user.id,
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
          userId: user.id,
        });
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [CST, sprintTasks] = await Promise.all([
      await this.prisma.sprintTask.createMany({
        data: issue_list,
      }),

      await this.prisma.sprintTask.findMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    // return { total: sprintTasks.length, sprintTasks };
  }

  async getProjectList(user: User) {
    const update_integration = await this.updateIntegration(user);
    return await this.prisma.project.findMany({
      where: {
        integrationID: update_integration?.id,
      },
    });
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

import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IntegrationType,
  SessionStatus,
  Status,
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

@Injectable()
export class TasksService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async getTasks(user: User, query: GetTaskQuery): Promise<Task[]> {
    try {
      const { priority, status, text } = query;
      let { startDate, endDate } = query as unknown as GetTaskQuery;

      const integrations = await this.prisma.integration.findMany({
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

      const databaseQuery = {
        userId: user.id,
        OR: [
          {
            assigneeId: integrations[0]?.jiraAccountId
              ? integrations[0]?.jiraAccountId
              : -1,
            source: IntegrationType.JIRA,
          },
          {
            source: 'Tracker23',
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

      const task = await this.prisma.task.findMany({
        where: databaseQuery,
        include: {
          sessions: true,
        },
      });
      return task;
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

  recurrentTask = async (user: User, dto: CreateTaskDto) => {
    const endDate = new Date(dto.endDate);
    const timeMultiplier =
      dto.frequency === 'DAILY' ? 1 : dto.frequency === 'WEEKLY' ? 7 : 14;
    const timeInterval = timeMultiplier * 3600 * 24 * 1000;
    const oneDay = 3600 * 24 * 1000;
    const taskPromises: Promise<any>[] = [];
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
            .then(async (task) => {
              await this.prisma.session.create({
                data: {
                  startTime: new Date(startTime),
                  endTime: new Date(endTime),
                  status: SessionStatus.STOPPED,
                  taskId: task.id,
                  userId: user.id,
                },
              });
            }),
        );
      }
      await Promise.allSettled(taskPromises);
      return { message: 'Recurrent Tasks created' };
    } catch (error) {
      throw new APIException(
        error.message || 'Session creation Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

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
              userId: user.id,
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

  async syncTasks(user: User, res: Response) {
    try {
      const updated_integration = await this.updateIntegration(user);
      const headers: any = { 'Content-Type': 'application/json' };
      let taskPromises: Promise<any>[] = [];
      res.json(await this.syncCall(StatusEnum.IN_PROGRESS, user.id));

      headers['Authorization'] = `Bearer ${updated_integration.accessToken}`;
      const searchUrl = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/search?`;

      // let count = 0;
      for (let startAt = 0; startAt < 50000; startAt += 100) {
        const respTasks = (
          await lastValueFrom(
            this.httpService.get(searchUrl, {
              headers,
              params: { startAt, maxResults: 100 },
            }),
          )
        ).data;
        if (respTasks.issues.length === 0) {
          await this.syncCall(StatusEnum.DONE, user.id);
          break;
        }
        const map = new Map<number, any>();
        respTasks.issues.map((issue: any) => {
          map.set(Number(issue.id), issue);
        });

        // find task list from local database
        const integratedTasks = await this.prisma.taskIntegration.findMany({
          where: {
            userId: user.id,
            integratedTaskId: { in: [...map.keys()] },
            type: IntegrationType.JIRA,
          },
          select: {
            integratedTaskId: true,
          },
        });

        // keep the task list that doesn't exist in the database
        for (let j = 0, len = integratedTasks.length; j < len; j++) {
          const key = integratedTasks[j].integratedTaskId;
          map.delete(key);
        }

        for (const integratedTaskId of map.keys()) {
          const integratedTask = map.get(integratedTaskId);
          const taskStatus = this.formatStatus(
            integratedTask.fields.status.name,
          );
          const taskPriority = this.formatPriority(
            integratedTask.fields.priority.name,
          );

          // find all workLog
          const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
          const config = {
            method: 'get',
            url,
            headers: {
              Authorization: `Bearer ${updated_integration?.accessToken}`,
              'Content-Type': 'application/json',
            },
          };
          const workLog = (await axios(config)).data;

          taskPromises.push(
            this.prisma.task
              .create({
                data: {
                  userId: user.id,
                  title: integratedTask.fields.summary,
                  assigneeId: integratedTask.fields.assignee?.accountId || null,
                  estimation: integratedTask.fields.timeoriginalestimate
                    ? integratedTask.fields.timeoriginalestimate / 3600
                    : null,
                  projectName: integratedTask.fields.project.name,
                  status: taskStatus,
                  priority: taskPriority,
                  createdAt: new Date(integratedTask.fields.created),
                  updatedAt: new Date(integratedTask.fields.updated),
                  source: IntegrationType.JIRA,
                },
              })
              .then(async (task) => {
                return Promise.all([
                  this.prisma.session.createMany({
                    data: workLog.worklogs.map((log: any) => {
                      const lastTime =
                        new Date(log.started).getTime() +
                        Number(log.timeSpentSeconds * 1000);
                      return {
                        startTime: new Date(log.started),
                        endTime: new Date(lastTime),
                        status: SessionStatus.STOPPED,
                        taskId: task.id,
                        userId: user.id,
                      };
                    }),
                  }),
                  this.prisma.taskIntegration.create({
                    data: {
                      userId: user.id,
                      taskId: task.id,
                      integratedTaskId: Number(integratedTask.id),
                      type: IntegrationType.JIRA,
                      url: integratedTask.self,
                    },
                  }),
                ]);
              }),
          );
        }
      }
      await Promise.allSettled(taskPromises);
    } catch (err) {
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

  async updateIssueStatus(user: User, issueId: string, status: string) {
    try {
      const updated_integration = await this.updateIntegration(user);
      const taskIntegration = await this.prisma.taskIntegration.findFirst({
        where: {
          userId: user.id,
          taskId: Number(issueId),
        },
        select: {
          integratedTaskId: true,
        },
      });
      const statusBody = JSON.stringify({
        transition: {
          id: this.getTransitionId(status),
        },
      });

      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${taskIntegration?.integratedTaskId}/transitions`;
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
            id: Number(issueId),
          },
          data: { status: status as Status },
        }));
      if (!updatedTask) {
        throw new APIException(
          'Can not update issue status',
          HttpStatus.BAD_REQUEST,
        );
      }
      return updatedTask;
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        'Can not update issue status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addWorkLog(
    user: User,
    issueId: string,
    timeSpentReqBody: TimeSpentReqBodyDto,
  ) {
    try {
      const integration = await this.prisma.integration.findFirst({
        where: { userId: user.id, type: IntegrationType.JIRA },
      });

      const url = `https://api.atlassian.com/ex/jira/${integration?.siteId}/rest/api/3/issue/${issueId}/worklog`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
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
      let tmp = map.get(new Date(endDay));
      if (!tmp) tmp = 0;
      map.set(new Date(endDay), tmp + this.getHourFromMinutes(totalTimeSpent));
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
      throw new APIException('You have no integration', HttpStatus.BAD_REQUEST);
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

    const updated_integration = await this.prisma.integration.update({
      where: { id: integration?.id },
      data: {
        accessToken: tokenResp.access_token,
        refreshToken: tokenResp.refresh_token,
      },
    });
    return updated_integration;
  }
}

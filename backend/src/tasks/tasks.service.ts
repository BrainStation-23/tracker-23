import { Injectable } from '@nestjs/common';
import { IntegrationType, SessionStatus, Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateTaskDto,
  GetTaskQuery,
  TimeSpentReqBodyDto,
  UpdateTaskDto,
} from './dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Response } from 'express';

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

      const databaseQuery = {
        userId: user.id,
        assigneeId: integrations[0].accountId,
        ...(startDate &&
          endDate && {
            createdAt: { gte: startDate, lte: endDate },
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
    return await this.prisma.task.create({
      data: { userId: user.id, ...dto },
    });
  }

  async updateTask(id: number, dto: UpdateTaskDto): Promise<Task> {
    return await this.prisma.task.update({ where: { id }, data: dto });
  }

  async deleteTask(id: number): Promise<Task> {
    return await this.prisma.task.delete({ where: { id } });
  }

  async syncTasks(user: User, res: Response) {
    try {
      let syncStatus = 'IN_PROGRESS';
      res.json(await this.syncCall(syncStatus, user.id));
      const tokenUrl = 'https://auth.atlassian.com/oauth/token';
      const headers: any = { 'Content-Type': 'application/json' };
      let taskPromises: Promise<any>[] = [];

      const integrations = await this.prisma.integration.findMany({
        where: { userId: user.id, type: IntegrationType.JIRA },
      });

      for (const integration of integrations) {
        const data = {
          grant_type: 'refresh_token',
          client_id: this.config.get('JIRA_CLIENT_ID'),
          client_secret: this.config.get('JIRA_SECRET_KEY'),
          refresh_token: integration.refreshToken,
        };

        const tokenResp = (
          await lastValueFrom(this.httpService.post(tokenUrl, data, headers))
        ).data;

        const updated_integration = await this.prisma.integration.update({
          where: { id: integration.id },
          data: {
            accessToken: tokenResp.access_token,
            refreshToken: tokenResp.refresh_token,
          },
        });

        headers['Authorization'] = `Bearer ${updated_integration.accessToken}`;
        const searchUrl = `https://api.atlassian.com/ex/jira/${integration.siteId}/rest/api/3/search?`;
        // currently status is not considered.

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
          if (respTasks.issues.length === 0) break;
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
            const url = `https://api.atlassian.com/ex/jira/${integration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${integration?.accessToken}`,
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
                    assigneeId:
                      integratedTask.fields.assignee?.accountId || null,
                    estimation: integratedTask.fields.timeestimate
                      ? integratedTask.fields.timeestimate / 3600
                      : null,
                    projectName: integratedTask.fields.project.name,
                    status: taskStatus,
                    priority: taskPriority,
                    createdAt: new Date(integratedTask.fields.created),
                  },
                })
                .then(async (task) => {
                  await this.prisma.session.createMany({
                    data: workLog.worklogs.map((log: any) => {
                      return {
                        startTime: new Date(log.started),
                        endTime: new Date(log.updated),
                        status: SessionStatus.STOPPED,
                        taskId: task.id,
                        userId: user.id,
                      };
                    }),
                  });
                  return this.prisma.taskIntegration.create({
                    data: {
                      userId: user.id,
                      taskId: task.id,
                      integratedTaskId: Number(integratedTask.id),
                      type: IntegrationType.JIRA,
                      url: integratedTask.self,
                    },
                  });
                }),
            );
          }
          await Promise.allSettled(taskPromises);
          // count += taskPromises.length;
          taskPromises = [];
        }
        syncStatus = 'DONE';
        this.syncCall(syncStatus, user.id);
      }
    } catch (err) {
      console.error('checking error', err.message);
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
      return await this.prisma.callSync.findFirst({
        where: {
          userId: userId,
        },
      });
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }

  async syncCall(status: string, userId: number) {
    try {
      const doesExist = await this.getCallSync(userId);
      if (!doesExist) {
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
      const integration = await this.prisma.integration.findFirst({
        where: { userId: user.id, type: IntegrationType.JIRA },
      });
      const statusBody = JSON.stringify({
        transition: {
          id: this.getTransitionId(status),
        },
      });

      const url = `https://api.atlassian.com/ex/jira/${integration?.siteId}/rest/api/3/issue/${issueId}/transitions`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: statusBody,
      };
      await axios(config);
    } catch (err) {
      console.log(err.message);
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
}

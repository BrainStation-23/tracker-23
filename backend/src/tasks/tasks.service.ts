import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IntegrationType, Priority, Status, Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, GetTaskQuery, UpdateTaskDto } from './dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

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

  async syncTasks(user: User) {
    try {
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

        let count = 0;
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
          const tasks = await this.prisma.taskIntegration.findMany({
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
          for (let j = 0, len = tasks.length; j < len; j++) {
            const key = tasks[j].integratedTaskId;
            map.delete(key);
          }

          for (const taskId of map.keys()) {
            const jiraTask = map.get(taskId);
            const taskStatus = this.formatStatus(jiraTask.fields.status.name);
            const taskPriority = this.formatPriority(
              jiraTask.fields.priority.name,
            );

            taskPromises.push(
              this.prisma.task
                .create({
                  data: {
                    userId: user.id,
                    title: jiraTask.fields.summary,
                    assigneeId: jiraTask.fields.assignee?.accountId || null,
                    estimation: jiraTask.fields.timeestimate
                      ? jiraTask.fields.timeestimate / 3600
                      : null,
                    projectName: jiraTask.fields.project.name,
                    status: taskStatus,
                    priority: taskPriority,
                    createdAt: new Date(jiraTask.fields.created),
                  },
                })
                .then((task) => {
                  return this.prisma.taskIntegration.create({
                    data: {
                      userId: user.id,
                      taskId: task.id,
                      integratedTaskId: Number(jiraTask.id),
                      type: IntegrationType.JIRA,
                      url: jiraTask.self,
                    },
                  });
                }),
            );
          }
          await Promise.allSettled(taskPromises);
          count += taskPromises.length;
          taskPromises = [];
        }
        return { message: `Newly ${count} Tasks Successfully synced` };
      }
    } catch (err) {
      console.error('checking error', err);
      throw new InternalServerErrorException('Something went wrong');
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
}

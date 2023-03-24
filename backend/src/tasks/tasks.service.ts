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
      const { priority, status } = query;
      const priority1: any = (priority as unknown as string)?.split(',');
      const status1: any = (status as unknown as string)?.split(',');

      let { startDate, endDate } = query as unknown as GetTaskQuery;
      startDate = startDate && new Date(startDate);
      endDate = endDate && new Date(endDate);

      const databaseQuery = {
        userId: user.id,
        ...(startDate &&
          endDate && {
            createdAt: { gte: startDate, lte: endDate },
          }),
        ...(priority1 && { priority: { in: priority1 } }),
        ...(status1 && { status: { in: status1 } }),
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

  async getTasks2(user: User): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { userId: user.id },
      include: {
        sessions: true,
      },
    });
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

  async syncTasks(user: User): Promise<Task[]> {
    try {
      const tokenUrl = 'https://auth.atlassian.com/oauth/token';
      const headers: any = { 'Content-Type': 'application/json' };
      const taskPromises: Promise<any>[] = [];

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

        const respTasks = (
          await lastValueFrom(this.httpService.get(searchUrl, { headers }))
        ).data;

        for (const jiraTask of respTasks.issues) {
          const doesExist = await this.prisma.taskIntegration.findUnique({
            where: {
              integratedTaskIdentifier: {
                userId: user.id,
                integratedTaskId: Number(jiraTask.id),
                type: IntegrationType.JIRA,
              },
            },
          });

          if (
            !doesExist &&
            integration.accountId === jiraTask.fields.assignee?.accountId
          ) {
            // console.log(jiraTask);
            let taskStatus: Status = 'TODO';
            if (jiraTask.fields.status.name === 'Done') {
              taskStatus = 'DONE';
            } else if (jiraTask.fields.status.name === 'In Progress') {
              taskStatus = 'IN_PROGRESS';
            }

            let taskPriority: Priority;
            if (jiraTask.fields.priority.name === 'High') {
              taskPriority = 'HIGH';
            } else if (jiraTask.fields.priority.name === 'Medium') {
              taskPriority = 'MEDIUM';
            } else {
              taskPriority = 'LOW';
            }

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
                  // console.log(task);
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
        }
      }
      await Promise.allSettled(taskPromises);
      // console.log(tasks);
      return await this.getTasks2(user);
    } catch (err) {
      console.error('checking error', err);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}

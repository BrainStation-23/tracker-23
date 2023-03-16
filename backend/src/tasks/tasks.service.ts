import { Injectable } from '@nestjs/common';
import { IntegrationType, Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
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

  async getTasks(user: User): Promise<Task[]> {
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
      try {
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
          if (!doesExist) {
            taskPromises.push(
              this.prisma.task
                .create({
                  data: {
                    userId: user.id,
                    title: jiraTask.fields.summary,
                    estimation: jiraTask.fields.timeestimate
                      ? jiraTask.fields.timeestimate / 3600
                      : null,
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
        }
      } catch (err) {
        console.error(err);
      }
    }
    await Promise.allSettled(taskPromises);
    return await this.getTasks(user);
  }
}

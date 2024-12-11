import { Injectable } from '@nestjs/common';
import { IntegrationType, Project, SessionStatus, User } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { CreateTaskDto, StatusEnum } from 'src/module/tasks/dto';
import { GetActiveSprintTasks } from 'src/module/sprints/dto/get.active.sprint.tasks.filter.dto';

@Injectable()
export class TasksDatabase {
  constructor(private prisma: PrismaService) {}

  async getTasksForScrumReport(
    numericProjectIds: number[],
    activeUserWorkspaceIds: number[],
    firstDayOfWeek: Date,
    lastDayOfWeek: Date,
  ) {
    try {
      return await this.prisma.task.findMany({
        where: {
          projectId: {
            in: numericProjectIds,
          },
          userWorkspaceId: {
            in: activeUserWorkspaceIds,
          },
          OR: [
            {
              sessions: {
                some: {
                  OR: [
                    {
                      startTime: {
                        gte: firstDayOfWeek,
                        lte: lastDayOfWeek,
                      },
                    },
                    {
                      endTime: {
                        gte: firstDayOfWeek,
                        lte: lastDayOfWeek,
                      },
                    },
                  ],
                },
              },
            },
            {
              OR: [
                {
                  createdAt: {
                    gte: firstDayOfWeek,
                    lte: lastDayOfWeek,
                  },
                },
                {
                  updatedAt: {
                    gte: firstDayOfWeek,
                    lte: lastDayOfWeek,
                  },
                },
              ],
            },
            // {
            //   statusCategoryName: StatusEnum.IN_PROGRESS,
            // },
          ],
        },

        include: {
          userWorkspace: {
            include: {
              user: true,
            },
          },
          sessions: true,
        },
      });
    } catch (e) {
      console.log('🚀 ~ TasksDatabase ~ e:', e);
      return [];
    }
  }

  async getSprintTasks(
    userWorkspaceId: number,
    taskIds: number[],
    projectIdArray: any,
    priority1: string,
    status1: string,
    text: string,
  ) {
    return await this.prisma.task.findMany({
      where: {
        userWorkspaceId,
        source: IntegrationType.JIRA,
        id: { in: taskIds },
        ...(projectIdArray && {
          projectId: { in: projectIdArray.map((id: number) => Number(id)) },
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
        sessions: {
          include: {
            userWorkspace: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  async fetchTasksByDateRange(
    projectIds: number[],
    startDate: Date,
    endDate: Date,
  ) {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
        OR: [
          {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        sessions: true,
      },
    });

    return tasks;
  }
  async getProject(query: Record<string, any>): Promise<any> {
    try {
      return await this.prisma.project.findFirst({
        where: query,
        select: {
          projectName: true,
          id: true,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async getProjectList(integrationId: number): Promise<Project[] | []> {
    try {
      return await this.prisma.project.findMany({
        where: { integrationId },
        include: {
          statuses: true,
        },
      });
    } catch (err) {
      return [];
    }
  }

  async createTaskAndSession(
    user: User,
    userWorkspaceId: number,
    dto: CreateTaskDto,
    projectName: string,
    startFinalTime: number,
    SessionStartTime: number | null,
    SessionEndTime: number | null,
  ) {
    try {
      return this.prisma.task
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
            createdAt: new Date(startFinalTime),
            updatedAt: new Date(startFinalTime),
            workspaceId: user?.activeWorkspaceId,
            projectName,
            projectId: dto?.projectId,
          },
        })
        .then(async (task: any) => {
          SessionStartTime &&
            SessionEndTime &&
            (await this.prisma.session.create({
              data: {
                startTime: new Date(SessionStartTime),
                endTime: new Date(SessionEndTime),
                status: SessionStatus.STOPPED,
                taskId: task.id,
                userWorkspaceId,
              },
            }));
        });
    } catch (err) {
      return null;
    }
  }

  async getActiveSprintTasksWithSessions(filter: GetActiveSprintTasks) {
    try {
      return await this.prisma.task.findMany({
        where: {
          userWorkspaceId: filter.userWorkspaceId,
          source: IntegrationType.JIRA,
          id: { in: filter.taskIds },
          ...(filter.priority && { priority: { in: filter.priority } }),
          ...(filter.status && { status: { in: filter.status } }),
          ...(filter.text && {
            title: {
              contains: filter.text,
              mode: 'insensitive',
            },
          }),
        },
        include: {
          sessions: {
            include: {
              userWorkspace: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          parentTask: {
            select: {
              title: true,
              url: true,
              key: true,
            },
          },
          childTask: {
            where: { userWorkspaceId: filter.userWorkspaceId },
            include: {
              sessions: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getSettings(user: User) {
    try {
      return (
        user?.activeWorkspaceId &&
        (await this.prisma.settings.findFirst({
          where: {
            workspaceId: user.activeWorkspaceId,
          },
          select: {
            id: true,
            syncTime: true,
            workspaceId: true,
            timeFormat: true,
            extraSpent: true,
          },
        }))
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getTaskbyId(taskId: number) {
    try {
      return await this.prisma.task.findUnique({
        where: { id: taskId },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getTask(filter: any) {
    try {
      return await this.prisma.task.findFirst({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getTaskWithCustomResponse(filter: Record<string, any>, response?: any) {
    try {
      return await this.prisma.task.findUnique({
        where: filter,
        include: response,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getTasks(query: Record<string, any>) {
    try {
      return await this.prisma.task.findMany({
        where: query,
        include: {
          sessions: true,
        },
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async updateTask(query: Record<string, any>, reqData: Record<string, any>) {
    try {
      return await this.prisma.task.update({
        where: query,
        data: reqData,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async updateManyTask(
    query: Record<string, any>,
    reqData: Record<string, any>,
    prisma = this.prisma,
  ) {
    try {
      return await prisma.task.updateMany({
        where: query,
        data: reqData,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async deleteTasks(query: Record<string, any>) {
    try {
      return await this.prisma.task.deleteMany({
        where: query,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async updateManyTaskSessions(
    query: Record<string, any>,
    reqData: Record<string, any>,
    prisma = this.prisma,
  ) {
    try {
      return await prisma.session.updateMany({
        where: query,
        data: reqData,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async createTask(task: any) {
    try {
      return await this.prisma.task.create({
        data: task,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async getUserIntegrations(query: Record<string, any>) {
    try {
      return await this.prisma.userIntegration.findMany({
        where: query,
        include: {
          integration: true,
        },
      });
    } catch (err) {
      console.log('🚀 ~ TasksDatabase ~ getUserIntegrations ~ err:', err);
      return [];
    }
  }

  async callSync(query: Record<string, any>) {
    try {
      return await this.prisma.callSync.findFirst({
        where: query,
      });
    } catch (err) {
      console.log('🚀 ~ TasksDatabase ~ syncCall ~ err:', err);
      return null;
    }
  }

  async updateCallSync(
    query: Record<string, any>,
    update: Record<string, any>,
  ) {
    try {
      const callSync = await this.prisma.callSync.findFirst({
        where: query,
      });
      return await this.prisma.callSync.update({
        where: { id: callSync?.id },
        data: update,
      });
    } catch (err) {
      console.log('🚀 ~ TasksDatabase ~ syncCall ~ err:', err);
      return null;
    }
  }

  async createBatchStatus(statusArray: any[]) {
    try {
      await this.prisma.statusDetail.createMany({
        data: statusArray,
      });
    } catch (err) {
      console.log('🚀 ~ TasksDatabase ~ createBatchStatus ~ err:', err);
    }
  }

  async getPriorityList(projectId: number) {
    try {
      return await this.prisma.priorityScheme.findMany({
        where: {
          projectId,
        },
      });
    } catch (err) {
      console.log('🚀 ~ TasksDatabase ~ createBatchStatus ~ err-361:', err);
      return [];
    }
  }

  async createBatchPriority(priorityListByProjectId: any[]) {
    try {
      return await this.prisma.priorityScheme.createMany({
        data: priorityListByProjectId,
      });
    } catch (err) {
      console.log('🚀 ~ TasksDatabase ~ createBatchPriority ~ err-372:', err);
      return [];
    }
  }

  async deletePriorities(projectId: number) {
    try {
      return await this.prisma.priorityScheme.deleteMany({
        where: {
          projectId,
        },
      });
    } catch (err) {
      console.log('🚀 ~ TasksDatabase ~ createBatchPriority ~ err-372:', err);
      return [];
    }
  }
}

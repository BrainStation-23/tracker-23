import { Injectable } from '@nestjs/common';
import { IntegrationType, SessionStatus, Task, User } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { CreateTaskDto } from 'src/module/tasks/dto';
import { GetActiveSprintTasks } from 'src/module/sprints/dto/get.active.sprint.tasks.filter.dto';

@Injectable()
export class TasksDatabase {
  constructor(private prisma: PrismaService) {}

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

  async getProject(query: Record<string, any>) {
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

  async createTaskAndSession(
    user: User,
    userWorkspaceId: number,
    dto: CreateTaskDto,
    projectName: string,
    startFinalTime: number,
    SessionStartTime: number,
    SessionEndTime: number,
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
          await this.prisma.session.create({
            data: {
              startTime: new Date(SessionStartTime),
              endTime: new Date(SessionEndTime),
              status: SessionStatus.STOPPED,
              taskId: task.id,
              userWorkspaceId,
            },
          });
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
  ) {
    try {
      return await this.prisma.task.updateMany({
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
  ) {
    try {
      return await this.prisma.session.updateMany({
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
}

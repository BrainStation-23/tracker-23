import { Injectable } from '@nestjs/common';
import { IntegrationType, SessionStatus, User } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { CreateTaskDto } from 'src/module/tasks/dto';
import * as dayjs from 'dayjs';
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

  async getProject(projectId: number) {
    try {
      return await this.prisma.project.findFirst({
        where: {
          id: projectId,
        },
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
            workspaceId: user.activeWorkspaceId,
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
          sessions: true,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Sprint, SprintTask, Task } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class SprintTaskDatabase {
  constructor(private prisma: PrismaService) {}

  async deleteSprintTaskBySprintIds(sprintIds: any[]) {
    try {
      return await this.prisma.sprintTask.deleteMany({
        where: {
          sprintId: { in: sprintIds },
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createSprintTask(issue_list: any[]) {
    try {
      return await this.prisma.sprintTask.createMany({
        data: issue_list,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findSprintTaskBySprintIds(
    sprintIds: number[],
    query: Record<string, any>,
  ): Promise<Task[] | []> {
    try {
      const sprints = await this.prisma.sprint.findMany({
        where: {
          id: { in: sprintIds },
        },
        include: {
          Task: {
            where: query,
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
          },
        },
      });
      const list = [];
      for (const sprint of sprints) {
        list.push(...sprint.Task);
      }
      return list;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getUserWorkspaces(filter: Record<string, any>) {
    try {
      return await this.prisma.userWorkspace.findMany({
        where: filter,
        select: {
          id: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              picture: true,
              email: true,
            },
          },
        },
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}

import { Injectable } from '@nestjs/common';
import { SprintTask } from '@prisma/client';
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

  async findSprintTaskBySprintIds(sprintIds: any[]): Promise<SprintTask[] | []> {
    try {
      return await this.prisma.sprintTask.findMany({
        where: {
          sprintId: { in: sprintIds },
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

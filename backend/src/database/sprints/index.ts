import { Injectable } from "@nestjs/common";
import { IntegrationType, Task } from "@prisma/client";
import { PrismaService } from "src/module/prisma/prisma.service";

@Injectable()
export class SprintDatabase {
  constructor(private prisma: PrismaService) {}

  async deleteSprintByProjectId(projectId: number) {
    try {
      return await this.prisma.sprint.deleteMany({
        where: {
          projectId: projectId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createSprints(sprintList: any[]) {
    try {
      return await this.prisma.sprint.createMany({
        data: sprintList,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findSprintListByProjectId(projectId: number) {
    try {
      return await this.prisma.sprint.findMany({
        where: {
          projectId: projectId,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findSprintListByProjectIdList(projectIds: number[]) {
    try {
      return await this.prisma.sprint.findMany({
        where: {
          projectId: { in: projectIds },
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getSprintList(filter: Record<string, any>) {
    try {
      return await this.prisma.sprint.findMany({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getTaskByProjectIdAndSource(projectId: number): Promise<Task[] | []>{
    try {
      return await this.prisma.task.findMany({
        where: {
          projectId,
          source: IntegrationType.JIRA,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}
import { Injectable } from '@nestjs/common';
import { IntegrationType, Task } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

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

  async updateSprints(id: number, updateReqBody: any) {
    try {
      return await this.prisma.sprint.update({
        where: { id },
        data: updateReqBody,
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
        include: {
          sprintTask: true,
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

  async getTaskByProjectIdAndSource(
    query: Record<string, any>,
  ): Promise<Task[] | []> {
    try {
      return await this.prisma.task.findMany({
        where: query,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getUserIntegration(id: number) {
    try {
      return this.prisma.userIntegration.findUnique({
        where: {
          id,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async getSprintById(query: Record<string, any>) {
    try {
      return this.prisma.sprint.findUnique({
        where: query,
        include: {
          project: {
            select: {
              id: true,
              projectName: true,
              integrationId: true,
            },
          },
          sprintTask: true,
          Task: true,
        },
      });
    } catch (err) {
      return null;
    }
  }
}

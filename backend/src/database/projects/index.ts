import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class ProjectDatabase {
  constructor(private prisma: PrismaService) {}

  async getProject(filter: Record<string, any>, response?: any) {
    try {
      return await this.prisma.project.findFirst({
        where: filter,
        include: response,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getLocalProjects(filter: Record<string, any>): Promise<Project[] | []> {
    try {
      return await this.prisma.project.findMany({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getProjectsWithStatus(filter: Record<string, any>) {
    try {
      return await this.prisma.project.findMany({
        where: filter,
        include: {
          statuses: true,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getProjectById(projectId: number): Promise<Project | null> {
    try {
      return await this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getProjects(filter: Record<string, any>): Promise<Project[] | []> {
    try {
      return await this.prisma.project.findMany({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getProjectByIdWithIntegration(
    projectId: number,
  ): Promise<Project | null> {
    try {
      return await this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
        include: { integration: true },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteTasksByProjectId(projId: number) {
    try {
      return await this.prisma.task.deleteMany({
        where: {
          projectId: projId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateProjectById(projId: number, update: any) {
    try {
      return await this.prisma.project.update({
        where: { id: projId },
        data: update,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createProject(projectName: string, workspaceId: number) {
    try {
      return await this.prisma.project.create({
        data: {
          workspaceId,
          projectName: projectName,
          source: 'T23',
          integrated: true,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createStatusDetail(projectId: number) {
    try {
      return await this.prisma.statusDetail.createMany({
        data: [
          {
            projectId,
            name: 'To Do',
            statusCategoryName: 'TO_DO',
          },
          {
            projectId,
            name: 'In Progress',
            statusCategoryName: 'IN_PROGRESS',
          },
          {
            projectId,
            name: 'Done',
            statusCategoryName: 'DONE',
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

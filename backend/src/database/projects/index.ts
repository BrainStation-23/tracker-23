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

  async getProjectsWithStatusAndPriorities(filter: Record<string, any>) {
    try {
      return await this.prisma.project.findMany({
        where: filter,
        include: {
          statuses: true,
          priorities: true,
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

  async deleteLocalProject(projId: number) {
    try {
      return await this.prisma.project.delete({
        where: {
          id: projId,
        }
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createLocalPriorities(projectId: number) {
    try {
      return await this.prisma.priorityScheme.createMany({
        data: [
          {
            projectId,
            name: 'HIGH',
            priorityCategoryName: 'HIGH',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/high.svg',
            color: '#f15C75',
          },
          {
            projectId,
            name: 'LOW',
            priorityCategoryName: 'LOW',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/low.svg',
            color: '#707070',
          },
          {
            projectId,
            name: 'MEDIUM',
            priorityCategoryName: 'MEDIUM',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/medium.svg',
            color: '#f79232',
          },
          {
            projectId,
            name: 'HIGHEST',
            priorityCategoryName: 'HIGHEST',
            color: '#d04437',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/highest.svg',
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createLocalPrioritiesWithTransactionPrismaInstance(
    projectId: number,
    prisma: any,
  ) {
    try {
      return await prisma.priorityScheme.createMany({
        data: [
          {
            projectId,
            name: 'HIGH',
            priorityCategoryName: 'HIGH',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/high.svg',
            color: '#f15C75',
          },
          {
            projectId,
            name: 'LOW',
            priorityCategoryName: 'LOW',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/low.svg',
            color: '#707070',
          },
          {
            projectId,
            name: 'MEDIUM',
            priorityCategoryName: 'MEDIUM',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/medium.svg',
            color: '#f79232',
          },
          {
            projectId,
            name: 'HIGHEST',
            priorityCategoryName: 'HIGHEST',
            color: '#d04437',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/highest.svg',
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

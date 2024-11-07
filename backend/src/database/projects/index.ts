import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class ProjectDatabase {
  constructor(private prisma: PrismaService) {}

  async getProjectWithRes(filter: Record<string, any>, response?: any) {
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
        include: {
          integration: true,
        },
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
          integration: true,
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

  async getProjects(filter: Record<string, any>) {
    try {
      return await this.prisma.project.findMany({
        where: filter,
        include: {
          priorities: true,
          integration: true,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getProjectByIdWithIntegration(projectId: number) {
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

  async deleteSprintByProjectId(projId: number) {
    try {
      const deletedSprints = await this.prisma.sprint.deleteMany({
        where: { projectId: projId },
      });

      return deletedSprints;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteStatusDetails(projId: number) {
    try {
      return await this.prisma.statusDetail.deleteMany({
        where: {
          projectId: projId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deletePriorities(projId: number) {
    try {
      return await this.prisma.priorityScheme.deleteMany({
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

  async createProject(
    projectName: string,
    workspaceId: number,
    prisma = this.prisma,
  ) {
    try {
      return await prisma.project.create({
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

  async createStatusDetail(projectId: number, prisma = this.prisma) {
    try {
      return await prisma.statusDetail.createMany({
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
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createLocalPrioritiesWithTransactionPrismaInstance(
    projectId: number,
    prisma = this.prisma,
  ) {
    try {
      await prisma.priorityScheme.createMany({
        data: [
          {
            name: 'Lowest',
            priorityCategoryName: 'LOWEST',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/lowest.svg',
            color: '#999999',
            projectId,
          },
          {
            name: 'Low',
            priorityCategoryName: 'LOW',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/low.svg',
            color: '#707070',
            projectId,
          },
          {
            projectId,
            name: 'Medium',
            priorityCategoryName: 'MEDIUM',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/medium.svg',
            color: '#f79232',
          },
          {
            projectId,
            name: 'High',
            priorityCategoryName: 'HIGH',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/high.svg',
            color: '#f15C75',
          },
          {
            projectId,
            name: 'Highest',
            priorityCategoryName: 'HIGHEST',
            color: '#d04437',
            iconUrl:
              'https://pm23.atlassian.net/images/icons/priorities/highest.svg',
          },
        ],
      });

      return await prisma.priorityScheme.findMany({
        where: {
          projectId,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getProjectListForSprintReport(
    filter: Record<string, any>,
    query: Record<string, any>,
  ) {
    try {
      return await this.prisma.project.findMany({
        where: filter,
        include: {
          tasks: {
            include: {
              userWorkspace: {
                include: {
                  user: true,
                },
              },
              sessions: {
                include: {
                  userWorkspace: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          sprints: {
            where: query,
            include: {
              Task: {
                include: {
                  sessions: {
                    include: {
                      userWorkspace: {
                        include: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          priorities: true,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async createProjects(filter: Project[]) {
    try {
      return await this.prisma.project.createMany({
        data: filter,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

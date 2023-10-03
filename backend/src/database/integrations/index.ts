import { Injectable } from '@nestjs/common';
import { IntegrationType, Project } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class IntegrationDatabase {
  constructor(private prisma: PrismaService) {}

  async getIntegrationListByWorkspaceId(workspaceId: number) {
    try {
      return await this.prisma.integration.findMany({
        where: { workspaceId },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async deleteIntegrationById(id: number) {
    try {
      return await this.prisma.integration.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateTempIntegration(filter: any, updatedData: any, newData: any) {
    try {
      return await this.prisma.tempIntegration.upsert({
        where: filter,
        update: updatedData,
        create: newData,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findTempIntegrations(userWorkspaceId: number) {
    try {
      return await this.prisma.tempIntegration.findMany({
        where: {
          userWorkspaceId,
          type: IntegrationType.JIRA,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async findSingleTempIntegration(filter: any) {
    try {
      return await this.prisma.tempIntegration.findUnique({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createIntegration(newIntegration: any) {
    try {
      return await this.prisma.integration.create({
        data: newIntegration,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findUniqueIntegration(filter: any) {
    try {
      return await this.prisma.integration.findUnique({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteTempIntegrationById(integrationId: number) {
    try {
      return await this.prisma.tempIntegration.delete({
        where: {
          id: integrationId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findProjects(filter: any) {
    try {
      return await this.prisma.project.findMany({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateTasks(
    jiraAccountId: string,
    importedProject: Project[],
    userWorkspaceId: number,
  ) {
    try {
      return await this.prisma.task.updateMany({
        where: {
          assigneeId: jiraAccountId,
          projectId: {
            in: importedProject.map((project: any) => {
              return project.id;
            }),
          },
        },
        data: {
          userWorkspaceId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateSessions(
    jiraAccountId: string,
    importedProject: Project[],
    userWorkspaceId: number,
  ) {
    try {
      return await this.prisma.session.updateMany({
        where: {
          authorId: jiraAccountId,
          task: {
            projectId: {
              in: importedProject.map((project: any) => {
                return project.id;
              }),
            },
          },
        },
        data: {
          userWorkspaceId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

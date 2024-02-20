import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class UserIntegrationDatabase {
  constructor(private prisma: PrismaService) {}

  async getUserIntegrationListWithIntegrations(filter: Record<string, any>) {
    try {
      return await this.prisma.userIntegration.findMany({
        where: filter,
        include: { integration: true },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getUserIntegrationListByIntegrationIds(
    userWorkspaceId: number,
    integrationIds: number[],
  ) {
    try {
      return await this.prisma.userIntegration.findMany({
        where: {
          userWorkspaceId,
          integrationId: {
            in: integrationIds,
          },
        },
        include: {
          integration: true,
        },
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getUserIntegrationById(userIntegrationId: number) {
    try {
      return await this.prisma.userIntegration.findUnique({
        where: {
          id: userIntegrationId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateUserIntegrationById(userIntegrationId: number, update: any) {
    try {
      return await this.prisma.userIntegration.update({
        where: { id: userIntegrationId },
        data: update,
        include: { integration: true },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteUserIntegrationById(id: number) {
    try {
      return await this.prisma.userIntegration.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createUserIntegration(userIntegration: any) {
    try {
      return await this.prisma.userIntegration.create({
        data: userIntegration,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createAndUpdateUserIntegration(
    query: Record<string, any>,
    updateUserIntegration: Record<string, any>,
    userIntegration: any,
  ) {
    try {
      return await this.prisma.userIntegration.upsert({
        where: query,
        update: updateUserIntegration,
        create: userIntegration,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserIntegration(filter: Record<string, any>) {
    try {
      return await this.prisma.userIntegration.findUnique({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserIntegrations(query: Record<string, any>) {
    try {
      return await this.prisma.userIntegration.findMany({
        where: query,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

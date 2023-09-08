import { Injectable } from '@nestjs/common';
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
}

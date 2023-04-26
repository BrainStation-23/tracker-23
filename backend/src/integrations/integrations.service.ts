import { Injectable } from '@nestjs/common';
import { IntegrationType, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async getIntegrations(user: User) {
    return await this.prisma.integration.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        site: true,
        siteId: true,
        type: true,
        accessToken: true,
      },
    });
  }

  async deleteIntegration(user: User) {
    return await this.prisma.integration.deleteMany({
      where: { userId: user.id, type: IntegrationType.JIRA },
    });
  }
}

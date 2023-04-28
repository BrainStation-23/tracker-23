import { HttpStatus, Injectable } from '@nestjs/common';
import { IntegrationType, User } from '@prisma/client';
import { APIException } from 'src/internal/exception/api.exception';
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
    try {
      await Promise.all([
        await this.prisma.task.deleteMany({
          where: { userId: user.id, source: IntegrationType.JIRA },
        }),
        await this.prisma.integration.deleteMany({
          where: { userId: user.id, type: IntegrationType.JIRA },
        }),
      ]);
      return { message: 'Successfully user integration deleted' };
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        'Can not delete user integration',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

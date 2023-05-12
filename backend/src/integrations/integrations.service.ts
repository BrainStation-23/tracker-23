import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
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

  async deleteIntegration(user: User, integrationId: number) {
    try {
      const id = Number(integrationId);
      const deletedIntegration = await this.prisma.integration.delete({
        where: { id },
      });
      await this.prisma.task.deleteMany({
        where: { userId: user.id, source: deletedIntegration.type },
      });
      return { message: 'Successfully user integration deleted' };
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Can not delete user integration',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

import { lastValueFrom } from 'rxjs';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';

@Injectable()
export class IntegrationsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

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

  async updateIntegration(user: User, integrationID: number) {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    const integration = await this.prisma.integration.findFirst({
      where: { userId: user.id, type: IntegrationType.JIRA, id: integrationID },
    });
    if (!integration) {
      return null;
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      refresh_token: integration?.refreshToken,
    };

    const tokenResp = (
      await lastValueFrom(this.httpService.post(tokenUrl, data, headers))
    ).data;

    const updated_integration =
      integration &&
      (await this.prisma.integration.update({
        where: { id: integration?.id },
        data: {
          accessToken: tokenResp.access_token,
          refreshToken: tokenResp.refresh_token,
        },
      }));
    return updated_integration;
  }

  async deleteIntegration(user: User, integrationId: number) {
    try {
      const id = Number(integrationId);
      const deletedIntegration = await this.prisma.integration.delete({
        where: { id },
      });
      await Promise.all([
        await this.prisma.task.deleteMany({
          where: { userId: user.id, source: deletedIntegration.type },
        }),
        await this.prisma.sprint.deleteMany({
          where: {
            userId: user.id,
          },
        }),
      ]);
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

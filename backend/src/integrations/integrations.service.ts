import { lastValueFrom } from 'rxjs';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { User } from '@prisma/client';

@Injectable()
export class IntegrationsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private workspacesService: WorkspacesService,
  ) {}

  async getUserIntegrations(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace || !user.activeWorkspaceId)
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );

    return await this.prisma.userIntegration.findMany({
      where: {
        userWorkspaceId: userWorkspace.id,
        workspaceId: user.activeWorkspaceId,
      },
      include: { integration: true },
    });
  }
  async getIntegrations(user: User) {
    if (!user.activeWorkspaceId) {
      throw new APIException(
        'Can not delete user integration',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.prisma.integration.findMany({
      where: {
        workspaceId: user.activeWorkspaceId,
      },
    });
  }

  async getUpdatedUserIntegration(user: User, userIntegrationId: number) {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    if (!user.activeWorkspaceId)
      throw new APIException('No active Workspace', HttpStatus.BAD_REQUEST);
    const userIntegration = await this.prisma.userIntegration.findUnique({
      where: {
        id: userIntegrationId,
      },
    });
    // const integration = await this.prisma.integration.findFirst({
    //   where: { userId: user.id, type: IntegrationType.JIRA, id: integrationID },
    // });
    if (!userIntegration) {
      return null;
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      refresh_token: userIntegration?.refreshToken,
    };

    const tokenResp = (
      await lastValueFrom(this.httpService.post(tokenUrl, data, headers))
    ).data;

    const updatedUserIntegration =
      userIntegration &&
      (await this.prisma.userIntegration.update({
        where: { id: userIntegration?.id },
        data: {
          accessToken: tokenResp.access_token,
          refreshToken: tokenResp.refresh_token,
        },
        include: { integration: true },
      }));
    return updatedUserIntegration;
  }

  async deleteUserIntegration(user: User, userIntegrationId: number) {
    try {
      const id = Number(userIntegrationId);
      await this.prisma.userIntegration.delete({
        where: { id },
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

  async deleteIntegration(user: User, integrationId: number) {
    try {
      const id = Number(integrationId);
      await this.prisma.integration.delete({
        where: { id },
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

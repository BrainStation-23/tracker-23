import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { APIException } from '../exception/api.exception';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { IntegrationDatabase } from 'src/database/integrations/index';

@Injectable()
export class IntegrationsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private workspacesService: WorkspacesService,
    private userIntegrationDatabase: UserIntegrationDatabase,
    private integrationDatabase: IntegrationDatabase,
  ) {}

  async getUserIntegrations(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace || !user.activeWorkspaceId)
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );

    return await this.userIntegrationDatabase.getUserIntegrationListWithIntegrations(
      {
        userWorkspaceId: userWorkspace.id,
        workspaceId: user.activeWorkspaceId,
      },
    );
  }

  async getIntegrations(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const integrations =
      await this.integrationDatabase.getIntegrationListByWorkspaceId(
        userWorkspace.workspaceId,
      );

    const integrationIds = integrations.map(
      (integration: any) => integration.id,
    );

    const userIntegrations =
      userWorkspace &&
      (await this.userIntegrationDatabase.getUserIntegrationListByIntegrationIds(
        userWorkspace.id,
        integrationIds,
      ));

    return userIntegrations?.map(
      (userIntegration: any) => userIntegration.integration,
    );
  }

  async getUpdatedUserIntegration(user: User, userIntegrationId: number) {
    const url = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    if (!user.activeWorkspaceId)
      throw new APIException('No active Workspace', HttpStatus.BAD_REQUEST);

    const userIntegration =
      await this.userIntegrationDatabase.getUserIntegrationById(
        userIntegrationId,
      );

    if (!userIntegration) {
      throw new APIException(
        'User integration not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      refresh_token: userIntegration?.refreshToken,
    };
    let tokenResp;
    try {
      tokenResp = (
        await lastValueFrom(this.httpService.post(url, data, headers))
      ).data;
    } catch (err) {
      throw new APIException(
        'Can not update user integration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const updatedUserIntegration =
      userIntegration &&
      (await this.userIntegrationDatabase.updateUserIntegrationById(
        userIntegration?.id,
        {
          accessToken: tokenResp.access_token,
          refreshToken: tokenResp.refresh_token,
        },
      ));

    if (!updatedUserIntegration)
      throw new APIException(
        'Can not update user integration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return updatedUserIntegration;
  }

  async deleteUserIntegration(userIntegrationId: number) {
    const userIntegrationDeleted =
      await this.userIntegrationDatabase.deleteUserIntegrationById(
        userIntegrationId,
      );

    if (!userIntegrationDeleted)
      throw new APIException(
        'Can not delete user integration',
        HttpStatus.BAD_REQUEST,
      );

    return { message: 'Successfully user integration deleted' };
  }

  async deleteIntegration(user: User, id: number) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException('Can not delete integration');
      }

      const transactionRes = await this.prisma.$transaction([
        this.prisma.userIntegration.delete({
          where: {
            UserIntegrationIdentifier: {
              integrationId: id,
              userWorkspaceId: userWorkspace.id,
            },
          },
        }),

        this.prisma.task.updateMany({
          where: {
            userWorkspaceId: userWorkspace.id,
            project: {
              integrationId: id,
            },
          },
          data: {
            userWorkspaceId: null,
          },
        }),

        this.prisma.session.updateMany({
          where: {
            userWorkspaceId: userWorkspace.id,
            task: {
              project: {
                integrationId: id,
              },
            },
          },
          data: {
            userWorkspaceId: null,
          },
        }),
      ]);

      if (transactionRes) {
        return { message: 'Successfully user integration deleted' };
      }

      throw new APIException(
        'Can not delete user integration',
        HttpStatus.BAD_REQUEST,
      );
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Can not execute the uninstall operation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteIntegrationByAdmin(user: User, id: number) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userWorkspace.role === Role.ADMIN) {
      const integrationDeleted =
        await this.integrationDatabase.deleteIntegrationById(id);
      if (!integrationDeleted)
        throw new APIException(
          'Can not delete user integration',
          HttpStatus.BAD_REQUEST,
        );

      return { message: 'Successfully user integration deleted' };
    }

    return { message: 'You are not allowed to perform this action.' };
  }
}

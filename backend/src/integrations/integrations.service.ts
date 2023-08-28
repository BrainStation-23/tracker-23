import { lastValueFrom } from 'rxjs';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { Integration, Role, User } from '@prisma/client';

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
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const integrations = await this.prisma.integration.findMany({
      where: { workspaceId: userWorkspace.workspaceId },
    });
    const userIntegrations =
      userWorkspace &&
      (await this.prisma.userIntegration.findMany({
        where: {
          userWorkspaceId: userWorkspace.id,
          integrationId: {
            in: integrations.map((int) => {
              return int.id;
            }),
          },
        },
        include: {
          integration: true,
        },
      }));
    return userIntegrations?.map((userIntegration) => {
      return userIntegration.integration;
    });
  }

  async getUpdatedUserIntegration(user: User, userIntegrationId: number) {
    try {
      const url = 'https://auth.atlassian.com/oauth/token';
      const headers: any = { 'Content-Type': 'application/json' };
      if (!user.activeWorkspaceId)
        throw new APIException('No active Workspace', HttpStatus.BAD_REQUEST);
      const userIntegration = await this.prisma.userIntegration.findUnique({
        where: {
          id: userIntegrationId,
        },
      });
      console.log(
        '🚀 ~ file: integrations.service.ts:60 ~ IntegrationsService ~ getUpdatedUserIntegration ~ userIntegration:',
        userIntegration,
      );

      // const integration = await this.prisma.integration.findFirst({
      //   where: { userId: user.id, type: IntegrationType.JIRA, id: integrationID },
      // });
      if (!userIntegration) {
        throw new APIException(
          'User integration not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      // console.log(userIntegration?.refreshToken);

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
        console.log(
          '🚀 ~ file: integrations.service.ts:82 ~ IntegrationsService ~ getUpdatedUserIntegration ~ tokenResp:',
          tokenResp,
        );
      } catch (err) {
        throw new APIException(
          'Can not update user integration',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

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
    } catch (err) {
      console.log(
        '🚀 ~ file: integrations.service.ts:99 ~ IntegrationsService ~ getUpdatedUserIntegration ~ err:',
        err,
      );
      throw new APIException(
        'Can not update user integration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException('Can not delete integration');
      }
      const id = Number(integrationId);
      const transactionRes = await this.prisma.$transaction([
        this.prisma.userIntegration.delete({
          where: {
            userIntegrationIdentifier: {
              integrationId: id,
              userWorkspaceId: userWorkspace.id,
            },
          },
        }),

        this.prisma.task.updateMany({
          where: {
            userWorkspaceId: userWorkspace.id,
          },
          data: {
            userWorkspaceId: null,
          },
        }),
      ]);
      console.log(
        '🚀 ~ file: integrations.service.ts:170 ~ IntegrationsService ~ deleteIntegration ~ transactionRes:',
        transactionRes,
      );

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

  async deleteIntegrationByAdmin(user: User, integrationId: number) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User Workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (userWorkspace.role === Role.ADMIN) {
        const id = Number(integrationId);
        await this.prisma.integration.delete({
          where: { id },
        });
        return { message: 'Successfully user integration deleted' };
      }
      return { message: 'You are not allowed to perform this action.' };
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Can not delete user integration',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

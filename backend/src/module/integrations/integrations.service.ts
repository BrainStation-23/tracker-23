import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, Role, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { APIException } from '../exception/api.exception';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { IntegrationDatabase } from 'src/database/integrations/index';
import { ReportsService } from '../reports/reports.service';
import { ErrorMessage } from './dto/get.userIntegrations.filter.dto';
import { MyGateway } from '../notifications/socketGateway';

@Injectable()
export class IntegrationsService {
  constructor(
    private config: ConfigService,
    private myGateway: MyGateway,
    private prisma: PrismaService,
    private httpService: HttpService,
    private workspacesService: WorkspacesService,
    private userIntegrationDatabase: UserIntegrationDatabase,
    private integrationDatabase: IntegrationDatabase,
    private reportService: ReportsService,
  ) {}

  async getUserIntegrations(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace || !user?.activeWorkspaceId)
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

  async getUserIntegrationsByRole(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace || !user?.activeWorkspaceId)
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );

    if (userWorkspace.role === Role.ADMIN) {
      return await this.userIntegrationDatabase.getUserIntegrationListWithIntegrations(
        {
          workspaceId: user.activeWorkspaceId,
        },
      );
    } else {
      return await this.userIntegrationDatabase.getUserIntegrationListWithIntegrations(
        {
          userWorkspaceId: userWorkspace.id,
          workspaceId: user.activeWorkspaceId,
        },
      );
    }
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

  async getIntegrationsForReportPage(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userWorkspace.role === Role.ADMIN) {
      return await this.integrationDatabase.getIntegrationListByWorkspaceId(
        userWorkspace.workspaceId,
      );
    } else {
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
  }

  async getUpdatedUserIntegration(user: User, userIntegrationId: number) {
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
    if (userIntegration.expiration_time.getTime() > Date.now()) {
      await this.sendReAuthNotification(
        user,
        ErrorMessage.INVALID_JIRA_REFRESH_TOKEN,
      );
      return userIntegration;
    } else {
      const url = 'https://auth.atlassian.com/oauth/token';
      const headers: any = { 'Content-Type': 'application/json' };
      if (!user?.activeWorkspaceId)
        throw new APIException('No active Workspace', HttpStatus.BAD_REQUEST);

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
        await this.sendReAuthNotification(
          user,
          ErrorMessage.INVALID_JIRA_REFRESH_TOKEN,
        );
        throw new APIException(
          ErrorMessage.INVALID_JIRA_REFRESH_TOKEN,
          HttpStatus.GONE,
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

      if (!updatedUserIntegration) {
        // throw new APIException(
        //   'Can not update user integration',
        //   HttpStatus.INTERNAL_SERVER_ERROR,
        // );
        return null;
      }

      return updatedUserIntegration;
    }
  }

  private async createNotification(
    user: User,
    title: string,
    description: string,
  ) {
    return (
      user?.activeWorkspaceId &&
      (await this.prisma.notification.create({
        data: {
          seen: false,
          author: 'SYSTEM',
          title,
          description,
          userId: user.id,
          workspaceId: user.activeWorkspaceId,
          // statusCode: HttpStatus.GONE,
        },
      }))
    );
  }

  async sendReAuthNotification(user: User, msg: string, res?: Response) {
    const notification = await this.createNotification(user, msg, msg);
    this.myGateway.sendNotification(`${user.id}`, notification);
  }

  async getUpdatedUserIntegrationForOthers(user: User, userIntegration: any) {
    if (
      userIntegration &&
      userIntegration.expiration_time.getTime() > Date.now()
    ) {
      return userIntegration;
    } else {
      const url = 'https://auth.atlassian.com/oauth/token';
      const headers: any = { 'Content-Type': 'application/json' };
      if (!user?.activeWorkspaceId) {
        return null;
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
        return null;
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

      if (!updatedUserIntegration) {
        return null;
      }

      return updatedUserIntegration;
    }
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

      const integration = await this.integrationDatabase.findUniqueIntegration({
        id,
      });
      if (!integration) {
        throw new APIException('Can not delete integration');
      }

      //This code for updating report config start
      const userIntegrations =
        await this.userIntegrationDatabase.getUserIntegrations({
          userWorkspaceId: userWorkspace.id,
          integration: {
            type: integration.type,
          },
        });

      const projects = await this.integrationDatabase.findProjects({
        integrationId: integration.id,
        workspaceId: user.activeWorkspaceId,
      });
      const projectIds = projects.map((project) => {
        return project.id;
      });
      await this.reportService.updateReportConfig(user, {
        projectIds: projectIds,
        ...(userIntegrations.length === 1 && { type: integration.type }),
      });
      //This code for updating report config end

      if (integration?.type === IntegrationType.OUTLOOK) {
        const transactionRes = await this.prisma.$transaction([
          this.prisma.userIntegration.delete({
            where: {
              UserIntegrationIdentifier: {
                integrationId: id,
                userWorkspaceId: userWorkspace.id,
              },
            },
          }),

          this.prisma.integration.delete({
            where: { id },
          }),

          this.prisma.task.deleteMany({
            where: {
              userWorkspaceId: userWorkspace.id,
              project: {
                integrationId: id,
              },
            },
          }),

          this.prisma.session.deleteMany({
            where: {
              userWorkspaceId: userWorkspace.id,
              task: {
                project: {
                  integrationId: id,
                },
              },
            },
          }),
        ]);

        if (transactionRes) {
          return { message: 'Successfully user integration deleted' };
        }
      } else {
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

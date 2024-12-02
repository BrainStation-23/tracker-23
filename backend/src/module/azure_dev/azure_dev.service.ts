import { ProjectDatabase } from '../../database/projects/index';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';
import { AuthorizeJiraDto } from './dto';
import { IntegrationsService } from '../integrations/integrations.service';
import { TasksService } from 'src/module/tasks/tasks.service';
import { WorkspacesService } from 'src/module/workspaces/workspaces.service';
import { APIException } from 'src/module/exception/api.exception';
import { IntegrationDatabase } from 'src/database/integrations';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import {
  getAOrganization,
  getAzureDevMemberId,
  getIntegrationDetails,
} from './azure_dev.axios';

@Injectable()
export class AzureDevService {
  constructor(
    private config: ConfigService,
    private tasksService: TasksService,
    private workspacesService: WorkspacesService,
    private integrationsService: IntegrationsService,
    private projectDatabase: ProjectDatabase,
    private integrationDatabase: IntegrationDatabase,
    private userIntegrationDatabase: UserIntegrationDatabase,
  ) {}
  async getIntegrationLink(state: string | undefined): Promise<string> {
    let stateParam = '';
    if (state) {
      stateParam = `&state=${state}`;
    }
    const callbackUrl = this.config.get('AZURE_CALLBACK_URL'); // Ensure this is configured
    const clientId = this.config.get('APP_ID'); // Ensure this is configured
    const scopes = this.config.get('AUTHORIZED_SCOPES'); // "vso.code_manage vso.dashboards_manage ..." etc.
    const authorizeUrl = this.config.get('AUTHORIZE_URL'); // "https://app.vssps.visualstudio.com/oauth2/authorize"

    return `${authorizeUrl}?client_id=${clientId}&response_type=Assertion&scope=${encodeURIComponent(
      scopes,
    )}${stateParam}&redirect_uri=${callbackUrl}`;
  }

  async findIntegration(dto: AuthorizeJiraDto, user: User) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace || !user?.activeWorkspaceId)
        throw new APIException(
          'User Workspace not found',
          HttpStatus.BAD_REQUEST,
        );

      // get access token and refresh tokens and store those on integrations table.
      const resp = await getIntegrationDetails({ code: dto?.code });
      const accountId = await getAzureDevMemberId({
        access_token: resp.access_token,
      });

      //fetch all resources from jira
      const respResources = await getAOrganization({
        access_token: resp.access_token,
      });

      const integrationWithProjects: any[] = [];
      await Promise.all(
        respResources?.count > 0 &&
          respResources?.value.map(async (element: any) => {
            const expires_in = 3500000;
            const issued_time = Date.now();
            const token_expire = new Date(issued_time + expires_in);
            const doesExistIntegration =
              await this.integrationDatabase.findUniqueIntegration({
                IntegrationIdentifier: {
                  siteId: element.accountName,
                  workspaceId: user.activeWorkspaceId,
                },
              });

            if (doesExistIntegration) {
              const projects = await this.integrationDatabase.findProjects({
                integrationId: doesExistIntegration.id,
              });

              await this.userIntegrationDatabase.createAndUpdateUserIntegration(
                {
                  UserIntegrationIdentifier: {
                    integrationId: doesExistIntegration.id,
                    userWorkspaceId: userWorkspace.id,
                  },
                },
                {
                  accessToken: resp.access_token,
                  refreshToken: resp.refresh_token,
                  expiration_time: token_expire,
                },
                {
                  accessToken: resp.access_token,
                  refreshToken: resp.refresh_token,
                  jiraAccountId: accountId,
                  userWorkspaceId: userWorkspace.id,
                  workspaceId: user.activeWorkspaceId,
                  integrationId: doesExistIntegration.id,
                  siteId: element.accountName,
                  expiration_time: token_expire,
                },
              );

              const importedProject =
                await this.integrationDatabase.findProjects({
                  workspaceId: user.activeWorkspaceId,
                  integrationId: doesExistIntegration.id,
                  integrated: true,
                });

              importedProject &&
                importedProject.length &&
                (await this.integrationDatabase.updateTasks(
                  accountId,
                  importedProject,
                  userWorkspace.id,
                ));

              importedProject &&
                (await this.integrationDatabase.updateSessions(
                  accountId,
                  importedProject,
                  userWorkspace.id,
                ));

              integrationWithProjects.push({
                message: `Integration successful in ${doesExistIntegration.site}`,
                integration: doesExistIntegration,
                projects,
              });
            } else {
              const integration =
                await this.integrationDatabase.createIntegration({
                  siteId: element.accountName,
                  type: IntegrationType.AZURE_DEVOPS,
                  site: element.accountUri,
                  workspaceId: user.activeWorkspaceId,
                });
              if (!integration) {
                throw new Error('Could not create integration');
              }

              const userIntegration =
                await this.userIntegrationDatabase.createUserIntegration({
                  accessToken: resp.access_token,
                  refreshToken: resp.refresh_token,
                  jiraAccountId: accountId,
                  userWorkspaceId: userWorkspace.id,
                  workspaceId: user.activeWorkspaceId,
                  integrationId: integration.id,
                  siteId: element.accountName,
                  expiration_time: token_expire,
                });

              if (!userIntegration) {
                throw new Error('Could not create user integration');
              }

              const projects = await this.tasksService.fetchAllAzureDevProjects(
                user,
                integration,
              );

              integrationWithProjects.push({
                message: `Integration successful in ${integration.site}`,
                integration,
                projects,
              });
            }
          }),
      );
      return this.getProjectList(integrationWithProjects);
    } catch (err) {
      throw new APIException(
        err.message || 'Could not create integration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createIntegrationAndGetProjects(user: User, siteId: string) {
    if (!user?.activeWorkspaceId) {
      throw new APIException('workspace not found', HttpStatus.BAD_REQUEST);
    }
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const getTempIntegration =
      await this.integrationDatabase.findSingleTempIntegration({
        TempIntegrationIdentifier: {
          siteId,
          userWorkspaceId: userWorkspace.id,
        },
      });

    if (!getTempIntegration) {
      throw new APIException('Something went wrong !!', HttpStatus.BAD_REQUEST);
    }

    const doesExistIntegration =
      await this.integrationDatabase.findUniqueIntegration({
        IntegrationIdentifier: {
          siteId: siteId,
          workspaceId: getTempIntegration.workspaceId,
        },
      });

    if (doesExistIntegration) {
      const projects = await this.integrationDatabase.findProjects({
        integrationId: doesExistIntegration.id,
      });

      await this.userIntegrationDatabase.createAndUpdateUserIntegration(
        {
          UserIntegrationIdentifier: {
            integrationId: doesExistIntegration.id,
            userWorkspaceId: getTempIntegration.userWorkspaceId,
          },
        },
        {
          accessToken: getTempIntegration.accessToken,
          refreshToken: getTempIntegration.refreshToken,
          expiration_time: getTempIntegration.expiration_time,
        },
        {
          accessToken: getTempIntegration.accessToken,
          refreshToken: getTempIntegration.refreshToken,
          jiraAccountId: getTempIntegration.jiraAccountId,
          userWorkspaceId: getTempIntegration.userWorkspaceId,
          workspaceId: getTempIntegration.workspaceId,
          integrationId: doesExistIntegration.id,
          siteId,
          expiration_time: getTempIntegration.expiration_time,
        },
      );

      const importedProject = await this.integrationDatabase.findProjects({
        workspaceId: user.activeWorkspaceId,
        integrationId: doesExistIntegration.id,
        integrated: true,
      });

      importedProject &&
        importedProject.length &&
        (await this.integrationDatabase.updateTasks(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          getTempIntegration.jiraAccountId,
          importedProject,
          userWorkspace.id,
        ));

      importedProject &&
        (await this.integrationDatabase.updateSessions(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          getTempIntegration.jiraAccountId,
          importedProject,
          userWorkspace.id,
        ));

      const deleteTempIntegration =
        await this.integrationDatabase.deleteTempIntegrationById(
          getTempIntegration.id,
        );

      if (!deleteTempIntegration) {
        throw new APIException(
          'Can not create integration',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        message: `Integration successful in ${doesExistIntegration.site}`,
        integration: doesExistIntegration,
        projects,
      };
    }

    const integration = await this.integrationDatabase.createIntegration({
      siteId,
      type: IntegrationType.JIRA,
      site: getTempIntegration.site,
      workspaceId: getTempIntegration.workspaceId,
    });
    if (!integration)
      throw new APIException(
        'Could not create integration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    await this.userIntegrationDatabase.createUserIntegration({
      accessToken: getTempIntegration.accessToken,
      refreshToken: getTempIntegration.refreshToken,
      jiraAccountId: getTempIntegration.jiraAccountId,
      userWorkspaceId: getTempIntegration.userWorkspaceId,
      workspaceId: getTempIntegration.workspaceId,
      integrationId: integration.id,
      siteId,
      expiration_time: getTempIntegration.expiration_time,
    });

    const deleteTempIntegration =
      integration &&
      (await this.integrationDatabase.deleteTempIntegrationById(
        getTempIntegration.id,
      ));

    if (!deleteTempIntegration) {
      throw new APIException(
        'Can not create integration',
        HttpStatus.BAD_REQUEST,
      );
    }

    const projects = await this.tasksService.fetchAllProjects(
      user,
      integration,
    );

    return {
      message: `Integration successful in ${integration.site}`,
      integration,
      projects,
    };
  }

  async getIntegratedProjectStatusesAndPriorities(user: User) {
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);

    const jiraIntegrationIds = getUserIntegrationList?.map(
      (userIntegration: any) => userIntegration?.integration?.id,
    );
    try {
      const projects =
        await this.projectDatabase.getProjectsWithStatusAndPriorities({
          integrated: true,
          integrationId: {
            in: jiraIntegrationIds?.map((id: any) => Number(id)),
          },
        });

      const localProjects =
        user?.activeWorkspaceId &&
        (await this.projectDatabase.getProjectsWithStatusAndPriorities({
          source: 'T23',
          workspaceId: user.activeWorkspaceId,
          integrated: true,
        }));

      localProjects && projects.push(...localProjects);

      return projects.map((project) => {
        return {
          ...project,
          integrationType: project.integration?.type
            ? project.integration?.type
            : IntegrationType.TRACKER23,
        };
      });
    } catch (error) {
      throw new APIException('Can not get Projects', HttpStatus.BAD_REQUEST);
    }
  }

  private getAccountId(token: string) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      .sub as string;
  }

  private getProjectList(projectList: any[]) {
    if (!projectList.length) return [];
    return projectList.map((project) => {
      return {
        ...project,
        integrationType: IntegrationType.JIRA,
      };
    });
  }
}

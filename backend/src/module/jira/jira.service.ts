import { ProjectDatabase } from './../../database/projects/index';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';
import { AuthorizeJiraDto } from './dto';
import { IntegrationsService } from '../integrations/integrations.service';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { TasksService } from 'src/module/tasks/tasks.service';
import { WorkspacesService } from 'src/module/workspaces/workspaces.service';
import { APIException } from 'src/module/exception/api.exception';
import { IntegrationDatabase } from 'src/database/integrations';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';

@Injectable()
export class JiraService {
  constructor(
    private httpService: HttpService,
    private config: ConfigService,
    private tasksService: TasksService,
    private workspacesService: WorkspacesService,
    private integrationsService: IntegrationsService,
    private projectDatabase: ProjectDatabase,
    private integrationDatabase: IntegrationDatabase,
    private userIntegrationDatabase: UserIntegrationDatabase,
  ) {}
  async getIntegrationLink(state: string | undefined) {
    let stateParam = '';
    if (state) {
      stateParam = `&state=${state}`;
    }
    const callback_url = this.config.get('JIRA_CALLBACK_URL');
    const client_id = this.config.get('JIRA_CLIENT_ID');
    return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${client_id}&scope=read:jira-work manage:jira-project manage:jira-data-provider read:board-scope:jira-software manage:jira-webhook read:jql:jira read:issue-details:jira read:sprint:jira-software write:jira-work write:issue:jira read:jira-user read:sprint:jira-software manage:jira-configuration write:workflow:jira offline_access&redirect_uri=${callback_url}${stateParam}&response_type=code&prompt=consent`;
  }

  async findIntegration(dto: AuthorizeJiraDto, user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace || !user.activeWorkspaceId)
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    // get access token and refresh tokens and store those on integrations table.
    const url = 'https://auth.atlassian.com/oauth/token';
    const urlResources = `https://api.atlassian.com/oauth/token/accessible-resources`;
    const headers: any = { 'Content-Type': 'application/json' };
    const body = {
      grant_type: 'authorization_code',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      code: dto.code,
      redirect_uri: this.config.get('JIRA_CALLBACK_URL'),
    };

    const resp = (
      await lastValueFrom(this.httpService.post(url, body, { headers }))
    ).data;

    // get resources from jira
    headers['Authorization'] = `Bearer ${resp['access_token']}`;
    const accountId = JSON.parse(
      Buffer.from(resp['access_token'].split('.')[1], 'base64').toString(),
    ).sub as string;

    const respResources = (
      await lastValueFrom(this.httpService.get(urlResources, { headers }))
    ).data;

    if (!user.activeWorkspaceId || !user.activeWorkspaceId)
      throw new APIException('No active Workspace', HttpStatus.BAD_REQUEST);

    const updatedIntegration = await Promise.allSettled(
      respResources.map(async (element: any) => {
        user.activeWorkspaceId &&
          (await this.integrationDatabase.updateTempIntegration(
            {
              tempIntegrationIdentifier: {
                siteId: element.id,
                userWorkspaceId: userWorkspace.id,
              },
            },
            {
              accessToken: resp.access_token,
              refreshToken: resp.refresh_token,
              site: element.url,
            },
            {
              siteId: element.id,
              userWorkspaceId: userWorkspace.id,
              type: IntegrationType.JIRA,
              accessToken: resp.access_token,
              refreshToken: resp.refresh_token,
              site: element.url,
              jiraAccountId: accountId,
              workspaceId: user.activeWorkspaceId,
            },
          ));
      }),
    );
    if (!updatedIntegration)
      throw new APIException(
        'Could not update integration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const tempIntegrations =
      await this.integrationDatabase.findTempIntegrations(userWorkspace.id);

    const integrationProjects = [];
    for (const tempIntegration of tempIntegrations) {
      const tmpIntegrationProjects = await this.createIntegrationAndGetProjects(
        user,
        tempIntegration?.siteId,
      );
      tmpIntegrationProjects &&
        integrationProjects.push(tmpIntegrationProjects);
    }

    return integrationProjects;
  }

  async createIntegrationAndGetProjects(user: User, siteId: string) {
    if (!user.activeWorkspaceId) {
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
        tempIntegrationIdentifier: {
          siteId,
          userWorkspaceId: userWorkspace.id,
        },
      });

    if (!getTempIntegration) {
      throw new APIException('Something went wrong !!', HttpStatus.BAD_REQUEST);
    }

    const doesExistIntegration = await this.integrationDatabase.findUniqueIntegration({
        integrationIdentifier: {
          siteId: siteId,
          workspaceId: getTempIntegration.workspaceId,
        },
    });

    if (doesExistIntegration) {
      const projects = await this.integrationDatabase.findProjects({
        integrationId: doesExistIntegration.id,
      });

      await this.userIntegrationDatabase.createUserIntegration({
          accessToken: getTempIntegration.accessToken,
          refreshToken: getTempIntegration.refreshToken,
          jiraAccountId: getTempIntegration.jiraAccountId,
          userWorkspaceId: getTempIntegration.userWorkspaceId,
          workspaceId: getTempIntegration.workspaceId,
          integrationId: doesExistIntegration.id,
          siteId,
      });

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
    });

    const deleteTempIntegration = integration && await this.integrationDatabase.deleteTempIntegrationById(getTempIntegration.id);

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

  async getIntegratedProjectStatuses(user: User) {
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);

    const jiraIntegrationIds = getUserIntegrationList?.map(
      (userIntegration: any) => userIntegration?.integration?.id,
    );
    try {
      const projects = await this.projectDatabase.getProjectsWithStatus({
        integrated: true,
        integrationId: {
          in: jiraIntegrationIds?.map((id: any) => Number(id)),
        },
      });

      const localProjects =
        user.activeWorkspaceId &&
        (await this.projectDatabase.getProjectsWithStatus({
          source: 'T23',
          workspaceId: user.activeWorkspaceId,
          integrated: true,
        }));

      localProjects && projects.push(...localProjects);

      return projects;
    } catch (error) {
      throw new APIException('Can not get Projects', HttpStatus.BAD_REQUEST);
    }
  }
}

import { lastValueFrom } from 'rxjs';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';

import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';

import { AuthorizeJiraDto } from './dto';
import { SprintsService } from 'src/sprints/sprints.service';

@Injectable()
export class JiraService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    private config: ConfigService,
    private tasksService: TasksService,
    private sprintsService: SprintsService,
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
    try {
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
      // console.log(resp);

      // get resources from jira
      headers['Authorization'] = `Bearer ${resp['access_token']}`;
      const accountId = JSON.parse(
        Buffer.from(resp['access_token'].split('.')[1], 'base64').toString(),
      ).sub as string;

      const respResources = (
        await lastValueFrom(this.httpService.get(urlResources, { headers }))
      ).data;

      await Promise.allSettled(
        respResources.map(async (element: any) => {
          // const integration = await this.prisma.integration.upsert({
          await this.prisma.tempIntegration.upsert({
            where: {
              tempIntegrationIdentifier: {
                siteId: element.id,
                userWorkspaceId: userWorkspace.id,
              },
            },
            update: {
              accessToken: resp.access_token,
              refreshToken: resp.refresh_token,
              site: element.url,
            },
            create: {
              siteId: element.id,
              userWorkspaceId: userWorkspace.id,
              type: IntegrationType.JIRA,
              accessToken: resp.access_token,
              refreshToken: resp.refresh_token,
              site: element.url,
              jiraAccountId: accountId,
            },
          });
          // console.log(integration);
        }),
      );
      const tempIntegrations = await this.prisma.tempIntegration.findMany({
        where: { userId: user.id, type: IntegrationType.JIRA },
        select: {
          id: true,
          site: true,
          siteId: true,
          type: true,
          accessToken: true,
        },
      });
      const integrationProjects = [];
      for (const tempIntegration of tempIntegrations) {
        const tmpIntegrationProjects =
          await this.createIntegrationAndGetProjects(
            user,
            tempIntegration.siteId,
          );
        tmpIntegrationProjects &&
          integrationProjects.push(tmpIntegrationProjects);
      }
      return integrationProjects;
    } catch (error) {
      throw new APIException('Code Expired', HttpStatus.BAD_REQUEST);
    }
  }

  async createIntegrationAndGetProjects(user: User, siteId: string) {
    try {
      const doesExistIntegration = await this.prisma.integration.findUnique({
        where: {
          integrationIdentifier: {
            siteId,
            userWorkspaceId: userWorkspace.id,
          },
        },
      });
      if (doesExistIntegration) {
        const projects = await this.tasksService.getIntegrationProjectList(
          user,
          doesExistIntegration.id,
        );

        return {
          message: `Integration successful in ${doesExistIntegration.site}`,
          integration: doesExistIntegration,
          projects,
        };
      }
      const getTempIntegration = await this.prisma.tempIntegration.findUnique({
        where: {
          tempIntegrationIdentifier: {
            siteId,
            userWorkspaceId: userWorkspace.id,
          },
        },
      });

      if (!getTempIntegration) {
        throw new APIException('Time Expired!', HttpStatus.BAD_REQUEST);
      }
      const integration = await this.prisma.integration.create({
        data: {
          siteId,
          userWorkspaceId: userWorkspace.id,
          type: IntegrationType.JIRA,
          accessToken: getTempIntegration.accessToken,
          refreshToken: getTempIntegration.refreshToken,
          site: getTempIntegration.site,
          jiraAccountId: getTempIntegration.jiraAccountId,
        },
      });
      const deleteTempIntegrations =
        integration &&
        (await this.prisma.tempIntegration.delete({
          where: {
            tempIntegrationIdentifier: {
              siteId,
              userId: user.id,
            },
          },
        }));
      // console.log(integration);
      if (!deleteTempIntegrations) {
        throw new APIException(
          'Can not create integration',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.tasksService.setProjectStatuses(user, integration);
      await this.sprintsService.createSprintAndTask(user, integration.id);
      const projects = await this.tasksService.getIntegrationProjectList(
        user,
        integration.id,
      );
      // this.tasksService.syncTasks(user);
      return {
        message: `Integration successful in ${integration.site}`,
        integration,
        projects,
      };
    } catch (err) {
      throw new APIException(
        err.message || 'Something is wrong in creating integration',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getIntegratedProjectStatuses(user: User) {
    const jiraIntegrations = await this.prisma.integration.findMany({
      where: { userId: user.id, type: IntegrationType.JIRA },
    });
    const jiraIntegrationIds = jiraIntegrations?.map(
      (integration) => integration.id,
    );
    try {
      const projects =
        jiraIntegrationIds?.length > 0
          ? await this.prisma.project.findMany({
              where: {
                integrationID: { in: jiraIntegrationIds },
                integrated: true,
              },
              include: {
                statuses: true,
              },
            })
          : [];
      projects.push({
        id: 0,
        projectId: 'None',
        projectKey: 'None',
        projectName: 'T23',
        source: '/',
        integrationID: -1,
        userId: -1,
        statuses: [
          {
            id: 0,
            statusId: 'None',
            name: 'To Do',
            untranslatedName: 'To Do',
            statusCategoryId: '2',
            statusCategoryName: 'TO_DO',
            transitionId: null,
            projectId: 0,
          },
          {
            id: 0,
            statusId: 'None',
            name: 'In Progress',
            untranslatedName: 'In Progress',
            statusCategoryId: '4',
            statusCategoryName: 'IN_PROGRESS',
            transitionId: null,
            projectId: 0,
          },
          {
            id: 0,
            statusId: 'None',
            name: 'Done',
            untranslatedName: 'Done',
            statusCategoryId: '3',
            statusCategoryName: 'DONE',
            transitionId: null,
            projectId: 0,
          },
        ],
        integrated: true,
      });
      return projects;
    } catch (error) {
      throw new APIException('Can not get Projects', HttpStatus.BAD_REQUEST);
    }
  }
}

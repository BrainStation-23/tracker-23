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
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { IntegrationsService } from '../integrations.service';

@Injectable()
export class JiraService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    private config: ConfigService,
    private tasksService: TasksService,
    private sprintsService: SprintsService,
    private workspacesService: WorkspacesService,
    private integrationsService: IntegrationsService,
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
      // console.log(resp);

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
      await Promise.allSettled(
        respResources.map(async (element: any) => {
          // const integration = await this.prisma.integration.upsert({
          user.activeWorkspaceId &&
            (await this.prisma.tempIntegration.upsert({
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
                workspaceId: user.activeWorkspaceId,
              },
            }));
          // console.log(integration);
        }),
      );
      const tempIntegrations = await this.prisma.tempIntegration.findMany({
        where: {
          userWorkspaceId: userWorkspace.id,
          type: IntegrationType.JIRA,
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
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    // const { siteId, userWorkspaceId, workspaceId } = tempIntegration;
    const getTempIntegration = await this.prisma.tempIntegration.findUnique({
      where: {
        tempIntegrationIdentifier: {
          siteId,
          userWorkspaceId: userWorkspace.id,
        },
      },
    });

    if (!getTempIntegration) {
      throw new APIException('Something went wrong !!', HttpStatus.BAD_REQUEST);
    }
    try {
      const doesExistIntegration = await this.prisma.integration.findUnique({
        where: {
          integrationIdentifier: {
            siteId: siteId,
            workspaceId: getTempIntegration.workspaceId,
          },
        },
      });
      if (doesExistIntegration) {
        const projects = await this.prisma.project.findMany({
          where: {
            integrationId: doesExistIntegration.id,
          },
        });

        await this.prisma.userIntegration.create({
          data: {
            accessToken: getTempIntegration.accessToken,
            refreshToken: getTempIntegration.refreshToken,
            jiraAccountId: getTempIntegration.jiraAccountId,
            userWorkspaceId: getTempIntegration.userWorkspaceId,
            workspaceId: getTempIntegration.workspaceId,
            integrationId: doesExistIntegration.id,
            siteId,
          },
        });

        const importedProject = await this.prisma.project.findMany({
          where: {
            workspaceId: user.activeWorkspaceId,
            integrationId: doesExistIntegration.id,
            integrated: true,
          },
        });

        await this.prisma.task.updateMany({
          where: {
            assigneeId: getTempIntegration.jiraAccountId,
            projectId: {
              in: importedProject.map((prj) => {
                return prj.id;
              }),
            },
          },
          data: {
            userWorkspaceId: userWorkspace.id,
          },
        });

        return {
          message: `Integration successful in ${doesExistIntegration.site}`,
          integration: doesExistIntegration,
          projects,
        };
      }
      const integration = await this.prisma.integration.create({
        data: {
          siteId,
          // userWorkspaceId,
          type: IntegrationType.JIRA,
          // accessToken: getTempIntegration.accessToken,
          // refreshToken: getTempIntegration.refreshToken,
          site: getTempIntegration.site,
          // jiraAccountId: getTempIntegration.jiraAccountId,
          workspaceId: getTempIntegration.workspaceId,
        },
      });
      // const integration = await this.prisma.integration.create({
      //   data: {
      //     siteId,
      //     userWorkspaceId,
      //     type: IntegrationType.JIRA,
      //     accessToken: getTempIntegration.accessToken,
      //     refreshToken: getTempIntegration.refreshToken,
      //     site: getTempIntegration.site,
      //     jiraAccountId: getTempIntegration.jiraAccountId,
      //   },
      // });
      await this.prisma.userIntegration.create({
        data: {
          accessToken: getTempIntegration.accessToken,
          refreshToken: getTempIntegration.refreshToken,
          jiraAccountId: getTempIntegration.jiraAccountId,
          userWorkspaceId: getTempIntegration.userWorkspaceId,
          workspaceId: getTempIntegration.workspaceId,
          integrationId: integration.id,
          siteId,
        },
      });
      const deleteTempIntegration =
        integration &&
        (await this.prisma.tempIntegration.delete({
          where: {
            id: getTempIntegration.id,
          },
        }));
      // console.log(integration);
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
      // await this.sprintsService.createSprintAndTask(user, integration.id);
      // const projects = await this.tasksService.getIntegrationProjectList(
      //   user,
      //   integration.id,
      // );
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
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);
    // const jiraIntegrations = await this.prisma.integration.findMany({
    //   where: { userId: user.id, type: IntegrationType.JIRA },
    // });
    const jiraIntegrationIds = getUserIntegrationList?.map(
      (userIntegration) => userIntegration?.integration?.id,
    );
    try {
      const projects = await this.prisma.project.findMany({
        where: {
          integrated: true,
          integrationId: {
            in: jiraIntegrationIds?.map((id) => Number(id)),
          },
          workspaceId: user.activeWorkspaceId,
        },
        include: {
          statuses: true,
        },
      });

      projects.push({
        id: 0,
        projectId: -1,
        projectKey: 'None',
        projectName: 'T23',
        source: '/',
        integrationId: -1,
        workspaceId: user.activeWorkspaceId,
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

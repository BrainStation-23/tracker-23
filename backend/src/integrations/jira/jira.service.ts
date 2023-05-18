import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IntegrationType,
  ProjectStatus,
  StatusDetail,
  User,
} from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorizeJiraDto } from './dto';
import { APIException } from 'src/internal/exception/api.exception';
import { TasksService } from 'src/tasks/tasks.service';
import axios from 'axios';

@Injectable()
export class JiraService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    private config: ConfigService,
    private tasksService: TasksService,
  ) {}
  async getIntegrationLink(state: string | undefined) {
    let stateParam = '';
    if (state) {
      stateParam = `&state=${state}`;
    }
    const callback_url = this.config.get('JIRA_CALLBACK_URL');
    const client_id = this.config.get('JIRA_CLIENT_ID');
    return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${client_id}&scope=read:jira-work manage:jira-project manage:jira-data-provider manage:jira-webhook write:jira-work write:issue:jira read:jira-user manage:jira-configuration write:workflow:jira offline_access&redirect_uri=${callback_url}${stateParam}&response_type=code&prompt=consent`;
  }

  async findIntegration(dto: AuthorizeJiraDto, user: User) {
    const previousIntegrations = await this.prisma.integration.findMany({
      where: { userId: user.id, type: IntegrationType.JIRA },
    });
    if (previousIntegrations.length) {
      throw new APIException(
        'You already have an integration',
        HttpStatus.BAD_REQUEST,
      );
    }
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
                userId: user.id,
              },
            },
            update: {
              accessToken: resp.access_token,
              refreshToken: resp.refresh_token,
              site: element.url,
            },
            create: {
              siteId: element.id,
              userId: user.id,
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
      const integrations = await this.prisma.tempIntegration.findMany({
        where: { userId: user.id, type: IntegrationType.JIRA },
        select: {
          id: true,
          site: true,
          siteId: true,
          type: true,
          accessToken: true,
        },
      });
      if (integrations.length === 1) {
        const createdIntegration = await this.createIntegration(
          user,
          integrations[0].siteId,
        );
        this.setProjectStatuses(user);
        return createdIntegration;
      }
      return integrations;
    } catch (error) {
      throw new APIException('Code Expired', HttpStatus.BAD_REQUEST);
    }
  }

  async createIntegration(user: User, siteId: string) {
    try {
      const doesExistIntegration = await this.prisma.integration.findUnique({
        where: {
          integrationIdentifier: {
            siteId,
            userId: user.id,
          },
        },
      });
      if (doesExistIntegration) {
        throw new APIException(
          'Already you have an integration',
          HttpStatus.BAD_REQUEST,
        );
      }
      const getTempIntegration = await this.prisma.tempIntegration.findUnique({
        where: {
          tempIntegrationIdentifier: {
            siteId,
            userId: user.id,
          },
        },
      });

      if (!getTempIntegration) {
        throw new APIException('Time Expired!', HttpStatus.BAD_REQUEST);
      }
      const integration = await this.prisma.integration.create({
        data: {
          siteId,
          userId: user.id,
          type: IntegrationType.JIRA,
          accessToken: getTempIntegration.accessToken,
          refreshToken: getTempIntegration.refreshToken,
          site: getTempIntegration.site,
          jiraAccountId: getTempIntegration.jiraAccountId,
        },
      });
      const deleteTempIntegrations =
        integration &&
        (await this.prisma.tempIntegration.deleteMany({
          where: { jiraAccountId: integration.jiraAccountId },
        }));
      // console.log(integration);
      if (!deleteTempIntegrations) {
        throw new APIException(
          'Can not create integration',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.setProjectStatuses(user);
      return { message: `Integration successful in ${integration.site}` };
    } catch (err) {
      throw new APIException(
        err.message || 'Something is wrong in creating integration',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async setProjectStatuses(user: User) {
    const updated_integration = await this.tasksService.updateIntegration(user);
    // let statusList: any;
    const getStatusListUrl = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/status`;
    try {
      const { data: statusList } = await axios.get(getStatusListUrl, {
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
        },
      });
      const projectIdList = new Set();
      const projectStatusArray: ProjectStatus[] = [];
      const statusArray: StatusDetail[] = [];
      for (const status of statusList) {
        const { name, untranslatedName, id, statusCategory } = status;
        const projectId = status?.scope?.project?.id;
        if (projectId) {
          if (!projectIdList.has(projectId)) {
            projectIdList.add(projectId);
            projectStatusArray.push({
              projectId,
              integrationID: updated_integration.id,
            });
          }
          const statusDetail: StatusDetail = {
            name,
            untranslatedName,
            id,
            statusCategoryId: `${statusCategory.id}`,
            statusCategoryName: statusCategory.name
              .replace(' ', '_')
              .toUpperCase(),
            projectId,
          };
          statusArray.push(statusDetail);
        }
      }
      await Promise.allSettled([
        await this.prisma.projectStatus.createMany({
          data: projectStatusArray,
        }),
        await this.prisma.statusDetail.createMany({ data: statusArray }),
      ]);
      return this.getProjectStatuses(user);
    } catch (error) {
      return error;
    }
  }

  async getProjectStatuses(user: User) {
    const jiraIntegration = await this.prisma.integration.findFirst({
      where: { userId: user.id, type: IntegrationType.JIRA },
    });
    try {
      const statuses = await this.prisma.projectStatus.findMany({
        where: { integrationID: jiraIntegration?.id },
        include: {
          statuses: true,
        },
      });
      return statuses;
    } catch (error) {
      throw new APIException(
        'Can not get Project Statuses',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

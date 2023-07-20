import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, SessionStatus, User } from '@prisma/client';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterWebhookDto, extendWebhookLifeReqDto } from './dto/index.js';
import { SessionsService } from 'src/sessions/sessions.service';
import { deleteWebhookDto } from './dto/deleteWebhook.dto.js';
@Injectable()
export class WebhooksService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private sessionService: SessionsService, // private tasksService: TasksService,
  ) {}

  async getWebhooks(user: User) {
    const updated_integration = await this.getUpdatedUserIntegration(user);
    const url = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/webhook`;
    const config = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${updated_integration.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    return (await axios(config)).data;
  }

  async getUpdatedUserIntegration(user: User) {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    const integration = await this.prisma.integration.findFirst({
      where: { userWorkspaceId: userWorkspace.id, type: IntegrationType.JIRA },
    });
    if (!integration) {
      throw new APIException('You have no integration', HttpStatus.BAD_REQUEST);
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

    const updated_integration = await this.prisma.integration.update({
      where: { id: integration?.id },
      data: {
        accessToken: tokenResp.access_token,
        refreshToken: tokenResp.refresh_token,
      },
    });
    return updated_integration;
  }

  async handleWebhook(payload: any) {
    console.log(payload);
    const jiraEvent = payload.webhookEvent;

    const projectKey = payload.issue.fields.project.key;
    const siteUrl = payload.user.self.split('/')[2];
    const webhookId = payload.matchedWebhookIds;
    const doesExistWebhook = await this.prisma.webhook.findUnique({
      where: {
        webhookIdentifier: {
          webhookId,
          siteUrl,
        },
      },
    });
    if (doesExistWebhook && payload.webhookEvent === 'jira:issue_created') {
      console.log('project', projectKey, siteUrl, webhookId);
      await this.prisma.task.create({
        data: {
          userId: 1, //unknown user or search user from integration
          title: payload.issue.fields.summary,
          assigneeId: payload.issue.fields.assignee?.accountId || null,
          estimation: payload.issue.fields.timeoriginalestimate
            ? payload.issue.timeoriginalestimate / 3600
            : null,
          projectName: payload.issue.fields.project.name,
          status: payload.issue.fields.status.name,
          priority: payload.issue.fields.priority.name,
          integratedTaskId: Number(payload.issue.id),
          createdAt: new Date(payload.issue.fields.created),
          updatedAt: new Date(payload.issue.fields.updated),
          source: IntegrationType.JIRA,
        },
      });
    } else if (doesExistWebhook && jiraEvent === 'jira:issue_updated') {
      let sendToModify;
      console.log(payload);
      if (
        payload.changelog.items[0].field === 'summary' ||
        payload.changelog.items[0].field === 'priority' ||
        payload.changelog.items[0].field === 'status'
      ) {
        sendToModify = payload.changelog.items[0].toString;
      } else {
        sendToModify = payload.changelog.items[0].to;
      }
      const toBeUpdateField = this.toBeUpdateField(
        payload.changelog.items[0].field,
        sendToModify,
      );
      console.log(toBeUpdateField);

      await this.prisma.task.updateMany({
        where: { integratedTaskId: Number(payload.issue.id) },
        data: toBeUpdateField,
      });
    } else if (jiraEvent === 'worklog_created') {
      const lastTime =
        new Date(payload.worklog.started).getTime() +
        Number(payload.worklog.timeSpentSeconds * 1000);

      await this.prisma.session.create({
        data: {
          startTime: new Date(payload.worklog.started),
          endTime: new Date(lastTime),
          status: SessionStatus.STOPPED,
          taskId: Number(payload.worklog.issueId),
          integratedTaskId: Number(payload.worklog.issueId),
          worklogId: payload.worklog.id,
          authorId: payload.worklog.author.accountId,
        },
      });
    }
  }

  toBeUpdateField(key: any, value: any) {
    switch (key) {
      case 'summary':
        return {
          title: value,
        };
      case 'assignee':
        return {
          assigneeId: value,
        };
      case 'timeoriginalestimate':
        return {
          estimation: Number(value) / 3600,
        };
      case 'status':
        return {
          status: value,
        };
      case 'priority':
        return {
          priority: value,
        };
      default:
        return {};
    }
  }

  async registerWebhook(user: User, reqBody: RegisterWebhookDto) {
    try {
      const updated_integration = await this.getUpdatedUserIntegration(user);
      const doesExist =
        updated_integration.site &&
        (await this.prisma.webhook.findMany({
          where: {
            siteUrl: updated_integration.site,
            projectKey: {
              hasSome: [...reqBody.projectName.map((key) => key)],
            },
          },
        }));
      // console.log([...reqBody.projectName.map((key) => key)]);
      if (doesExist && doesExist.length) {
        throw new APIException(
          'Already one of the project has webhook registered!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const projectList = reqBody.projectName.map((el) => el);
      const formateReqBody = {
        url: reqBody.url,
        webhooks: [
          {
            events: reqBody.webhookEvents,
            jqlFilter: `project IN (${projectList})`,
          },
        ],
      };
      // console.log(formateReqBody);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: formateReqBody,
      };

      const webhook = await (await axios(config)).data;

      const currentDate = new Date(Date.now());
      currentDate.setDate(currentDate.getDate() + 30);

      const localWebhook =
        webhook &&
        updated_integration.site &&
        (await this.prisma.webhook.create({
          data: {
            projectKey: reqBody.projectName,
            webhookId: Number(
              webhook.webhookRegistrationResult[0].createdWebhookId,
            ),
            siteUrl: updated_integration.site,
            expirationDate: currentDate,
          },
        }));
      return localWebhook;
    } catch (err) {
      console.log(err);
      throw new APIException(
        err.message || 'Fetching problem to register webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteWebhook(user: User, reqBody: deleteWebhookDto) {
    try {
      const updated_integration = await this.getUpdatedUserIntegration(user);
      const jiraReqBody = {
        webhookIds: [reqBody.webhookId],
      };
      console.log(jiraReqBody);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook`;
      const config = {
        method: 'delete',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: jiraReqBody,
      };

      const webhook = (await axios(config)).status;
      console.log('deleted', webhook);
      webhook == 202 &&
        updated_integration.site &&
        (await this.prisma.webhook.delete({
          where: {
            webhookIdentifier: {
              webhookId: reqBody.webhookId,
              siteUrl: updated_integration.site,
            },
          },
        }));
      return webhook;
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Fetching problem to register webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async failedWebhook(user: User) {
    try {
      const updated_integration = await this.getUpdatedUserIntegration(user);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook/failed`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      const webhooks = (await axios(config)).data;
      console.log('Get failed', webhooks);
      return webhooks;
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Fetching problem to get failed webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async extendWebhookLife(user: User, reqBody: extendWebhookLifeReqDto) {
    try {
      console.log(reqBody);
      const body = {
        webhookIds: [reqBody.webhookId],
      };
      console.log(body);
      const updated_integration = await this.getUpdatedUserIntegration(user);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook/refresh`;
      const config = {
        method: 'put',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: body,
      };

      const webhook = (await axios(config)).data;
      const time = new Date(
        this.sessionService.getUtcTime(webhook.expirationDate),
      );
      const updatedLocal =
        updated_integration.site &&
        (await this.prisma.webhook.update({
          where: {
            webhookIdentifier: {
              webhookId: reqBody.webhookId,
              siteUrl: updated_integration.site,
            },
          },
          data: {
            expirationDate: time,
          },
        }));
      console.log(updatedLocal);
      return updatedLocal;
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Fetching problem to Extend webhook life!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

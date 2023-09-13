import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IntegrationType,
  SessionStatus,
  User,
} from '@prisma/client';
import axios from 'axios';
import { RegisterWebhookDto, extendWebhookLifeReqDto } from './dto/index.js';
import { deleteWebhookDto } from './dto/deleteWebhook.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { IntegrationsService } from '../integrations/integrations.service.js';
import { APIException } from '../exception/api.exception.js';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionsService, // private tasksService: TasksService,
    private integrationsService: IntegrationsService,
  ) {}

  async getWebhooks(user: User) {
    const userIntegrationIds: any[] = [];
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);
    getUserIntegrationList.map(async (userIntegration: any) => {
      userIntegrationIds.push(userIntegration.id);
    });
    return await this.getAllWebhooks(user, userIntegrationIds);
  }

  async getAllWebhooks(user: User, userIntegrationIds: number[]) {
    const webhooks = [];
    for (let index = 0, len = userIntegrationIds.length; index < len; index++) {
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          userIntegrationIds[index],
        );
      if (!updated_integration) {
        return [];
      }
      const url = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/webhook`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration.accessToken}`,
          'Content-Type': 'application/json',
        },
      };
      const webhookJira = (await axios(config)).data;
      webhooks.push(webhookJira);
    }
    return webhooks;
  }

  async handleWebhook(payload: any) {
    console.log(payload);
    const jiraEvent = payload.webhookEvent;

    const projectKey = payload.issue.fields.project.key;
    const siteId = 'payload.self.sideId';
    // const siteUrl = payload.user.self.split('/')[2];
    const webhookId = payload.matchedWebhookIds;
    const doesExistWebhook = await this.prisma.webhook.findUnique({
      where: {
        webhookIdentifier: {
          webhookId,
          siteId,
        },
      },
    });
    if (doesExistWebhook && payload.webhookEvent === 'jira:issue_created') {
      // console.log('project', projectKey, siteUrl, webhookId);
      await this.prisma.task.create({
        data: {
          // userId: 1, //unknown user or search user from integration
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
      //console.log(payload);
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
      //console.log(toBeUpdateField);

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
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          reqBody.userIntegrationId,
        );
      if (!updated_integration) {
        return null;
      }
      const doesExist =
        updated_integration.siteId &&
        (await this.prisma.webhook.findMany({
          where: {
            siteId: updated_integration.siteId,
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
      // //console.log(formateReqBody);
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
      let webhook;
      try {
        webhook = await (await axios(config)).data;
        console.log(
          '🚀 ~ file: webhooks.service.ts:217 ~ WebhooksService ~ registerWebhook ~ webhook:',
          webhook,
        );
      } catch (err) {
        console.log(
          '🚀 ~ file: webhooks.service.ts:223 ~ WebhooksService ~ registerWebhook ~ err:',
          err,
        );
      }

      const currentDate = new Date(Date.now());
      currentDate.setDate(currentDate.getDate() + 30);

      const localWebhook =
        webhook &&
        updated_integration.siteId &&
        (await this.prisma.webhook.create({
          data: {
            projectKey: reqBody.projectName,
            webhookId: Number(
              webhook.webhookRegistrationResult[0].createdWebhookId,
            ),
            siteId: updated_integration.siteId,
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
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          reqBody.userIntegrationId,
        );
      if (!updated_integration) {
        return null;
      }
      const jiraReqBody = {
        webhookIds: [reqBody.webhookId],
      };
      //console.log(jiraReqBody);
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
        updated_integration.siteId &&
        (await this.prisma.webhook.delete({
          where: {
            webhookIdentifier: {
              webhookId: reqBody.webhookId,
              siteId: updated_integration.siteId,
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

  async failedWebhook(user: User, reqBody: RegisterWebhookDto) {
    try {
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          reqBody.userIntegrationId,
        );
      if (!updated_integration) {
        return null;
      }
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
      //console.log('Get failed', webhooks);
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
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          reqBody.userIntegrationId,
        );
      if (!updated_integration) {
        return null;
      }
      //console.log(reqBody);
      const body = {
        webhookIds: [reqBody.webhookId],
      };
      console.log(body);
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
        updated_integration.siteId &&
        (await this.prisma.webhook.update({
          where: {
            webhookIdentifier: {
              webhookId: reqBody.webhookId,
              siteId: updated_integration.siteId,
            },
          },
          data: {
            expirationDate: time,
          },
        }));
      //console.log(updatedLocal);
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

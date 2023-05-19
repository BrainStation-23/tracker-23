import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, SessionStatus, User } from '@prisma/client';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async getWebhooks(user: User) {
    const updated_integration = await this.updateIntegration(user);
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

  async updateIntegration(user: User) {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    const integration = await this.prisma.integration.findFirst({
      where: { userId: user.id, type: IntegrationType.JIRA },
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
    const jiraEvent = payload.webhookEvent;
    if (payload.webhookEvent === 'jira:issue_created') {
      await this.prisma.task.create({
        data: {
          userId: 1,
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
    } else if (jiraEvent === 'jira:issue_updated') {
      let sendToModify;
      if (
        payload.changelog.items[0].field ===
        ('summary' || 'priority' || 'status')
      ) {
        sendToModify = payload.changelog.items[0].toString;
      }
      sendToModify = payload.changelog.items[0].to;
      const toBeUpdateField = this.toBeUpdateField(
        payload.changelog.items[0].field,
        sendToModify,
      );

      await this.prisma.task.update({
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
          userId: 1,
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

  async registerWebhook(user: User, reqBody: any) {
    try {
      const updated_integration = await this.updateIntegration(user);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: reqBody,
      };

      const webhook = await (await axios(config)).data;
      console.log(webhook);
      return webhook;
    } catch (err) {
      console.log(err);
      throw new APIException(
        err.message || 'Fetching problem to register webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

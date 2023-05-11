import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';
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
    console.log('Incoming webhook data:', payload);

    // const taskId = data.issue.key; // assume the webhook payload includes an issue key
    // const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    // if (task) {
    //   const newStatus = data.issue.fields.status.name; // assume the webhook payload includes the new status
    //   await this.prisma.task.update({
    //     where: { id: taskId },
    //     data: { status: newStatus },
    //   });
    //   console.log(`Task ${taskId} updated to status ${newStatus}`);
    //   return { message: `Task ${taskId} updated` };
    // } else {
    //   console.log(`Task ${taskId} not found`);
    //   return { message: `Task ${taskId} not found` };
    // }
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

import { Injectable } from '@nestjs/common';
import { webhook } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class WebhookDatabase {
  constructor(private prisma: PrismaService) {}

  async createWebhook(reqData: Record<string, any>) {
    try {
      return await this.prisma.webhook.create({
        data: {
          webhookId: reqData.webhookId,
          siteId: reqData.siteId,
          calendarId: reqData.calendarId,
          expirationDate: reqData.expirationDate,
        },
      });
    } catch (err) {
      console.log(
        '🚀 ~ file: index.ts:10 ~ WebhookDatabase ~ createWebhook ~ err:',
        err,
      );
      return null;
    }
  }

  async doesExistWebhook(query: Record<string, any>) {
    try {
      return await this.prisma.webhook.findFirst({
        where: query,
      });
    } catch (err) {
      console.log(
        '🚀 ~ file: index.ts:36 ~ WebhookDatabase ~ doesExistWebhook ~ err:',
        err,
      );
      return null;
    }
  }

  async getWebhook(query: Record<string, any>): Promise<webhook | null> {
    try {
      return await this.prisma.webhook.findFirst({
        where: query,
      });
    } catch (err) {
      console.log(
        '🚀 ~ file: index.ts:48 ~ WebhookDatabase ~ getWebhook ~ err:',
        err,
      );
      return null;
    }
  }

  async updateWebhook(query: Record<string, any>, data: Record<string, any>) {
    try {
      return await this.prisma.webhook.update({
        where: query,
        data,
      });
    } catch (err) {
      console.log('🚀 ~ WebhookDatabase ~ updateWebhook ~ err:', err);
      return null;
    }
  }

  async deleteOutlookWebhook(
    query: Record<string, any>,
  ): Promise<webhook | null> {
    try {
      return await this.prisma.webhook.delete({
        where: query,
      });
    } catch (err) {
      return null;
    }
  }

  async getWebhooks(params: { siteId: string; projectKey: string }) {
    try {
      const { siteId, projectKey } = params;
      return await this.prisma.webhook.findMany({
        where: {
          siteId: siteId,
          projectKey: {
            hasSome: [projectKey],
          },
        },
      });
    } catch (err) {
      console.log('🚀 ~ WebhookDatabase ~ getWebhooks ~ err:', err);
      return [];
    }
  }
}

import { UserIntegration } from '@prisma/client';
import axios from 'axios';

export class OutlookApiCalls {
  async registerOutlookWebhook(
    userIntegration: UserIntegration,
    url: string,
    formateReqBody: any,
  ) {
    try {
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: formateReqBody,
      };
      const webhook = await (await axios(config)).data;
      return webhook;
    } catch (err) {
      console.log('🚀 ~ file: api.ts:23 ~ OutlookApiCalls ~ err:', err);
      return null;
    }
  }

  async extendOutlookWebhookLifecycle(
    userIntegration: UserIntegration,
    url: string,
    formateReqBody: any,
  ) {
    try {
      const config = {
        method: 'PATCH',
        url,
        headers: {
          Authorization: `Bearer ${userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: formateReqBody,
      };
      const webhook = await (await axios(config)).data;
      console.log('🚀 ~ OutlookApiCalls ~ webhook:', webhook);
      return webhook;
    } catch (err) {
      console.log('🚀 ~ OutlookApiCalls ~ err:', err);
      return null;
    }
  }

  async getCalendarEvents(userIntegration: UserIntegration, url: string) {
    try {
      const headers: any = {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      };
      const config = {
        method: 'GET',
        url,
        headers,
      };
      return (await axios(config)).data;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:40 ~ OutlookApiCalls ~ getCalendarEvents ~ err:',
        err,
      );
      return null;
    }
  }

  async getOutlookWebhooks(userIntegration: UserIntegration, url: string) {
    try {
      const headers: any = {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      };
      const config = {
        method: 'get',
        url,
        headers,
      };
      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:62 ~ OutlookApiCalls ~ getOutlookWebhooks ~ err:',
        err,
      );
      return [];
    }
  }

  async deleteOutlookWebhook(userIntegration: UserIntegration, url: string) {
    try {
      const headers: any = {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      };
      const config = {
        method: 'delete',
        url,
        headers,
      };
      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:84 ~ OutlookApiCalls ~ deleteOutlookWebhook ~ err:',
        err,
      );
      return null;
    }
  }

  async getOutlookEvent(userIntegration: UserIntegration, url: string) {
    try {
      const headers: any = {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      };
      const config = {
        method: 'get',
        url,
        headers,
      };
      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:110 ~ OutlookApiCalls ~ getOutlookEvent ~ err:',
        err,
      );
      return null;
    }
  }

  async deleteOutlookEvent(userIntegration: UserIntegration, url: string) {
    try {
      const headers: any = {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      };
      const config = {
        method: 'delete',
        url,
        headers,
      };
      return await axios(config);
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:130 ~ OutlookApiCalls ~ deleteOutlookEvent ~ err:',
        err,
      );
      return null;
    }
  }
}

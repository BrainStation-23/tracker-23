import { UserIntegration } from '@prisma/client';
import axios from 'axios';

export class AzureDevApiCalls {
  async registerAzureDevWebhook(
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
      console.log('🚀 ~ file: api.ts:23 ~ AzureDevApiCalls ~ err:', err);
      return null;
    }
  }

  async extendAzureDevWebhookLifecycle(
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
      console.log('🚀 ~ AzureDevApiCalls ~ webhook:', webhook);
      return webhook;
    } catch (err) {
      console.log('🚀 ~ AzureDevApiCalls ~ err:', err);
      return null;
    }
  }

  async azureGetApiCall(userIntegration: UserIntegration, url: string) {
    try {
      const headers: any = {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      };
      const config = {
        method: 'GET',
        url,
        headers,
      };
      const data = (await axios(config)).data;
      console.log('🚀 ~ AzureDevApiCalls ~ azureGetApiCall ~ data:', data);
      return data;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:40 ~ AzureDevApiCalls ~ getCalendarEvents ~ err:',
        err,
      );
      return [];
    }
  }

  async getAzureDevWebhooks(userIntegration: UserIntegration, url: string) {
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
        '🚀 ~ file: api.ts:62 ~ AzureDevApiCalls ~ getAzureDevWebhooks ~ err:',
        err,
      );
      return [];
    }
  }

  async deleteAzureDevWebhook(userIntegration: UserIntegration, url: string) {
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
        '🚀 ~ file: api.ts:84 ~ AzureDevApiCalls ~ deleteAzureDevWebhook ~ err:',
        err,
      );
      return null;
    }
  }

  async getAzureDevEvent(userIntegration: UserIntegration, url: string) {
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
        '🚀 ~ file: api.ts:110 ~ AzureDevApiCalls ~ getAzureDevEvent ~ err:',
        err,
      );
      return null;
    }
  }

  async deleteAzureDevEvent(userIntegration: UserIntegration, url: string) {
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
        '🚀 ~ file: api.ts:130 ~ AzureDevApiCalls ~ deleteAzureDevEvent ~ err:',
        err,
      );
      return null;
    }
  }
}

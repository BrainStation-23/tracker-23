import { UserIntegration } from '@prisma/client';
import axios from 'axios';

export class AzureDevApiCalls {
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
      return data;
    } catch (err) {
      console.log(
        '🚀 ~ file: api.ts:40 ~ AzureDevApiCalls ~ getCalendarEvents ~ err:',
        err,
      );
      return [];
    }
  }

  async azurePostApiCall(
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
      console.log('🚀 ~ file: api.ts:69 ~ JiraApiCalls ~ err:', err);
      return null;
    }
  }
}

import { UserIntegration } from '@prisma/client';
import axios from 'axios';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export class JiraClient {
  constructor(
    private access_token: string,
    private readonly config: ConfigService,
    private httpService: HttpService,
    private userIntegrationDatabase: UserIntegrationDatabase,
  ) {}

  async getMyProfile() {
    return this.sendRequest('get', 'me');
  }

  async CallJira(
    userIntegration: UserIntegration,
    apiCaller: (userIntegration: UserIntegration, ...rest: any) => Promise<any>,
    ...rest: any
  ) {
    try {
      const config = {
        method: 'Get',
        url: `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/myself`,
        headers: {
          Authorization: `Bearer ${userIntegration.accessToken}`,
          'Content-Type': 'application/json',
        },
      };
      const response = (await axios(config)).data;
      console.log('🚀 ~ file: client.ts:37 ~ JiraClient ~ response:', response);
      return await apiCaller(userIntegration, ...rest);
    } catch (err) {
      console.log('🚀 ~ file: client.ts:40 ~ JiraClient ~ err:', err.message);
      const url = 'https://auth.atlassian.com/oauth/token';
      const headers: any = { 'Content-Type': 'application/json' };
      console.log('🚀 ~ file: client.ts:44 ~ JiraClient ~ headers:', headers);
      const data = {
        grant_type: 'refresh_token',
        client_id: this.config.get('JIRA_CLIENT_ID'),
        client_secret: this.config.get('JIRA_SECRET_KEY'),
        refresh_token: userIntegration?.refreshToken,
      };
      console.log('🚀 ~ file: client.ts:48 ~ JiraClient ~ data:', data);
      let tokenResp;
      try {
        tokenResp = (
          await lastValueFrom(this.httpService.post(url, data, headers))
        ).data;
      } catch (err) {
        console.log('🚀 ~ file: client.ts:55 ~ JiraClient ~ err:', err);
      }

      const newUserIntegration: any =
        userIntegration &&
        (await this.userIntegrationDatabase.updateUserIntegrationById(
          userIntegration?.id,
          {
            accessToken: tokenResp.access_token,
            refreshToken: tokenResp.refresh_token,
          },
        ));
      console.log(
        '🚀 ~ file: client.ts:62 ~ JiraClient ~ newUserIntegration:',
        newUserIntegration,
      );
      return await apiCaller(newUserIntegration, ...rest);
    }
  }

  async sendRequest(
    method: string,
    endpoint: string,
    headers?: any,
    body?: any,
  ) {
    const resp = await axios.get(`https://api.atlassian.com/${endpoint}`, {
      method,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.access_token}`,
        ...headers,
      },
      data: { ...body },
    });
    return resp.data;
  }
}

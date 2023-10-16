import { UserIntegration } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';

@Injectable()
export class JiraClientService {
  constructor(
    private readonly config: ConfigService,
    private httpService: HttpService,
    private userIntegrationDatabase: UserIntegrationDatabase,
  ) {}

  async CallJira(
    userIntegration: UserIntegration,
    apiCaller: (userIntegration: UserIntegration, ...rest: any) => Promise<any>,
    ...rest: any
  ) {
    if (userIntegration.expiration_time.getTime() > Date.now()) {
      // console.log(
      //   '🚀 ~ file: client.ts:22 ~ JiraClientService ~ userIntegration.expiration_time.getTime():',
      //   userIntegration.expiration_time.getTime(),
      //   Date.now(),
      // );
      return await apiCaller(userIntegration, ...rest);
    } else {
      const url = 'https://auth.atlassian.com/oauth/token';
      const headers: any = { 'Content-Type': 'application/json' };
      const data = {
        grant_type: 'refresh_token',
        client_id: this.config.get('JIRA_CLIENT_ID'),
        client_secret: this.config.get('JIRA_SECRET_KEY'),
        refresh_token: userIntegration?.refreshToken,
      };
      // console.log('🚀 ~ file: client.ts:37 ~ JiraClientService ~ data:', data);
      let tokenResp;
      try {
        tokenResp = (
          await lastValueFrom(this.httpService.post(url, data, headers))
        ).data;
      } catch (err) {
        console.log('🚀 ~ file: client.ts:55 ~ JiraClient ~ err:', err);
      }
      const expires_in = 3500000;
      const issued_time = Date.now();
      const token_expire = issued_time + expires_in;

      const newUserIntegration: any =
        userIntegration &&
        (await this.userIntegrationDatabase.updateUserIntegrationById(
          userIntegration?.id,
          {
            accessToken: tokenResp.access_token,
            refreshToken: tokenResp.refresh_token,
            expiration_time: new Date(token_expire),
          },
        ));
      // console.log(
      //   '🚀 ~ file: client.ts:62 ~ JiraClient ~ newUserIntegration:',
      //   newUserIntegration,
      // );
      return await apiCaller(newUserIntegration, ...rest);
    }
  }
}

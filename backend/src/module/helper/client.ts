import { UserIntegration } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { outLookConfig } from 'config/outlook';
import axios from 'axios';
import { APIException } from '../exception/api.exception';
import { ErrorMessage } from '../integrations/dto/get.userIntegrations.filter.dto';

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
        throw new APIException(
          ErrorMessage.INVALID_JIRA_REFRESH_TOKEN,
          HttpStatus.GONE,
        );
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

  async CallOutlook(
    userIntegration: UserIntegration,
    apiCaller: (userIntegration: UserIntegration, ...rest: any) => Promise<any>,
    ...rest: any
  ) {
    if (userIntegration.expiration_time.getTime() > Date.now()) {
      return await apiCaller(userIntegration, ...rest);
    } else {
      const url = outLookConfig.outlookAuthUrl;
      const data = {
        client_id: outLookConfig.clientId,
        grant_type: 'refresh_token',
        scope: outLookConfig.scope,
        refresh_token: userIntegration?.refreshToken,
        redirect_uri: outLookConfig.callback,
        client_secret: outLookConfig.client_secret,
      };
      let tokenResp;
      try {
        tokenResp = await (
          await axios.post(url, data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
        ).data;
      } catch (err) {
        throw new APIException(
          ErrorMessage.INVALID_OUTLOOK_REFRESH_TOKEN,
          HttpStatus.GONE,
        );
      }

      const issuedTime = Date.now();
      const newUserIntegration: any =
        userIntegration &&
        (await this.userIntegrationDatabase.updateUserIntegrationById(
          userIntegration?.id,
          {
            accessToken: tokenResp.access_token,
            refreshToken: tokenResp.refresh_token,
            expiration_time: new Date(issuedTime + tokenResp.expires_in * 1000),
          },
        ));
      return await apiCaller(newUserIntegration, ...rest);
    }
  }
}

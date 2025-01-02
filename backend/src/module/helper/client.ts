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
import { StatusEnum } from '../tasks/dto';
import { azureDevConfig } from 'config/azure_dev';

@Injectable()
export class ClientService {
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
    if (userIntegration?.expiration_time.getTime() > Date.now()) {
      // console.log(
      //   '🚀 ~ file: client.ts:22 ~ ClientService ~ userIntegration.expiration_time.getTime():',
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
      // console.log('🚀 ~ file: client.ts:37 ~ ClientService ~ data:', data);
      let tokenResp;
      try {
        tokenResp = (
          await lastValueFrom(this.httpService.post(url, data, headers))
        ).data;
      } catch (err) {
        // console.log('🚀 ~ ClientService ~ err:', 'hello from inside');
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
        const getSync = await this.userIntegrationDatabase.getSyncStatus({
          userWorkspaceId: userIntegration.userWorkspaceId,
          status: StatusEnum.IN_PROGRESS,
        });
        if (getSync) {
          await this.userIntegrationDatabase.updateSyncStatus(
            {
              id: getSync.id,
            },
            { status: StatusEnum.INVALID_JIRA_REFRESH_TOKEN },
          );
        }
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

  async CallAzureDev(
    userIntegration: UserIntegration,
    apiCaller: (userIntegration: UserIntegration, ...rest: any) => Promise<any>,
    ...rest: any
  ) {
    if (userIntegration?.expiration_time.getTime() > Date.now()) {
      return await apiCaller(userIntegration, ...rest);
    } else {
      const url = 'https://app.vssps.visualstudio.com/oauth2/token';
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      const body = {
        client_assertion_type: azureDevConfig.client_assertion_type,
        client_assertion: azureDevConfig.client_assertion,
        grant_type: 'refresh_token',
        assertion: userIntegration.refreshToken,
        redirect_uri: azureDevConfig.redirect_uri,
      };
      // console.log('🚀 ~ file: client.ts:37 ~ ClientService ~ data:', data);
      let tokenResp: any;
      try {
        tokenResp = await axios.post(url, body, {
          headers,
        });
      } catch (err) {
        throw new APIException(
          ErrorMessage.INVALID_AZURE_DEV_REFRESH_TOKEN,
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
            accessToken: tokenResp.data.access_token,
            refreshToken: tokenResp.data.refresh_token,
            expiration_time: new Date(token_expire),
          },
        ));
      return await apiCaller(newUserIntegration, ...rest);
    }
  }
}

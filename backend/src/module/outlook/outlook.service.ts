import { HttpStatus, Injectable } from '@nestjs/common';
import { IntegrationType, User } from '@prisma/client';
import { outLookConfig } from 'config/outlook';
import { AuthorizeOutlookDto } from './dto/authorization.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { APIException } from '../exception/api.exception';
import { IntegrationDatabase } from 'src/database/integrations';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { ProjectDatabase } from 'src/database/projects';
import axios from 'axios';

@Injectable()
export class OutlookService {
  constructor(
    private workspacesService: WorkspacesService,
    private integrationDatabase: IntegrationDatabase,
    private userIntegrationDatabase: UserIntegrationDatabase,
    private projectDatabase: ProjectDatabase,
  ) {}

  async getIntegrationLink() {
    const client_id = outLookConfig.clientId;
    const callback_url = outLookConfig.callback;
    const scope = outLookConfig.scope;
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?&scope=${scope}&response_type=code&response_mode=query&state=testing&redirect_uri=${callback_url}&client_id=${client_id}&prompt=consent`;
  }

  async createIntegration(dto: AuthorizeOutlookDto, user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace || !user.activeWorkspaceId)
      throw new APIException(
        'User Workspace not found',
        HttpStatus.BAD_REQUEST,
      );

    const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const body = {
      client_id: outLookConfig.clientId,
      scope: outLookConfig.scope,
      redirect_uri: outLookConfig.callback,
      code: dto.code,
      grant_type: 'authorization_code',
      client_secret: outLookConfig.client_secret,
    };
    let response;
    try {
      response = await axios.post(url, new URLSearchParams(body).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: outlook..service.ts:139 ~ OutlookService ~ createIntegration ~ error:',
        error,
      );
      throw new APIException('Could not authorize!', HttpStatus.BAD_REQUEST);
    }
    const selfUrl = 'https://graph.microsoft.com/v1.0/me';
    const config = {
      method: 'GET',
      url: selfUrl,
      headers: {
        Authorization: `Bearer ${response?.data?.access_token}`,
      },
    };
    let account: any, calendars;
    try {
      account = await (await axios(config)).data;
    } catch (err) {
      throw new APIException(
        'Could not get user account!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const doesExist = await this.integrationDatabase.findUniqueIntegration({
      IntegrationIdentifier: {
        siteId: account.id,
        workspaceId: user.activeWorkspaceId,
      },
    });
    if (doesExist) {
      throw new APIException(
        'This site is already integrated!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const integration = await this.integrationDatabase.createIntegration({
      siteId: account.id,
      type: IntegrationType.OUTLOOK,
      site: account.userPrincipalName,
      workspaceId: user.activeWorkspaceId,
    });

    if (!integration) {
      throw new APIException(
        'Could not create integration!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userIntegration =
      await this.userIntegrationDatabase.createUserIntegration({
        accessToken: response?.data?.access_token,
        refreshToken: response?.data?.refresh_token,
        userWorkspaceId: userWorkspace.id,
        workspaceId: user.activeWorkspaceId,
        integrationId: integration?.id,
        siteId: integration?.siteId,
        expiration_time: new Date(Date.now() + response?.data?.expires_in),
      });
    if (!userIntegration) {
      throw new APIException(
        'Could not create User integration!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const calendarUrl = 'https://graph.microsoft.com/v1.0/me/calendars';
    const calendarConfig = {
      method: 'GET',
      url: calendarUrl,
      headers: {
        Authorization: `Bearer ${userIntegration.accessToken}`,
      },
    };
    try {
      calendars = await (await axios(calendarConfig)).data;
    } catch (err) {
      throw new APIException(
        'Could not fetch calendar list!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const calendarArray: any[] = [];
    for (let index = 0, len = calendars.value.length; index < len; index++) {
      const calendar = calendars.value[index];
      integration.site &&
        calendarArray.push({
          calendarId: calendar.id,
          projectName: calendar.name,
          source: integration.site,
          integrated: false,
          integrationId: integration.id,
          workspaceId: user.activeWorkspaceId,
        });
    }

    await this.projectDatabase.createProjects(calendarArray);
    const calendarList = await this.projectDatabase.getProjects({
      integrationId: integration.id,
    });
    return calendarList.map((calendar) => {
      return {
        ...calendar,
        integrationType: IntegrationType.OUTLOOK,
      };
    });
  }
}

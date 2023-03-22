import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorizeJiraDto } from './dto';

@Injectable()
export class JiraService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}
  async getIntegrationLink(state: string | undefined) {
    let stateParam = '';
    if (state) {
      stateParam = `&state=${state}`;
    }
    const callback_url = this.config.get('JIRA_CALLBACK_URL');
    const client_id = this.config.get('JIRA_CLIENT_ID');
    return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${client_id}&scope=read:jira-work manage:jira-project manage:jira-data-provider manage:jira-webhook write:jira-work read:jira-user manage:jira-configuration offline_access&redirect_uri=${callback_url}${stateParam}&response_type=code&prompt=consent`;
  }

  async createIntegration(dto: AuthorizeJiraDto, user: User) {
    console.log(
      '🚀 ~ file: jira.service.ts:21 ~ JiraService ~ createIntegration ~ user:',
      user,
    );
    // get access token and refresh tokens and store those on integrations table.
    const url = 'https://auth.atlassian.com/oauth/token';
    const myURL = 'https://pm23.atlassian.net/rest/api/3/myself';
    const urlResources =
      'https://api.atlassian.com/oauth/token/accessible-resources';
    const headers: any = { 'Content-Type': 'application/json' };
    const body = {
      grant_type: 'authorization_code',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      code: dto.code,
      redirect_uri: this.config.get('JIRA_CALLBACK_URL'),
    };

    const resp = (
      await lastValueFrom(this.httpService.post(url, body, { headers }))
    ).data;

    // console.log(resp);

    // get resources from jira
    headers['Authorization'] = `Bearer ${resp['access_token']}`;

    const respResources = (
      await lastValueFrom(this.httpService.get(urlResources, { headers }))
    ).data;

    const myResp = (
      await axios.get(myURL, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `dipankar.bala@brainstation-23.com:ATATT3xFfGF0eEtuB4FmJVBgUYp6soYDzLgIWeKG9Oxy7TjX3FhFvqyKZx3dU_H8HB0LWno1j9UfuBCG8O-wpUUZo39yFAhwgR779aU_rSmYB7w_kT7tK0DNjm1aaPmbqxVP6talb6W5lq7A4EZdzCOBANBg-z4fDB-K5W8gd1EynUxlSjO-i6M=EE40F455`,
          ).toString('base64')}`,
          Accept: 'application/json',
        },
      })
    ).data;
    // console.log(myResp);

    // add all available resources in our database if doesn't exist
    respResources.forEach(async (element: any) => {
      // const integration = await this.prisma.integration.upsert({
      await this.prisma.integration.upsert({
        where: {
          integrationIdentifier: { userId: user.id, siteId: element.id },
        },
        update: {
          accessToken: resp.access_token,
          refreshToken: resp.refresh_token,
          site: element.url,
        },
        create: {
          siteId: element.id,
          userId: user.id,
          type: IntegrationType.JIRA,
          accessToken: resp.access_token,
          refreshToken: resp.refresh_token,
          site: element.url,
          accountId: myResp.accountId,
          email: myResp.emailAddress,
        },
      });
      // console.log(integration);
    });
    return await this.prisma.integration.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        site: true,
        siteId: true,
        type: true,
        accessToken: true,
      },
    });
  }
}

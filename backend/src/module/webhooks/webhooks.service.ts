import { HttpStatus, Injectable } from '@nestjs/common';
import { IntegrationType, SessionStatus, User } from '@prisma/client';
import axios from 'axios';
import { RegisterWebhookDto, extendWebhookLifeReqDto } from './dto/index.js';
import { deleteWebhookDto } from './dto/deleteWebhook.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { IntegrationsService } from '../integrations/integrations.service.js';
import { APIException } from '../exception/api.exception.js';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { JiraClientService } from '../helper/client';
@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionsService, // private tasksService: TasksService,
    private integrationsService: IntegrationsService,
    private jiraApiCalls: JiraApiCalls,
    private jiraClient: JiraClientService,
  ) {}

  async getWebhooks(user: User) {
    const userIntegrationIds: any[] = [];
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);
    getUserIntegrationList.map(async (userIntegration: any) => {
      userIntegrationIds.push(userIntegration.id);
    });
    return await this.getAllWebhooks(user, userIntegrationIds);
  }

  async getAllWebhooks(user: User, userIntegrationIds: number[]) {
    const webhooks = [];
    for (let index = 0, len = userIntegrationIds.length; index < len; index++) {
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          userIntegrationIds[index],
        );
      if (!updated_integration) {
        return [];
      }
      const url = `https://api.atlassian.com/ex/jira/${updated_integration.siteId}/rest/api/3/webhook`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration.accessToken}`,
          'Content-Type': 'application/json',
        },
      };
      const webhookJira = (await axios(config)).data;
      webhooks.push(webhookJira);
    }
    return webhooks;
  }

  async handleWebhook(payload: any) {
    const jiraEvent = payload.webhookEvent;
    const projectKey = payload.issue.key;
    const siteUrl = payload.user.self.split('/rest/');
    const integration = await this.prisma.integration.findFirst({
      where: {
        site: siteUrl[0],
      },
    });
    const siteId = integration?.siteId;
    const url = `${siteUrl[0]}/browse/${projectKey}`;
    // https://pm23.atlassian.net/browse/T23-261
    const webhookId: number[] = payload.matchedWebhookIds;
    const doesExistWebhook =
      siteId &&
      (await this.prisma.webhook.findUnique({
        where: {
          webhookIdentifier: {
            webhookId: webhookId[0],
            siteId,
          },
        },
      }));
    const projects = await this.prisma.project.findMany({
      where: {
        projectId: Number(payload.issue.fields.project.id),
        integrated: true,
      },
    });
    if (doesExistWebhook && payload.webhookEvent === 'jira:issue_created') {
      for (const project of projects) {
        const mappedUserWorkspaceAndJiraId =
          await this.mappingUserWorkspaceAndJiraAccountId(project.workspaceId);
        const mappedProjectIds = await this.mappingProjectIdAndJiraProjectId(
          project.workspaceId,
        );
        await this.prisma.task.create({
          data: {
            userWorkspaceId:
              mappedUserWorkspaceAndJiraId.get(
                payload.issue.fields.assignee?.accountId,
              ) || null,
            workspaceId: project.workspaceId,
            title: payload.issue.fields.summary,
            assigneeId: payload.issue.fields.assignee?.accountId || null,
            estimation: payload.issue.fields.timeoriginalestimate
              ? payload.issue.timeoriginalestimate / 3600
              : null,
            projectName: payload.issue.fields.project.name,
            projectId: mappedProjectIds.get(
              Number(payload.issue.fields.project.id),
            ),
            status: payload.issue.fields.status.name,
            statusCategoryName: payload.issue.fields.status.statusCategory.name
              .replace(' ', '_')
              .toUpperCase(),
            priority: payload.issue.fields.priority.name,
            integratedTaskId: Number(payload.issue.id),
            createdAt: new Date(payload.issue.fields.created),
            updatedAt: new Date(payload.issue.fields.updated),
            jiraUpdatedAt: new Date(payload.issue.fields.updated),
            source: IntegrationType.JIRA,
            url,
          },
        });
      }
    } else if (doesExistWebhook && jiraEvent === 'jira:issue_updated') {
      let sendToModify;
      if (
        payload.changelog.items[0].field === 'summary' ||
        payload.changelog.items[0].field === 'priority' ||
        payload.changelog.items[0].field === 'status' ||
        'resolution'
      ) {
        sendToModify = payload.changelog.items[0].toString;
      } else {
        sendToModify = payload.changelog.items[0].to;
      }
      let toBeUpdateField = this.toBeUpdateField(
        payload.changelog.items[0].field,
        sendToModify,
      );
      for (const project of projects) {
        if (toBeUpdateField.assigneeId) {
          const mappedUserWorkspaceAndJiraId =
            await this.mappingUserWorkspaceAndJiraAccountId(
              project.workspaceId,
            );
          const updatedField = {
            ...toBeUpdateField,
            userWorkspaceId: mappedUserWorkspaceAndJiraId.get(
              toBeUpdateField.assigneeId,
            ),
          };
          toBeUpdateField = updatedField;
        }
        await this.prisma.task.updateMany({
          where: {
            projectId: project.id,
            workspaceId: project.workspaceId,
            integratedTaskId: Number(payload.issue.id),
          },
          data: toBeUpdateField,
        });
      }
    } else if (jiraEvent === 'worklog_created') {
      const lastTime =
        new Date(payload.worklog.started).getTime() +
        Number(payload.worklog.timeSpentSeconds * 1000);

      await this.prisma.session.create({
        data: {
          startTime: new Date(payload.worklog.started),
          endTime: new Date(lastTime),
          status: SessionStatus.STOPPED,
          taskId: Number(payload.worklog.issueId),
          integratedTaskId: Number(payload.worklog.issueId),
          worklogId: payload.worklog.id,
          authorId: payload.worklog.author.accountId,
        },
      });
    }
  }

  private async mappingUserWorkspaceAndJiraAccountId(workspaceId: number) {
    const mappedUserWorkspaceAndJiraId = new Map<string, number>();
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        userWorkspaces: {
          include: {
            userIntegration: true,
          },
        },
      },
    });

    workspace &&
      workspace.userWorkspaces &&
      workspace.userWorkspaces?.map((userWorkspace) => {
        if (
          userWorkspace.userIntegration.length > 0 &&
          userWorkspace.userIntegration[0].jiraAccountId
        ) {
          mappedUserWorkspaceAndJiraId.set(
            userWorkspace.userIntegration[0].jiraAccountId,
            userWorkspace.id,
          );
        }
      });
    return mappedUserWorkspaceAndJiraId;
  }

  private async mappingProjectIdAndJiraProjectId(workspaceId: number) {
    const mappedProjectAndJiraId = new Map<number, number>();
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        projects: true,
      },
    });

    workspace &&
      workspace.projects &&
      workspace.projects?.map((project) => {
        if (project && project.projectId) {
          mappedProjectAndJiraId.set(project.projectId, project.id);
        }
      });
    return mappedProjectAndJiraId;
  }

  toBeUpdateField(key: any, value: any) {
    switch (key) {
      case 'summary':
        return {
          title: value,
        };
      case 'assignee':
        return {
          assigneeId: value,
        };
      case 'timeestimate':
        return {
          estimation: Number(value) / 3600,
        };
      case 'timeoriginalestimate':
        return {
          estimation: Number(value) / 3600,
        };
      case 'status':
        return {
          status: value,
        };
      case 'resolution':
        return {
          status: value,
        };
      case 'priority':
        return {
          priority: value,
        };
      default:
        return {};
    }
  }

  async registerWebhook(user: User, reqBody: RegisterWebhookDto) {
    try {
      const userIntegration = await this.prisma.userIntegration.findUnique({
        where: {
          id: Number(reqBody.userIntegrationId),
        },
      });
      if (!userIntegration) {
        return null;
      }
      const projectList = reqBody.projectName.map((el) => el);
      const formateReqBody = {
        url: reqBody.url,
        webhooks: [
          {
            events: reqBody.webhookEvents,
            jqlFilter: `project IN (${projectList})`,
          },
        ],
      };
      let webhook: any;
      try {
        const webhookUrl = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/webhook`;
        webhook = await this.jiraClient.CallJira(
          userIntegration,
          this.jiraApiCalls.registerWebhook,
          webhookUrl,
          formateReqBody,
        );
        // console.log(
        //   '🚀 ~ file: webhooks.service.ts:217 ~ WebhooksService ~ registerWebhook ~ webhook:',
        //   webhook.webhookRegistrationResult[0],
        // );
      } catch (err) {
        console.log(
          '🚀 ~ file: webhooks.service.ts:223 ~ WebhooksService ~ registerWebhook ~ err:',
          err,
        );
      }

      const currentDate = new Date(Date.now());
      currentDate.setDate(currentDate.getDate() + 30);

      const localWebhook =
        webhook &&
        userIntegration.siteId &&
        (await this.prisma.webhook.create({
          data: {
            projectKey: reqBody.projectName,
            webhookId: Number(
              webhook.webhookRegistrationResult[0].createdWebhookId,
            ),
            siteId: userIntegration.siteId,
            expirationDate: currentDate,
          },
        }));
      return localWebhook;
    } catch (err) {
      console.log(err);
      throw new APIException(
        err.message || 'Fetching problem to register webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteWebhook(user: User, reqBody: deleteWebhookDto) {
    try {
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          reqBody.userIntegrationId,
        );
      if (!updated_integration) {
        return null;
      }
      const jiraReqBody = {
        webhookIds: [reqBody.webhookId],
      };
      //console.log(jiraReqBody);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook`;
      const config = {
        method: 'delete',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: jiraReqBody,
      };

      const webhook = (await axios(config)).status;
      // console.log('deleted', webhook);
      webhook == 202 &&
        updated_integration.siteId &&
        (await this.prisma.webhook.delete({
          where: {
            webhookIdentifier: {
              webhookId: reqBody.webhookId,
              siteId: updated_integration.siteId,
            },
          },
        }));
      return webhook;
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Fetching problem to register webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async failedWebhook(user: User, reqBody: RegisterWebhookDto) {
    try {
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          reqBody.userIntegrationId,
        );
      if (!updated_integration) {
        return null;
      }
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook/failed`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      const webhooks = (await axios(config)).data;
      //console.log('Get failed', webhooks);
      return webhooks;
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Fetching problem to get failed webhook!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async extendWebhookLife(user: User, reqBody: extendWebhookLifeReqDto) {
    try {
      const updated_integration =
        await this.integrationsService.getUpdatedUserIntegration(
          user,
          reqBody.userIntegrationId,
        );
      if (!updated_integration) {
        return null;
      }
      //console.log(reqBody);
      const body = {
        webhookIds: [reqBody.webhookId],
      };
      // console.log(body);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/webhook/refresh`;
      const config = {
        method: 'put',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: body,
      };

      const webhook = (await axios(config)).data;
      const time = new Date(
        this.sessionService.getUtcTime(webhook.expirationDate),
      );
      const updatedLocal =
        updated_integration.siteId &&
        (await this.prisma.webhook.update({
          where: {
            webhookIdentifier: {
              webhookId: reqBody.webhookId,
              siteId: updated_integration.siteId,
            },
          },
          data: {
            expirationDate: time,
          },
        }));
      //console.log(updatedLocal);
      return updatedLocal;
    } catch (err) {
      console.log(err.message);
      throw new APIException(
        err.message || 'Fetching problem to Extend webhook life!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

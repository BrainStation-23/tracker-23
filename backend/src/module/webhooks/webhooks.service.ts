import { HttpStatus, Injectable } from '@nestjs/common';
import { IntegrationType, SessionStatus, User } from '@prisma/client';
import axios from 'axios';
import {
  RegisterWebhookDto,
  deleteWebhookDto,
  extendWebhookLifeReqDto,
} from './dto/index';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { SessionsService } from 'src/module/sessions/sessions.service';
import { IntegrationsService } from 'src/module/integrations/integrations.service';
import { APIException } from 'src/module/exception/api.exception';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { OutlookApiCalls } from 'src/utils/outlookApiCall/api';
import { JiraClientService } from 'src/module/helper/client';
import { outLookConfig } from '../../../config/outlook';
import { WorkspacesService } from 'src/module/workspaces/workspaces.service';
import { WebhookDatabase } from 'src/database/webhook';
import { ProjectDatabase } from 'src/database/projects';
import { TasksDatabase } from 'src/database/tasks';
import { IntegrationDatabase } from 'src/database/integrations';
@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionsService, // private tasksService: TasksService,
    private integrationsService: IntegrationsService,
    private jiraApiCalls: JiraApiCalls,
    private outlookApiCalls: OutlookApiCalls,
    private jiraClient: JiraClientService,
    private workspaceService: WorkspacesService,
    private webhookDatabase: WebhookDatabase,
    private projectDatabase: ProjectDatabase,
    private tasksDatabase: TasksDatabase,
    private integrationDatabase: IntegrationDatabase,
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
  async getOutlookWebhooks(user: User) {
    const userWorkspace = await this.workspaceService.getUserWorkspace(user);
    const userIntegration =
      user?.activeWorkspaceId &&
      (await this.prisma.userIntegration.findFirst({
        where: {
          workspaceId: user.activeWorkspaceId,
          userWorkspaceId: userWorkspace.id,
          integration: {
            type: IntegrationType.OUTLOOK,
          },
        },
      }));
    if (!userIntegration) {
      throw new APIException(
        'User integration not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const getSubscriptionUrl = `${outLookConfig.outlookWebhookRegisterEndPoint}`;
    let webhooks;
    try {
      webhooks = await this.jiraClient.CallOutlook(
        userIntegration,
        this.outlookApiCalls.getOutlookWebhooks,
        getSubscriptionUrl,
      );
    } catch (err) {
      console.log(err);
      throw new APIException(
        'Fetching problem to register webhook in outlook!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return [...webhooks.value];
  }

  async deleteOutlookWebhook(user: User, webhookId: number) {
    const userWorkspace = await this.workspaceService.getUserWorkspace(user);
    const userIntegration =
      user?.activeWorkspaceId &&
      (await this.prisma.userIntegration.findFirst({
        where: {
          workspaceId: user.activeWorkspaceId,
          userWorkspaceId: userWorkspace.id,
          integration: {
            type: IntegrationType.OUTLOOK,
          },
        },
      }));

    if (!userIntegration) {
      throw new APIException(
        'User integration not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const deletedWebhook = await this.webhookDatabase.deleteOutlookWebhook({
      id: webhookId,
    });

    const deleteSubscriptionUrl = `${outLookConfig.outlookWebhookRegisterEndPoint}/${deletedWebhook?.webhookId}`;

    deletedWebhook &&
      (await this.jiraClient.CallOutlook(
        userIntegration,
        this.outlookApiCalls.deleteOutlookWebhook,
        deleteSubscriptionUrl,
      ));

    return deletedWebhook;
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
            webhookId: String(webhookId[0]),
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
        const doesExist = await this.prisma.task.findFirst({
          where: {
            integratedTaskId: Number(payload.issue.id),
            projectId: project.id,
          },
        });
        if (!doesExist) {
          const mappedUserWorkspaceAndJiraId =
            await this.mappingUserWorkspaceAndJiraAccountId(
              project.workspaceId,
            );
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
              statusCategoryName:
                payload.issue.fields.status.statusCategory.name
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
      }
    } else if (doesExistWebhook && jiraEvent === 'jira:issue_updated') {
      let sendToModify;
      let toBeUpdateField: any;
      if (
        payload.changelog?.items[0]?.field === 'status' ||
        payload.changelog?.items[0]?.field === 'resolution'
      ) {
        sendToModify =
          payload.changelog?.items[0]?.field === 'resolution'
            ? payload.changelog?.items[1]?.toString
            : payload.changelog?.items[0]?.toString;
        toBeUpdateField = this.toBeUpdateField('status', sendToModify);
      } else if (
        payload.changelog?.items[0]?.field === 'summary' ||
        payload.changelog?.items[0]?.field === 'priority'
      ) {
        sendToModify = payload.changelog?.items[0]?.toString;
        toBeUpdateField = this.toBeUpdateField(
          payload.changelog?.items[0]?.field,
          sendToModify,
        );
      } else {
        sendToModify = payload.changelog.items[0].to;
        toBeUpdateField = this.toBeUpdateField(
          payload.changelog.items[0].field,
          sendToModify,
        );
      }
      for (const project of projects) {
        if (toBeUpdateField.assigneeId) {
          const mappedUserWorkspaceAndJiraId =
            await this.mappingUserWorkspaceAndJiraAccountId(
              project.workspaceId,
            );
          const updatedField = {
            ...toBeUpdateField,
            userWorkspaceId:
              mappedUserWorkspaceAndJiraId.get(toBeUpdateField.assigneeId) ??
              null,
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

  async handleOutlookWebhook(valid: any, payload: any) {
    if (valid) return valid;
    let flag = false;
    const webhook = await this.webhookDatabase.getWebhook({
      webhookId: payload.value[0].subscriptionId,
    });
    const eventId = payload.value[0].resourceData.id;
    if (!(webhook && eventId)) {
      return;
    }

    const projects = await this.projectDatabase.getProjects({
      calendarId: webhook.calendarId,
    });
    if (payload.value[0].changeType === 'created') {
      const userIntegration =
        projects[0]?.userWorkspaceId &&
        (await this.integrationDatabase.getIntegration({
          userWorkspaceId: projects[0].userWorkspaceId,
          siteId: webhook.siteId,
        }));
      if (!userIntegration) {
        return false;
      }
      const eventUrl = `${outLookConfig.outlookGetEventByEventIdUrl}${eventId}`;
      const outlookEvent = await this.jiraClient.CallOutlook(
        userIntegration,
        this.outlookApiCalls.getOutlookEvent,
        eventUrl,
      );
      for (let index = 0; index < projects.length; index++) {
        const project = projects[index];
        const session = {
          startTime: new Date(outlookEvent.start.dateTime),
          endTime: new Date(outlookEvent.end.dateTime),
          status: SessionStatus.STOPPED,
          userWorkspaceId: project?.userWorkspaceId,
          integratedEventId: outlookEvent.id,
        };
        const data = {
          userWorkspaceId: project?.userWorkspaceId,
          workspaceId: project.workspaceId,
          title: outlookEvent.subject,
          projectName: project.projectName,
          projectId: project.id,
          integratedEventId: outlookEvent.id,
          createdAt: new Date(outlookEvent.createdDateTime),
          updatedAt: new Date(outlookEvent.end.dateTime),
          jiraUpdatedAt: new Date(outlookEvent.lastModifiedDateTime),
          source: IntegrationType.OUTLOOK,
          dataSource: project.source,
          url: outlookEvent.webLink,
          sessions: {
            createMany: {
              data: [session],
            },
          },
        };
        await this.tasksDatabase.createTask(data);
      }
      flag = true;
    } else if (payload.value[0].changeType === 'deleted') {
      const projectIds: number[] = [];
      for (let index = 0; index < projects.length; index++) {
        projectIds.push(projects[index].id);
      }
      const tasks = await this.tasksDatabase.getTasks({
        projectId: { in: projectIds },
        integratedEventId: eventId,
      });
      const taskIds: number[] = [];
      for (let index = 0; index < tasks.length; index++) {
        taskIds.push(Number(tasks[index].id));
      }
      await this.tasksDatabase.deleteTasks({
        id: { in: taskIds },
      });

      flag = true;
    } else if (payload.value[0].changeType === 'updated') {
      const projectIds: number[] = [];
      for (let index = 0; index < projects.length; index++) {
        projectIds.push(projects[index].id);
      }
      const tasks = await this.tasksDatabase.getTasks({
        projectId: { in: projectIds },
        integratedEventId: eventId,
      });

      const taskIds: number[] = [];
      let tempFlag = true,
        userWorkspaceId;
      for (let index = 0; index < tasks.length; index++) {
        taskIds.push(Number(tasks[index].id));
        if (tempFlag) {
          userWorkspaceId = tasks[index].userWorkspaceId;
          tempFlag = false;
        }
      }
      const userIntegration =
        userWorkspaceId &&
        (await this.integrationDatabase.getIntegration({
          userWorkspaceId,
          siteId: webhook.siteId,
        }));
      if (!userIntegration) {
        return false;
      }

      const eventUrl = `${outLookConfig.outlookGetEventByEventIdUrl}${eventId}`;
      const outlookEvent = await this.jiraClient.CallOutlook(
        userIntegration,
        this.outlookApiCalls.getOutlookEvent,
        eventUrl,
      );

      if (outlookEvent) {
        const session = {
          startTime: new Date(outlookEvent.start.dateTime),
          endTime: new Date(outlookEvent.end.dateTime),
        };
        const data = {
          title: outlookEvent.subject,
          createdAt: new Date(outlookEvent.createdDateTime),
          updatedAt: new Date(outlookEvent.end.dateTime),
          jiraUpdatedAt: new Date(outlookEvent.lastModifiedDateTime),
        };
        await this.tasksDatabase.updateManyTaskSessions(
          { taskId: { in: taskIds } },
          session,
        );
        await this.tasksDatabase.updateManyTask({ id: { in: taskIds } }, data);
        flag = true;
      }
    }
    return flag;
  }

  async handleOutlookWebhookLifecycle(payload: any) {
    try {
      const webhook = await this.webhookDatabase.getWebhook({
        subscriptionId: payload.value[0].subscriptionId,
      });

      if (!webhook) {
        return null;
      }
      const projects = await this.projectDatabase.getProjects({
        calendarId: webhook.calendarId,
      });
      const userIntegration =
        projects[0]?.userWorkspaceId &&
        (await this.integrationDatabase.getIntegration({
          userWorkspaceId: projects[0].userWorkspaceId,
          siteId: webhook.siteId,
        }));
      if (!userIntegration) {
        return null;
      }

      const lifeCycleDate = {
        expirationDateTime: new Date(Date.now() + 2.5 * 3600 * 24 * 1000),
      };
      let updatedLifeCycle;
      const extendLifecycleUrl = `${outLookConfig.outlookWebhookRegisterEndPoint}/${payload.value[0].subscriptionId}`;
      try {
        updatedLifeCycle = await this.jiraClient.CallOutlook(
          userIntegration,
          this.outlookApiCalls.extendOutlookWebhookLifecycle,
          extendLifecycleUrl,
          lifeCycleDate,
        );
      } catch (err) {
        // console.log(err);
        // throw new APIException(
        //   'Fetching problem to register webhook in outlook!',
        //   HttpStatus.BAD_REQUEST,
        // );
        return null;
      }

      await this.webhookDatabase.updateWebhook(
        { id: webhook.id },
        {
          expirationDateTime: new Date(Date.now() + 2.5 * 3600 * 24 * 1000),
        },
      );
    } catch (err) {
      return null;
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
            webhookId: String(
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

  async registerOutlookWebhook(user: User, calendarId: string) {
    const userWorkspace = await this.workspaceService.getUserWorkspace(user);
    const userIntegration =
      user?.activeWorkspaceId &&
      (await this.prisma.userIntegration.findFirst({
        where: {
          workspaceId: user.activeWorkspaceId,
          userWorkspaceId: userWorkspace.id,
          integration: {
            type: IntegrationType.OUTLOOK,
          },
        },
      }));
    if (!userIntegration) {
      // throw new APIException(
      //   'User integration not found',
      //   HttpStatus.BAD_REQUEST,
      // );
      return null;
    }
    const doesExistWebhook = await this.webhookDatabase.doesExistWebhook({
      siteId: userIntegration.siteId,
      calendarId: calendarId,
    });
    if (doesExistWebhook || !outLookConfig?.webhookUrl) {
      // throw new APIException(
      //   'Webhook already exist! Please renew.',
      //   HttpStatus.BAD_REQUEST,
      // );
      return null;
    }
    const subscriptionConfig = {
      changeType: outLookConfig.outlookWebhookChangeType,
      notificationUrl: outLookConfig.webhookUrl,
      lifecycleNotificationUrl: outLookConfig.webhook_lifecycleUrl,
      resource: `/me/calendars/${calendarId}/events`,
      expirationDateTime: new Date(Date.now() + 2.5 * 3600 * 24 * 1000),
      clientState: outLookConfig.clientState,
    };
    let webhook;
    const webhookUrl = outLookConfig.outlookWebhookRegisterEndPoint;
    try {
      webhook = await this.jiraClient.CallOutlook(
        userIntegration,
        this.outlookApiCalls.registerOutlookWebhook,
        webhookUrl,
        subscriptionConfig,
      );
      console.log(
        '🚀 ~ WebhooksService ~ registerOutlookWebhook ~ webhook:',
        webhook,
      );
    } catch (err) {
      // console.log(err);
      // throw new APIException(
      //   'Fetching problem to register webhook in outlook!',
      //   HttpStatus.BAD_REQUEST,
      // );
      return null;
    }

    const data = {
      webhookId: webhook.id,
      siteId: userIntegration.siteId,
      calendarId: calendarId,
      expirationDate: webhook.expirationDateTime,
    };
    const localWebhook = await this.webhookDatabase.createWebhook(data);
    if (!localWebhook) {
      // throw new APIException(
      //   'Fetching problem to register webhook!',
      //   HttpStatus.INTERNAL_SERVER_ERROR,
      // );
      return null;
    }
    return localWebhook;
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

import axios from 'axios';
import { coreConfig } from 'config/core';
import * as dayjs from 'dayjs';
import { lastValueFrom } from 'rxjs';
import { TasksDatabase } from 'src/database/tasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { Worker, isMainThread, parentPort } from 'worker_threads';

import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IntegrationType,
  Project,
  SessionStatus,
  User,
  UserIntegration,
  UserWorkspace,
} from '@prisma/client';

import { APIException } from '../exception/api.exception';
import { JiraClientService } from '../helper/client';
import { IntegrationsService } from '../integrations/integrations.service';
import { MyGateway } from '../notifications/socketGateway';
import { PrismaService } from '../prisma/prisma.service';
import { SprintsService } from '../sprints/sprints.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { StatusEnum } from '../tasks/dto';
import { QueuePayloadType } from '../queue/types';

@Injectable()
export class WorkerService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private integrationsService: IntegrationsService,
    private myGateway: MyGateway,
    private workspacesService: WorkspacesService,
    private sprintService: SprintsService,
    private tasksDatabase: TasksDatabase,
    private jiraApiCalls: JiraApiCalls,
    private jiraClient: JiraClientService,
  ) {}

  async performTask(data: any) {
    return new Promise((resolve, reject) => {
      if (isMainThread) {
        const worker = new Worker(
          `${__filename}/../../../module/worker/worker.js`,
          {
            workerData: data,
          },
        );

        worker.on('message', async (result) => {
          await this.processData(result);
          resolve(result);
        });

        worker.on('error', (error) => {
          reject(error);
        });

        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      } else if (parentPort) {
        // Worker thread logic
        const result = this.processData(data);
        parentPort.postMessage(result);
        resolve(result);
      } else {
        reject(new Error('parentPort is null'));
      }
    });
  }

  private async processData(data: any) {
    const { payloadType, user, projectId } = data;
    if (payloadType === QueuePayloadType.SYNC_ALL) {
      return await this.syncAllAndUpdateTasks(user);
    } else if (payloadType === QueuePayloadType.SYNC_PROJECT_OR_OUTLOOK) {
      return await this.syncSingleProjectOrCalendar(user, projectId);
    }
  }

  private async createNotification(
    user: User,
    title: string,
    description: string,
  ) {
    return (
      user?.activeWorkspaceId &&
      (await this.prisma.notification.create({
        data: {
          seen: false,
          author: 'SYSTEM',
          title,
          description,
          userId: user.id,
          workspaceId: user.activeWorkspaceId,
        },
      }))
    );
  }

  async queueHandler(data: any) {
    await this.performTask(data);
  }

  async fetchAndProcessTasksAndWorklog(
    user: User,
    project: Project,
    userIntegration: UserIntegration,
  ) {
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userIntegration.accessToken}`,
    };

    const mappedUserWorkspaceAndJiraId =
      await this.mappingUserWorkspaceAndJiraAccountId(user);
    const settings = await this.tasksDatabase.getSettings(user);
    const syncTime: number = settings ? settings.syncTime : 6;
    const url = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/api/3/search?jql=project=${project.projectId} AND created >= startOfMonth(-${syncTime}M) AND created <= endOfDay()&maxResults=1000`;
    const fields =
      'summary, assignee,timeoriginalestimate,project, comment,parent, created, updated,status,priority';
    let respTasks;
    const parentChildMapped = new Map<number, number>();

    for (let startAt = 0; startAt < 5000; startAt += 100) {
      let worklogPromises: Promise<any>[] = [];
      // let taskPromises: Promise<any>[] = [];
      const taskList: any[] = [],
        worklogsList: any[] = [],
        sessionArray: any[] = [];
      const mappedIssues = new Map<number, any>();
      respTasks = (
        await lastValueFrom(
          this.httpService.get(url, {
            headers,
            params: { startAt, maxResults: 100, fields },
          }),
        )
      ).data;

      if (!respTasks || respTasks.issues.length === 0) {
        break;
      }
      respTasks.issues.map((issue: any) => {
        mappedIssues.set(Number(issue.id), {
          ...issue?.fields,
          key: issue?.key,
        });
      });

      const integratedTasks = await this.prisma.task.findMany({
        where: {
          workspaceId: user.activeWorkspaceId,
          integratedTaskId: { in: [...mappedIssues.keys()] },
          source: IntegrationType.JIRA,
        },
        select: {
          integratedTaskId: true,
        },
      });

      // console.log(respTasks);

      // keep the task list that doesn't exist in the database
      for (let j = 0, len = integratedTasks.length; j < len; j++) {
        const key = integratedTasks[j].integratedTaskId;
        key && mappedIssues.delete(key);
      }

      for (const [integratedTaskId, integratedTask] of mappedIssues) {
        const taskStatus = integratedTask.status.name;
        const taskPriority = integratedTask.priority.name;

        if (!parentChildMapped.has(integratedTaskId)) {
          integratedTask.parent &&
            integratedTask.parent.id &&
            parentChildMapped.set(
              integratedTaskId,
              Number(integratedTask.parent.id),
            );
        }

        taskList.push({
          userWorkspaceId:
            mappedUserWorkspaceAndJiraId.get(
              integratedTask.assignee?.accountId,
            ) || null,
          workspaceId: project.workspaceId,
          title: integratedTask.summary,
          assigneeId: integratedTask.assignee?.accountId || null,
          estimation: integratedTask.timeoriginalestimate
            ? Number((integratedTask.timeoriginalestimate / 3600).toFixed(2))
            : null,
          projectName: project.projectName,
          projectId: project.id,
          status: taskStatus,
          statusCategoryName: integratedTask.status.statusCategory.name
            .replace(' ', '_')
            .toUpperCase(),
          priority: taskPriority,
          integratedTaskId: integratedTaskId,
          createdAt: new Date(integratedTask.created),
          updatedAt: new Date(integratedTask.updated),
          jiraUpdatedAt: new Date(integratedTask.updated),
          source: IntegrationType.JIRA,
          dataSource: project.source,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          url: `${userIntegration?.integration?.site}/browse/${integratedTask?.key}`,
          key: integratedTask?.key,
        });
      }
      const mappedTaskId = new Map<number, number>();
      try {
        const [t, tasks] = await Promise.all([
          await this.prisma.task.createMany({
            data: taskList,
          }),
          await this.prisma.task.findMany({
            where: {
              projectId: project.id,
              source: IntegrationType.JIRA,
            },
            select: {
              id: true,
              integratedTaskId: true,
            },
          }),
        ]);

        for (let index = 0; index < tasks.length; index++) {
          mappedTaskId.set(
            Number(tasks[index].integratedTaskId),
            tasks[index].id,
          );
        }
      } catch (err) {
        console.log(
          '🚀 ~ file: tasks.service.ts:924 ~ TasksService ~ err:',
          err,
        );
        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }
      let total = 0;
      try {
        for (const [integratedTaskId] of mappedIssues) {
          const fields = 'issueId';
          const url = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
          const config = {
            method: 'get',
            url,
            headers: {
              Authorization: `Bearer ${userIntegration?.accessToken}`,
              'Content-Type': 'application/json',
              fields,
            },
          };
          const res = axios(config);
          worklogPromises.push(res);
          if (worklogPromises.length >= coreConfig.promiseQuantity) {
            total += coreConfig.promiseQuantity;
            const resolvedPromise = await Promise.all(worklogPromises);
            worklogsList.push(...resolvedPromise);
            worklogPromises = [];
          }
        }

        if (worklogPromises.length) {
          const resolvedPromise = await Promise.all(worklogPromises);
          worklogsList.push(...resolvedPromise);
        }
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:952 ~ TasksService ~ error:',
          error,
        );
        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }

      for (let index = 0; index < worklogsList.length; index++) {
        const regex = /\/issue\/(\d+)\/worklog/;
        const match = worklogsList[index].request.path.match(regex);
        const taskId = mappedTaskId.get(Number(match[1]));

        taskId &&
          worklogsList[index].data.worklogs.map((log: any) => {
            const lastTime =
              new Date(log.started).getTime() +
              Number(log.timeSpentSeconds * 1000);
            sessionArray.push({
              startTime: new Date(log.started),
              endTime: new Date(lastTime),
              status: SessionStatus.STOPPED,
              taskId: taskId,
              integratedTaskId: Number(log.issueId),
              worklogId: Number(log.id),
              authorId: log.author.accountId,
              userWorkspaceId:
                mappedUserWorkspaceAndJiraId.get(log.author.accountId) || null,
            });
          });
      }
      try {
        await this.prisma.session.createMany({
          data: sessionArray,
        });
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:986 ~ TasksService ~ error:',
          error,
        );

        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    //parent task update
    const mappedTaskIdForParentChild = new Map<number, number>();
    const updateTaskPromises: Promise<any>[] = [];
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId: project.id,
        source: IntegrationType.JIRA,
      },
      select: {
        id: true,
        integratedTaskId: true,
      },
    });

    for (let index = 0; index < tasks.length; index++) {
      if (
        !mappedTaskIdForParentChild.has(Number(tasks[index].integratedTaskId))
      ) {
        mappedTaskIdForParentChild.set(
          Number(tasks[index].integratedTaskId),
          tasks[index].id,
        );
      }
    }
    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index];
      const parentJiraId =
        task.integratedTaskId && parentChildMapped.get(task.integratedTaskId);
      const parentLocalId =
        parentJiraId && mappedTaskIdForParentChild.get(parentJiraId);
      updateTaskPromises.push(
        this.prisma.task.update({
          where: {
            id: task.id,
          },
          data: {
            parentTaskId: parentLocalId,
          },
        }),
      );
    }
    await Promise.allSettled(updateTaskPromises);
  }

  private async syncTasksFetchAndProcessTasksAndWorklog(
    user: User,
    project: Project,
    userIntegration: UserIntegration,
  ) {
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userIntegration.accessToken}`,
    };

    const mappedUserWorkspaceAndJiraId =
      await this.mappingUserWorkspaceAndJiraAccountId(user);
    const settings = await this.tasksDatabase.getSettings(user);
    const syncTime: number = settings ? settings.syncTime : 6;

    const url = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/api/3/search?jql=project=${project.projectId} AND created >= startOfMonth(-${syncTime}M) AND created <= endOfDay()&maxResults=1000`;
    const fields =
      'summary, assignee,timeoriginalestimate,project, comment, created, updated,status,priority, parent';
    let respTasks;
    for (let startAt = 0; startAt < 5000; startAt += 100) {
      let worklogPromises: Promise<any>[] = [];
      // let taskPromises: Promise<any>[] = [];
      const taskList: any[] = [],
        worklogsList: any[] = [],
        sessionArray: any[] = [];
      const mappedIssues = new Map<number, any>();
      respTasks = (
        await lastValueFrom(
          this.httpService.get(url, {
            headers,
            params: { startAt, maxResults: 100, fields },
          }),
        )
      ).data;
      if (respTasks.issues.length === 0) {
        break;
      }
      respTasks.issues.map((issue: any) => {
        mappedIssues.set(Number(issue.id), {
          ...issue?.fields,
          key: issue?.key,
        });
      });

      const integratedTasks = await this.prisma.task.findMany({
        where: {
          workspaceId: user.activeWorkspaceId,
          integratedTaskId: { in: [...mappedIssues.keys()] },
          source: IntegrationType.JIRA,
        },
        select: {
          integratedTaskId: true,
        },
      });

      for (let j = 0, len = integratedTasks.length; j < len; j++) {
        const key = integratedTasks[j].integratedTaskId;
        const localTask = await this.prisma.task.findFirst({
          where: {
            integratedTaskId: key,
            workspaceId: user.activeWorkspaceId,
          },
        });
        const jiraTask = mappedIssues.get(Number(key));

        if (
          localTask &&
          localTask.jiraUpdatedAt &&
          localTask.jiraUpdatedAt < new Date(jiraTask.updated)
        ) {
          // const updatedTask =
          localTask &&
            localTask.id &&
            (await this.prisma.task.update({
              where: {
                id: localTask.id,
              },
              data: {
                userWorkspaceId:
                  mappedUserWorkspaceAndJiraId.get(
                    jiraTask.assignee?.accountId,
                  ) || null,
                workspaceId: project.workspaceId,
                title: jiraTask.summary,
                assigneeId: jiraTask.assignee?.accountId || null,
                estimation: jiraTask.timeoriginalestimate
                  ? Number((jiraTask.timeoriginalestimate / 3600).toFixed(2))
                  : null,
                // projectName: jiraTask.project.name,
                status: jiraTask.status.name,
                statusCategoryName: jiraTask.status.statusCategory.name
                  .replace(' ', '_')
                  .toUpperCase(),
                priority: jiraTask.priority.name,
                updatedAt:
                  localTask.updatedAt <= new Date(jiraTask.updated)
                    ? new Date(jiraTask.updated)
                    : localTask.updatedAt,
                jiraUpdatedAt: new Date(jiraTask.updated),
              },
            }));
          // console.log(updatedTask);

          // worklog delete
          const wklogs = await this.prisma.session.deleteMany({
            where: {
              taskId: localTask.id,
            },
          });
          //console.log(wklogs);

          const url = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/issue/${localTask.integratedTaskId}/worklog`;
          const config = {
            method: 'get',
            url,
            headers: {
              Authorization: `Bearer ${userIntegration?.accessToken}`,
              'Content-Type': 'application/json',
              fields,
            },
          };
          const worklog = (await axios(config)).data;
          // console.log(worklog);
          worklog.worklogs.map(async (log: any) => {
            const lastTime =
              new Date(log.started).getTime() +
              Number(log.timeSpentSeconds * 1000);
            localTask?.id &&
              (await this.prisma.session.create({
                data: {
                  startTime: new Date(log.started),
                  endTime: new Date(lastTime),
                  status: SessionStatus.STOPPED,
                  taskId: localTask.id,
                  integratedTaskId: Number(log.issueId),
                  worklogId: Number(log.id),
                  authorId: log.author.accountId,
                  userWorkspaceId:
                    mappedUserWorkspaceAndJiraId.get(log.author.accountId) ||
                    null,
                },
              }));
          });
        }
        // console.log('updatedTask', updatedTask);
      }

      // keep the task list that doesn't exist in the database
      for (let j = 0, len = integratedTasks.length; j < len; j++) {
        const key = integratedTasks[j].integratedTaskId;
        key && mappedIssues.delete(key);
      }
      for (const [integratedTaskId, integratedTask] of mappedIssues) {
        const taskStatus = integratedTask.status.name;
        taskList.push({
          userWorkspaceId:
            mappedUserWorkspaceAndJiraId.get(
              integratedTask.assignee?.accountId,
            ) || null,
          workspaceId: project.workspaceId,
          title: integratedTask.summary,
          assigneeId: integratedTask.assignee?.accountId || null,
          estimation: integratedTask.timeoriginalestimate
            ? Number((integratedTask.timeoriginalestimate / 3600).toFixed(2))
            : null,
          projectName: integratedTask.project.name,
          projectId: project.id,
          status: taskStatus,
          statusCategoryName: integratedTask.status.statusCategory.name
            .replace(' ', '_')
            .toUpperCase(),
          priority: integratedTask.priority.name,
          integratedTaskId: integratedTaskId,
          createdAt: new Date(integratedTask.created),
          updatedAt: new Date(integratedTask.updated),
          jiraUpdatedAt: new Date(integratedTask.updated),
          source: IntegrationType.JIRA,
          dataSource: project.source,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          url: `${userIntegration?.integration?.site}/browse/${integratedTask?.key}`,
          key: integratedTask?.key,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [t, tasks] = await Promise.all([
        await this.prisma.task.createMany({
          data: taskList,
        }),
        await this.prisma.task.findMany({
          where: {
            source: IntegrationType.JIRA,
          },
          select: {
            id: true,
            integratedTaskId: true,
          },
        }),
      ]);
      const mappedTaskId = new Map<number, number>();
      for (let index = 0; index < tasks.length; index++) {
        mappedTaskId.set(
          Number(tasks[index].integratedTaskId),
          tasks[index].id,
        );
      }
      let total = 0;
      try {
        for (const [integratedTaskId] of mappedIssues) {
          const fields = 'issueId';
          const url = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/issue/${integratedTaskId}/worklog`;
          const config = {
            method: 'get',
            url,
            headers: {
              Authorization: `Bearer ${userIntegration?.accessToken}`,
              'Content-Type': 'application/json',
              fields,
            },
          };
          const res = axios(config);
          worklogPromises.push(res);
          if (worklogPromises.length >= coreConfig.promiseQuantity) {
            total += coreConfig.promiseQuantity;
            const resolvedPromise = await Promise.all(worklogPromises);
            worklogsList.push(...resolvedPromise);
            worklogPromises = [];
          }
        }

        if (worklogPromises.length) {
          const resolvedPromise = await Promise.all(worklogPromises);
          worklogsList.push(...resolvedPromise);
        }
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:1291 ~ TasksService ~ error:',
          error,
        );
      }

      for (let index = 0; index < worklogsList.length; index++) {
        const urlArray = worklogsList[index].config.url.split('/');
        const jiraTaskId = urlArray[urlArray.length - 2];
        const taskId = mappedTaskId.get(Number(jiraTaskId));

        taskId &&
          worklogsList[index].data.worklogs.map((log: any) => {
            const lastTime =
              new Date(log.started).getTime() +
              Number(log.timeSpentSeconds * 1000);
            sessionArray.push({
              startTime: new Date(log.started),
              endTime: new Date(lastTime),
              status: SessionStatus.STOPPED,
              taskId: taskId,
              integratedTaskId: Number(log.issueId),
              worklogId: Number(log.id),
              authorId: log.author.accountId,
              userWorkspaceId:
                mappedUserWorkspaceAndJiraId.get(log.author.accountId) || null,
            });
          });
      }
      try {
        await this.prisma.session.createMany({
          data: sessionArray,
        });
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:1058 ~ TasksService ~ error:',
          error,
        );
        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async mappingUserWorkspaceAndJiraAccountId(user: User) {
    const mappedUserWorkspaceAndJiraId = new Map<string, number>();
    const workspace =
      user?.activeWorkspaceId &&
      (await this.prisma.workspace.findUnique({
        where: {
          id: user.activeWorkspaceId,
        },
        include: {
          userWorkspaces: {
            include: {
              userIntegration: true,
            },
          },
        },
      }));

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

  async updateProjectIntegrationStatus(projId: number) {
    await this.prisma.project.update({
      where: { id: projId },
      data: { integrated: true },
    });
  }

  async sendImportedNotification(user: User, msg: string) {
    const notification = await this.createNotification(user, msg, msg);
    this.myGateway.sendNotification(`${user.id}`, notification);
  }

  async syncSingleProjectOrCalendar(user: User, projId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });
    if (!project) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }
    if (project.integration?.type === IntegrationType.OUTLOOK) {
      return await this.syncEvents(user, project.id);
    } else if (project.integration?.type === IntegrationType.JIRA) {
      return await this.syncTasks(user, project.id);
    }
  }

  async syncEvents(user: User, calenId: number) {
    const calender = await this.prisma.project.findUnique({
      where: { id: calenId },
      include: { integration: true },
    });
    if (!calender) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException('Calendar Not Found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException(
        'Can not import calender events, userWorkspace not found!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegration =
      calender?.integrationId &&
      (await this.getUserIntegration(userWorkspace.id, calender.integrationId));

    if (!userIntegration) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      return [];
    }
    try {
      Promise.allSettled([
        await this.syncCall(StatusEnum.IN_PROGRESS, user),
        await this.sendImportedNotification(user, 'Syncing in progress!'),
        await this.fetchAndProcessCalenderEvents(
          user,
          userWorkspace,
          calender,
          userIntegration,
        ),
        await this.syncCall(StatusEnum.DONE, user),
        await this.sendImportedNotification(
          user,
          'Calendar Synced Successfully!',
        ),
      ]);
      return { message: 'Calendar Synced Successfully!' };
    } catch (err) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1511 ~ TasksService ~ syncTasks ~ err:',
        err,
      );
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException(
        'Could not Sync Calendar Events!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchAndProcessCalenderEvents(
    user: User,
    userWorkspace: UserWorkspace,
    calender: Project,
    userIntegration: UserIntegration,
  ) {
    const settings = await this.tasksDatabase.getSettings(user);
    const givenTime: number = settings ? settings.syncTime : 6;
    const currentTime = dayjs();
    const syncTime = currentTime.subtract(givenTime, 'month');
    const iso8601SyncTime = syncTime.toISOString();
    const iso861CurrentTime = currentTime.toISOString();
    let url = `https://graph.microsoft.com/v1.0//me/calendars/${calender.calendarId}/calendarView?startDateTime=${iso8601SyncTime}&endDateTime=${iso861CurrentTime}`;
    const mappedIssues = new Map<string, any>();
    const taskList: any[] = [],
      sessionArray: any[] = [];
    let events;

    do {
      events = null;
      events = await this.jiraClient.CallOutlook(
        userIntegration,
        this.jiraApiCalls.getCalendarEvents,
        url,
      );
      events.value.map((event: any) => {
        mappedIssues.set(event.id, event);
      });
      url = events['@odata.nextLink'];
    } while (url);

    const integratedEvents = await this.prisma.task.findMany({
      where: {
        workspaceId: user.activeWorkspaceId,
        userWorkspaceId: userWorkspace.id,
        integratedEventId: { in: [...mappedIssues.keys()] },
        source: IntegrationType.OUTLOOK,
      },
      select: {
        id: true,
        integratedEventId: true,
        jiraUpdatedAt: true,
        updatedAt: true,
      },
    });

    for (let j = 0, len = integratedEvents.length; j < len; j++) {
      const localEvent = integratedEvents[j];
      const calendarEvent =
        localEvent.integratedEventId &&
        mappedIssues.get(localEvent.integratedEventId);

      if (
        localEvent &&
        localEvent.jiraUpdatedAt &&
        localEvent.jiraUpdatedAt < new Date(calendarEvent.lastModifiedDateTime)
      ) {
        localEvent &&
          localEvent.id &&
          (await this.prisma.task.update({
            where: {
              id: localEvent.id,
            },
            data: {
              userWorkspaceId: userWorkspace.id,
              workspaceId: user.activeWorkspaceId,
              title: calendarEvent.subject,
              updatedAt:
                localEvent.updatedAt <= new Date(calendarEvent.end.dateTime)
                  ? new Date(calendarEvent.end.dateTime)
                  : localEvent.updatedAt,
              jiraUpdatedAt: new Date(calendarEvent.lastModifiedDateTime),
            },
          }));
        // worklog delete
        await this.prisma.session.deleteMany({
          where: {
            taskId: localEvent.id,
          },
        });
        localEvent?.id &&
          (await this.prisma.session.create({
            data: {
              startTime: new Date(calendarEvent.start.dateTime),
              endTime: new Date(calendarEvent.end.dateTime),
              taskId: localEvent.id,
              status: SessionStatus.STOPPED,
              integratedEventId: calendarEvent.id,
              userWorkspaceId: userWorkspace.id,
            },
          }));
      }
      const key = integratedEvents[j]?.integratedEventId;
      key && mappedIssues.delete(key);
    }

    for (const [integratedEventId, integratedEvent] of mappedIssues) {
      taskList.push({
        userWorkspaceId: userWorkspace.id,
        workspaceId: calender.workspaceId,
        title: integratedEvent.subject,
        projectName: calender.projectName,
        projectId: calender.id,
        integratedEventId,
        createdAt: new Date(integratedEvent.createdDateTime),
        updatedAt: new Date(integratedEvent.end.dateTime),
        jiraUpdatedAt: new Date(integratedEvent.lastModifiedDateTime),
        source: IntegrationType.OUTLOOK,
        dataSource: calender.source,
        url: integratedEvent.webLink,
      });
    }
    const mappedEventId = new Map<string, number>();
    try {
      const [t, events] = await Promise.all([
        await this.prisma.task.createMany({
          data: taskList,
        }),
        await this.prisma.task.findMany({
          where: {
            projectId: calender.id,
            source: IntegrationType.OUTLOOK,
          },
          select: {
            id: true,
            integratedEventId: true,
          },
        }),
      ]);

      for (let idx = 0; idx < events.length; idx++) {
        const event = events[idx];
        event.integratedEventId &&
          mappedEventId.set(event.integratedEventId, event.id);
      }
    } catch (err) {
      console.log(
        '🚀 ~ file: projects.service.ts:512 ~ ProjectsService ~ err:',
        err,
      );
      throw new APIException(
        'Could not import Calender Events',
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const [integratedEventId, integratedEvent] of mappedIssues) {
      const taskId = mappedEventId.get(integratedEventId);

      taskId &&
        sessionArray.push({
          startTime: new Date(integratedEvent.start.dateTime),
          endTime: new Date(integratedEvent.end.dateTime),
          taskId,
          status: SessionStatus.STOPPED,
          integratedEventId: integratedEvent.id,
          userWorkspaceId: userWorkspace.id,
        });
    }
    try {
      await this.prisma.session.createMany({
        data: sessionArray,
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:986 ~ TasksService ~ error:',
        error,
      );
      throw new APIException(
        'Could not import Calender Events',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async syncTasks(user: User, projId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });
    if (!project) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException(
        'Can not import project tasks, userWorkspace not found!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegration =
      project?.integrationId &&
      (await this.getUserIntegration(userWorkspace.id, project.integrationId));
    const updatedUserIntegration =
      userIntegration &&
      (await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegration.id,
      ));

    if (!updatedUserIntegration) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      // throw new APIException(
      //   'Could not sync project tasks, userWorkspace not found!',
      //   HttpStatus.BAD_REQUEST,
      // );
      return [];
    }
    try {
      Promise.allSettled([
        // await this.syncCall(StatusEnum.IN_PROGRESS, user),
        await this.sendImportedNotification(user, 'Syncing in progress!'),
        await this.syncTasksFetchAndProcessTasksAndWorklog(
          user,
          project,
          updatedUserIntegration,
        ),
        await this.sprintService.createSprintAndTask(
          user,
          project,
          updatedUserIntegration,
        ),
        await this.updateProjectIntegrationStatus(projId),
        await this.syncCall(StatusEnum.DONE, user),
        await this.sendImportedNotification(
          user,
          'Project Synced Successfully!',
        ),
      ]);
      return { message: 'Project Synced Successfully!' };
    } catch (err) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1511 ~ TasksService ~ syncTasks ~ err:',
        err,
      );
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException(
        'Could not Sync project tasks!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserIntegration(userWorkspaceId: number, integrationId: number) {
    return await this.prisma.userIntegration.findUnique({
      where: {
        UserIntegrationIdentifier: {
          integrationId,
          userWorkspaceId,
        },
      },
    });
  }

  async syncAllAndUpdateTasks(user: User) {
    const [jiraProjectIds, outLookCalendarIds] = await Promise.all([
      await this.sprintService.getProjectIds(user),
      await this.sprintService.getCalenderIds(user),
      // await this.syncCall(StatusEnum.IN_PROGRESS, user),
      // await this.sendImportedNotification(user, 'Syncing in progress!'),
    ]);
    let syncedProjects = 0;
    try {
      for await (const projectId of jiraProjectIds) {
        const synced = await this.syncTasks(user, projectId);
        if (synced) syncedProjects++;
      }
      for await (const calendarId of outLookCalendarIds) {
        const synced = await this.syncEvents(user, calendarId);
        if (synced) syncedProjects++;
      }
      Promise.allSettled([
        // await this.sendImportedNotification(
        //   user,
        //   ' Project Synced Successfully!',
        // ),
        await this.syncCall(StatusEnum.DONE, user),
      ]);
      return { message: syncedProjects + ' Projects Imported Successfully!' };
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1437 ~ TasksService ~ syncAll ~ error:',
        error,
      );
      throw new APIException(
        'Could not sync all of you project : ' +
          `${syncedProjects} synced out of ${jiraProjectIds?.length} projects`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCallSync(user: User) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const getData = await this.prisma.callSync.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
        },
      });
      if (!getData) {
        return {
          id: -1,
          status: 'Not yet synced',
          userWorkspaceId: userWorkspace.id,
        };
      }
      return getData;
    } catch (err) {
      console.log(err.message);
      throw new APIException('Not found', HttpStatus.BAD_REQUEST);
    }
  }

  async syncCall(status: string, user: User) {
    try {
      const doesExist = await this.getCallSync(user);
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!doesExist || doesExist.id === -1) {
        return await this.prisma.callSync.create({
          data: {
            status,
            userWorkspaceId: userWorkspace.id,
          },
        });
      }

      return await this.prisma.callSync.update({
        where: { id: doesExist.id },
        data: {
          status: status,
        },
      });
    } catch (err) {
      console.log(err.message);
      return null;
    }
  }
}

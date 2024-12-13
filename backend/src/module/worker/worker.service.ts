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
import { ClientService } from '../helper/client';
import { IntegrationsService } from '../integrations/integrations.service';
import { MyGateway } from '../notifications/socketGateway';
import { PrismaService } from '../prisma/prisma.service';
import { SprintsService } from '../sprints/sprints.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { StatusEnum } from '../tasks/dto';
import { QueuePayloadType } from '../queue/types';
import { getCustomSprintField } from '../tasks/tasks.axios';
import { AzureDevApiCalls } from 'src/utils/azureDevApiCall/api';

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
    private clientService: ClientService,
    private azureDevApiCalls: AzureDevApiCalls,
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
        console.log(
          '🚀 ~ WorkerService ~ returnnewPromise ~ parentPort:',
          parentPort,
        );
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
    if (
      payloadType === QueuePayloadType.SYNC_ALL ||
      payloadType === QueuePayloadType.RELOAD
    ) {
      return await this.syncAllAndUpdateTasks(user, payloadType);
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
    type: QueuePayloadType,
  ) {
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userIntegration.accessToken}`,
    };

    const mappedUserWorkspaceAndJiraId =
      await this.mappingUserWorkspaceAndJiraAccountId(user);
    const settings = await this.tasksDatabase.getSettings(user);
    const syncTime: number = settings ? settings.syncTime : 6;

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    const syncState = await this.tasksDatabase.callSync({
      userWorkspaceId: userWorkspace.id,
      projectId: project.id,
    });
    let urlParam;
    if (syncState?.lastSync) {
      const day = new Date().getDay() - new Date(syncState.lastSync).getDay();
      if (day <= 0) {
        urlParam = `Updated >= startOfDay()`;
      } else {
        urlParam = `Updated >= startOfDay("-${day}")`;
      }
    } else {
      urlParam = `created >= startOfMonth(-${syncTime}M) AND created <= endOfDay()`;
    }

    let url: string;
    if (type === QueuePayloadType.RELOAD) {
      url = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/api/3/search?jql=project=${project.projectId} AND created >= startOfMonth(-${syncTime}M) AND created <= endOfDay()&maxResults=1000`;
    } else {
      url = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/api/3/search?jql=project=${project.projectId} AND ${urlParam} &maxResults=1000`;
    }
    const sprintCustomField = await getCustomSprintField(
      userIntegration.siteId!,
      headers,
    );
    const fields = `summary, assignee,timeoriginalestimate,project, comment, created, updated,status,priority, parent, ${sprintCustomField}`;
    let respTasks;
    const mappedSprint = new Map<number, any>();
    const mappedSprintTask = new Map();
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
        const sprints = integratedTask[`${sprintCustomField}`];
        if (sprints) {
          sprints.forEach((sprint: any) => {
            if (!mappedSprint.has(Number(sprint.id))) {
              mappedSprintTask.set(Number(sprint.id), []);
              mappedSprint.set(Number(Number(sprint.id)), sprint);
            }
            mappedSprintTask.get(Number(sprint.id)).push(integratedTaskId);
          }); // Add each sprint, duplicates will be ignored
        }
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
    // key = jira sprint id, value = tracker23 sprint id
    const JiraSprintIdMappedWithSprintId = await this.createSprint(
      [...mappedSprint.values()],
      project.id,
    );

    //bind the sprint with the task
    for (const [jiraSprintId, sprintId] of JiraSprintIdMappedWithSprintId) {
      const jiraTaskIds: number[] = mappedSprintTask.get(jiraSprintId);
      await this.prisma.task.updateMany({
        where: {
          workspaceId: user.activeWorkspaceId!,
          projectId: project.id,
          integratedTaskId: { in: jiraTaskIds },
        },
        data: {
          sprintId,
        },
      });
    }
  }

  private async syncTasksFetchAndProcessAzureDevOpsTasksAndWorklog(
    user: User,
    project: Project,
    userIntegration: UserIntegration,
    type: QueuePayloadType,
  ) {
    const mappedUserWorkspaceAndAzureDevOpsId =
      await this.mappingUserWorkspaceAndAzureDevOpsAccountId(user);
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    const syncState = await this.tasksDatabase.callSync({
      userWorkspaceId: userWorkspace.id,
      projectId: project.id,
    });

    let startDate;
    if (syncState?.lastSync) {
      startDate = syncState.lastSync;
    } else {
      startDate = new Date();
    }

    const organizationName = userIntegration.siteId;
    const projectName = project.projectName;
    if (!organizationName || !projectName) return null;

    const fetchAzureTasksByProjectUrl = `https://dev.azure.com/${organizationName}/${projectName}/_apis/wit/wiql?api-version=7.0`;
    const bodyQuery = {
      query: `
         SELECT [System.Id], [System.Title], [System.State], [System.ChangedDate]
      FROM WorkItems
      WHERE 
        [System.TeamProject] = '${projectName}' 
        AND [System.WorkItemType] = 'Task'
        AND [System.ChangedDate] >= '${startDate}' 
        AND [System.ChangedDate] <= '${new Date()}'
      ORDER BY [System.ChangedDate] DESC
      `,
    };

    const response = await this.clientService.CallAzureDev(
      userIntegration,
      this.azureDevApiCalls.azurePostApiCall,
      fetchAzureTasksByProjectUrl,
      bodyQuery,
    );

    let taskIds = response?.workItems?.map((item: { id: any }) => item.id);

    // fetch all task details
    const url = `https://dev.azure.com/${organizationName}/${projectName}/_apis/wit/workitemsbatch?api-version=7.1`;
    const body = { ids: taskIds };
    const allTaskDetails = await this.clientService.CallAzureDev(
      userIntegration,
      this.azureDevApiCalls.azurePostApiCall,
      url,
      body,
    );
    if (!taskIds || !taskIds?.length) {
      return [];
    }
    // process all task logs
    const taskList = [];
    for (const task of allTaskDetails?.value) {
      const taskObject = {
        userWorkspaceId:
          mappedUserWorkspaceAndAzureDevOpsId.get(
            task.fields['System.AssignedTo'].id,
          ) || null,
        workspaceId: project.workspaceId,
        title: task.fields['System.Title'],
        assigneeId: task.fields['System.AssignedTo'].id,
        estimation: task.fields['Microsoft.VSTS.Scheduling.Effort'] ?? null,
        projectName: task.fields['System.TeamProject'],
        projectId: project.id,
        // spentHours: task.fields['Microsoft.VSTS.Scheduling.RemainingWork'],
        status: task.fields['System.State'],
        statusCategoryName: '',
        statusType: task.fields['System.WorkItemType'],
        priority: String(task.fields['Microsoft.VSTS.Common.Priority']),
        integratedTaskId: task.id,
        source: IntegrationType.AZURE_DEVOPS,
        dataSource: project.source,
        createdAt: new Date(task.fields['System.CreatedDate']),
        updatedAt: new Date(task.fields['System.ChangedDate']),
        jiraUpdatedAt: new Date(task.fields['System.ChangedDate']),
        url: task.url.replace('/_apis/wit/workItems/', '/_workitems/edit/'),
      };
      const estimation =
        task.fields['Microsoft.VSTS.Scheduling.Effort'] ?? null;
      const remainingWork =
        task.fields['Microsoft.VSTS.Scheduling.RemainingWork'] ?? null;
      const startTime =
        task.fields['Microsoft.VSTS.Common.StateChangeDate'] ?? new Date();
      let spentHour;
      if (estimation && remainingWork) {
        spentHour = estimation - remainingWork;
      } else if (estimation && !remainingWork) {
        spentHour = 0;
      } else if (!estimation && remainingWork) {
        spentHour = 8 - remainingWork;
      } else {
        spentHour = 0;
      }

      if (!mappedSession.has(task.id)) {
        mappedSession.set(task.id, {
          startTime: new Date(startTime),
          endTime: new Date(
            new Date(startTime).getTime() + spentHour * 60 * 60 * 1000,
          ),
          status: SessionStatus.STOPPED,
          userWorkspaceId:
            mappedUserWorkspaceAndAzureDevOpsId.get(
              task.fields['System.AssignedTo'].id,
            ) || null,
          integratedTaskId: Number(task.id),
        });
      }
      taskList.push(taskObject);
    }
    // find existing tasks in local
    const integratedTasks = await this.prisma.task.findMany({
      where: {
        workspaceId: user?.activeWorkspaceId,
        integratedTaskId: { in: taskIds },
        source: IntegrationType.AZURE_DEVOPS,
      },
      select: {
        id: true,
        integratedTaskId: true,
      },
    });

    const existingTaskMap = new Map(
      integratedTasks.map((task) => [task.integratedTaskId, task.id]),
    );

    const tasksToCreate: {
      userWorkspaceId: number | null;
      workspaceId: number;
      title: any;
      assigneeId: any;
      estimation: any;
      projectName: any;
      projectId: number;
      status: any;
      statusCategoryName: string;
      statusType: any;
      priority: string;
      integratedTaskId: any;
      source: 'AZURE_DEVOPS';
      dataSource: string;
      createdAt: Date;
      updatedAt: Date;
      jiraUpdatedAt: Date;
      url: any;
    }[] = [];
    const tasksToUpdate: {
      userWorkspaceId: number | null;
      workspaceId: number;
      title: any;
      assigneeId: any;
      estimation: any;
      projectName: any;
      projectId: number;
      // spentHours: task.fields['Microsoft.VSTS.Scheduling.RemainingWork'],
      status: any;
      statusCategoryName: string;
      statusType: any;
      priority: string;
      integratedTaskId: any;
      source: 'AZURE_DEVOPS';
      dataSource: string;
      createdAt: Date;
      updatedAt: Date;
      jiraUpdatedAt: Date;
      url: any;
      id: number;
    }[] = [];

    taskList.forEach((task) => {
      const existingTaskId = existingTaskMap.get(task.integratedTaskId);
      if (existingTaskId) {
        tasksToUpdate.push({
          id: existingTaskId,
          ...task,
        });
      } else {
        tasksToCreate.push(task);
      }
    });

    const [t, t1, tasks] = await Promise.all([
      await this.prisma.$transaction(
        tasksToUpdate.map((task) =>
          this.prisma.task.update({
            where: { id: task.id },
            data: task,
          }),
        ),
      ),

      await this.prisma.task.createMany({
        data: tasksToCreate,
      }),

      await this.prisma.task.findMany({
        where: {
          projectId: project.id,
          source: IntegrationType.AZURE_DEVOPS,
        },
        select: {
          id: true,
          integratedTaskId: true,
        },
      }),
    ]);

    //insert taskId
    const mappedSession = new Map<number, any>();
    for (const [key, value] of mappedSession.entries()) {
      const task = tasks.find(
        (t) => t.integratedTaskId !== null && t.integratedTaskId === key,
      );
      if (task) {
        mappedSession.set(key, { ...value, taskId: task.id });
      }
    }
    // Fetch existing sessions
    const existingSessions = await this.prisma.session.findMany({
      where: {
        integratedTaskId: { in: taskIds },
      },
      select: {
        id: true,
        integratedTaskId: true,
      },
    });
    // Create a map for quick lookup of existing sessions
    const existingSessionMap = new Map(
      existingSessions.map((session) => [session.integratedTaskId, session.id]),
    );

    // Prepare sessions to create or update
    const sessionsToCreate = [];
    const sessionsToUpdate = [];

    for (const [key, value] of mappedSession.entries()) {
      const existingSessionId = existingSessionMap.get(key);

      const sessionObject = {
        userWorkspaceId: value.userWorkspaceId,
        integratedTaskId: value.integratedTaskId,
        startTime: value.startTime,
        endTime: value.endTime,
        status: value.status,
        taskId: value.taskId,
      };

      if (existingSessionId) {
        // Add to update list
        sessionsToUpdate.push({
          id: existingSessionId,
          ...sessionObject,
        });
      } else {
        // Add to create list
        sessionsToCreate.push(sessionObject);
      }
    }

    try {
      await this.prisma.$transaction([
        // Update existing sessions
        ...sessionsToUpdate.map((session) =>
          this.prisma.session.update({
            where: { id: session.id },
            data: session,
          }),
        ),
        // Create new sessions
        this.prisma.session.createMany({
          data: sessionsToCreate,
        }),
      ]);
    } catch (error) {
      console.log('🚀 ~ TasksService ~ error:', error);
      throw new APIException(
        'Could not create session!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return taskList;
  }

  async createSprint(sprints: any[], projectId: number) {
    for (const sprint of sprints) {
      await this.prisma.sprint.upsert({
        where: {
          sprintIdentifier: {
            jiraSprintId: Number(sprint.id),
            projectId: projectId,
          },
        },
        create: {
          jiraSprintId: Number(sprint.id),
          projectId: projectId,
          state: sprint.state,
          name: sprint.name,
          startDate: sprint?.startDate
            ? new Date(sprint?.startDate)
            : sprint?.createdDate
            ? new Date(sprint?.createdDate)
            : new Date(),
          endDate: sprint?.endDate ? new Date(sprint?.endDate) : null,
          completeDate: sprint?.completeDate
            ? new Date(sprint?.completeDate)
            : sprint?.endDate
            ? new Date(sprint?.endDate)
            : null,
        },
        update: {
          state: sprint.state,
          name: sprint.name,
          startDate: sprint?.startDate
            ? new Date(sprint?.startDate)
            : sprint?.createdDate
            ? new Date(sprint?.createdDate)
            : new Date(),
          endDate: sprint?.endDate ? new Date(sprint?.endDate) : null,
          completeDate: sprint?.completeDate
            ? new Date(sprint?.completeDate)
            : sprint?.endDate
            ? new Date(sprint?.endDate)
            : null,
        },
      });
    }
    const sprintIdMappedWithJiraSprintId = new Map<number, number>();
    const sprintList = await this.prisma.sprint.findMany({
      where: { projectId },
    });
    for (const sprint of sprintList) {
      sprintIdMappedWithJiraSprintId.set(sprint.jiraSprintId, sprint.id);
    }
    return sprintIdMappedWithJiraSprintId;
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
  private async mappingUserWorkspaceAndAzureDevOpsAccountId(user: User) {
    const mappedUserWorkspaceAndAzureDevOpsId = new Map<string, number>();
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
          userWorkspace.userIntegration[0].AzureAccountId
        ) {
          mappedUserWorkspaceAndAzureDevOpsId.set(
            userWorkspace.userIntegration[0].AzureAccountId,
            userWorkspace.id,
          );
        }
      });
    return mappedUserWorkspaceAndAzureDevOpsId;
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
      return await this.syncTasks(
        user,
        project.id,
        QueuePayloadType.SYNC_PROJECT_OR_OUTLOOK,
      );
    } else if (project.integration?.type === IntegrationType.AZURE_DEVOPS) {
      return await this.syncAzureDevOpsTasks(
        user,
        project.id,
        QueuePayloadType.SYNC_PROJECT_OR_OUTLOOK,
      );
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
        await this.syncCall(StatusEnum.FAILED, user, calenId),
      ]);
      throw new APIException('Calendar Not Found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user, calenId),
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
        await this.syncCall(StatusEnum.FAILED, user, calenId),
      ]);
      return [];
    }
    try {
      Promise.allSettled([
        await this.syncCall(StatusEnum.IN_PROGRESS, user, calenId),
        await this.sendImportedNotification(user, 'Syncing in progress!'),
        await this.fetchAndProcessCalenderEvents(
          user,
          userWorkspace,
          calender,
          userIntegration,
        ),
        await this.syncCall(StatusEnum.DONE, user, calenId),
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
        await this.syncCall(StatusEnum.FAILED, user, calenId),
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
      events = await this.clientService.CallOutlook(
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

  async syncTasks(user: User, projId: number, type: QueuePayloadType) {
    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });
    if (!project) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user, projId),
      ]);
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user, projId),
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
        await this.syncCall(StatusEnum.FAILED, user, projId),
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
          type,
        ),
        // await this.sprintService.createSprintAndTask(
        //   user,
        //   project,
        //   updatedUserIntegration,
        // ),
        await this.updateProjectIntegrationStatus(projId),
        await this.syncCall(StatusEnum.DONE, user, projId),
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
        await this.syncCall(StatusEnum.FAILED, user, projId),
      ]);
      throw new APIException(
        'Could not Sync project tasks!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async syncAzureDevOpsTasks(
    user: User,
    projId: number,
    type: QueuePayloadType,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });
    if (!project) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user, projId),
      ]);
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      Promise.allSettled([
        await this.sendImportedNotification(user, 'Syncing Failed!'),
        await this.syncCall(StatusEnum.FAILED, user, projId),
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
        await this.syncCall(StatusEnum.FAILED, user, projId),
      ]);
      return [];
    }
    try {
      Promise.allSettled([
        // await this.syncCall(StatusEnum.IN_PROGRESS, user),
        await this.sendImportedNotification(user, 'Syncing in progress!'),
        await this.syncTasksFetchAndProcessAzureDevOpsTasksAndWorklog(
          user,
          project,
          updatedUserIntegration,
          type,
        ),
        await this.updateProjectIntegrationStatus(projId),
        await this.syncCall(StatusEnum.DONE, user, projId),
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
        await this.syncCall(StatusEnum.FAILED, user, projId),
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

  async syncAllAndUpdateTasks(user: User, type: QueuePayloadType) {
    const [jiraProjectIds, outLookCalendarIds] = await Promise.all([
      await this.sprintService.getProjectIds(user),
      await this.sprintService.getCalenderIds(user),
      // await this.syncCall(StatusEnum.IN_PROGRESS, user),
      // await this.sendImportedNotification(user, 'Syncing in progress!'),
    ]);
    let syncedProjects = 0;
    try {
      for await (const projectId of jiraProjectIds) {
        const synced = await this.syncTasks(user, projectId, type);
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
        await this.updateSyncCall(user, new Date(Date.now())),
      ]);
      return { message: syncedProjects + ' Projects Imported Successfully!' };
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1437 ~ TasksService ~ syncAll ~ error:',
        error,
      );
      return {
        message:
          'Could not sync all of you project : ' +
          `${syncedProjects} synced out of ${jiraProjectIds?.length} projects`,
      };
    }
  }

  private async updateSyncCall(user: User, time: Date) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    await this.tasksDatabase.updateCallSync(
      { userWorkspaceId: userWorkspace.id },
      { lastSync: time },
    );
  }
  async getCallSync(user: User, projectId?: number) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!projectId && userWorkspace) {
        // Fetch all sync records for the user's workspace
        const allSyncData = await this.prisma.callSync.findMany({
          where: {
            userWorkspaceId: userWorkspace.id,
          },
        });

        // Handle case where no sync data is found
        if (allSyncData.length === 0) {
          return {
            status: StatusEnum.FAILED,
            message: 'You have no project to sync!',
          };
        }

        // Determine overall status based on the records
        let hasInProgress = false;
        let hasFailed = false;
        let failedCount = 0;

        for (const record of allSyncData) {
          if (record.status === StatusEnum.IN_PROGRESS) {
            hasInProgress = true;
          } else if (record.status === StatusEnum.FAILED) {
            hasFailed = true;
            failedCount++;
          }
        }

        // Return appropriate status based on the conditions
        if (hasInProgress) {
          return {
            status: StatusEnum.IN_PROGRESS,
            message: 'Synchronization is in progress.',
          };
        } else if (hasFailed) {
          return {
            status: StatusEnum.DONE,
            message: `Sync completed, but ${failedCount} project\'s sync failed.`,
          };
        } else {
          return {
            status: StatusEnum.DONE,
            message: 'All records are successfully synced.',
          };
        }
      }
      const getData = await this.prisma.callSync.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
          projectId: projectId,
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

  async syncCall(status: string, user: User, projectId?: number) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const projectIds: number[] = [];
      // If a specific projectId is provided, handle only that project
      if (projectId) {
        projectIds.push(projectId);
      } else {
        // Fetch all project IDs if no projectId is provided
        const [jiraProjectIds, outLookCalendarIds] = await Promise.all([
          this.sprintService.getProjectIds(user),
          this.sprintService.getCalenderIds(user),
        ]);
        projectIds.push(...jiraProjectIds, ...outLookCalendarIds);
      }

      // Loop through each project ID and process sync logic
      for (const projId of projectIds) {
        const doesExist = await this.getCallSync(user, projId);

        if (!doesExist || doesExist?.id === -1) {
          await this.prisma.callSync.create({
            data: {
              status,
              userWorkspaceId: userWorkspace.id,
              projectId: projId, // Ensure project ID is recorded
            },
          });
        } else if (status === StatusEnum.DONE) {
          await this.prisma.callSync.update({
            where: { id: doesExist.id },
            data: {
              status: StatusEnum.DONE,
              lastSync: new Date(),
            },
          });
        } else {
          await this.prisma.callSync.update({
            where: { id: doesExist.id },
            data: {
              status,
            },
          });
        }
      }
    } catch (err) {
      console.error(err.message);
      return null;
    }
  }
}

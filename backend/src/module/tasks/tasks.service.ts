import axios from 'axios';
import { coreConfig } from 'config/core';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import {
  Integration,
  IntegrationType,
  Project,
  Role,
  SessionStatus,
  StatusDetail,
  Task,
  User,
  UserIntegration,
} from '@prisma/client';

import {
  CreateTaskDto,
  GetTaskQuery,
  StatusEnum,
  TimeSpentReqBodyDto,
  UpdatePinDto,
  WeekDaysType,
} from './dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from '../sprints/sprints.service';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { MyGateway } from '../notifications/socketGateway';
import { APIException } from '../exception/api.exception';
import { TasksDatabase } from 'src/database/tasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { ConfigService } from '@nestjs/config';
import { JiraClientService } from '../helper/client';
import { UpdateIssuePriorityReqBodyDto } from './dto/update.issue.req.dto';
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private readonly config: ConfigService,
    private integrationsService: IntegrationsService,
    private myGateway: MyGateway,
    private workspacesService: WorkspacesService,
    private sprintService: SprintsService,
    private tasksDatabase: TasksDatabase,
    private jiraApiCalls: JiraApiCalls,
    private jiraClient: JiraClientService,
  ) {}

  async getTasks(user: User, query: GetTaskQuery): Promise<Task[]> {
    try {
      if (!user.activeWorkspaceId) {
        return [];
      }
      const { priority, status, text } = query;
      const sprintIds = query.sprintId as unknown as string;
      const projectIds = query.projectIds as unknown as string;
      let { startDate, endDate } = query as unknown as GetTaskQuery;
      const sprintIdArray =
        sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));
      const projectIdArray =
        projectIds && projectIds.split(',').map((item) => Number(item.trim()));
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        return [];
      }
      const queryFilter: any = {};

      if (text) {
        queryFilter.OR = [
          {
            title: {
              contains: text.replace(/[+\-]/g, (match) => `\\${match}`),
              mode: 'insensitive',
            },
          },
          {
            key: {
              contains: text.replace(/[+\-]/g, (match) => `\\${match}`),
            },
          },
        ];
      }

      const priority1: any = (priority as unknown as string)?.split(',');
      const status1: any = (status as unknown as string)?.split(',');
      startDate = startDate && new Date(startDate);
      endDate = endDate && new Date(endDate);
      if (endDate) {
        const oneDay = 3600 * 24 * 1000;
        endDate = new Date(endDate.getTime() + oneDay);
      }
      let tasks: any[] = [];

      if (sprintIdArray && sprintIdArray.length) {
        // const integrationId = jiraIntegration?.jiraAccountId ?? '-1';
        const taskIds = await this.sprintService.getSprintTasksIds(
          sprintIdArray,
        );
        return await this.prisma.task.findMany({
          where: {
            userWorkspaceId: userWorkspace.id,
            source: IntegrationType.JIRA,
            id: { in: taskIds },
            ...(projectIdArray && {
              projectId: { in: projectIdArray.map((id) => Number(id)) },
            }),
            ...(priority1 && { priority: { in: priority1 } }),
            ...(status1 && { status: { in: status1 } }),
            ...queryFilter,
          },
          include: {
            sessions: {
              include: {
                userWorkspace: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
            parentTask: {
              select: {
                title: true,
                url: true,
                key: true,
              },
            },
            childTask: {
              select: {
                title: true,
                url: true,
                key: true,
              },
            },
          },
        });
      } else {
        const databaseQuery = {
          userWorkspaceId: userWorkspace.id,
          ...(projectIdArray && {
            projectId: { in: projectIdArray.map((id) => Number(id)) },
          }),
          ...(startDate &&
            endDate && {
              createdAt: { lte: endDate },
              updatedAt: { gte: startDate },
            }),
          ...(priority1 && { priority: { in: priority1 } }),
          ...(status1 && { status: { in: status1 } }),
          ...queryFilter,
        };
        // console.log(
        //   '🚀 ~ file: tasks.service.ts:126 ~ TasksService ~ getTasks ~ databaseQuery:',
        //   databaseQuery,
        // );
        try {
          tasks = await this.prisma.task.findMany({
            where: databaseQuery,
            include: {
              sessions: {
                include: {
                  userWorkspace: {
                    select: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
              parentTask: {
                select: {
                  title: true,
                  url: true,
                  key: true,
                },
              },
              childTask: {
                select: {
                  title: true,
                  url: true,
                  key: true,
                },
              },
            },
          });
        } catch (err) {
          console.log(
            '🚀 ~ file: tasks.service.ts:138 ~ TasksService ~ getTasks ~ err:',
            err,
          );
        }
      }
      return tasks;
    } catch (err) {
      return [];
    }
  }

  async getWorkspaceTasks(user: User, query: GetTaskQuery): Promise<Task[]> {
    try {
      const { priority, status, text } = query;
      const sprintIds = query.sprintId as unknown as string;
      // console.log(sprintIds);
      let { startDate, endDate } = query as unknown as GetTaskQuery;

      const sprintIdArray =
        sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));

      const userWorkspace =
        user.activeWorkspaceId &&
        (await this.prisma.userWorkspace.findFirst({
          where: {
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
        }));
      if (!userWorkspace) {
        return [];
      }

      if (userWorkspace.role === Role.ADMIN) {
        const priority1: any = (priority as unknown as string)?.split(',');
        const status1: any = (status as unknown as string)?.split(',');

        startDate = startDate && new Date(startDate);
        endDate = endDate && new Date(endDate);
        if (endDate) {
          const oneDay = 3600 * 24 * 1000;
          endDate = new Date(endDate.getTime() + oneDay);
        }
        let tasks: Task[] = [];

        if (sprintIdArray && sprintIdArray.length) {
          // const integrationId = jiraIntegration?.jiraAccountId ?? '-1';
          const taskIds = await this.sprintService.getSprintTasksIds(
            sprintIdArray,
          );
          //console.log(taskIds);

          return await this.prisma.task.findMany({
            where: {
              workspaceId: user.activeWorkspaceId,
              source: IntegrationType.JIRA,
              id: { in: taskIds },
              ...(priority1 && { priority: { in: priority1 } }),
              ...(status1 && { status: { in: status1 } }),
              ...(text && {
                title: {
                  contains: text.replace(/[+\-]/g, (match) => `\\${match}`),
                  mode: 'insensitive',
                },
              }),
            },
            include: {
              sessions: {
                include: {
                  userWorkspace: {
                    select: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
              parentTask: {
                select: {
                  title: true,
                  url: true,
                  key: true,
                },
              },
              childTask: {
                select: {
                  title: true,
                  url: true,
                  key: true,
                },
              },
            },
          });
        } else {
          const databaseQuery = {
            workspaceId: user.activeWorkspaceId,
            // OR: [
            //   {
            //     userWorkspaceId: userWorkspace.id,
            //     source: IntegrationType.JIRA,
            //   },
            //   {
            //     userWorkspaceId: userWorkspace.id,
            //     source: IntegrationType.TRACKER23,
            //   },
            // ],
            ...(startDate &&
              endDate && {
                createdAt: { lte: endDate },
                updatedAt: { gte: startDate },
              }),
            ...(priority1 && { priority: { in: priority1 } }),
            ...(status1 && { status: { in: status1 } }),
            ...(text && {
              title: {
                contains: text.replace(/[+\-]/g, (match) => `\\${match}`),
                mode: 'insensitive',
              },
            }),
          };

          tasks = await this.prisma.task.findMany({
            where: databaseQuery,
            include: {
              sessions: {
                include: {
                  userWorkspace: {
                    select: {
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
              parentTask: {
                select: {
                  title: true,
                  url: true,
                  key: true,
                },
              },
              childTask: {
                select: {
                  title: true,
                  url: true,
                  key: true,
                },
              },
            },
          });
        }
        //console.log(tasks.length);
        return tasks;
      }

      throw new APIException(
        'Only admin has this ability',
        HttpStatus.BAD_REQUEST,
      );
    } catch (err) {
      // console.log(err.message);
      return [];
    }
  }

  async createTask(user: User, dto: CreateTaskDto) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    // console.log(dto);
    let project;
    if (dto && !dto.projectId) {
      const transaction = await this.prisma.$transaction(
        async (prisma: any) => {
          const newProject =
            dto.projectName &&
            (await this.workspacesService.createLocalProjectWithTransactionPrismaInstance(
              user,
              dto.projectName,
              prisma,
            ));

          return [newProject];
        },
      );
      project = transaction && transaction[0];
    } else {
      project = await this.tasksDatabase.getProject(Number(dto.projectId));
    }

    if (dto.isRecurrent) {
      return (
        project &&
        project.projectName &&
        (await this.recurrentTask(
          user,
          userWorkspace.id,
          {
            ...dto,
            projectId: Number(project.id),
          },
          project.projectName,
        ))
      );
    } else {
      const newTask = await this.prisma.task
        .create({
          data: {
            userWorkspaceId: userWorkspace.id,
            title: dto.title,
            description: dto.description,
            estimation: dto.estimation,
            due: dto.due,
            priority: dto.priority,
            status: dto.status,
            labels: dto.labels,
            workspaceId: user.activeWorkspaceId,
            projectName: project?.projectName,
            projectId: project?.id,
          },
        })
        .then(async (task) => {
          await this.prisma.session.create({
            data: {
              startTime: dto.startTime,
              endTime: dto.endTime,
              status: SessionStatus.STOPPED,
              userWorkspaceId: userWorkspace.id,
              taskId: task.id,
            },
          });
          return task;
        });

      return await this.prisma.task.findUnique({
        where: { id: newTask.id },
        include: {
          sessions: true,
        },
      });
    }
  }

  async recurrentTask(
    user: User,
    userWorkspaceId: number,
    dto: CreateTaskDto,
    projectName: string,
  ) {
    const { repeat, repeatType, startDate } = dto;
    let repeatTime = repeat * 3600 * 24 * 1000;
    if (repeatType === 'DAY') {
      if (dto.endDate) {
        return await this.createDayTaskWithEndDate(
          user,
          userWorkspaceId,
          dto,
          projectName,
          startDate,
          repeatTime,
        );
      } else if (dto.occurrences) {
        return await this.createDayTaskWithOccurrences(
          user,
          userWorkspaceId,
          dto,
          projectName,
          startDate,
          repeatTime,
        );
      }
    } else if (repeatType === 'WEEK') {
      repeatTime *= 7;
      const myMap = new Map<string, number>();
      for (const day of Object.values(WeekDaysType)) {
        myMap.set(day, myMap.size + 1);
      }
      if (dto.endDate) {
        return await this.createWeeklyTaskWithEndDate(
          user,
          userWorkspaceId,
          dto,
          projectName,
          myMap,
          startDate,
          repeatTime,
        );
      } else if (dto.occurrences) {
        return await this.createWeeklyTaskWithOccurrences(
          user,
          userWorkspaceId,
          dto,
          projectName,
          myMap,
          startDate,
          repeatTime,
        );
      }
    } else if (repeatType === 'MONTH') {
      const currentDate = dayjs(dto.startDate);
      const daysInMonth = currentDate.daysInMonth();
      repeatTime *= daysInMonth;
      // console.log(
      //   '🚀 ~ file: tasks.service.ts:426 ~ TasksService ~ daysInMonth:',
      //   daysInMonth,
      // );
      if (dto.endDate) {
        return await this.createDayTaskWithEndDate(
          user,
          userWorkspaceId,
          dto,
          projectName,
          startDate,
          repeatTime,
        );
      } else if (dto.occurrences) {
        return await this.createDayTaskWithOccurrences(
          user,
          userWorkspaceId,
          dto,
          projectName,
          startDate,
          repeatTime,
        );
      }
    }
  }

  private async createDayTaskWithEndDate(
    user: User,
    userWorkspaceId: number,
    dto: CreateTaskDto,
    projectName: string,
    startDate: Date,
    repeatTime: number,
  ) {
    let SessionStartTime = new Date(dto.startTime).getTime();
    let SessionEndTime = new Date(dto.endTime).getTime();
    let taskPromises: Promise<any>[] = [];
    for (
      let startTime = new Date(startDate).getTime();
      startTime <= new Date(dto.endDate).getTime();
      startTime += repeatTime
    ) {
      taskPromises.push(
        this.tasksDatabase.createTaskAndSession(
          user,
          userWorkspaceId,
          dto,
          projectName,
          startTime,
          SessionStartTime,
          SessionEndTime,
        ),
      );
      SessionStartTime += repeatTime;
      SessionEndTime += repeatTime;
    }
    if (taskPromises.length > 500) {
      await Promise.allSettled(taskPromises);
      taskPromises = [];
    }
    await Promise.allSettled(taskPromises);
    return { message: 'Recurrent Tasks created' };
  }

  private async createDayTaskWithOccurrences(
    user: User,
    userWorkspaceId: number,
    dto: CreateTaskDto,
    projectName: string,
    startDate: Date,
    repeatTime: number,
  ) {
    let SessionStartTime = new Date(dto.startTime).getTime();
    let SessionEndTime = new Date(dto.endTime).getTime();
    let taskPromises: Promise<any>[] = [];
    let count = 0;
    for (
      let startTime = new Date(startDate).getTime();
      count < dto.occurrences;
      startTime += repeatTime
    ) {
      taskPromises.push(
        this.tasksDatabase.createTaskAndSession(
          user,
          userWorkspaceId,
          dto,
          projectName,
          startTime,
          SessionStartTime,
          SessionEndTime,
        ),
      );
      count++;
      SessionStartTime += repeatTime;
      SessionEndTime += repeatTime;
    }
    if (taskPromises.length > 500) {
      await Promise.allSettled(taskPromises);
      taskPromises = [];
    }
    await Promise.allSettled(taskPromises);
    return { message: 'Recurrent Tasks created' };
  }

  private async createWeeklyTaskWithEndDate(
    user: User,
    userWorkspaceId: number,
    dto: CreateTaskDto,
    projectName: string,
    myMap: Map<string, number>,
    startDate: Date,
    repeatTime: number,
  ) {
    let SessionStartTime = new Date(dto.startTime).getTime();
    let SessionEndTime = new Date(dto.endTime).getTime();
    let taskPromises: Promise<any>[] = [];
    for (
      let startTime = new Date(startDate).getTime();
      startTime <= new Date(dto.endDate).getTime();
      startTime += repeatTime
    ) {
      const weekday = dayjs(new Date(startTime)).format('dddd').toUpperCase();
      const firstPos = myMap?.get(weekday);
      for (let index = 0; index < dto.weekDays.length; index++) {
        let target = myMap?.get(dto.weekDays[index]);
        if (firstPos && target && target < firstPos) {
          target = 7 - firstPos + target;
        } else {
          target = firstPos && target ? target - firstPos : 0;
        }
        const SessionStartFinalTime =
          SessionStartTime + target * 24 * 3600 * 1000;
        const SessionEndFinalTime = SessionEndTime + target * 24 * 3600 * 1000;
        const startFinalTime = startTime + target * 24 * 3600 * 1000;
        if (startFinalTime > new Date(dto.endDate).getTime()) {
          continue;
        }
        taskPromises.push(
          this.tasksDatabase.createTaskAndSession(
            user,
            userWorkspaceId,
            dto,
            projectName,
            startFinalTime,
            SessionStartFinalTime,
            SessionEndFinalTime,
          ),
        );
      }
      SessionStartTime += repeatTime;
      SessionEndTime += repeatTime;
    }
    if (taskPromises.length > 500) {
      await Promise.allSettled(taskPromises);
      taskPromises = [];
    }
    await Promise.allSettled(taskPromises);
    return { message: 'Recurrent Tasks created' };
  }

  private async createWeeklyTaskWithOccurrences(
    user: User,
    userWorkspaceId: number,
    dto: CreateTaskDto,
    projectName: string,
    myMap: Map<string, number>,
    startDate: Date,
    repeatTime: number,
  ) {
    let SessionStartTime = new Date(dto.startTime).getTime();
    let SessionEndTime = new Date(dto.endTime).getTime();
    let taskPromises: Promise<any>[] = [];
    let count = 0;
    for (
      let startTime = new Date(startDate).getTime();
      count < dto.occurrences;
      startTime += repeatTime
    ) {
      const weekday = dayjs(new Date(startTime)).format('dddd');
      const firstPos = myMap?.get(weekday);
      for (let index = 0; index < dto.weekDays.length; index++) {
        let target = myMap?.get(dto.weekDays[index]);
        if (firstPos && target && target < firstPos) {
          target = 7 - firstPos + target;
        } else {
          target = firstPos && target ? target - firstPos : 0;
        }
        const SessionStartFinalTime =
          SessionStartTime + target * 24 * 3600 * 1000;
        const SessionEndFinalTime = SessionEndTime + target * 24 * 3600 * 1000;
        const startFinalTime = startTime + target * 24 * 3600 * 1000;
        if (count >= dto.occurrences) {
          // console.log(
          //   '🚀 ~ file: tasks.service.ts:542 ~ TasksService ~ count:',
          //   count,
          // );

          break;
        } // Have to think into deep.
        taskPromises.push(
          this.tasksDatabase.createTaskAndSession(
            user,
            userWorkspaceId,
            dto,
            projectName,
            startFinalTime,
            SessionStartFinalTime,
            SessionEndFinalTime,
          ),
        );
        count++;
      }
      SessionStartTime += repeatTime;
      SessionEndTime += repeatTime;
    }
    if (taskPromises.length > 500) {
      await Promise.allSettled(taskPromises);
      taskPromises = [];
    }
    await Promise.allSettled(taskPromises);
    return { message: 'Recurrent Tasks created' };
  }

  // for future use
  // recurrentSession = async (user: User, dto: CreateTaskDto, task: Task) => {
  //   const userWorkspace = await this.workspacesService.getUserWorkspace(user);
  //   if (!userWorkspace) {
  //     throw new APIException(
  //       'UserWorkspace not found!',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   if (dto.isRecurrent) {
  //     const endDate = new Date(dto.endDate);
  //     const timeMultiplier =
  //       dto.frequency === 'DAILY' ? 1 : dto.frequency === 'WEEKLY' ? 7 : 14;
  //     const timeInterval = timeMultiplier * 3600 * 24 * 1000;
  //     const oneDay = 3600 * 24 * 1000;
  //     const sessions: any = [];
  //     try {
  //       for (
  //         let startTime = new Date(dto.startTime).getTime(),
  //           endTime = new Date(dto.endTime).getTime();
  //         endTime <= endDate.getTime() + oneDay;
  //         startTime += timeInterval, endTime += timeInterval
  //       ) {
  //         const session = await this.prisma.session.create({
  //           data: {
  //             startTime: new Date(startTime),
  //             endTime: new Date(endTime),
  //             status: SessionStatus.STOPPED,
  //             taskId: task.id,
  //             userWorkspaceId: userWorkspace.id,
  //           },
  //         });
  //         if (session) sessions.push(session);
  //       }
  //     } catch (error) {
  //       throw new APIException(
  //         'Session creation Failed',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   }
  // };

  async updatePin(id: number, dto: UpdatePinDto): Promise<Task> {
    return await this.prisma.task.update({
      where: { id },
      data: {
        pinned: dto.pinned,
      },
    });
  }

  async deleteTask(id: number): Promise<Task> {
    return await this.prisma.task.delete({ where: { id } });
  }

  async getUserIntegration(userWorkspaceId: number, integrationId: number) {
    return this.prisma.userIntegration.findUnique({
      where: {
        UserIntegrationIdentifier: {
          integrationId,
          userWorkspaceId,
        },
      },
    });
  }

  async handleIntegrationFailure(user: User) {
    const notification = await this.createNotification(
      user,
      'Project Import Failed',
      'Project Import Failed',
    );
    this.myGateway.sendNotification(`${user.id}`, notification);
    await this.syncCall(StatusEnum.FAILED, user);
    throw new APIException(
      'Can not import project tasks',
      HttpStatus.BAD_REQUEST,
    );
  }

  private async createNotification(
    user: User,
    title: string,
    description: string,
  ) {
    return (
      user.activeWorkspaceId &&
      this.prisma.notification.create({
        data: {
          seen: false,
          author: 'SYSTEM',
          title,
          description,
          userId: user.id,
          workspaceId: user.activeWorkspaceId,
        },
      })
    );
  }

  async sendImportingNotification(user: User) {
    const notification = await this.createNotification(
      user,
      'Importing Project',
      'Importing Project',
    );
    this.myGateway.sendNotification(`${user.id}`, notification);
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

      const parentChildMapped = new Map<number, number>();
      for (const [integratedTaskId, integratedTask] of mappedIssues) {
        const taskStatus = integratedTask.status.name;
        const taskPriority = integratedTask.priority.name;
        integratedTask.parent &&
          integratedTask.parent.id &&
          parentChildMapped.set(
            integratedTaskId,
            Number(integratedTask.parent.id),
          );

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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          url: `${userIntegration?.integration?.site}/browse/${integratedTask?.key}`,
          key: integratedTask?.key,
        });
      }
      const mappedTaskId = new Map<number, number>();
      const updateTaskPromises: Promise<any>[] = [];
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

        for (let index = 0; index < tasks.length; index++) {
          const task = tasks[index];
          const parentJiraId =
            task.integratedTaskId &&
            parentChildMapped.get(task.integratedTaskId);
          const parentLocalId = parentJiraId && mappedTaskId.get(parentJiraId);
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
        // console.log(
        //   '🚀 ~ file: tasks.service.ts:1034 ~ TasksService ~ Number(match[1]:',
        //   Number(match[1]),
        // );
        // console.log(
        //   '🚀 ~ file: tasks.service.ts:1066 ~ TasksService ~ taskId:',
        //   taskId,
        // );

        taskId &&
          worklogsList[index].data.worklogs.map((log: any) => {
            // console.log(
            //   '🚀 ~ file: tasks.service.ts:1059 ~ TasksService ~ worklogsList[index].data.worklogs.map ~   mappedUserWorkspaceAndJiraId.get(log.author.accountId):',
            //   mappedUserWorkspaceAndJiraId.get(log.author.accountId),
            // );
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
        // console.log(
        //   '🚀 ~ file: tasks.service.ts:986 ~ TasksService ~ error:',
        //   error,
        // );

        throw new APIException(
          'Can not sync with jira',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
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
          const taskPriority = this.formatPriority(jiraTask.priority.name);
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
                priority: taskPriority,
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
        const taskPriority = this.formatPriority(integratedTask.priority.name);
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
          priority: taskPriority,
          integratedTaskId: integratedTaskId,
          createdAt: new Date(integratedTask.created),
          updatedAt: new Date(integratedTask.updated),
          jiraUpdatedAt: new Date(integratedTask.updated),
          source: IntegrationType.JIRA,
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
      user.activeWorkspaceId &&
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

  async sendImportedNotification(user: User, msg: string, res?: Response) {
    const notification = await this.createNotification(user, msg, msg);
    this.myGateway.sendNotification(`${user.id}`, notification);
    res?.json({ message: msg });
  }

  async handleImportFailure(user: User, message: string) {
    const notification = await this.createNotification(user, message, message);
    this.myGateway.sendNotification(`${user.id}`, notification);
  }

  async syncTasks(user: User, projId: number, res?: Response) {
    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });
    if (!project) {
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
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
      await this.handleIntegrationFailure(user);
      return [];
    }
    res && (await this.syncCall(StatusEnum.IN_PROGRESS, user));
    try {
      await this.sendImportingNotification(user);
      // const transaction = await this.prisma.$transaction(
      //   async (prisma: any) => {
      await this.syncTasksFetchAndProcessTasksAndWorklog(
        user,
        project,
        updatedUserIntegration,
      );
      await this.sprintService.createSprintAndTask(
        user,
        projId,
        updatedUserIntegration.id,
      );
      await this.updateProjectIntegrationStatus(projId);
      //   },
      // );
      res && (await this.syncCall(StatusEnum.DONE, user));
      // if (done) {
      //   await this.createSprintAndTask(user, updated_userIntegration.id);
      // }
      await this.sendImportedNotification(user, 'Project Synced', res);
      return { message: 'Project synced!' };
    } catch (err) {
      await this.handleImportFailure(user, 'Sync Tasks Failed');
      console.log(
        '🚀 ~ file: tasks.service.ts:1164 ~ TasksService ~ syncTasks ~ err:',
        err,
      );
      throw new APIException(
        'Can not Sync project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async syncAll(user: User) {
    // async syncTasks(user: User, id: number, res?: Response)
    await this.syncCall(StatusEnum.IN_PROGRESS, user);
    const projectIds = await this.sprintService.getProjectIds(user);
    let syncedProjects = 0;
    try {
      for (const projectId of projectIds) {
        const synced = await this.syncTasks(user, projectId);
        // console.log(
        //   '🚀 ~ file: tasks.service.ts:1436 ~ TasksService ~ syncAll ~ synced:',
        //   synced,
        // );
        if (synced) syncedProjects++;
      }
      try {
        const notification =
          user.activeWorkspaceId &&
          (await this.prisma.notification.create({
            data: {
              seen: false,
              author: 'SYSTEM',
              title: 'Synced all projects',
              description: 'Synced all projects',
              userId: user.id,
              workspaceId: user.activeWorkspaceId,
            },
          }));
        this.myGateway.sendNotification(`${user.id}`, notification);
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:233 ~ TasksService ~ syncTasks ~ error:',
          error.message,
        );
      }
      await this.syncCall(StatusEnum.DONE, user);
      return { message: syncedProjects + ' Projects Imported' };
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1437 ~ TasksService ~ syncAll ~ error:',
        error,
      );
      throw new APIException(
        'Can not sync All projects : ' +
          `${syncedProjects} synced out of ${projectIds?.length} projects`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  formatStatus(status: string) {
    switch (status) {
      case 'Done':
        return 'DONE';
      case 'In Progress':
        return 'IN_PROGRESS';
      default:
        return 'TODO';
    }
  }

  formatPriority(priority: string) {
    return priority.toUpperCase();
    switch (priority) {
      case 'Highest':
        return 'HIGHEST';
      case 'High':
        return 'HIGH';
      case 'Medium':
        return 'MEDIUM';
      case 'Low':
        return 'LOW';
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

  async updateIssueStatus(user: User, taskId: string, status: string) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const task = await this.prisma.task.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
          id: Number(taskId),
        },
        select: {
          integratedTaskId: true,
          projectId: true,
        },
      });
      if (task?.integratedTaskId === null) {
        const updatedTask = await this.prisma.task.update({
          where: {
            id: Number(taskId),
          },
          data: {
            status: status,
            statusCategoryName: getStatusCategoryName(status),
          },
        });
        return updatedTask;
      } else if (task && task.projectId && task.integratedTaskId) {
        const project = await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        });
        if (!project)
          throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

        const userIntegration =
          project?.integrationId &&
          (await this.prisma.userIntegration.findUnique({
            where: {
              UserIntegrationIdentifier: {
                integrationId: project?.integrationId,
                userWorkspaceId: userWorkspace.id,
              },
            },
          }));

        const statuses: StatusDetail[] = task?.projectId
          ? await this.prisma.statusDetail.findMany({
              where: {
                projectId: task?.projectId,
              },
            })
          : [];
        if (!userIntegration)
          throw new APIException(
            'User integration not found!',
            HttpStatus.BAD_REQUEST,
          );
        const statusNames = statuses?.map((status) => status.name);
        const url = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/issue/${task?.integratedTaskId}/transitions`;
        if (statuses[0].transitionId === null) {
          const { transitions } = await this.jiraClient.CallJira(
            userIntegration,
            this.jiraApiCalls.getTransitions,
            url,
          );
          for (const transition of transitions) {
            if (task.projectId && statusNames.includes(transition.name)) {
              await this.prisma.statusDetail.update({
                where: {
                  StatusDetailIdentifier: {
                    name: transition.name,
                    projectId: task.projectId,
                  },
                },
                data: { transitionId: transition.id },
              });
            }
          }
        }

        const statusDetails = await this.prisma.statusDetail.findFirst({
          where: {
            projectId: task?.projectId,
            name: status,
          },
        });

        const statusBody = JSON.stringify({
          transition: {
            id: statusDetails?.transitionId,
          },
        });
        const updatedIssue: any = await this.jiraClient.CallJira(
          userIntegration,
          this.jiraApiCalls.updatedIssues,
          url,
          statusBody,
        );
        const updatedTask =
          updatedIssue &&
          (await this.prisma.task.update({
            where: {
              id: Number(taskId),
            },
            data: {
              status: status,
              statusCategoryName: statusDetails?.statusCategoryName,
            },
          }));
        if (!updatedTask) {
          throw new APIException(
            'Can not update issue status 1',
            HttpStatus.BAD_REQUEST,
          );
        }
        return updatedTask;
      } else
        throw new APIException('Something went wrong!', HttpStatus.BAD_REQUEST);
    } catch (err) {
      console.log(err);
      throw new APIException(
        'Can not update issue status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateIssueEstimation(user: User, taskId: string, estimation: number) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const task = await this.prisma.task.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
          id: Number(taskId),
        },
        select: {
          integratedTaskId: true,
          projectId: true,
        },
      });
      if (task?.integratedTaskId === null) {
        const updatedTask = await this.prisma.task.update({
          where: {
            id: Number(taskId),
          },
          data: {
            estimation: estimation,
          },
        });
        return updatedTask;
      } else if (task && task.projectId && task.integratedTaskId) {
        const project = await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        });
        if (!project)
          throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

        const userIntegration =
          project.integrationId &&
          (await this.prisma.userIntegration.findUnique({
            where: {
              UserIntegrationIdentifier: {
                integrationId: project.integrationId,
                userWorkspaceId: userWorkspace.id,
              },
            },
          }));
        if (!userIntegration) {
          throw new APIException(
            'You have no UserIntegration! ',
            HttpStatus.BAD_REQUEST,
          );
        }
        const url = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/issue/${task?.integratedTaskId}`;

        const estimationBody = JSON.stringify({
          update: {
            timetracking: [
              {
                edit: {
                  originalEstimate: estimation + 'h',
                },
              },
            ],
          },
        });
        const updatedIssueEstimation = await this.jiraClient.CallJira(
          userIntegration,
          this.jiraApiCalls.UpdateIssueEstimation,
          url,
          estimationBody,
        );
        const updatedTask =
          updatedIssueEstimation &&
          (await this.prisma.task.update({
            where: {
              id: Number(taskId),
            },
            data: {
              estimation: estimation,
            },
          }));
        if (!updatedTask) {
          throw new APIException(
            'Can not update issue estimation',
            HttpStatus.BAD_REQUEST,
          );
        }
        return updatedTask;
      } else
        throw new APIException('Something went wrong!', HttpStatus.BAD_REQUEST);
    } catch (err) {
      console.log(err);
      throw new APIException(
        'Can not update issue estimation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // This api doesn't in use
  async addWorkLog(
    user: User,
    issueId: string,
    timeSpentReqBody: TimeSpentReqBodyDto,
  ) {
    try {
      // fix this incase u need this api
      const updated_userIntegration =
        await this.integrationsService.getUpdatedUserIntegration(user, 7);
      const url = `https://api.atlassian.com/ex/jira/${updated_userIntegration?.siteId}/rest/api/3/issue/${issueId}/worklog`;
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: timeSpentReqBody,
      };

      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(err.message);
    }
  }

  getHourFromMinutes(min: number) {
    if (!min) return 0;
    const hour = Number((min / 60).toFixed(2));
    return hour;
  }

  async getAllStatus(user: User) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      //Lots of works to do
      const integration = await this.prisma.userIntegration.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
        },
      });
      if (!integration) {
        throw new APIException(
          'You have no integration',
          HttpStatus.BAD_REQUEST,
        );
      }
      const url = `https://api.atlassian.com/ex/jira/${integration?.siteId}//rest/api/3/statuscategory`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(err.message);
    }
  }

  async setProjectStatuses2(user: User, integration: Integration) {
    const updated_userIntegration =
      await this.integrationsService.getUpdatedUserIntegration(
        user,
        integration.id,
      );
    if (!updated_userIntegration) return [];
    // let statusList: any;
    const getStatusListUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/status`;
    const getProjectListUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/project`;

    try {
      const { data: statusList } = await axios.get(getStatusListUrl, {
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        },
      });
      const { data: projectList } = await axios.get(getProjectListUrl, {
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        },
      });

      const projectIdList = new Set();
      const projectListArray: any[] = [];
      const statusArray: StatusDetail[] = [];

      for (const project of projectList) {
        const { id: projectId, key: projectKey, name: projectName } = project;
        if (projectId) {
          if (!projectIdList.has(projectId)) {
            projectIdList.add(projectId);
            projectListArray.push({
              projectId: Number(projectId),
              projectName,
              projectKey,
              source: updated_userIntegration
                ? `${updated_userIntegration.integration?.site}/browse/${projectKey}`
                : '',
              // source: IntegrationType.JIRA,

              integrationID: updated_userIntegration.id,
              // userId: user.id,
              integrated: false,
            });
          }
        }
      }
      await this.prisma.project.createMany({
        data: projectListArray,
      });
      const projectsList = await this.prisma.project.findMany({
        where: { integrationId: updated_userIntegration.integration?.id },
        include: {
          statuses: true,
        },
      });
      const projectsWithoutStatuses = new Set();
      const mappedProjects = new Map<number, number>();
      projectsList.map((project: any) => {
        projectsWithoutStatuses.add(project.projectId);
        mappedProjects.set(project.projectId, project.id);
      });
      // for (const status of statusList) {
      //   const { name, untranslatedName, id, statusCategory } = status;
      //   console.log(name, untranslatedName, id, statusCategory);
      //   const projectId = status?.scope?.project?.id;
      //   // if (!projectId) continue;
      //   console.log(projectId);
      //   projectsWithoutStatuses.delete(projectId);
      //   const statusProjectId = mappedProjects.get(Number(projectId));
      //   const statusDetail: any = {
      //     name,
      //     untranslatedName,
      //     statusId: id,
      //     statusCategoryId: `${statusCategory.id}`,
      //     statusCategoryName: statusCategory.name
      //       .replace(' ', '_')
      //       .toUpperCase(),
      //     projectId: statusProjectId,
      //     // transitionId: null,
      //   };
      //   statusProjectId && statusArray.push(statusDetail);
      // }
      //console.log('statusArray1', statusArray);
      if (projectsWithoutStatuses.size > 0) {
        for (const projectId of projectsWithoutStatuses) {
          const getStatusByProjectIdUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/project/${projectId}/statuses`;
          const { data: res } = await axios.get(getStatusByProjectIdUrl, {
            headers: {
              Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
            },
          });
          const StatusByProjectList = res.length > 0 ? res[0].statuses : [];
          for (const status of StatusByProjectList) {
            const { name, untranslatedName, id, statusCategory } = status;
            const statusProjectId = mappedProjects.get(Number(projectId));
            const statusDetail: any = {
              name,
              untranslatedName,
              statusId: id,
              statusCategoryId: `${statusCategory.id}`,
              statusCategoryName: statusCategory.name
                .replace(' ', '_')
                .toUpperCase(),
              projectId: statusProjectId,
              // transitionId: null,
            };
            statusProjectId && statusArray.push(statusDetail);
          }
          //console.log('statusArray1', statusArray);
        }
      }
      try {
        // console.log(statusArray);
        await this.prisma.statusDetail.createMany({
          data: statusArray,
        });
      } catch (error) {
        console.log(
          '🚀 ~ file: jira.service.ts:261 ~ setProjectStatuses ~ error:',
          error,
        );
      }

      // return await this.getProjectStatuses(user);
      // await Promise.allSettled([
      //   await this.prisma.project.createMany({
      //     data: projectListArray,
      //   }),
      //   await this.prisma.statusDetail.createMany({ data: statusArray }),
      // ]);
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:945 ~ setProjectStatuses ~ error:',
        error,
      );
      return error;
    }
  }

  async fetchAllProjects(user: User, integration: Integration) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userIntegration =
      user.activeWorkspaceId &&
      (await this.prisma.userIntegration.findUnique({
        where: {
          UserIntegrationIdentifier: {
            integrationId: integration.id,
            userWorkspaceId: userWorkspace.id,
          },
        },
      }));
    const updated_userIntegration =
      userIntegration &&
      (await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegration.id,
      ));
    if (!updated_userIntegration)
      throw new APIException(
        'Updating Integration Failed',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const getProjectListUrl = `https://api.atlassian.com/ex/jira/${updated_userIntegration.siteId}/rest/api/3/project`;
      const { data: projectList } = await axios.get(getProjectListUrl, {
        headers: {
          Authorization: `Bearer ${updated_userIntegration?.accessToken}`,
        },
      });
      const projectIdList = new Set();
      const projectListArray: any[] = [];

      for (const project of projectList) {
        const { id: projectId, key: projectKey, name: projectName } = project;
        if (projectId) {
          if (!projectIdList.has(projectId)) {
            projectIdList.add(projectId);
            projectListArray.push({
              projectId: Number(projectId),
              projectName,
              projectKey,
              source: updated_userIntegration
                ? `${updated_userIntegration.integration?.site}/browse/${projectKey}`
                : '',
              integrationId: integration.id,
              workspaceId: userWorkspace.workspaceId,
              integrated: false,
            });
          }
        }
      }
      await this.prisma.project.createMany({
        data: projectListArray,
      });
      return await this.prisma.project.findMany({
        where: { integrationId: updated_userIntegration.integration?.id },
        include: {
          statuses: true,
        },
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async setProjectStatuses(
    project: Project,
    updatedUserIntegration: UserIntegration,
  ) {
    const localStatus = await this.prisma.statusDetail.findMany({
      where: { projectId: project.id },
    });
    try {
      const getStatusByProjectIdUrl = `https://api.atlassian.com/ex/jira/${updatedUserIntegration.siteId}/rest/api/3/project/${project.projectId}/statuses`;
      const { data: statusList } = await axios.get(getStatusByProjectIdUrl, {
        headers: {
          Authorization: `Bearer ${updatedUserIntegration?.accessToken}`,
        },
      });

      const StatusListByProjectId =
        statusList.length > 0 ? statusList[0].statuses : [];
      const statusArray: any[] = [];
      const mappedStatuses = new Map<string, number>();
      localStatus.map((status: StatusDetail) => {
        mappedStatuses.set(status.name, status.id);
      });

      for (const status of StatusListByProjectId) {
        const { name, untranslatedName, id, statusCategory } = status;
        const statusDetail: any = {
          name,
          untranslatedName,
          statusId: id,
          statusCategoryId: `${statusCategory.id}`,
          statusCategoryName: statusCategory.name
            .replace(' ', '_')
            .toUpperCase(),
          projectId: project.id,
          // transitionId: null,
        };
        const doesExist = mappedStatuses.get(name);
        if (!doesExist) statusArray.push(statusDetail);
      }

      const createdStatus = await this.prisma.statusDetail.createMany({
        data: statusArray,
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: jira.service.ts:261 ~ setProjectStatuses ~ error:',
        error.message,
      );
    }
  }

  async importPriorities(
    project: any,
    updatedUserIntegration: UserIntegration,
  ) {
    try {
      const getPriorityByProjectIdUrl = `https://api.atlassian.com/ex/jira/${updatedUserIntegration.siteId}/rest/api/3/priority`;
      const { data: priorityList } = await axios.get(
        getPriorityByProjectIdUrl,
        {
          headers: {
            Authorization: `Bearer ${updatedUserIntegration?.accessToken}`,
          },
        },
      );

      const priorityListByProjectId =
        priorityList.length > 0
          ? priorityList.map((priority: any) => {
              return {
                name: priority.name,
                priorityId: priority.id,
                priorityCategoryName: priority.name.toUpperCase(),
                projectId: project.id,
                iconUrl: priority.iconUrl,
                color: priority.statusColor,
              };
            })
          : [];

      await this.prisma.priorityScheme.createMany({
        data: priorityListByProjectId,
      });

      return true;
    } catch (error) {
      console.log(
        '🚀 ~ file: task.service.ts:2223 ~ importPriorities ~ error:',
        error.message,
      );
    }
  }

  async getProjectList(user: User) {
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);
    const jiraIntegrationIds = getUserIntegrationList?.map(
      (userIntegration: any) => userIntegration?.integration?.id,
    );
    try {
      if (user.activeWorkspaceId) {
        return await this.prisma.project.findMany({
          where: {
            integrationId: {
              in: jiraIntegrationIds?.map((id: any) => Number(id)),
            },
            workspaceId: user.activeWorkspaceId,
          },
          include: {
            statuses: true,
          },
        });
      }
      return [];
    } catch (err) {
      throw new APIException(
        'Can not get project list',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProjectTasks(user: User, id: number, res: Response) {
    const project = await this.prisma.project.findFirst({
      where: { id: id },
      include: { integration: true },
    });
    if (!project) {
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prisma.task.deleteMany({
        where: {
          projectId: id,
        },
      });
      try {
        const projectIntegrated = await this.prisma.project.update({
          where: { id: id },
          data: { integrated: false },
        });
        // console.log(
        //   '🚀 ~ file: tasks.service.ts:1704 ~ TasksService ~ deleteProjectTasks ~ projectIntegrated:',
        //   projectIntegrated,
        // );
        return res.status(202).json({ message: 'Project Deleted' });
      } catch (error) {
        console.log(
          '🚀 ~ file: tasks.service.ts:521 ~ TasksService ~ projectTasks ~ error:',
          error,
        );
      }
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:1645 ~ TasksService ~ deleteProjectTasks ~ error:',
        error,
      );
      throw new APIException('Internal server Error', HttpStatus.BAD_REQUEST);
    }
  }

  async updateTaskPriority(
    user: User,
    taskId: number,
    { priority }: UpdateIssuePriorityReqBodyDto,
  ) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const task = await this.prisma.task.findFirst({
        where: {
          userWorkspaceId: userWorkspace.id,
          id: taskId,
        },
        select: {
          integratedTaskId: true,
          projectId: true,
        },
      });

      if (task?.integratedTaskId === null) {
        return await this.prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            priority,
            priorityCategoryName: priority,
          },
        });
      } else if (task && task.projectId && task.integratedTaskId) {
        const project = await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        });
        if (!project)
          throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

        const userIntegration =
          project?.integrationId &&
          (await this.prisma.userIntegration.findUnique({
            where: {
              UserIntegrationIdentifier: {
                integrationId: project?.integrationId,
                userWorkspaceId: userWorkspace.id,
              },
            },
          }));
        if (!userIntegration)
          throw new APIException(
            'User integration not found!',
            HttpStatus.BAD_REQUEST,
          );

        const url = `https://api.atlassian.com/ex/jira/${userIntegration?.siteId}/rest/api/3/issue/${task?.integratedTaskId}`;
        // const priorityBody = JSON.stringify({
        //   transition: {
        //     id: statusDetails?.transitionId,
        //   },
        // });
        const updatedIssue: any = await this.jiraClient.CallJira(
          userIntegration,
          this.jiraApiCalls.updateIssuePriority,
          url,
          priority,
        );
        const updatedTask =
          updatedIssue &&
          (await this.prisma.task.update({
            where: {
              id: taskId,
            },
            data: {
              priority,
              priorityCategoryName: priority,
            },
          }));
        if (!updatedTask) {
          throw new APIException(
            'Can not update issue status 1',
            HttpStatus.BAD_REQUEST,
          );
        }
        return updatedTask;
      } else
        throw new APIException('Something went wrong!', HttpStatus.BAD_REQUEST);
    } catch (err) {
      console.log(err);
      throw new APIException(
        'Can not update issue status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

const getStatusCategoryName = (status: string) => {
  switch (status) {
    case 'To Do':
      return 'TO_DO';
    case 'Done':
      return 'DONE';
    default:
      return 'IN_PROGRESS';
  }
};

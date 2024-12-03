/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';
import { coreConfig } from 'config/core';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import { TasksDatabase } from 'src/database/tasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { HttpStatus, Injectable } from '@nestjs/common';
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
  UserWorkspace,
  UserWorkspaceStatus,
} from '@prisma/client';

import { APIException } from '../exception/api.exception';
import { ClientService } from '../helper/client';
import { IntegrationsService } from '../integrations/integrations.service';
import { MyGateway } from '../notifications/socketGateway';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  CreateTaskDto,
  GetTaskQuery,
  StatusEnum,
  TimeSpentReqBodyDto,
  UpdatePinDto,
  WeekDaysType,
} from './dto';
import { UpdateIssuePriorityReqBodyDto } from './dto/update.issue.req.dto';
import { QueuePayloadType } from 'src/module/queue/types';
import { RabbitMQService } from '../queue/queue.service';
import {
  fetchAzureTasksByProject,
  fetchProjectStatusList,
  fetchTasksByProject,
  getCustomSprintField,
} from './tasks.axios';
import { startOfWeek, endOfWeek } from 'date-fns';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import {
  convertToISO,
  doesTodayTask,
  getYesterday,
} from 'src/utils/helper/helper';
import { SprintsService } from '../sprints/sprints.service';
import { getAOrganization } from '../azure_dev/azure_dev.axios';
import { AzureDevApiCalls } from 'src/utils/azureDevApiCall/api';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
    private myGateway: MyGateway,
    private workspacesService: WorkspacesService,
    private tasksDatabase: TasksDatabase,
    private jiraApiCalls: JiraApiCalls,
    private azureDevApiCalls: AzureDevApiCalls,
    private clientService: ClientService,
    private sprintTaskDatabase: SprintTaskDatabase,
    private readonly rabbitMQService: RabbitMQService,
    private sprintService: SprintsService,
  ) {}

  async getTasksByWeek(
    user: User,
    projectIds?: string[] | string,
    date?: string,
  ) {
    try {
      let numericProjectIds: number[] = [];
      const currentDate: Date = date ? convertToISO(date) : convertToISO();
      const yesterdayDate: Date = getYesterday(currentDate);
      const firstDayOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
      const lastDayOfWeek = endOfWeek(currentDate, { weekStartsOn: 1 });
      const startOfCurrentDate = new Date(
        Date.UTC(
          currentDate.getUTCFullYear(),
          currentDate.getUTCMonth(),
          currentDate.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      const endOfCurrentDate = new Date(
        Date.UTC(
          currentDate.getUTCFullYear(),
          currentDate.getUTCMonth(),
          currentDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );
      const startOfYesterdayDate = new Date(
        Date.UTC(
          yesterdayDate.getUTCFullYear(),
          yesterdayDate.getUTCMonth(),
          yesterdayDate.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      const endOfYesterdayDate = new Date(
        Date.UTC(
          yesterdayDate.getUTCFullYear(),
          yesterdayDate.getUTCMonth(),
          yesterdayDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      if (projectIds && typeof projectIds === 'string') {
        numericProjectIds = projectIds.split(',').map((id) => Number(id));
      } else if (Array.isArray(projectIds) && projectIds.length != 0) {
        numericProjectIds = projectIds.map((id) => Number(id));
      } else {
        const activeWorkspaceProjects = await this.prisma.project.findMany({
          where: {
            workspaceId: user?.activeWorkspaceId ?? undefined,
          },
        });
        numericProjectIds = activeWorkspaceProjects.map((project) =>
          Number(project.id),
        );
      }

      const userWorkspaceList = await this.sprintTaskDatabase.getUserWorkspaces(
        {
          workspaceId: user.activeWorkspaceId,
          status: UserWorkspaceStatus.ACTIVE,
        },
      );

      const activeUserWorkspaceIds: number[] = [];
      userWorkspaceList.map((userWorkspace) =>
        activeUserWorkspaceIds.push(userWorkspace.id),
      );

      const tasks = await this.tasksDatabase.getTasksForScrumReport(
        numericProjectIds,
        activeUserWorkspaceIds,
        firstDayOfWeek,
        lastDayOfWeek,
      );

      // Group tasks by user
      const groupedTasks = tasks.reduce<
        Record<
          string,
          {
            user: User;
            tasks: Task[];
            todayTasks: Task[];
            yesterdayTasks: Task[];
          }
        >
      >((record, task) => {
        const findOtherUser: number[] = this.findMatchingAuthors(
          task.sessions,
          activeUserWorkspaceIds,
          task.userWorkspaceId!,
        );
        findOtherUser.push(task.userWorkspaceId!);

        findOtherUser.forEach((userWorkspaceId) => {
          if (!record[userWorkspaceId]) {
            record[userWorkspaceId] = {
              user: task.userWorkspace?.user as User,
              tasks: [],
              todayTasks: [],
              yesterdayTasks: [],
            };
          }

          // find today's and yesterday's task
          const isTodayTask = doesTodayTask(
            startOfCurrentDate,
            endOfCurrentDate,
            task,
            true,
          );
          const isYesterDayTask = doesTodayTask(
            startOfYesterdayDate,
            endOfYesterdayDate,
            task,
          );

          const sessions = task.sessions || [];
          const taskTotalSessionTime = sessions.reduce((total, session) => {
            if (session.startTime && session.endTime) {
              const sessionStartTime = new Date(session.startTime);
              const sessionEndTime = new Date(session.endTime);
              if (
                sessionStartTime >= startOfYesterdayDate &&
                sessionEndTime <= endOfYesterdayDate &&
                userWorkspaceId === session.userWorkspaceId
              ) {
                const sessionDuration =
                  (new Date(session.endTime).getTime() -
                    new Date(session.startTime).getTime()) /
                  (1000 * 60 * 60);
                return total + sessionDuration;
              }
            }
            return total;
          }, 0);
          const roundedNum = parseFloat(taskTotalSessionTime.toFixed(2));
          roundedNum % 1 === 0 ? Math.floor(roundedNum) : roundedNum;

          const tmpTask = {
            ...task,
            spentHours: roundedNum,
            isTodayTask: isTodayTask ? true : false,
            isYesterdayTask: isYesterDayTask ? true : false,
          };
          record[userWorkspaceId].tasks.push(tmpTask);

          if (isTodayTask) record[userWorkspaceId].todayTasks.push(tmpTask);
          if (isYesterDayTask)
            record[userWorkspaceId].yesterdayTasks.push(tmpTask);
        });
        return record;
      }, {});

      const resData = Object.values(groupedTasks);
      return { date: date ? date : currentDate, resData };
    } catch (error) {
      console.log(error);
      return { date: new Date(), resData: [] };
    }
  }

  async getTasks(user: User, query: GetTaskQuery): Promise<Task[]> {
    try {
      if (!user?.activeWorkspaceId) {
        return [];
      }
      const { priority, status, text } = query;
      let { startDate, endDate } = query as unknown as GetTaskQuery;

      const sprintIds = query.sprintId as unknown as string;
      const sprintIdArray =
        sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));

      const projectIds = query.projectIds as unknown as string;
      const projectIdArray =
        projectIds && projectIds.split(',').map((item) => Number(item.trim()));

      const types = query.types as unknown as string;
      const typeArray = types && types.split(',');

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
        // const taskIds = await this.sprintService.getSprintTasksIds(
        //   sprintIdArray,
        // );
        const query = {
          userWorkspaceId: userWorkspace.id,
          source: IntegrationType.JIRA,
          ...(projectIdArray && {
            projectId: { in: projectIdArray.map((id) => Number(id)) },
          }),
          ...(priority1 && { priority: { in: priority1 } }),
          ...(status1 && { status: { in: status1 } }),
          ...queryFilter,
        };
        return await this.sprintTaskDatabase.findSprintTaskBySprintIds(
          sprintIdArray,
          query,
        );
        // return await this.prisma.task.findMany({
        //   where: {
        //     userWorkspaceId: userWorkspace.id,
        //     source: IntegrationType.JIRA,
        //     id: { in: taskIds },
        //     ...(projectIdArray && {
        //       projectId: { in: projectIdArray.map((id) => Number(id)) },
        //     }),
        //     ...(priority1 && { priority: { in: priority1 } }),
        //     ...(status1 && { status: { in: status1 } }),
        //     ...queryFilter,
        //   },
        //   include: {
        //     sessions: {
        //       include: {
        //         userWorkspace: {
        //           select: {
        //             user: {
        //               select: {
        //                 firstName: true,
        //                 lastName: true,
        //               },
        //             },
        //           },
        //         },
        //       },
        //     },
        //     parentTask: {
        //       select: {
        //         title: true,
        //         url: true,
        //         key: true,
        //       },
        //     },
        //     childTask: {
        //       select: {
        //         title: true,
        //         url: true,
        //         key: true,
        //       },
        //     },
        //   },
        // });
      } else {
        const databaseQuery = {
          userWorkspaceId: userWorkspace.id,
          ...(projectIdArray && {
            projectId: { in: projectIdArray.map((id) => Number(id)) },
          }),
          ...(startDate &&
            endDate && {
              createdAt: { lte: endDate },
              updatedAt: { gte: startDate, lte: endDate },
            }),
          ...(priority1 && { priority: { in: priority1 } }),
          ...(status1 && { status: { in: status1 } }),
          ...(query.types && { source: { in: typeArray } }),
          ...queryFilter,
        };
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

  private async sendQueue(
    user: User,
    type: QueuePayloadType,
    projectId?: number,
  ) {
    try {
      this.rabbitMQService.publishMessage(type, {
        payloadType: type,
        user: user,
        ...(projectId && { projectId }),
      });
    } catch (error) {
      console.log(error);
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
        user?.activeWorkspaceId &&
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
          const query = {
            userWorkspaceId: userWorkspace.id,
            source: IntegrationType.JIRA,
            ...(priority1 && { priority: { in: priority1 } }),
            ...(status1 && { status: { in: status1 } }),
          };
          return await this.sprintTaskDatabase.findSprintTaskBySprintIds(
            sprintIdArray,
            query,
          );
          // const integrationId = jiraIntegration?.jiraAccountId ?? '-1';
          // const taskIds = await this.sprintService.getSprintTasksIds(
          //   sprintIdArray,
          // );
          // //console.log(taskIds);

          // return await this.prisma.task.findMany({
          //   where: {
          //     workspaceId: user.activeWorkspaceId,
          //     source: IntegrationType.JIRA,
          //     id: { in: taskIds },
          //     ...(priority1 && { priority: { in: priority1 } }),
          //     ...(status1 && { status: { in: status1 } }),
          //     ...(text && {
          //       title: {
          //         contains: text.replace(/[+\-]/g, (match) => `\\${match}`),
          //         mode: 'insensitive',
          //       },
          //     }),
          //   },
          //   include: {
          //     sessions: {
          //       include: {
          //         userWorkspace: {
          //           select: {
          //             user: {
          //               select: {
          //                 firstName: true,
          //                 lastName: true,
          //               },
          //             },
          //           },
          //         },
          //       },
          //     },
          //     parentTask: {
          //       select: {
          //         title: true,
          //         url: true,
          //         key: true,
          //       },
          //     },
          //     childTask: {
          //       select: {
          //         title: true,
          //         url: true,
          //         key: true,
          //       },
          //     },
          //   },
          // });
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
      project = await this.tasksDatabase.getProject({
        id: Number(dto.projectId),
      });
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
      const task = await this.prisma.task.create({
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
          createdAt: dto.startDate,
          updatedAt: dto.startDate,
        },
      });

      if (dto.startTime && dto.endTime && task.id) {
        await this.prisma.session.create({
          data: {
            startTime: dto.startTime,
            endTime: dto.endTime,
            status: SessionStatus.STOPPED,
            userWorkspaceId: userWorkspace.id,
            taskId: task.id,
          },
        });
      }

      return await this.prisma.task.findUnique({
        where: { id: task.id },
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
    let SessionStartTime: number | null =
      dto.startTime && new Date(dto.startTime).getTime();
    let SessionEndTime: number | null =
      dto.endTime && new Date(dto.endTime).getTime();
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
      SessionStartTime && (SessionStartTime += repeatTime);
      SessionEndTime && (SessionEndTime += repeatTime);
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
    let SessionStartTime: number | null =
      dto.startTime && new Date(dto.startTime).getTime();
    let SessionEndTime: number | null =
      dto.endTime && new Date(dto.endTime).getTime();
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
      SessionStartTime && (SessionStartTime += repeatTime);
      SessionEndTime && (SessionEndTime += repeatTime);
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
    let SessionStartTime = dto.startTime && new Date(dto.startTime).getTime();
    let SessionEndTime = dto.endTime && new Date(dto.endTime).getTime();
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
        const SessionStartFinalTime = SessionStartTime
          ? SessionStartTime + target * 24 * 3600 * 1000
          : null;
        const SessionEndFinalTime = SessionEndTime
          ? SessionEndTime + target * 24 * 3600 * 1000
          : null;
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
    let SessionStartTime = dto.startTime && new Date(dto.startTime).getTime();
    let SessionEndTime = dto.endTime && new Date(dto.endTime).getTime();
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
        const SessionStartFinalTime = SessionStartTime
          ? SessionStartTime + target * 24 * 3600 * 1000
          : null;
        const SessionEndFinalTime = SessionEndTime
          ? SessionEndTime + target * 24 * 3600 * 1000
          : null;
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
    try {
      return await this.prisma.userIntegration.findUnique({
        where: {
          UserIntegrationIdentifier: {
            integrationId,
            userWorkspaceId,
          },
        },
      });
    } catch (err) {
      return null;
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

  async fetchAndProcessTasksAndWorklog(
    user: User,
    project: Project,
    userIntegration: UserIntegration,
  ) {
    const headers: any = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userIntegration.accessToken}`,
    };
    const sprintCustomField = await getCustomSprintField(
      userIntegration.siteId!,
      headers,
    );
    const mappedUserWorkspaceAndJiraId =
      await this.mappingUserWorkspaceAndJiraAccountId(user);
    const settings = await this.tasksDatabase.getSettings(user);
    const syncTime: number = settings ? settings.syncTime : 6;
    let respTasks;
    const parentChildMapped = new Map<number, number>();
    const mappedSprint = new Map<number, any>();
    const mappedSprintTask = new Map();

    for (let startAt = 0; startAt < 5000; startAt += 100) {
      let worklogPromises: Promise<any>[] = [];
      const taskList: any[] = [],
        worklogsList: any[] = [],
        sessionArray: any[] = [];
      const mappedIssues = new Map<number, any>();

      respTasks = await fetchTasksByProject({
        siteId: userIntegration.siteId!,
        projectId: project.projectId!,
        syncTime,
        headers,
        startAt,
      });

      if (!respTasks || respTasks.issues.length === 0) {
        break;
      }
      respTasks?.issues?.map((issue: any) => {
        mappedIssues.set(Number(issue?.id), {
          ...issue?.fields,
          key: issue?.key,
        });
      });

      const integratedTasks = await this.prisma.task.findMany({
        where: {
          workspaceId: user?.activeWorkspaceId,
          integratedTaskId: { in: [...mappedIssues.keys()] },
          source: IntegrationType.JIRA,
        },
        select: {
          integratedTaskId: true,
        },
      });

      // keep the task list that doesn't exist in the database
      for (let j = 0, len = integratedTasks.length; j < len; j++) {
        const key = integratedTasks[j].integratedTaskId;
        key && mappedIssues.delete(key);
      }
      // const sprintArray = new Set();
      // let assigneeFlag = true;
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
        const taskPriority = integratedTask.priority.name;
        const key = integratedTask?.key;

        if (!parentChildMapped.has(integratedTaskId)) {
          integratedTask.parent &&
            integratedTask.parent.id &&
            parentChildMapped.set(
              integratedTaskId,
              Number(integratedTask.parent.id),
            );
        }
        // if (assigneeFlag && integratedTask.assignee) {
        //   assigneeFlag = false;
        // }
        // if (assigneeFlag && !integratedTask.assignee) {
        //   const issueUrl = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/api/3/issue/${integratedTask?.key}`;
        //   // console.log('🚀 ~ TasksService ~ issueUrl 1:', issueUrl);
        //   const issue = await this.clientService.CallJira(
        //     userIntegration,
        //     this.jiraApiCalls.jiraApiGetCall,
        //     issueUrl,
        //   );
        //   // console.log('🚀 ~ TasksService ~ issue 2:', issue);
        //   integratedTask = issue.fields;
        //   console.log('🚀 ~ TasksService ~ integratedTask 3:', integratedTask);
        // }

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
          statusCategoryName: integratedTask?.status?.statusCategory?.name
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
          key,
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
        // console.log(
        //   '🚀 ~ file: tasks.service.ts:924 ~ TasksService ~ err:',
        //   err,
        // );
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
        console.log('error  occurred while creating worklog');
        console.log(error);
        throw new Error('Failed to fetch worklogs');
      }

      for (let index = 0; index < worklogsList.length; index++) {
        const regex = /\/issue\/(\d+)\/worklog/;
        const match = worklogsList[index]?.request?.path?.match(regex);
        const taskId = mappedTaskId.get(Number(match[1]));

        taskId &&
          worklogsList[index]?.data?.worklogs?.map((log: any) => {
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

  async fetchAndProcessAzureDevOpsTasksAndWorklog(
    user: User,
    project: Project,
    userIntegration: UserIntegration,
  ){
    const organizationName = ""
    const projectName = ""
    const taskIds = await fetchAzureTasksByProject({
      organizationName: '',
      projectName: '',
      accessToken: userIntegration.accessToken,
    });

  // fetch all task details
    const url = `https://dev.azure.com/AbirHussain/MY-TRACKER-23/_apis/wit/workitemsbatch?api-version=7.1`
    const body = {ids: taskIds}
    const headers: any = {
      Authorization: `Bearer ${userIntegration.accessToken}`,
      'Content-Type': 'application/json',
    };
    const allTaskDetails = await axios.post(url, body, { headers });
  // process all task logs
    const workLogs = [];
    for (const task of allTaskDetails.data.value) {
      const taskObject = {
        title: task.fields.System.Title,
        assigneeId: task.fields.System.AssignedTo.id,
        projectName: task.fields.System.TeamProject,
        projectId: task.url.split("/").find((part: string) => /^[0-9a-fA-F-]{36}$/.test(part)) || null,
        workItemType: task.fields.System.WorkItemType,
        spentHours: task.fields.Microsoft.VSTS.Scheduling.Effort,
        status: task.fields.System.State,
        priority: String(task.fields.Microsoft.VSTS.Common.Priority),
        source: "AZURE_DEVOPS",
        dataSource: project.source,
        integratedTaskId: task.id,
        url: task.url.replace('/_apis/wit/workItems/', '/_workitems/edit/'),
      };
      workLogs.push(taskObject);
    }
    return workLogs;
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

  async updateProjectIntegrationStatus(projId: number) {
    await this.prisma.project.update({
      where: { id: projId },
      data: { integrated: true },
    });
  }

  async sendImportedNotification(user: User, msg: string, res?: Response) {
    const notification = await this.createNotification(user, msg, msg);
    this.myGateway.sendNotification(`${user.id}`, notification);
  }

  async syncAll(user: User) {
    this.sendQueue(user, QueuePayloadType.SYNC_ALL);
    return await this.syncCall(StatusEnum.IN_PROGRESS, user);
  }

  async reload(user: User) {
    this.sendQueue(user, QueuePayloadType.RELOAD);
    return await this.syncCall(StatusEnum.IN_PROGRESS, user);
  }

  async syncAndGetTasks(user: User, projectId: number) {
    this.sendQueue(user, QueuePayloadType.SYNC_PROJECT_OR_OUTLOOK, projectId);
    return await this.syncCall(StatusEnum.IN_PROGRESS, user, projectId);
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

  async deleteAllSyncCall() {
    const deletedSyncData = await this.prisma.callSync.deleteMany({
      where: {},
    });
    console.log(
      '🚀 ~ TasksService ~ deleteAllSyncCall ~ deletedSyncData:',
      deletedSyncData,
    );
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
          const { transitions } = await this.clientService.CallJira(
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
        const updatedIssue: any = await this.clientService.CallJira(
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
      throw err;
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
        const updatedIssueEstimation = await this.clientService.CallJira(
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
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new Error('User workspace not found');
      }
      const userIntegration: any =
        user?.activeWorkspaceId &&
        (await this.prisma.userIntegration.findUnique({
          where: {
            UserIntegrationIdentifier: {
              integrationId: integration.id,
              userWorkspaceId: userWorkspace.id,
            },
          },
          include: {
            integration: true,
          },
        }));
      if (!userIntegration) {
        throw new Error('User Integration not found');
      }

      const getProjectListUrl = `https://api.atlassian.com/ex/jira/${userIntegration.siteId}/rest/api/3/project`;
      const projectList: any = await this.clientService.CallJira(
        userIntegration,
        this.jiraApiCalls.jiraApiGetCall,
        getProjectListUrl,
      );
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
              source: userIntegration
                ? `${userIntegration?.integration?.site}/browse/${projectKey}`
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
      const projects = await this.tasksDatabase.getProjectList(
        userIntegration?.integration?.id,
      );
      return projects;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async fetchAllAzureDevProjects(user: User, integration: Integration) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new Error('User workspace not found');
      }
      const userIntegration: any =
        user?.activeWorkspaceId &&
        (await this.prisma.userIntegration.findUnique({
          where: {
            UserIntegrationIdentifier: {
              integrationId: integration.id,
              userWorkspaceId: userWorkspace.id,
            },
          },
          include: {
            integration: true,
          },
        }));
      if (!userIntegration) {
        throw new Error('User Integration not found');
      }

      // const organization = await getAOrganization({
      //   access_token: userIntegration.accessToken,
      // });

      const getProjectListUrl = `https://dev.azure.com/${integration.siteId}/_apis/projects?api-version=7.1-preview.4`;
      const projectList: any = await this.clientService.CallAzureDev(
        userIntegration,
        this.azureDevApiCalls.azureGetApiCall,
        getProjectListUrl,
      );
      const projectIdList = new Set();
      const projectListArray: any[] = [];

      for (const project of projectList?.value) {
        const { id: projectId, name: projectName } = project;
        if (projectId) {
          if (!projectIdList.has(projectId)) {
            projectIdList.add(projectId);
            projectListArray.push({
              azureProjectId: projectId,
              projectName,
              source: `${project.url.split('/_apis')[0]}/${projectName}`,
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
      const projects = await this.tasksDatabase.getProjectList(
        userIntegration?.integration?.id,
      );
      return projects;
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
      const statusList =
        updatedUserIntegration?.accessToken &&
        updatedUserIntegration?.siteId &&
        project?.projectId &&
        (await fetchProjectStatusList({
          siteId: updatedUserIntegration.siteId,
          project: project,
          accessToken: updatedUserIntegration.accessToken,
        }));

      const StatusListByProjectId: any[] =
        statusList && statusList.length > 0 ? statusList : [];
      const statusArray: any[] = [];
      const mappedStatuses = new Map<string, number>();

      localStatus.map((status: StatusDetail) => {
        mappedStatuses.set(status?.name, status?.id);
      });

      for (const status of StatusListByProjectId) {
        const { name, untranslatedName, id, statusCategory } = status.status;
        const type = status.type;
        const statusDetail: any = {
          type,
          name,
          untranslatedName,
          statusId: id,
          statusCategoryId: `${statusCategory?.id}`,
          statusCategoryName: statusCategory?.name
            .replace(' ', '_')
            .toUpperCase(),
          projectId: project.id,
          // transitionId: null,
        };
        if (!mappedStatuses.has(name)) statusArray.push(statusDetail);
      }

      if (statusArray.length > 0)
        await this.tasksDatabase.createBatchStatus(statusArray);
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
      const priorityList: any = await this.clientService.CallJira(
        updatedUserIntegration,
        this.jiraApiCalls.importJiraPriorities,
        getPriorityByProjectIdUrl,
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

      const [, , getPriorities] = await Promise.all([
        await this.tasksDatabase.deletePriorities(project.id),
        await this.tasksDatabase.createBatchPriority(priorityListByProjectId),
        await this.tasksDatabase.getPriorityList(project.id),
      ]);

      return getPriorities;
    } catch (error) {
      console.log(
        '🚀 ~ file: task.service.ts:2223 ~ importPriorities ~ error:',
        error.message,
      );
      return [];
    }
  }

  async getProjectList(user: User) {
    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);
    const jiraIntegrationIds = getUserIntegrationList?.map(
      (userIntegration: any) => userIntegration?.integration?.id,
    );
    try {
      if (user?.activeWorkspaceId) {
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
        const updatedIssue: any = await this.clientService.CallJira(
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

  async syncEvents(user: User, calenId: number, res?: Response) {
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
        res && (await this.syncCall(StatusEnum.IN_PROGRESS, user)),
        res &&
          (await this.sendImportedNotification(
            user,
            'Syncing in progress!',
            res,
          )),
        await this.fetchAndProcessCalenderEvents(
          user,
          userWorkspace,
          calender,
          userIntegration,
        ),
        res && (await this.syncCall(StatusEnum.DONE, user)),
        res &&
          (await this.sendImportedNotification(
            user,
            'Calendar Synced Successfully!',
            res,
          )),
      ]);
      return res
        ? res.send({ Message: 'Calendar Synced Successfully!' })
        : { Message: 'Calendar Synced Successfully!' };
    } catch (err) {
      console.log('🚀 ~ TasksService ~ syncEvents ~ err:', err);
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
      console.log('🚀 ~ TasksService ~ calendarEvent:', calendarEvent);

      if (
        localEvent &&
        localEvent.jiraUpdatedAt &&
        calendarEvent?.lastModifiedDateTime &&
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

  private findMatchingAuthors(
    sessions: any[],
    activeUserWorkspaceIds: string | any[],
    givenId: number,
  ): number[] {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return [];
    }
    return sessions
      .filter(
        (session) =>
          activeUserWorkspaceIds.includes(session.userWorkspaceId) &&
          session.userWorkspaceId !== givenId,
      )
      .map((session) => session.userWorkspaceId);
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

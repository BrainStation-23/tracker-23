import axios from 'axios';
import * as moment from 'moment';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IntegrationType, Session, SessionStatus, User } from '@prisma/client';

import { ManualTimeEntryReqBody, SessionDto, SessionReqBodyDto } from './dto';
import { IntegrationsService } from '../integrations/integrations.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TasksService } from '../tasks/tasks.service';
import { APIException } from '../exception/api.exception';
import {
  GetTaskQuery,
  GetTeamTaskQuery,
  GetTeamTaskQueryType,
} from '../tasks/dto';
import { UserWorkspaceDatabase } from '../../database/userWorkspaces';
import { SessionDatabase } from '../../database/sessions';

@Injectable()
export class SessionsService {
  constructor(
    private integrationsService: IntegrationsService,
    private prisma: PrismaService,
    private tasksService: TasksService,
    private workspacesService: WorkspacesService,
    private userWorkspaceDatabase: UserWorkspaceDatabase,
    private sessionDatabase: SessionDatabase,
  ) {}

  async getSessions(user: User, taskId: number) {
    await this.validateTaskAccess(user, taskId);

    return await this.prisma.session.findMany({
      where: { taskId },
    });
  }

  async createSession(user: User, dto: SessionDto) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'UserWorkspace not found!',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.validateTaskAccess(user, dto.taskId);
    await this.prisma.task.update({
      where: { id: dto.taskId },
      data: { status: 'In Progress', statusCategoryName: 'IN_PROGRESS' },
    });

    // Checking for previous active session
    const activeSession = await this.prisma.session.findFirst({
      where: { taskId: dto.taskId, endTime: null },
    });

    if (activeSession) {
      await this.stopSession(user, activeSession.taskId);
    }

    return await this.prisma.session.create({
      data: { ...dto, userWorkspaceId: userWorkspace.id },
    });
  }

  async stopSession(user: User, taskId: number) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const task = await this.validateTaskAccess(user, taskId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.tasksService.updateIssueStatus(user, taskId + '', task.status + '');
    const activeSession = await this.prisma.session.findFirst({
      where: { taskId, endTime: null },
    });

    if (!activeSession) {
      throw new BadRequestException('No active session');
    }
    const timeSpent = Math.ceil(
      (new Date(Date.now()).getTime() - activeSession.startTime.getTime()) /
        1000,
    );
    if (timeSpent < 60) {
      await this.prisma.session.delete({
        where: { id: activeSession.id },
      });
      throw new BadRequestException({
        message: 'Session canceled due to insufficient time',
      });
    }
    const updated_session = await this.stopSessionUtil(activeSession.id);

    if (task.integratedTaskId) {
      const project =
        task.projectId &&
        (await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        }));
      if (!project)
        throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

      const userIntegration =
        project?.integrationId &&
        (await this.prisma.userIntegration.findUnique({
          where: {
            userIntegrationIdentifier: {
              integrationId: project?.integrationId,
              userWorkspaceId: userWorkspace.id,
            },
          },
        }));
      const session =
        userIntegration &&
        (await this.logToIntegrations(
          user,
          task.integratedTaskId,
          userIntegration.id,
          updated_session,
        ));
      if (!session) {
        throw new BadRequestException({
          message: 'Session canceled due to insufficient time',
        });
      }
      await this.updateTaskUpdatedAt(taskId);
    }
    return updated_session;
  }

  async validateTaskAccess(user: User, taskId: number) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const task = await this.prisma.task.findFirst({
      where: { id: taskId },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }
    //have to think about it
    if (task.userWorkspaceId !== userWorkspace.id) {
      throw new UnauthorizedException('You do not have access to this task');
    }
    return task;
  }

  async stopSessionUtil(sessionId: number) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { endTime: new Date(), status: SessionStatus.STOPPED },
    });
  }

  async logToIntegrations(
    user: User,
    integratedTaskId: number,
    userIntegrationId: number,
    session: Session,
  ) {
    if (session.endTime == null) {
      return null;
    }
    const timeSpent = Math.ceil(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000,
    );
    if (timeSpent < 60) {
      return null;
    }
    const updated_integration =
      await this.integrationsService.getUpdatedUserIntegration(
        user,
        userIntegrationId,
      );
    if (!updated_integration) {
      return null;
    }

    const jiraSession = await this.addWorkLog(
      session.startTime,
      integratedTaskId as unknown as string,
      this.timeConverter(timeSpent),
      updated_integration,
    );
    const localSession =
      jiraSession &&
      (await this.prisma.session.update({
        where: { id: session.id },
        data: {
          authorId: updated_integration?.jiraAccountId
            ? updated_integration?.jiraAccountId
            : null,
          integratedTaskId: jiraSession ? Number(jiraSession.issueId) : null,
          worklogId: jiraSession ? Number(jiraSession.id) : null,
        },
      }));
    if (!localSession) return null;
    return { success: true, msg: 'Successfully Updated to jira' };
  }

  timeConverter(timeSpent: number) {
    if (!timeSpent) {
      return 0 + 'm';
    }
    timeSpent = Math.ceil(timeSpent / 60);
    return timeSpent + 'm';
  }

  async addWorkLog(
    startTime: any,
    issueId: string,
    timeSpentReqBody: string,
    integration: any,
  ) {
    try {
      const url = `https://api.atlassian.com/ex/jira/${integration.siteId}/rest/api/3/issue/${issueId}/worklog`;
      const data = JSON.stringify({
        started: this.getUtcTime(startTime),
        timeSpent: timeSpentReqBody,
      });
      const config = {
        method: 'post',
        url,
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
      const workLog = await (await axios(config)).data;
      return workLog;
    } catch (err) {
      return null;
    }
  }
  getUtcTime(date: any) {
    const targetTimezoneOffset = '';
    // Create a moment object with the original timestamp
    const originalMoment = moment(date);

    // Convert to the target timezone
    const targetMoment = originalMoment.utcOffset(targetTimezoneOffset);

    // Format the target moment object
    const formattedString = targetMoment.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const tmp =
      formattedString.substr(0, formattedString.length - 3) +
      formattedString[formattedString.length - 2] +
      formattedString[formattedString.length - 1];
    console.log(
      '🚀 ~ file: sessions.service.ts:211 ~ SessionsService ~ getUtcTime ~ tmp:',
      tmp,
    );
    return `${tmp}`;
  }

  async manualTimeEntry(user: User, dto: ManualTimeEntryReqBody) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'UserWorkspace not found!',
          HttpStatus.BAD_REQUEST,
        );
      }
      const startTime = new Date(`${dto.startTime}`);
      const endTime = new Date(`${dto.endTime}`);
      const { integratedTaskId, id, projectId } = await this.validateTaskAccess(
        user,
        dto.taskId,
      );

      const timeSpent = Math.ceil(
        (endTime.getTime() - startTime.getTime()) / 1000,
      );
      if (timeSpent < 60) {
        throw new APIException(
          'Insufficient TimeSpent',
          HttpStatus.BAD_REQUEST,
        );
      }
      let jiraSession: any;
      let updated_integration: any;
      if (integratedTaskId) {
        const getUserIntegrationList =
          await this.integrationsService.getUserIntegrations(user);
        console.log(
          '🚀 ~ file: sessions.service.ts:276 ~ SessionsService ~ manualTimeEntry ~ getUserIntegrationList:',
          getUserIntegrationList,
        );
        const project =
          projectId &&
          (await this.prisma.project.findFirst({
            where: { id: projectId },
            include: { integration: true },
          }));
        if (!project) {
          throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);
        }

        const userIntegration: number[] = [];
        getUserIntegrationList.map((userInt: any) => {
          if (
            project.integration?.id &&
            userInt.integrationId === project.integration.id
          ) {
            userIntegration.push(userInt.id);
          }
        });
        console.log(
          '🚀 ~ file: sessions.service.ts:293 ~ SessionsService ~ userIntegration ~ userIntegration:',
          userIntegration,
        );
        updated_integration =
          userIntegration.length &&
          (await this.integrationsService.getUpdatedUserIntegration(
            user,
            userIntegration[0],
          ));
        if (updated_integration)
          jiraSession = await this.addWorkLog(
            startTime,
            integratedTaskId as unknown as string,
            this.timeConverter(Number(timeSpent)),
            updated_integration,
          );
        jiraSession && this.updateTaskUpdatedAt(dto.taskId);
      }
      if (id) {
        return await this.prisma.session.create({
          data: {
            startTime: startTime,
            endTime: endTime,
            status: SessionStatus.STOPPED,
            taskId: id,
            authorId: updated_integration?.jiraAccountId
              ? updated_integration?.jiraAccountId
              : null,
            integratedTaskId: jiraSession ? Number(jiraSession.issueId) : null,
            worklogId: jiraSession ? Number(jiraSession.id) : null,
            userWorkspaceId: userWorkspace.id,
          },
        });
      } else {
        throw new APIException(
          'Something is wrong in manual time entry',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      console.log(err);
      throw new APIException(
        'Something is wrong in manual time entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSession(
    user: User,
    sessionId: string,
    reqBody: SessionReqBodyDto,
  ) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const doesExistWorklog = await this.prisma.session.findUnique({
        where: { id: Number(sessionId) },
      });
      if (!doesExistWorklog) {
        throw new APIException('No session found', HttpStatus.BAD_REQUEST);
      }

      let session: Session | false | null = null;
      const task = await this.prisma.task.findFirst({
        where: {
          id: doesExistWorklog.taskId,
          userWorkspaceId: userWorkspace.id,
        },
      });
      if (!task) {
        throw new APIException(
          'Task Not Found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (task && task.source === IntegrationType.TRACKER23) {
        session = await this.updateSessionFromLocal(Number(sessionId), reqBody);
        return session;
      }
      const getUserIntegrationList =
        await this.integrationsService.getUserIntegrations(user);
      console.log(
        '🚀 ~ file: sessions.service.ts:276 ~ SessionsService ~ manualTimeEntry ~ getUserIntegrationList:',
        getUserIntegrationList,
      );
      const project =
        task.projectId &&
        (await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        }));
      if (!project)
        throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

      const userIntegration: number[] = [];
      getUserIntegrationList.map((userInt: any) => {
        if (
          project.integration?.id &&
          userInt.integrationId === project.integration.id
        ) {
          userIntegration.push(userInt.id);
        }
      });
      console.log(
        '🚀 ~ file: sessions.service.ts:293 ~ SessionsService ~ userIntegration ~ userIntegration:',
        userIntegration,
      );
      const updated_integration =
        userIntegration.length &&
        (await this.integrationsService.getUpdatedUserIntegration(
          user,
          userIntegration[0],
        ));

      if (!updated_integration) {
        throw new APIException(
          'Integration Not Found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (doesExistWorklog.authorId === updated_integration.jiraAccountId) {
        const startTime = new Date(`${reqBody.startTime}`);
        const endTime = new Date(`${reqBody.endTime}`);
        const timeSpentReqBody = Math.ceil(
          (endTime.getTime() - startTime.getTime()) / 1000,
        );
        if (timeSpentReqBody < 60) {
          throw new APIException(
            'Insufficient TimeSpent',
            HttpStatus.BAD_REQUEST,
          );
        }

        const timeSpent = this.timeConverter(Number(timeSpentReqBody));
        const data = JSON.stringify({
          started: this.getUtcTime(startTime),
          timeSpent: timeSpent,
        });
        const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/api/3/issue/${doesExistWorklog?.integratedTaskId}/worklog/${doesExistWorklog.worklogId}`;
        const config = {
          method: 'put',
          url,
          headers: {
            Authorization: `Bearer ${updated_integration?.accessToken}`,
            'Content-Type': 'application/json',
          },
          data: data,
        };

        const response = (await axios(config)).data;
        session =
          response &&
          (await this.updateSessionFromLocal(Number(sessionId), reqBody));
        task && (await this.updateTaskUpdatedAt(task.id));
      }

      if (!session) {
        throw new APIException(
          'You are not allowed to update this session!',
          HttpStatus.BAD_REQUEST,
        );
      }
      return session;
    } catch (err) {
      throw new APIException(
        err.message || 'Something is wrong to update this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateSessionFromLocal(sessionId: number, reqBody: SessionReqBodyDto) {
    const updateFromLocal = await this.prisma.session.update({
      where: {
        id: Number(sessionId),
      },
      data: reqBody,
    });
    if (!updateFromLocal) {
      throw new APIException(
        'Can not update this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return updateFromLocal;
  }

  async deleteSession(user: User, sessionId: string) {
    try {
      const userWorkspace = await this.workspacesService.getUserWorkspace(user);
      if (!userWorkspace) {
        throw new APIException(
          'User workspace not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      const doesExistWorklog = await this.prisma.session.findUnique({
        where: { id: Number(sessionId) },
      });
      if (!doesExistWorklog) {
        throw new APIException('No session found', HttpStatus.BAD_REQUEST);
      }

      let session: Session | false | null = null;
      const task = await this.prisma.task.findFirst({
        where: {
          id: doesExistWorklog.taskId,
          userWorkspaceId: userWorkspace.id,
        },
      });

      if (!task) {
        throw new APIException(
          'Task Not Found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (task && task.source === IntegrationType.TRACKER23) {
        session = await this.deleteSessionFromLocal(Number(sessionId));
        return { message: 'Session Deleted Successfully!' };
      }

      const getUserIntegrationList =
        await this.integrationsService.getUserIntegrations(user);
      console.log(
        '🚀 ~ file: sessions.service.ts:276 ~ SessionsService ~ manualTimeEntry ~ getUserIntegrationList:',
        getUserIntegrationList,
      );
      const project =
        task.projectId &&
        (await this.prisma.project.findFirst({
          where: { id: task.projectId },
          include: { integration: true },
        }));
      if (!project)
        throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

      const userIntegration =
        project?.integrationId &&
        (await this.tasksService.getUserIntegration(
          userWorkspace.id,
          project.integrationId,
        ));
      const updatedUserIntegration =
        userIntegration &&
        (await this.integrationsService.getUpdatedUserIntegration(
          user,
          userIntegration.id,
        ));

      if (!updatedUserIntegration) {
        throw new APIException(
          'Integration Not Found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (doesExistWorklog.authorId === updatedUserIntegration.jiraAccountId) {
        const url = `https://api.atlassian.com/ex/jira/${updatedUserIntegration?.siteId}/rest/api/3/issue/${doesExistWorklog?.integratedTaskId}/worklog/${doesExistWorklog.worklogId}`;
        const config = {
          method: 'delete',
          url,
          headers: {
            Authorization: `Bearer ${updatedUserIntegration?.accessToken}`,
            'Content-Type': 'application/json',
          },
        };

        const status = (await axios(config)).status;
        session =
          status === 204 &&
          (await this.deleteSessionFromLocal(Number(sessionId)));
        task && this.updateTaskUpdatedAt(task.id);
      }

      if (!session) {
        throw new APIException(
          'You are not allowed to delete this session!',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Session deleted successfully!' };
    } catch (err) {
      throw new APIException(
        err.message || 'Something is wrong to delete this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteSessionFromLocal(sessionId: number) {
    const deleteFromLocal = await this.prisma.session.delete({
      where: {
        id: Number(sessionId),
      },
    });
    if (!deleteFromLocal) {
      throw new APIException(
        'Can not delete this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return deleteFromLocal;
  }

  async updateTaskUpdatedAt(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        sessions: true,
      },
    });

    const sessionDate: any = task?.sessions
      .map((el: any) => {
        if (el.endTime > new Date(Date.now())) return el.endTime;
      })
      .filter((val: any) => val)
      .sort((x: Date, y: Date) => {
        return new Date(y).getTime() - new Date(x).getTime();
      });

    let date = new Date(Date.now());
    if (sessionDate?.length > 0 && date < sessionDate[0]) date = sessionDate[0];
    await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        updatedAt: date,
      },
    });
  }

  async weeklySpentTime(user: User, query: GetTaskQuery) {
    const sessions = await this.getSessionsByUserWorkspace(user);
    if (!sessions)
      return {
        TotalSpentTime: 0,
        //value: null,
      };

    //let { startDate, endDate } = query;
    const startDate = query?.startDate ? new Date(query.startDate) : new Date();
    const endDate = query?.endDate ? new Date(query.endDate) : new Date();

    //const taskList: any[] = await this.getTasks(user, query);

    let totalTimeSpent = 0;
    const map = new Map<string, number>();
    for (const session of sessions) {
      let taskTimeSpent = 0;
      const start = session && session.startTime && new Date(session.startTime);
      let end = session && session.endTime && new Date(session.endTime);
      if (end && end.getTime() === 0) {
        end = new Date();
      }
      let sessionTimeSpent = 0;
      if (start >= startDate && end && end <= endDate) {
        sessionTimeSpent = (end.getTime() - start.getTime()) / (1000 * 60);
      } else if (startDate >= start && end && end >= endDate) {
        sessionTimeSpent =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60);
      } else if (end && end >= startDate) {
        sessionTimeSpent =
          Math.min(
            Math.max(endDate.getTime() - start.getTime(), 0),
            end.getTime() - startDate.getTime(),
          ) /
          (1000 * 60);
      }
      totalTimeSpent += sessionTimeSpent;
      taskTimeSpent += sessionTimeSpent;

      if (!session?.task?.projectName) session.task.projectName = 'T23';

      if (!map.has(session?.task?.projectName)) {
        map.set(session?.task.projectName, taskTimeSpent);
      } else {
        let getValue = map.get(session?.task?.projectName);
        if (!getValue) getValue = 0;
        map.set(session?.task?.projectName, getValue + taskTimeSpent);
      }
    }

    const ar = [];
    const iterator = map[Symbol.iterator]();
    for (const item of iterator) {
      ar.push({
        projectName: item[0],
        value: this.tasksService.getHourFromMinutes(item[1]),
      });
    }

    return {
      TotalSpentTime: this.tasksService.getHourFromMinutes(totalTimeSpent),
      value: ar,
    };
  }

  async getSpentTimeByDay(user: User, query: GetTaskQuery) {
    const sessions = await this.getSessionsByUserWorkspace(user);
    if (!sessions)
      return {
        TotalSpentTime: 0,
        //value: null,
      };

    let { startDate, endDate } = query;
    startDate = startDate ? new Date(startDate) : new Date();
    endDate = endDate ? new Date(endDate) : new Date();

    return this.getSpentTimePerDay(sessions, startDate, endDate);
  }

  async getTimeSpentByTeam(
    query: GetTeamTaskQuery,
    user: User,
    type: GetTeamTaskQueryType,
  ) {
    let projectIds, projectIdArray, userIds, userIdArray;
    if (query?.projectIds) {
      projectIds = query?.projectIds as unknown as string;
      projectIdArray =
        projectIds && projectIds.split(',').map((item) => Number(item.trim()));
    }
    if (query?.userIds) {
      userIds = query?.userIds as unknown as string;
      userIdArray =
        userIds && userIds.split(',').map((item) => Number(item.trim()));
    }

    if (!user?.activeWorkspaceId)
      throw new APIException(
        'No user workspace detected',
        HttpStatus.BAD_REQUEST,
      );

    let { startDate, endDate } = query;
    startDate = startDate ? new Date(startDate) : new Date();
    endDate = endDate ? new Date(endDate) : new Date();
    let sessions;

    if (!userIdArray || userIdArray?.length === 0) {
      sessions = await this.sessionDatabase.getSessions({
        ...(query?.status && { task: { status: query?.status } }),
        ...(projectIdArray &&
          projectIdArray?.length !== 0 && {
            task: {
              projectId: { in: projectIdArray },
              workspaceId: user?.activeWorkspaceId,
              startTime: {
                gte: startDate,
              },
            },
          }),
        startTime: { gte: startDate },
      });
    } else {
      const userWorkspaces =
        user?.activeWorkspaceId &&
        (await this.userWorkspaceDatabase.getUserWorkspaceList({
          userId: {
            in: userIdArray,
          },
          workspaceId: user?.activeWorkspaceId,
        }));

      //@ts-ignore
      const userWorkspaceIds: number[] = userWorkspaces?.map(
        (userWorkspace: any) => userWorkspace?.id,
      );

      sessions = await this.sessionDatabase.getSessions({
        ...(query?.status && { task: { status: query?.status } }),
        ...(projectIdArray &&
          projectIdArray?.length !== 0 && {
            task: {
              projectId: { in: projectIdArray },
            },
          }),
        userWorkspaceId: { in: userWorkspaceIds },
        startTime: { gte: startDate },
      });
    }

    if (!sessions) return { value: 0, message: 'No tasks available' };

    return type === GetTeamTaskQueryType.DATE_RANGE
      ? this.getSpentTimeInRange(sessions, startDate, endDate)
      : this.getSpentTimePerDay(sessions, startDate, endDate);
  }

  //private functions
  private async getSessionsByUserWorkspace(user: User) {
    if (!user || !user.activeWorkspaceId)
      throw new APIException(
        'No workspace id detected',
        HttpStatus.BAD_REQUEST,
      );

    const userWorkspace =
      await this.userWorkspaceDatabase.getSingleUserWorkspace({
        userId: user.id,
        workspaceId: user.activeWorkspaceId,
      });

    if (!userWorkspace)
      throw new APIException(
        'Could not get userworkspace',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return await this.sessionDatabase.getSessions({
      userWorkspaceId: userWorkspace?.id,
    });
  }

  private getSpentTimePerDay(sessions: any, startDate: Date, endDate: Date) {
    const map = new Map<Date, number>();

    let totalTimeSpent = 0;
    const oneDay = 3600 * 24 * 1000;
    for (
      let endDay = startDate.getTime() + oneDay, startDay = startDate.getTime();
      endDay <= endDate.getTime() + oneDay;
      endDay += oneDay, startDay += oneDay
    ) {
      for (const session of sessions) {
        const start = new Date(session.startTime);
        let end = new Date(session.endTime);
        if (end.getTime() === 0) {
          end = new Date();
        }

        let sessionTimeSpent = 0;
        if (start.getTime() >= startDay && end.getTime() <= endDay) {
          sessionTimeSpent = (end.getTime() - start.getTime()) / (1000 * 60);
        } else if (startDay >= start.getTime() && end.getTime() >= endDay) {
          sessionTimeSpent = (endDay - startDay) / (1000 * 60);
        } else if (end.getTime() >= startDay) {
          sessionTimeSpent =
            Math.min(
              Math.max(endDay - start.getTime(), 0),
              end.getTime() - startDay,
            ) /
            (1000 * 60);
        }
        totalTimeSpent += sessionTimeSpent;
      }

      let tmp = map.get(new Date(startDay));
      if (!tmp) tmp = 0;
      map.set(
        new Date(startDay),
        tmp + this.tasksService.getHourFromMinutes(totalTimeSpent),
      );
      totalTimeSpent = 0;
    }

    const ar = [];
    const iterator = map[Symbol.iterator]();
    for (const item of iterator) {
      ar.push({
        day: item[0],
        hour: item[1],
      });
    }

    return ar;
  }

  private getSpentTimeInRange(sessions: any, startDate: Date, endDate: Date) {
    let totalTimeSpent = 0;
    const map = new Map<string, number>();
    for (const session of sessions) {
      let taskTimeSpent = 0;
      const start = new Date(session.startTime);
      let end = new Date(session.endTime);
      if (end.getTime() === 0) {
        end = new Date();
      }
      let sessionTimeSpent = 0;
      if (start >= startDate && end <= endDate) {
        sessionTimeSpent = (end.getTime() - start.getTime()) / (1000 * 60);
      } else if (startDate >= start && end >= endDate) {
        sessionTimeSpent =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60);
      } else if (end >= startDate) {
        sessionTimeSpent =
          Math.min(
            Math.max(endDate.getTime() - start.getTime(), 0),
            end.getTime() - startDate.getTime(),
          ) /
          (1000 * 60);
      }
      totalTimeSpent += sessionTimeSpent;
      taskTimeSpent += sessionTimeSpent;

      if (!session?.task?.projectName) session.task.projectName = 'T23';

      if (!map.has(session?.task?.projectName)) {
        map.set(session?.task?.projectName, taskTimeSpent);
      } else {
        let getValue = map.get(session?.task?.projectName);
        if (!getValue) getValue = 0;
        map.set(session?.task?.projectName, getValue + taskTimeSpent);
      }
    }
    const ar = [];
    const iterator = map[Symbol.iterator]();
    for (const item of iterator) {
      ar.push({
        projectName: item[0],
        value: this.tasksService.getHourFromMinutes(item[1]),
      });
    }

    return {
      TotalSpentTime: this.tasksService.getHourFromMinutes(totalTimeSpent),
      value: ar,
    };
  }
}

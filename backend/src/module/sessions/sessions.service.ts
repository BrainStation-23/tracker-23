import axios from 'axios';
import * as moment from 'moment';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IntegrationType,
  Session,
  SessionStatus,
  User,
  UserIntegration,
  UserWorkspaceStatus,
} from '@prisma/client';

import { ManualTimeEntryReqBody, SessionDto, SessionReqBodyDto } from './dto';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TasksService } from '../tasks/tasks.service';
import { APIException } from '../exception/api.exception';
import {
  GetTaskQuery,
  GetTeamTaskQuery,
  GetTeamTaskQueryType,
  GetTimeSheetQueryDto,
} from '../tasks/dto';
import { UserWorkspaceDatabase } from '../../database/userWorkspaces';
import { SessionDatabase } from '../../database/sessions';
import { ProjectDatabase } from 'src/database/projects';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { TasksDatabase } from 'src/database/tasks';
import * as dayjs from 'dayjs';
import { SprintReportFilterDto } from './dto/sprint-report.dto';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { JiraClientService } from '../helper/client';

@Injectable()
export class SessionsService {
  constructor(
    private integrationsService: IntegrationsService,
    private tasksService: TasksService,
    private workspacesService: WorkspacesService,
    private userWorkspaceDatabase: UserWorkspaceDatabase,
    private sessionDatabase: SessionDatabase,
    private projectDatabase: ProjectDatabase,
    private userIntegrationDatabase: UserIntegrationDatabase,
    private tasksDatabase: TasksDatabase,
    private jiraApiCalls: JiraApiCalls,
    private jiraClient: JiraClientService,
  ) {}

  async getSessions(user: User, taskId: number) {
    await this.validateTaskAccess(user, taskId);

    return await this.sessionDatabase.getSessions({ taskId });
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
    await this.sessionDatabase.updateTask(
      { id: dto.taskId },
      { status: 'In Progress', statusCategoryName: 'IN_PROGRESS' },
    );

    // Checking for previous active session
    const activeSession = await this.sessionDatabase.getSession(dto.taskId);

    if (activeSession) {
      await this.stopSession(user, activeSession.taskId);
    }

    return await this.sessionDatabase.createSession({
      ...dto,
      userWorkspaceId: userWorkspace.id,
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
    this.tasksService.updateIssueStatus(user, taskId + '', task.status + '');
    const activeSession = await this.sessionDatabase.getSession(taskId);

    if (!activeSession) {
      throw new BadRequestException('No active session');
    }
    const timeSpent = Math.floor(
      (new Date(Date.now()).getTime() - activeSession.startTime.getTime()) /
        1000,
    );
    if (timeSpent < 60) {
      await this.sessionDatabase.deleteSession(activeSession.id);
      throw new BadRequestException({
        message: 'Session canceled due to insufficient time',
      });
    }
    const updated_session = await this.stopSessionUtil(activeSession.id);

    if (task.integratedTaskId) {
      const project =
        task.projectId &&
        (await this.projectDatabase.getProjectWithRes(
          { id: task.projectId },
          { integration: true },
        ));

      if (!project)
        throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);

      const userIntegration =
        project?.integrationId &&
        (await this.userIntegrationDatabase.getUserIntegration({
          UserIntegrationIdentifier: {
            integrationId: project?.integrationId,
            userWorkspaceId: userWorkspace.id,
          },
        }));

      const session =
        userIntegration &&
        updated_session &&
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
    const task = await this.tasksDatabase.getTaskbyId(taskId);

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
    return await this.sessionDatabase.updateSessionById(sessionId, {
      endTime: new Date(),
      status: SessionStatus.STOPPED,
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

    const timeSpent = Math.floor(
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
      (await this.sessionDatabase.updateSessionById(session.id, {
        authorId: updated_integration?.jiraAccountId
          ? updated_integration?.jiraAccountId
          : null,
        integratedTaskId: jiraSession ? Number(jiraSession.issueId) : null,
        worklogId: jiraSession ? Number(jiraSession.id) : null,
      }));

    if (!localSession) return null;

    return { success: true, msg: 'Successfully Updated to jira' };
  }

  timeConverter(timeSpent: number) {
    if (!timeSpent) {
      return 0 + 'm';
    }
    timeSpent = Math.floor(timeSpent / 60);
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

      const workLog: any = await this.jiraClient.CallJira(
        integration,
        this.jiraApiCalls.updatedIssues,
        url,
        data,
      );
      return workLog;
    } catch (err) {
      console.log('🚀 ~ SessionsService ~ err:', err);
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

    return `${tmp}`;
  }

  async manualTimeEntry(user: User, dto: ManualTimeEntryReqBody) {
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

    const timeSpent = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000,
    );
    if (timeSpent < 60) {
      throw new APIException('Insufficient TimeSpent', HttpStatus.BAD_REQUEST);
    }

    let jiraSession: any;
    let updated_integration: any;

    if (integratedTaskId) {
      const getUserIntegrationList =
        await this.integrationsService.getUserIntegrations(user);

      const project =
        projectId &&
        (await this.projectDatabase.getProjectWithRes(
          { id: projectId },
          { integration: true },
        ));

      if (!project) {
        throw new APIException('Invalid Project', HttpStatus.BAD_REQUEST);
      }

      const userIntegration: number[] = [];
      getUserIntegrationList.map((userInt: any) => {
        if (
          project.integrationId &&
          userInt.integrationId === project.integrationId
        ) {
          userIntegration.push(userInt.id);
        }
      });

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
      const createdSession = await this.sessionDatabase.createSession({
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
      });

      if (!createdSession)
        throw new APIException(
          'Could not create session',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      return createdSession;
    } else {
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
        throw new Error('User workspace not found');
      }

      const doesExistWorklog = await this.sessionDatabase.getSessionById(
        +sessionId,
      );
      if (!doesExistWorklog) {
        throw new Error('No session found');
      }

      //let session: Session | false | null = null;
      const task = await this.tasksDatabase.getTask({
        id: doesExistWorklog.taskId,
        userWorkspaceId: userWorkspace.id,
      });
      if (!task) {
        throw new Error('Task Not Found');
      }

      if (task && task.source === IntegrationType.TRACKER23) {
        return await this.updateSessionFromLocal(Number(sessionId), reqBody);
        //return session;
      }

      const getUserIntegrationList =
        await this.integrationsService.getUserIntegrations(user);

      const project =
        task.projectId &&
        (await this.projectDatabase.getProjectWithRes(
          { id: task.projectId },
          { integration: true },
        ));
      if (!project) throw new Error('Could not fetch Project');

      const userIntegration: UserIntegration[] = [];
      for await (const userInt of getUserIntegrationList) {
        if (userInt.integrationId === project.integrationId) {
          userIntegration.push(userInt);
          if (userIntegration.length > 0) break;
        }
      }

      if (!userIntegration.length) {
        throw new Error('Integration Not Found');
      }

      if (doesExistWorklog.authorId === userIntegration[0]?.jiraAccountId) {
        const startTime = new Date(`${reqBody.startTime}`);
        const endTime = new Date(`${reqBody.endTime}`);
        const timeSpentReqBody = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000,
        );
        if (timeSpentReqBody < 60) {
          throw new Error('Insufficient TimeSpent');
        }

        const timeSpent = this.timeConverter(Number(timeSpentReqBody));
        const data = JSON.stringify({
          started: this.getUtcTime(startTime),
          timeSpent: timeSpent,
        });
        const url = `https://api.atlassian.com/ex/jira/${userIntegration[0]?.siteId}/rest/api/3/issue/${doesExistWorklog?.integratedTaskId}/worklog/${doesExistWorklog.worklogId}`;
        const response: any = await this.jiraClient.CallJira(
          userIntegration[0],
          this.jiraApiCalls.UpdateWorkLog,
          url,
          data,
        );

        const session =
          response &&
          (await this.updateSessionFromLocal(Number(sessionId), reqBody));
        task && (await this.updateTaskUpdatedAt(task.id));

        if (!session) {
          throw new Error('You are not allowed to update this session!');
        }
        return session;
      }
    } catch (err) {
      throw new APIException(
        err.message || 'Something is wrong to update this session!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateSessionFromLocal(sessionId: number, reqBody: SessionReqBodyDto) {
    const updateFromLocal = await this.sessionDatabase.updateSessionById(
      +sessionId,
      reqBody,
    );
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

      const doesExistWorklog = await this.sessionDatabase.getSessionById(
        +sessionId,
      );
      if (!doesExistWorklog) {
        throw new APIException('No session found', HttpStatus.BAD_REQUEST);
      }

      const task = await this.tasksDatabase.getTask({
        id: doesExistWorklog.taskId,
        userWorkspaceId: userWorkspace.id,
      });
      if (!task) {
        throw new APIException(
          'Task Not Found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (task && task.source === IntegrationType.TRACKER23) {
        await this.deleteSessionFromLocal(Number(sessionId));

        return { message: 'Session Deleted Successfully!' };
      }

      const project =
        task.projectId &&
        (await this.projectDatabase.getProjectWithRes(
          { id: task.projectId },
          { integration: true },
        ));
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
        const session =
          status === 204 &&
          (await this.deleteSessionFromLocal(Number(sessionId)));

        task && this.updateTaskUpdatedAt(task.id);

        if (!session) {
          throw new APIException(
            'You are not allowed to delete this session!',
            HttpStatus.BAD_REQUEST,
          );
        }
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
    const deleteFromLocal = await this.sessionDatabase.deleteSession(
      +sessionId,
    );
    if (!deleteFromLocal) {
      throw new APIException(
        'Can not delete this session!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return deleteFromLocal;
  }

  async updateTaskUpdatedAt(taskId: number) {
    const task = await this.tasksDatabase.getTaskWithCustomResponse(
      {
        id: taskId,
      },
      {
        sessions: true,
      },
    );

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

    await this.sessionDatabase.updateTask(
      {
        id: taskId,
      },
      {
        updatedAt: date,
      },
    );
  }

  async weeklySpentTime(user: User, query: GetTaskQuery) {
    const sessions = await this.getSessionsByUserWorkspace(user);
    if (!sessions?.length) {
      return {
        TotalSpentTime: 0,
        value: [],
      };
    }

    //let { startDate, endDate } = query;
    const startDate = query?.startDate ? new Date(query.startDate) : new Date();
    const endDate = query?.endDate ? new Date(query.endDate) : new Date();

    //const taskList: any[] = await this.getTasks(user, query);

    let totalTimeSpent = 0;
    const mapProjectNameAndSessions = new Map<string, number>();
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

      if (!mapProjectNameAndSessions.has(session?.task?.projectName)) {
        mapProjectNameAndSessions.set(session?.task.projectName, taskTimeSpent);
      } else {
        let getValue = mapProjectNameAndSessions.get(
          session?.task?.projectName,
        );
        if (!getValue) getValue = 0;
        mapProjectNameAndSessions.set(
          session?.task?.projectName,
          getValue + taskTimeSpent,
        );
      }
    }

    const ar = [];
    const iterator = mapProjectNameAndSessions[Symbol.iterator]();
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

  async getSpentTimeByDay(
    loggedInUser: Partial<User>,
    query: GetTimeSheetQueryDto,
    user?: Partial<User>,
  ) {
    const sessions =
      loggedInUser &&
      (await this.getSessionsByUserWorkspace(loggedInUser, user));
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
          status: UserWorkspaceStatus.ACTIVE,
          workspaceId: user?.activeWorkspaceId,
        }));

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

  async getTimeSheetPerDay(loggedInUser: User, query: GetTimeSheetQueryDto) {
    const mappedUserWithWorkspaceId = new Map<number, any>();
    const existUserWorkspaceId = new Map<number, any>();
    const projectIdArray: number[] = [];

    const projectIds = query?.projectIds as unknown as string;
    const arrayOfProjectIds = projectIds?.split(',');
    const projectIdsArray = arrayOfProjectIds?.map(Number);

    const userIds = query?.userIds as unknown as string;
    const arrayOfUserIds = userIds?.split(',');
    const userIdsArray = arrayOfUserIds?.map(Number);

    const types = query.types as unknown as string;
    const typeArray = types && types.split(',');

    const projects = await this.projectDatabase.getProjects({
      ...(query?.projectIds && {
        id: {
          in: projectIdsArray.map((id: any) => {
            return id;
          }),
        },
      }),
      ...(query.types && {
        integration: {
          type: { in: typeArray },
        },
      }),
      workspaceId: loggedInUser.activeWorkspaceId,
      integrated: true,
    });

    const getUserWorkspaceList =
      await this.sessionDatabase.getUserWorkspaceList({
        workspaceId: loggedInUser.activeWorkspaceId,
        status: UserWorkspaceStatus.ACTIVE,
        ...(query?.userIds && { userId: { in: userIdsArray } }),
      });

    for (
      let index = 0, len = getUserWorkspaceList.length;
      index < len;
      index++
    ) {
      mappedUserWithWorkspaceId.set(
        getUserWorkspaceList[index].id,
        getUserWorkspaceList[index].user,
      );
    }
    for (const project of projects) {
      projectIdArray.push(project.id);
      for (const [
        userWorkspaceId,
        user,
      ] of mappedUserWithWorkspaceId.entries()) {
        const userIntegration =
          project.integrationId &&
          (await this.userIntegrationDatabase.getUserIntegration({
            UserIntegrationIdentifier: {
              integrationId: project.integrationId,
              userWorkspaceId,
            },
          }));
        if (userIntegration && !existUserWorkspaceId.has(userWorkspaceId)) {
          existUserWorkspaceId.set(userWorkspaceId, user);
        }
      }
    }

    const daysDifference = this.calculateDaysBetweenDates(
      query?.startDate,
      query?.endDate,
    );
    const response: any[] = [];
    for (const [userWorkspaceId, user] of existUserWorkspaceId.entries()) {
      const sessions = await this.getSessionsByDay(
        query,
        userWorkspaceId,
        projectIdArray.length ? projectIdArray : null,
      );
      response.push({
        ...user,
        sessions,
      });
    }
    return daysDifference === 31 || daysDifference <= 31
      ? this.formattedDailyTimeSheet(query, response)
      : daysDifference > 31 && daysDifference <= 94
      ? this.formattedWeeklyTimeSheet(query, response)
      : this.formattedMonthlyTimeSheet(query, response);
  }

  //private functions
  private async getSessionsByUserWorkspace(
    loggedInUser: Partial<User>,
    user?: Partial<User>,
  ) {
    if (!loggedInUser || !loggedInUser?.activeWorkspaceId) {
      return [];
    }
    const userId = user ? user.id : loggedInUser.id;
    const userWorkspace =
      await this.userWorkspaceDatabase.getSingleUserWorkspace({
        userId,
        workspaceId: loggedInUser.activeWorkspaceId,
      });

    const sessions = userWorkspace?.id
      ? await this.sessionDatabase.getSessions({
          userWorkspaceId: userWorkspace?.id,
        })
      : [];

    return sessions;
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

  private getArrayOfDatesInRange(startDate: any, endDate: any) {
    const dates = [];
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    let currentDate = dayjs(start);

    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
      dates.push(currentDate.format('MMM DD, YYYY'));
      currentDate = currentDate.add(1, 'day');
    }

    return dates;
  }

  private calculateDaysBetweenDates(startDate: any, endDate: any): number {
    startDate = startDate ? new Date(startDate) : new Date();
    endDate = endDate ? new Date(endDate) : new Date();
    // Calculate the time difference in milliseconds
    const timeDifferenceMs = endDate.getTime() - startDate.getTime();

    // Convert milliseconds to days
    const daysDifference = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24));

    return daysDifference;
  }

  private organizeDateRangeIntoWeeks(
    startDateStr: any,
    endDateStr: any,
  ): { weekArray: string[]; weekRange: Record<string, string> } {
    startDateStr = startDateStr ? new Date(startDateStr) : new Date();
    endDateStr = endDateStr ? new Date(endDateStr) : new Date();

    const startDate = dayjs(startDateStr);
    const endDate = dayjs(endDateStr);

    // Calculate the number of weeks
    const numberOfWeeks = Math.ceil(endDate.diff(startDate, 'week', true));

    // Initialize arrays to store week labels and week date ranges
    const weekArray: string[] = [];
    const weekRange: Record<string, string> = {};

    // Generate week labels and week date ranges
    for (let i = 0; i < numberOfWeeks; i++) {
      const weekStartDate = startDate.add(i, 'week');
      const weekEndDate = startDate.add(i + 1, 'week').subtract(1, 'day');
      const weekLabel = `Week ${i + 1}`;
      const weekRangeLabel = `${weekStartDate.format(
        'MM/DD/YYYY',
      )} - ${weekEndDate.format('MM/DD/YYYY')}`;

      weekArray.push(weekLabel);
      weekRange[weekLabel] = weekRangeLabel;
    }

    return { weekArray, weekRange };
  }

  private organizeDateRangeIntoMonths(start: any, end: any) {
    start = start ? new Date(start) : new Date();
    end = end ? new Date(end) : new Date();
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const months = [];
    let currentDate = startDate.clone();

    while (currentDate.isBefore(endDate)) {
      const year = currentDate.year();
      const monthName = currentDate.format('MMMM');
      const monthStartDate = currentDate.startOf('month').toDate();
      const monthEndDate = currentDate.endOf('month');

      let daysInMonth = monthEndDate.date();

      if (currentDate.isSame(startDate, 'month')) {
        // Calculate days remaining in the first month
        const daysRemaining = daysInMonth - startDate.date() + 1;
        months.push({
          year,
          month: monthName,
          startDate: startDate.toDate(),
          days: daysRemaining,
        });
      } else {
        if (monthEndDate.isAfter(endDate)) {
          // Adjust days if the month ends after the endDate
          daysInMonth = endDate.date() - monthStartDate.getDate() + 1;
        }
        months.push({
          year,
          month: monthName,
          startDate: monthStartDate,
          days: daysInMonth,
        });
      }

      // Move to the next month
      currentDate = currentDate.add(1, 'month').startOf('month');
    }

    return months;
  }

  private formattedDailyTimeSheet(query: GetTimeSheetQueryDto, response: any) {
    const columns = this.getArrayOfDatesInRange(
      query?.startDate,
      query?.endDate,
    );

    const rows = [];
    let totalTime = 0;

    for (let i = 0; i < response.length; i++) {
      let totalIndividualTime = 0;
      const row = {
        userId: response[i].id,
        name: response[i].firstName + ' ' + response[i].lastName,
        picture: response[i].picture,
        email: response[i].email,
        totalTime: 0,
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      for (let j = 0; j < response[i]?.sessions.length; j++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        row[`${columns[j]}`] = response[i]?.sessions[j].hour;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        totalIndividualTime += response[i]?.sessions[j].hour;
      }
      row.totalTime = totalIndividualTime;
      totalTime += totalIndividualTime;
      rows.push(row);
    }

    return {
      columns,
      rows,
      totalTime,
    };
  }

  private formattedWeeklyTimeSheet(query: GetTimeSheetQueryDto, response: any) {
    const { weekArray, weekRange } = this.organizeDateRangeIntoWeeks(
      query.startDate,
      query.endDate,
    );

    const rows: any[] = [];
    let totalTime = 0;

    for (let i = 0; i < response.length; i++) {
      let totalIndividual = 0;
      const timeLogsOfWeeks: any = {};
      let a = 0;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      for (let j = 0; j < response[i].sessions.length; j = j + 7) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const group = response[i].sessions.slice(j, j + 7);
        const sum = group.reduce(
          (acc: any, day: { hour: any }) => acc + day.hour,
          0,
        );
        totalTime += sum;
        totalIndividual += sum;
        //sessions.push();
        timeLogsOfWeeks[`${weekArray[a]}`] = sum;
        timeLogsOfWeeks[`totalTime`] = totalIndividual;
        a++;
      }
      rows.push({
        userId: response[i].id,
        name: response[i].firstName + ' ' + response[i].lastName,
        picture: response[i].picture,
        email: response[i].email,
        ...timeLogsOfWeeks,
      });
    }

    return {
      rows,
      totalTime,
      columns: weekArray,
      dateRange: weekRange,
    };
  }

  private formattedMonthlyTimeSheet(
    query: GetTimeSheetQueryDto,
    response: any,
  ) {
    let totalTime = 0;
    const rows: any[] = [];

    const months = this.organizeDateRangeIntoMonths(
      query.startDate,
      query.endDate,
    );

    const columns = months?.map((month) => month.month + ' ' + month.year);

    for (let i = 0; i < response.length; i++) {
      let counter = -1,
        totalIndividual = 0;
      const timeLogsOfMonths: any = {};
      const row = {
        userId: response[i].id,
        name: `${response[i].firstName} ${response[i].lastName}`,
        pic: response[i].picture,
        email: response[i].email,
        totalTime: 0,
      };

      for (
        let j = 0;
        j < response[i].sessions.length;
        j = j + months[counter].days
      ) {
        counter++;
        const group = response[i].sessions.slice(j, j + months[counter].days);
        const sum = group.reduce(
          (acc: any, day: { hour: any }) => acc + day.hour,
          0,
        );

        totalIndividual += sum;
        totalTime += sum;
        timeLogsOfMonths[`${columns[counter]}`] = sum;
        timeLogsOfMonths[`totalTime`] = totalIndividual;
      }

      rows.push({
        ...row,
        ...timeLogsOfMonths,
      });
    }

    return {
      columns,
      rows,
      totalTime,
    };
  }

  async sendWeeklyTimeSheet(userId: number) {
    const userWorkspaceList =
      await this.userWorkspaceDatabase.getUserWorkspaceList({
        userId: userId,
        status: {
          in: [UserWorkspaceStatus.ACTIVE],
        },
      });
    const end = dayjs();
    const start = end.subtract(7, 'day').startOf('day');
    const formattedEndDate = end.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const formattedStartedDate = start.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const sessionList = await this.sessionDatabase.getSessions({
      userWorkspaceId: {
        in: userWorkspaceList.map((userWorkspace) => userWorkspace.id),
      },
      startTime: { gte: new Date(formattedStartedDate) },
      OR: [{ endTime: { lte: new Date(formattedEndDate) } }, { endTime: null }],
    });
    let TotalSpentTime = 0;
    if (!sessionList || sessionList?.length === 0) {
      return {
        TotalSpentTime: 0,
        value: [],
      };
    }
    const mappedProject = new Map<string, number>();
    for (const session of sessionList) {
      let taskTimeSpent = 0;
      const start = session.startTime;
      let end = session.endTime ?? null;
      if (!end) {
        end = new Date();
      }
      const sessionTimeSpent = (end.getTime() - start.getTime()) / (1000 * 60);
      TotalSpentTime += sessionTimeSpent;
      taskTimeSpent += sessionTimeSpent;

      if (!session?.task?.projectName) {
        throw new APIException('Something is wrong!', HttpStatus.BAD_REQUEST);
      }

      if (!mappedProject.has(session?.task?.projectName)) {
        mappedProject.set(session?.task.projectName, taskTimeSpent);
      } else {
        let getValue = mappedProject.get(session?.task?.projectName);
        if (!getValue) getValue = 0;
        mappedProject.set(session?.task?.projectName, getValue + taskTimeSpent);
      }
    }

    const arr = [];
    const iterator = mappedProject[Symbol.iterator]();
    for (const item of iterator) {
      arr.push({
        projectName: item[0],
        value: this.tasksService.getHourFromMinutes(item[1]),
      });
    }

    return {
      TotalSpentTime: this.tasksService.getHourFromMinutes(TotalSpentTime),
      value: arr,
    };
  }

  async usersSpentAndEstimationReportOnSprint(
    user: User,
    query?: SprintReportFilterDto,
  ) {
    const mappedTaskWithId = new Map<number, any>();
    const mappedUserWithWorkspaceId = new Map<number, any>();
    const existUserIntegration = new Map<number, any>();
    const rows: any[] = [];

    const sprintIds = query?.sprintId as unknown as string;
    const projectIds = query?.projectIds as unknown as string;
    const userIds = query?.userId as unknown as string;
    const arrayOfSprintIds = sprintIds?.split(',');
    const arrayOfProjectIds = projectIds?.split(',');
    const arrayOfUserIds = userIds?.split(',');
    // Convert each string element to a number
    const sprintIdsArray = arrayOfSprintIds?.map(Number);
    const projectIdsArray = arrayOfProjectIds?.map(Number);
    const userIdsArray = arrayOfUserIds?.map(Number);

    const projects = await this.projectDatabase.getProjectListForSprintReport(
      {
        ...(query?.projectIds && {
          id: {
            in: projectIdsArray.map((id: any) => {
              return id;
            }),
          },
        }),
        workspaceId: user.activeWorkspaceId,
        integrated: true,
      },
      {
        ...(query?.sprintId && {
          id: {
            in: sprintIdsArray.map((id: any) => {
              return id;
            }),
          },
        }),
      },
    );

    const getUserWorkspaceList =
      await this.sessionDatabase.getUserWorkspaceList({
        workspaceId: user.activeWorkspaceId,
        status: UserWorkspaceStatus.ACTIVE,
        ...(query?.userId && { userId: { in: userIdsArray } }),
      });

    for (
      let index = 0, len = getUserWorkspaceList.length;
      index < len;
      index++
    ) {
      mappedUserWithWorkspaceId.set(
        getUserWorkspaceList[index].id,
        getUserWorkspaceList[index].user,
      );
    }

    for (const project of projects) {
      for (let index = 0, len = project.tasks.length; index < len; index++) {
        mappedTaskWithId.set(project.tasks[index].id, project.tasks[index]);
      }
      for (let index = 0, len = project.sprints.length; index < len; index++) {
        const sprint = project.sprints[index];
        const userMap = new Map<
          number,
          {
            userId: number;
            name: string;
            picture: string;
            estimation: any;
            timeSpent: any;
          }
        >();

        if (!sprint.sprintTask.length) {
          for (const [
            userWorkspaceId,
            user,
          ] of mappedUserWithWorkspaceId.entries()) {
            userMap.set(userWorkspaceId, {
              userId: user.id,
              name: user.firstName + ' ' + user.lastName,
              picture: user.picture,
              estimation: 0,
              timeSpent: 0,
            });
          }
        }
        for (
          let idx = 0, sprintTasklen = sprint.sprintTask.length;
          idx < sprintTasklen;
          idx++
        ) {
          const sprintTaskId = sprint.sprintTask[idx].taskId;
          const task = mappedTaskWithId.get(sprintTaskId);
          if (task) {
            const MappedSessionTime = this.getTimeFromSessions(
              task.sessions,
              mappedUserWithWorkspaceId,
            );
            for (const [
              userWorkspaceId,
              user,
            ] of mappedUserWithWorkspaceId.entries()) {
              if (!MappedSessionTime.has(userWorkspaceId)) {
                MappedSessionTime.set(userWorkspaceId, {
                  sessionTimeSpent: 0,
                });
              }
            }

            for (const [
              userWorkspaceId,
              sessionTime,
            ] of MappedSessionTime.entries()) {
              if (!userMap.has(userWorkspaceId)) {
                const user = mappedUserWithWorkspaceId.get(userWorkspaceId);
                userMap.set(userWorkspaceId, {
                  userId: user.id,
                  name: user.firstName + ' ' + user.lastName,
                  picture: user.picture,
                  estimation:
                    task?.userWorkspaceId === userWorkspaceId
                      ? task.estimation ?? 0
                      : 0,
                  timeSpent: sessionTime?.sessionTimeSpent ?? 0,
                });
              } else {
                const user = userMap.get(userWorkspaceId);
                if (user) {
                  (user.estimation +=
                    task?.userWorkspaceId === userWorkspaceId
                      ? task.estimation ?? 0
                      : 0),
                    (user.timeSpent += sessionTime?.sessionTimeSpent ?? 0);
                }
              }
            }
          }
        }

        for (const [userWorkspaceId, user] of userMap.entries()) {
          if (user.timeSpent) {
            userMap.set(userWorkspaceId, {
              ...user,
              estimation: Number(user.estimation.toFixed(2)),
              timeSpent: Number(user.timeSpent.toFixed(2)),
            });

            if (
              query?.projectIds &&
              !existUserIntegration.has(userWorkspaceId)
            ) {
              existUserIntegration.set(userWorkspaceId, user);
            }
          } else if (user.timeSpent === 0 && user.estimation === 0) {
            const userIntegration =
              project.integrationId &&
              (await this.userIntegrationDatabase.getUserIntegration({
                UserIntegrationIdentifier: {
                  integrationId: project.integrationId,
                  userWorkspaceId,
                },
              }));
            if (!userIntegration) {
              userMap.set(userWorkspaceId, {
                ...user,
                estimation: null,
                timeSpent: null,
              });
              query?.projectIds && userMap.delete(userWorkspaceId);
            } else {
              if (
                query?.projectIds &&
                !existUserIntegration.has(userWorkspaceId)
              ) {
                existUserIntegration.set(userWorkspaceId, user);
              }
            }
          }
        }
        rows.push({
          sprintId: sprint.id,
          name: sprint.name,
          projectName: project.projectName,
          startDate: sprint.startDate,
          users: [...userMap.values()].sort((a, b) => a.userId - b.userId),
        });
      }
    }

    const columns = query?.projectIds
      ? [...existUserIntegration.values()].map((user: any) => {
          return {
            userId: user.userId,
            name: user.name,
            picture: user.picture,
          };
        })
      : [...mappedUserWithWorkspaceId.values()].map((user: any) => {
          return {
            userId: user.id,
            name: user.lastName
              ? user.firstName + ' ' + user.lastName
              : user.firstName,
            picture: user.picture,
          };
        });

    const sortedColumns = columns.sort((a, b) => a.userId - b.userId);
    const sortedRows = rows.sort((a, b) => b.startDate - a.startDate);
    return {
      columns: sortedColumns,
      rows: sortedRows,
    };
  }

  getTimeFromSessions(
    sessions: any[],
    mappedUserWithWorkspaceId: Map<number, any>,
  ) {
    const mappedUserWorkspaceWithTimeSpent = new Map<
      number,
      { sessionTimeSpent: number }
    >();
    for (const session of sessions) {
      let sessionTimeSpent = 0;
      if (session.userWorkspace) {
        const user = mappedUserWithWorkspaceId.get(session.userWorkspace.id);
        if (user) {
          const start = new Date(session.startTime);
          let end = new Date(session.endTime);
          if (end.getTime() === 0) {
            end = new Date();
          }
          sessionTimeSpent =
            (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          if (!mappedUserWorkspaceWithTimeSpent.has(session.userWorkspace.id)) {
            mappedUserWorkspaceWithTimeSpent.set(session.userWorkspace.id, {
              sessionTimeSpent,
            });
          } else {
            const getUserWorkspace = mappedUserWorkspaceWithTimeSpent.get(
              session.userWorkspace.id,
            );
            if (getUserWorkspace) {
              getUserWorkspace.sessionTimeSpent += sessionTimeSpent ?? 0;
            }
          }
        }
      }
    }
    return mappedUserWorkspaceWithTimeSpent;
  }

  async getSessionsByDay(
    query: GetTimeSheetQueryDto,
    userWorkspaceId: number,
    projectIds: number[] | null,
  ) {
    const sessions = await this.sessionDatabase.getSessions({
      userWorkspaceId,
      ...(projectIds?.length && {
        task: {
          projectId: {
            in: projectIds,
          },
        },
      }),
    });
    if (!sessions)
      return {
        TotalSpentTime: 0,
      };

    let { startDate, endDate } = query;
    startDate = startDate ? new Date(startDate) : new Date();
    endDate = endDate ? new Date(endDate) : new Date();

    return this.getSpentTimePerDay(sessions, startDate, endDate);
  }
}

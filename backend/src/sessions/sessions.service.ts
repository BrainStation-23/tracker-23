import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, Session, SessionStatus, User } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { ManualTimeEntryReqBody, SessionDto } from './dto';
import axios from 'axios';
import * as moment from 'moment';
import { APIException } from 'src/internal/exception/api.exception';
@Injectable()
export class SessionsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async getSessions(user: User, taskId: number) {
    await this.validateTaskAccess(user, taskId);

    return await this.prisma.session.findMany({
      where: { taskId },
    });
  }

  async createSession(user: User, dto: SessionDto) {
    await this.validateTaskAccess(user, dto.taskId);
    await this.prisma.task.update({
      where: { id: dto.taskId },
      data: { status: 'In Progress' },
    });

    // Checking for previous active session
    const activeSession = await this.prisma.session.findFirst({
      where: { taskId: dto.taskId, endTime: null },
    });

    if (activeSession) {
      await this.stopSession(user, activeSession.taskId);
    }

    return await this.prisma.session.create({
      data: { ...dto },
    });
  }

  async stopSession(user: User, taskId: number) {
    const task = await this.validateTaskAccess(user, taskId);
    const activeSession = await this.prisma.session.findFirst({
      where: { taskId, endTime: null },
    });

    if (!activeSession) {
      throw new BadRequestException('No active session');
    }
    const updated_session = await this.stopSessionUtil(activeSession.id);
    if (task.integratedTaskId) {
      const session = await this.logToIntegrations(
        user,
        task.integratedTaskId,
        updated_session,
      );
      if (!session) {
        throw new BadRequestException({
          message: 'Session canceled due to insufficient time',
        });
      }
    }
    return updated_session;
  }

  async validateTaskAccess(user: User, taskId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    if (task.userId !== user.id) {
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
    const updated_integration = await this.updateIntegration(user);
    if (!updated_integration) {
      return null;
    }

    this.addWorkLog(
      session.startTime,
      integratedTaskId as unknown as string,
      this.timeConverter(timeSpent),
      updated_integration,
    );
    return { success: true, msg: 'successfully updated to jira' };
  }

  async updateIntegration(user: User) {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const headers: any = { 'Content-Type': 'application/json' };
    const integration = await this.prisma.integration.findFirst({
      where: { userId: user.id, type: IntegrationType.JIRA },
    });
    if (!integration) {
      throw new APIException('You have no integration', HttpStatus.BAD_REQUEST);
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      refresh_token: integration?.refreshToken,
    };

    const tokenResp = (
      await lastValueFrom(this.httpService.post(tokenUrl, data, headers))
    ).data;

    const updated_integration = await this.prisma.integration.update({
      where: { id: integration?.id },
      data: {
        accessToken: tokenResp.access_token,
        refreshToken: tokenResp.refresh_token,
      },
    });
    return updated_integration;
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
      console.log(workLog);
      return workLog;
    } catch (err) {
      console.log(err.message);
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
      const startTime = new Date(`${dto.startTime}`);
      const endTime = new Date(`${dto.endTime}`);
      const { integratedTaskId, id } = await this.validateTaskAccess(
        user,
        dto.taskId,
      );
      const updated_integration = await this.updateIntegration(user);

      const timeSpent = Math.ceil(
        (endTime.getTime() - startTime.getTime()) / 1000,
      );
      if (timeSpent < 60) {
        throw new APIException(
          'Insufficient TimeSpent',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (updated_integration) {
        await this.addWorkLog(
          startTime,
          integratedTaskId as unknown as string,
          this.timeConverter(Number(timeSpent)),
          updated_integration,
        );
      }
      if (id)
        return await this.prisma.session.create({
          data: {
            startTime: startTime,
            endTime: endTime,
            status: SessionStatus.STOPPED,
            taskId: id,
            authorId: updated_integration.jiraAccountId,
          },
        });
      else {
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
}

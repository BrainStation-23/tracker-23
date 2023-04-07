import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IntegrationType,
  Session,
  SessionStatus,
  Status,
  User,
} from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionDto } from './dto';
import axios from 'axios';

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
      data: { status: Status.IN_PROGRESS },
    });

    const activeSession = await this.prisma.session.findFirst({
      where: { taskId: dto.taskId, endTime: null },
    });

    if (activeSession) {
      const updated_sesssion = await this.stopSessionUtil(activeSession.id);
      await this.logToIntegrations(user.id, dto.taskId, updated_sesssion);
    }

    return await this.prisma.session.create({
      data: { ...dto, userId: user.id },
    });
  }

  async stopSession(user: User, taskId: number) {
    await this.validateTaskAccess(user, taskId);
    const activeSession = await this.prisma.session.findFirst({
      where: { taskId, endTime: null },
    });

    if (!activeSession) {
      throw new BadRequestException('No active session');
    }
    const updated_session = await this.stopSessionUtil(activeSession.id);
    const session = await this.logToIntegrations(
      user.id,
      taskId,
      updated_session,
    );
    if (!session) {
      throw new BadRequestException({
        message: 'Session canceled due to insufficient time',
      });
    }
    return updated_session;
  }

  async validateTaskAccess(user: User, taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    if (task.userId !== user.id) {
      throw new UnauthorizedException('You do not have access to this task');
    }
  }

  async stopSessionUtil(sessionId: number) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { endTime: new Date(), status: SessionStatus.STOPPED },
    });
  }

  async logToIntegrations(userId: number, taskId: number, session: Session) {
    if (session.endTime == null) {
      return null;
    }
    const timeSpent = Math.ceil(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000,
    );
    if (timeSpent < 60) {
      return null;
    }
    const jiraIntegration = await this.prisma.integration.findFirst({
      where: {
        type: IntegrationType.JIRA,
        userId: userId,
      },
    });
    if (!jiraIntegration) {
      return null;
    }

    const taskIntegration = await this.prisma.taskIntegration.findFirst({
      where: {
        taskId,
      },
    });

    this.addWorkLog(
      taskIntegration?.integratedTaskId as unknown as string,
      this.timeConverter(timeSpent),
      await this.updatedIntegration(jiraIntegration),
    );
    return { success: true, msg: 'successfully updated to jira' };
  }

  async updatedIntegration(jiraIntegration: any) {
    const headers: any = { 'Content-Type': 'application/json' };
    const data = {
      grant_type: 'refresh_token',
      client_id: this.config.get('JIRA_CLIENT_ID'),
      client_secret: this.config.get('JIRA_SECRET_KEY'),
      refresh_token: jiraIntegration.refreshToken,
    };
    const tokenUrl = 'https://auth.atlassian.com/oauth/token';

    const tokenResp = (
      await lastValueFrom(this.httpService.post(tokenUrl, data, headers))
    ).data;

    return await this.prisma.integration.update({
      where: { id: jiraIntegration.id },
      data: {
        accessToken: tokenResp.access_token,
        refreshToken: tokenResp.refresh_token,
      },
    });
  }

  timeConverter(timeSpent: number) {
    if (!timeSpent) {
      return 0 + 'm';
    }
    timeSpent = Math.ceil(timeSpent / 60);
    return timeSpent + 'm';
  }

  async addWorkLog(
    issueId: string,
    timeSpentReqBody: string,
    integration: any,
  ) {
    try {
      const url = `https://api.atlassian.com/ex/jira/${integration.siteId}/rest/api/3/issue/${issueId}/worklog`;
      const data = JSON.stringify({
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
      return await (
        await axios(config)
      ).data;
    } catch (err) {
      console.log(err.message);
    }
  }
}

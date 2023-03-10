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
import { AxiosHeaders } from 'axios';
import { session } from 'passport';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionDto } from './dto';

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
      data: { ...dto },
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
    await this.logToIntegrations(user.id, taskId, updated_session);
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
      return;
    }
    const timeSpent =
      session.endTime.getSeconds() - session.startTime.getSeconds() + 60;

    if (timeSpent < 60) {
      return;
    }

    const jiraIntegration = await this.prisma.integration.findFirst({
      where: {
        type: IntegrationType.JIRA,
        userId: userId,
      },
    });

    if (!jiraIntegration) {
      return;
    }

    const taskIntegrations = await this.prisma.taskIntegration.findMany({
      where: {
        taskId,
      },
    });

    console.log(taskIntegrations);

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

    const updated_integration = await this.prisma.integration.update({
      where: { id: jiraIntegration.id },
      data: {
        accessToken: tokenResp.access_token,
        refreshToken: tokenResp.refresh_token,
      },
    });

    const worklogHeader = new AxiosHeaders();
    worklogHeader.setContentType('application/json');
    worklogHeader.setAuthorization('Bearer ' + updated_integration.accessToken);
    worklogHeader.setAccept('application/json');

    taskIntegrations.forEach(async (taskIntegration) => {
      const worklogUrl = `https://api.atlassian.com/ex/jira/${jiraIntegration.siteId}/rest/api/3/issue/${taskIntegration.integratedTaskId}/worklog`;
      // const worklogUrl =
      // 'https://api.atlassian.com/ex/jira/0f06b500-1b44-4005-a147-5b2ebe38c710/rest/api/3/issue/10002/worklog';
      const isoString = session.startTime.toISOString();
      const formattedString = isoString.slice(0, -1) + '+0000';
      const bodyData = {
        comment: {
          content: [
            {
              content: [
                {
                  text: 'I did some work here.',
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
        started: formattedString,
        timeSpentSeconds: timeSpent,
      };
      console.log(jiraIntegration.accessToken);
      console.log(worklogUrl);
      console.log(JSON.stringify(bodyData));

      try {
        const worklogResp = (
          await lastValueFrom(
            this.httpService.post(worklogUrl, bodyData, { ...worklogHeader }),
          )
        ).data;
        console.log('========================');

        console.log(worklogResp);

        if (worklogResp.status == 201) {
          console.log('successfully updated');
        }
      } catch (error) {
        console.error(error);
      }
    });
    return { success: true, msg: 'successfully updated to jira' };
  }
}

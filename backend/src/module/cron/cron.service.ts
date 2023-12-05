import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { TasksService } from '../tasks/tasks.service'; // Import your TasksService
import { PrismaService } from '../prisma/prisma.service';
import { APIException } from '../exception/api.exception';
import { SessionsService } from '../sessions/sessions.service';
import { EmailService } from '../email/email.service';
import * as fs from 'fs';
import * as ejs from 'ejs';
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly sessionsService: SessionsService,
    private readonly emailService: EmailService,
  ) {
    // Schedule the cron job to run every day at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        // Add your cron job logic here
        const integrations = await this.prisma.integration.findMany({
          select: {
            Projects: {
              where: {
                integrated: true,
              },
            },
            userIntegrations: {
              select: {
                userWorkspace: {
                  select: {
                    user: true,
                  },
                },
              },
            },
          },
        });
        for (const integration of integrations) {
          const user = integration.userIntegrations[0].userWorkspace.user;
          integration.Projects.map(async (project) => {
            await this.tasksService.syncTasks(user, project.id);
          });
        }
      } catch (error) {
        throw new APIException(
          `Error in syncTasks: ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    cron.schedule('0 6 * * 0', async () => {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
        },
      });
      for (const user of users) {
        const sendWeeklyTime = await this.sessionsService.sendWeeklyTimeSheet(
          user.id,
        );
        const template = fs.readFileSync(
          'src/utils/htmlTemplates/weeklySpentTime.html',
          'utf8',
        );
        const html = ejs.render(template, { data: sendWeeklyTime });
        await this.emailService.sendEmail('Weekly Time log', html, user.email);
      }
    });
  }
}

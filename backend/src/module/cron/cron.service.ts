import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { TasksService } from '../tasks/tasks.service'; // Import your TasksService
import { PrismaService } from '../prisma/prisma.service';
import { APIException } from '../exception/api.exception';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
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
  }
}

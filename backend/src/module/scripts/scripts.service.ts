import { IntegrationDatabase } from 'src/database/integrations';
import { ProjectDatabase } from 'src/database/projects';

import { HttpStatus, Injectable } from '@nestjs/common';
import { Scripts } from '@prisma/client';

import { APIException } from '../exception/api.exception';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class ScriptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly integrationDatabase: IntegrationDatabase,
    private readonly projectDatabase: ProjectDatabase,
  ) {}
  async migratePrioritySchema() {
    const projects = await this.prisma.project.findMany({
      where: {
        integrated: true,
      },
      include: {
        integration: {
          include: {
            userIntegrations: true,
          },
        },
        priorities: true,
      },
    });
    for (const project of projects) {
      if (project?.priorities?.length === 0 && project.projectId) {
        if (
          project.integration &&
          project.integration?.userIntegrations.length > 0
        ) {
          const priorityList = await this.tasksService.importPriorities(
            project,
            project.integration?.userIntegrations[0],
          );
          for (let index = 0, len = priorityList.length; index < len; index++) {
            const element = priorityList[index];
            const tasks = await this.prisma.task.findMany({
              where: {
                projectId: project.id,
                priority: element.name.toUpperCase(),
              },
            });
            for (
              let index = 0, taskLen = tasks.length;
              index < taskLen;
              index++
            ) {
              const task = tasks[index];
              await this.prisma.task.update({
                where: {
                  id: task.id,
                },
                data: {
                  priority: element.name,
                },
              });
            }
          }
        } else if (
          project.integration &&
          project.integration?.userIntegrations.length === 0
        ) {
          await this.integrationDatabase.deleteIntegrationById(
            project.integration?.id,
          );
        }
      } else if (
        project?.priorities?.length === 0 &&
        project.source === 'T23'
      ) {
        const priorityList =
          await this.projectDatabase.createLocalPrioritiesWithTransactionPrismaInstance(
            project?.id,
          );

        for (let index = 0, len = priorityList.length; index < len; index++) {
          const element = priorityList[index];
          const tasks = await this.prisma.task.findMany({
            where: {
              projectId: project.id,
              priority: element.name.toUpperCase(),
            },
          });
          for (
            let index = 0, taskLen = tasks.length;
            index < taskLen;
            index++
          ) {
            const task = tasks[index];
            await this.prisma.task.update({
              where: {
                id: task.id,
              },
              data: {
                priority: element.name,
              },
            });
          }
        }
      }
    }
  }

  async migrateOutlookSchema() {
    try {
      let scriptStatus: Scripts | null = await this.prisma.scripts.findUnique({
        where: { key: 'outlook-migration-1' },
      });
      console.log(
        '🚀 ~ file: scripts.service.ts:117 ~ ScriptsService ~ migrateOutlookSchema ~ scriptStatus:',
        scriptStatus,
      );
      if (!scriptStatus) {
        await this.prisma.scripts.create({
          data: {
            key: 'outlook-migration-1',
            title: 'Outlook Migration',
            description: 'Outlook Migration',
          },
        });
        scriptStatus = await this.prisma.scripts.findUnique({
          where: { key: 'outlook-migration-1' },
        });
      }
      console.log(
        '🚀 ~ file: scripts.service.ts:132 ~ ScriptsService ~ migrateOutlookSchema ~ scriptStatus:',
        scriptStatus,
      );
      if (scriptStatus?.done)
        return { message: 'Outlook Migration already done! ' };
      // update wrong integrations
      await this.prisma.integration.updateMany({
        where: {
          type: {
            not: {
              in: ['JIRA', 'TRACKER23', 'OUTLOOK'],
            },
          },
        },
        data: {
          type: 'JIRA',
        },
      });

      await this.prisma.task.updateMany({
        where: {
          source: {
            not: {
              in: ['JIRA', 'TRACKER23', 'OUTLOOK'],
            },
          },
        },
        data: {
          source: 'TRACKER23',
          dataSource: 'Tracker 23',
        },
      });

      const allIntegrations = await this.prisma.integration.findMany({
        include: {
          Projects: true,
        },
      });

      for (const integration of allIntegrations) {
        const projectids = [];
        for (let i = 0; i < integration?.Projects?.length; i++) {
          projectids.push(integration?.Projects[i].id);
        }
        await this.prisma.task.updateMany({
          where: {
            projectId: { in: projectids },
          },
          data: {
            source: integration.type,
            dataSource: integration.site ? integration.site : '',
          },
        });
      }
      await this.prisma.scripts.update({
        where: { key: 'outlook-migration-1' },
        data: {
          done: true,
        },
      });
      return { message: 'Outlook Migration Successful' };
    } catch (error) {
      console.log(
        '🚀 ~ file: scripts.service.ts:118 ~ ScriptsService ~ migrateOutlookSchema ~ error:',
        error,
      );
      try {
        await this.prisma.scripts.update({
          where: { key: 'outlook-migration-1' },
          data: {
            done: false,
          },
        });
      } catch (error) {
        console.log(
          '🚀 ~ file: scripts.service.ts:128 ~ ScriptsService ~ migrateOutlookSchema ~ error:',
          error,
        );
        throw new APIException(
          'Migration Failed - Failed to upgrade outlook-migration',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new APIException(
        'Migration Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

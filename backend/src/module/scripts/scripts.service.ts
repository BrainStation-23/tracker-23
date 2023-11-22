import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';
import { IntegrationDatabase } from 'src/database/integrations';
import { ProjectDatabase } from 'src/database/projects';

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
}

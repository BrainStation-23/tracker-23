import { HttpStatus, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { IntegrationsService } from "src/integrations/integrations.service";
import { APIException } from "src/internal/exception/api.exception";
import { PrismaService } from "src/prisma/prisma.service";
import { SprintsService } from "src/sprints/sprints.service";
import { StatusEnum } from "src/tasks/dto";
import { TasksService } from "src/tasks/tasks.service";
import { WorkspacesService } from "src/workspaces/workspaces.service";
import { Response } from 'express';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
    private workspacesService: WorkspacesService,
    private tasksService: TasksService,
    private sprintService: SprintsService,
  ) {}

  async importProjects(user: User, projId: number, res?: Response) {
    const project = await this.prisma.project.findUnique({
      where: { id: projId },
      include: { integration: true },
    });

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'Can not import project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }

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
      await this.tasksService.handleIntegrationFailure(user);
      return [];
    }

    res && (await this.tasksService.syncCall(StatusEnum.IN_PROGRESS, user));

    this.tasksService.setProjectStatuses(project, updatedUserIntegration);

    try {
      await this.tasksService.sendImportingNotification(user);
      await this.tasksService.fetchAndProcessTasksAndWorklog(
        userWorkspace,
        user,
        project,
        updatedUserIntegration,
      );
      await this.sprintService.createSprintAndTask(
        user,
        projId,
        updatedUserIntegration.id,
      );
      await this.tasksService.updateProjectIntegrationStatus(projId);
      res && (await this.tasksService.syncCall(StatusEnum.DONE, user));
      await this.tasksService.sendImportedNotification(user, res);
    } catch (error) {
      await this.tasksService.handleImportFailure(user);
      throw new APIException(
        'Can not import project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProject(user: User, id: number, res: Response) {
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

  async getProjectList(user: User) {
    return await this.prisma.project.findMany({
      where: {
        workspaceId: user.activeWorkspaceId,
      },
    });
  }
}
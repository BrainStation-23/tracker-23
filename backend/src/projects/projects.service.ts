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
import { UpdateProjectRequest } from "./dto/update.project.dto";

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
        await this.prisma.project.update({
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

  async createProject(user: User, projectName: string) {
    if (!user || (user && !user?.activeWorkspaceId))
      throw new APIException(
        'No userworkspace detected',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const newProject = await this.prisma.project.create({
        data: {
          projectName: projectName,
          source: 'T23',
          integrated: true,
          workspaceId: user?.activeWorkspaceId,
        },
        select: {
          id: true,
        },
      });

      if (!newProject)
        throw new APIException(
          'Project could not be created',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      await this.prisma.statusDetail.createMany({
        data: [
          {
            name: 'To Do',
            statusCategoryName: 'TO_DO',
            projectId: newProject.id,
          },
          {
            name: 'In Progress',
            statusCategoryName: 'IN_PROGRESS',
            projectId: newProject.id,
          },
          {
            name: 'Done',
            statusCategoryName: 'DONE',
            projectId: newProject.id,
          },
        ],
      });

      return newProject;
    } catch (error) {
      console.log(error);
      throw new APIException(
        'Could not create new project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProject(user: User, id: number, data: UpdateProjectRequest) {
    if (!user || (user && !user?.activeWorkspaceId))
      throw new APIException(
        'No userworkspace detected',
        HttpStatus.BAD_REQUEST,
      );

    try {
      const existingProject = await this.prisma.project.findFirst({
        where: {
          id: id,
          workspaceId: user?.activeWorkspaceId,
        },
      });

      if(!existingProject) throw new APIException('Invalid project ID', HttpStatus.BAD_REQUEST);

      return await this.prisma.project.update({
        where: {
          id: id,
        },
        data: data,
      });
    } catch (error) {
      console.log(error);
      throw new APIException('Could not update project', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
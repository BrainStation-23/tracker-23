import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';

import { UpdateProjectRequest } from './dto/update.project.dto';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TasksService } from '../tasks/tasks.service';
import { SprintsService } from '../sprints/sprints.service';
import { APIException } from '../exception/api.exception';
import { StatusEnum } from '../tasks/dto';
import { ProjectDatabase } from 'src/database/projects';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';

@Injectable()
export class ProjectsService {
  constructor(
    private integrationsService: IntegrationsService,
    private workspacesService: WorkspacesService,
    private tasksService: TasksService,
    private sprintService: SprintsService,
    private projectDatabase: ProjectDatabase,
    private userIntegrationDatabase: UserIntegrationDatabase,
  ) {}

  async importProjects(user: User, projId: number, res?: Response) {
    const project = await this.projectDatabase.getProjectByIdWithIntegration(
      projId,
    );
    if (!project)
      throw new APIException('Invalid Project Id', HttpStatus.BAD_REQUEST);

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegration =
      project?.integrationId &&
      (await this.userIntegrationDatabase.getUserIntegration({
          userIntegrationIdentifier: {
            integrationId: project?.integrationId,
            userWorkspaceId: userWorkspace.id,
          },
      }));

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
      await this.tasksService.sendImportedNotification(
        user,
        'Project Imported',
        res,
      );
    } catch (error) {
      await this.tasksService.handleImportFailure(
        user,
        'Importing Tasks Failed',
      );
      console.log(
        '🚀 ~ file: tasks.service.ts:752 ~ TasksService ~ importProjectTasks ~ error:',
        error,
      );
      throw new APIException(
        'Can not import project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProject(user: User, id: number, res: Response) {
    const project = await this.projectDatabase.getProject(
      { id },
      { integration: true },
    );

    if (!project) {
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }

    const deletedTasks = await this.projectDatabase.deleteTasksByProjectId(id);
    if(!deletedTasks) throw new APIException('Invalid Project ID', HttpStatus.BAD_REQUEST);

    const updatedProject = await this.projectDatabase.updateProjectById(id, { integrated: false });
    if(!updatedProject) throw new APIException('Could not update project', HttpStatus.INTERNAL_SERVER_ERROR);

    return res.status(202).json({ message: 'Project Deleted' });
  }

  async getProjectList(user: User) {
    if (!user || !user.activeWorkspaceId)
      throw new APIException(
        'User workspaces not detected',
        HttpStatus.BAD_REQUEST,
      );

    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrations(user);

    const jiraIntegrationIds = getUserIntegrationList?.map(
      (userIntegration: any) => userIntegration?.integration?.id,
    );

    const projects = await this.projectDatabase.getProjects({
      integrationId: {
        in: jiraIntegrationIds?.map((id: any) => Number(id)),
      },
      workspaceId: user.activeWorkspaceId,
    });
    if(!projects) throw new APIException('Could not find projects', HttpStatus.INTERNAL_SERVER_ERROR);

    let localProjects =
      user.activeWorkspaceId &&
      (await this.projectDatabase.getLocalProjects({
        source: 'T23',
        workspaceId: user.activeWorkspaceId,
        integrated: true,
      }));

    if(!localProjects) localProjects = [];
    
    return [...projects, ...localProjects];
  }

  async createProject(user: User, projectName: string) {
    if (!user || (user && !user?.activeWorkspaceId))
      throw new APIException(
        'No userworkspace detected',
        HttpStatus.BAD_REQUEST,
      );

    const projectExists = await this.projectDatabase.getProject({
      projectName,
      source: 'T23',
      workspaceId: user?.activeWorkspaceId,
    },{
      integration: true,
    });

    if (projectExists)
      throw new APIException(
        'Project name already exists',
        HttpStatus.BAD_REQUEST,
      );

    const newProject =
      user?.activeWorkspaceId &&
      (await this.projectDatabase.createProject(
        projectName,
        user?.activeWorkspaceId,
      ));

    if (!newProject)
      throw new APIException(
        'Project could not be created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const statusCreated = await this.projectDatabase.createStatusDetail(newProject?.id);
    if(!statusCreated) throw new APIException('Could not create status', HttpStatus.INTERNAL_SERVER_ERROR);

    return newProject;
  }

  async updateProject(user: User, id: number, data: UpdateProjectRequest) {
    if (!user || (user && !user?.activeWorkspaceId))
      throw new APIException(
        'No userworkspace detected',
        HttpStatus.BAD_REQUEST,
      );

    const existingProject =
      user?.activeWorkspaceId &&
      (await this.projectDatabase.getProject({
        id: id,
        workspaceId: user?.activeWorkspaceId,
      }));

    if (!existingProject)
      throw new APIException('Invalid project ID', HttpStatus.BAD_REQUEST);

    const updatedProject = await this.projectDatabase.updateProjectById(id, data);
    if(!updatedProject) throw new APIException('Could not update project', HttpStatus.BAD_REQUEST);

    return updatedProject;
  }
}

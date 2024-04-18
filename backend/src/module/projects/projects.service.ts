import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IntegrationType,
  Project,
  Role,
  SessionStatus,
  User,
  UserIntegration,
  UserWorkspace,
} from '@prisma/client';
import { Response } from 'express';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TasksService } from '../tasks/tasks.service';
import { SprintsService } from '../sprints/sprints.service';
import { APIException } from '../exception/api.exception';
import { StatusEnum } from '../tasks/dto';
import { ProjectDatabase } from 'src/database/projects';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { ConfigService } from '@nestjs/config';
import { RegisterWebhookDto } from '../webhooks/dto';
import { JiraService } from '../jira/jira.service';
import { ImportCalendarProjectQueryDto, UpdateProjectRequest } from './dto';
import { TasksDatabase } from 'src/database/tasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { JiraClientService } from '../helper/client';
import * as dayjs from 'dayjs';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class ProjectsService {
  constructor(
    private integrationsService: IntegrationsService,
    private workspacesService: WorkspacesService,
    private tasksService: TasksService,
    private sprintService: SprintsService,
    private projectDatabase: ProjectDatabase,
    private userIntegrationDatabase: UserIntegrationDatabase,
    private prisma: PrismaService,
    private readonly webhooksService: WebhooksService,
    private readonly config: ConfigService,
    private readonly jiraService: JiraService,
    private readonly tasksDatabase: TasksDatabase,
    private jiraApiCalls: JiraApiCalls,
    private jiraClient: JiraClientService,
    private reportService: ReportsService,
  ) {}

  async importProject(user: User, projId: number, res?: Response) {
    const project = await this.projectDatabase.getProjectByIdWithIntegration(
      projId,
    );
    if (!project) {
      await this.tasksService.sendImportedNotification(
        user,
        'Failed to import the project!',
      );
      throw new APIException('Invalid Project Id', HttpStatus.BAD_REQUEST);
    }
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      await this.tasksService.sendImportedNotification(
        user,
        'Failed to import the project!',
      );
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegration =
      project?.integrationId &&
      (await this.tasksService.getUserIntegration(
        userWorkspace.id,
        project.integrationId,
      ));

    let updatedUserIntegration: any;
    if (
      userWorkspace.role === Role.ADMIN &&
      !userIntegration &&
      userWorkspace?.workspaceId
    ) {
      const userIntegrations = await this.tasksDatabase.getUserIntegrations({
        workspaceId: userWorkspace.workspaceId,
      });
      for (let index = 0; index < userIntegrations.length; index++) {
        const userIntegration = userIntegrations[index];
        updatedUserIntegration =
          userIntegration &&
          (await this.integrationsService.getUpdatedUserIntegrationForOthers(
            user,
            userIntegration,
          ));

        if (updatedUserIntegration) {
          break;
        }
      }
    } else {
      updatedUserIntegration =
        userIntegration &&
        (await this.integrationsService.getUpdatedUserIntegration(
          user,
          userIntegration.id,
        ));
    }

    if (!updatedUserIntegration) {
      Promise.allSettled([
        await this.tasksService.sendImportedNotification(
          user,
          'Syncing Failed!',
        ),
        await this.tasksService.syncCall(StatusEnum.FAILED, user),
      ]);
      throw new APIException(
        'UserIntegration not found. Could not import project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (userIntegration && project.projectKey && userIntegration?.siteId) {
      const doesExistWebhook = await this.prisma.webhook.findMany({
        where: {
          siteId: userIntegration?.siteId,
          projectKey: {
            hasSome: [project.projectKey],
          },
        },
      });
      const host = this.config.get('WEBHOOK_HOST');
      if (!doesExistWebhook.length && host) {
        const payload: RegisterWebhookDto = {
          url: `${host}/webhook/receiver`,
          webhookEvents: [
            'jira:issue_created',
            'jira:issue_updated',
            'jira:issue_deleted',
            // 'sprint_started',
            // 'sprint_closed',
          ],
          projectName: [project.projectKey],
          userIntegrationId: userIntegration?.id || 0,
        };
        await this.webhooksService.registerWebhook(user, payload);
      }
    }

    try {
      Promise.allSettled([
        res && (await this.tasksService.syncCall(StatusEnum.IN_PROGRESS, user)),

        await this.tasksService.setProjectStatuses(
          project,
          updatedUserIntegration,
        ),
        await this.tasksService.importPriorities(
          project,
          updatedUserIntegration,
        ),
        await this.tasksService.sendImportedNotification(
          user,
          'Importing Project in progress!',
        ),
        await this.tasksService.fetchAndProcessTasksAndWorklog(
          user,
          project,
          updatedUserIntegration,
        ),
        await this.sprintService.createSprintAndTask(
          user,
          project,
          updatedUserIntegration,
        ),
        await this.tasksService.updateProjectIntegrationStatus(projId),
        res && (await this.tasksService.syncCall(StatusEnum.DONE, user)),
        await this.tasksService.sendImportedNotification(
          user,
          'Project Imported Successfully!',
          res,
        ),
      ]),
        res?.json({ message: 'Project Imported Successfully' });
    } catch (error) {
      await this.tasksService.sendImportedNotification(
        user,
        'Importing Tasks Failed',
      );
      console.log(
        '🚀 ~ file: tasks.service.ts:752 ~ TasksService ~ importProjectTasks ~ error:',
        error,
      );
      throw new APIException(
        'Could not import project tasks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async importCalendarProject(
    user: User,
    query: ImportCalendarProjectQueryDto,
    res?: Response,
  ) {
    const projectIds = query.projectIds as unknown as string;
    const projectIdArray =
      projectIds && projectIds.split(',').map((item) => Number(item.trim()));
    const projects = await this.projectDatabase.getProjects({
      id: { in: projectIdArray },
    });

    if (!projects.length) {
      await this.tasksService.sendImportedNotification(
        user,
        'Failed to import the Calender!',
      );
      throw new APIException('Invalid Calender Id!', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (!userWorkspace) {
      await this.tasksService.sendImportedNotification(
        user,
        'Failed to import the Calender!',
      );
      throw new APIException(
        'User workspace not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userIntegration =
      projects[0]?.integrationId &&
      (await this.userIntegrationDatabase.getUserIntegration({
        UserIntegrationIdentifier: {
          integrationId: projects[0]?.integrationId,
          userWorkspaceId: userWorkspace.id,
        },
      }));

    if (!userIntegration) {
      await this.tasksService.sendImportedNotification(
        user,
        'Failed to import the Calender!',
      );
      throw new APIException(
        'User Integration not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.tasksService.sendImportedNotification(
        user,
        'Importing Calendar in progress!',
      );

      for (let index = 0, len = projects.length; index < len; index++) {
        const project = projects[index];
        project?.calendarId &&
          (await this.webhooksService.registerOutlookWebhook(
            user,
            project.calendarId,
          ));
        Promise.allSettled([
          await this.fetchCalendarEvents(
            user,
            userWorkspace,
            project,
            userIntegration,
          ),
          await this.tasksService.updateProjectIntegrationStatus(project.id),
        ]);
      }
      Promise.allSettled([
        res && (await this.tasksService.syncCall(StatusEnum.DONE, user)),
        await this.tasksService.sendImportedNotification(
          user,
          'Calender Imported Successfully!',
          res,
        ),
      ]);
      res?.json({ message: 'Calender Imported Successfully!' });
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:752 ~ TasksService ~ importProjectTasks ~ error:',
        error,
      );
      await this.tasksService.sendImportedNotification(
        user,
        'Failed to import the Calender!',
      );
      throw new APIException(
        'Could not import Calendar Events',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProject(user: User, id: number, res: Response) {
    const project = await this.projectDatabase.getProjectWithRes(
      { id },
      { integration: true },
    );

    if (!project) {
      throw new APIException('Project Not Found', HttpStatus.BAD_REQUEST);
    }
    await this.reportService.updateReportConfig(user, { projectIds: [id] });
    Promise.allSettled([
      await this.projectDatabase.deleteTasksByProjectId(id),
      await this.projectDatabase.deleteSprintByProjectId(id),
      await this.projectDatabase.deleteStatusDetails(id),
      await this.projectDatabase.deletePriorities(id),
      project?.calendarId &&
        (await this.webhooksService.deleteLocalWebhook({
          calenderId: project?.calendarId,
        })),
    ]);

    const updatedProject =
      project.source === 'T23'
        ? await this.projectDatabase.deleteLocalProject(project?.id)
        : await this.projectDatabase.updateProjectById(id, {
            integrated: false,
          });
    if (!updatedProject) {
      throw new APIException(
        'Could not delete project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return res.status(202).json({ message: 'Project Deleted' });
  }

  async getProjectList(user: User) {
    if (!user || !user?.activeWorkspaceId)
      throw new APIException(
        'User workspaces not detected',
        HttpStatus.BAD_REQUEST,
      );

    const getUserIntegrationList =
      await this.integrationsService.getUserIntegrationsByRole(user);

    const jiraIntegrationIds = getUserIntegrationList?.map(
      (userIntegration: any) => userIntegration?.integration?.id,
    );

    const projects = await this.projectDatabase.getProjects({
      integrationId: {
        in: jiraIntegrationIds?.map((id: any) => Number(id)),
      },
      workspaceId: user.activeWorkspaceId,
    });
    if (!projects)
      throw new APIException(
        'Could not find projects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    let localProjects =
      user?.activeWorkspaceId &&
      (await this.projectDatabase.getLocalProjects({
        source: 'T23',
        workspaceId: user.activeWorkspaceId,
        integrated: true,
      }));

    if (!localProjects) localProjects = [];
    return [
      ...projects.map((project) => {
        return {
          ...project,
          integrationType: project.integration?.type,
        };
      }),
      ...localProjects.map((project) => {
        return {
          ...project,
          integrationType: IntegrationType.TRACKER23,
        };
      }),
    ];
  }

  async createProject(user: User, projectName: string) {
    if (!user || (user && !user?.activeWorkspaceId))
      throw new APIException(
        'No UserWorkspace detected',
        HttpStatus.BAD_REQUEST,
      );

    const projectExists = await this.projectDatabase.getProjectWithRes(
      {
        projectName,
        source: 'T23',
        workspaceId: user?.activeWorkspaceId,
      },
      {
        integration: true,
      },
    );

    if (projectExists)
      throw new APIException(
        'Project name already exists',
        HttpStatus.BAD_REQUEST,
      );
    const newProject = await this.prisma.$transaction(async (prisma: any) => {
      const projectCreated =
        user?.activeWorkspaceId &&
        (await this.projectDatabase.createProject(
          projectName,
          user?.activeWorkspaceId,
          prisma,
        ));

      if (!projectCreated)
        throw new APIException(
          'Could not create project!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const statusCreated = await this.projectDatabase.createStatusDetail(
        projectCreated?.id,
        prisma,
      );
      if (!statusCreated)
        throw new APIException(
          'Could not create status!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const priorities =
        await this.projectDatabase.createLocalPrioritiesWithTransactionPrismaInstance(
          projectCreated?.id,
          prisma,
        );
      if (!priorities) {
        throw new APIException(
          'Could not create priorities!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return projectCreated;
    });
    return await this.projectDatabase.getProjectWithRes(
      {
        id: newProject.id,
        workspaceId: user?.activeWorkspaceId,
      },
      {
        integration: true,
        statuses: true,
        priorities: true,
      },
    );
  }

  async updateProject(user: User, id: number, data: UpdateProjectRequest) {
    if (!user || (user && !user?.activeWorkspaceId))
      throw new APIException(
        'No UserWorkspace detected',
        HttpStatus.BAD_REQUEST,
      );

    const existingProject =
      user?.activeWorkspaceId &&
      (await this.projectDatabase.getProjectWithRes({
        id: id,
        workspaceId: user?.activeWorkspaceId,
      }));

    if (!existingProject)
      throw new APIException('Invalid project ID', HttpStatus.BAD_REQUEST);

    const updatedProject = await this.projectDatabase.updateProjectById(
      id,
      data,
    );
    if (!updatedProject)
      throw new APIException(
        'Could not update project',
        HttpStatus.BAD_REQUEST,
      );

    return updatedProject;
  }

  async getProjectsByRole(user: User) {
    const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    if (userWorkspace.role === Role.ADMIN) {
      const projects =
        user?.activeWorkspaceId &&
        (await this.projectDatabase.getProjectsWithStatusAndPriorities({
          workspaceId: user.activeWorkspaceId,
          integrated: true,
        }));
      if (!projects) {
        return [];
      }
      return projects;
    } else if (userWorkspace.role === Role.USER) {
      return await this.jiraService.getIntegratedProjectStatusesAndPriorities(
        user,
      );
    }
  }

  async fetchCalendarEvents(
    user: User,
    userWorkspace: UserWorkspace,
    project: Project,
    userIntegration: UserIntegration,
  ) {
    const settings = await this.tasksDatabase.getSettings(user);
    const givenTime: number = settings ? settings.syncTime : 6;
    const currentTime = dayjs();
    const syncPreviousTime = currentTime.subtract(givenTime, 'month');
    const syncNextTime = currentTime.add(givenTime, 'month');

    const iso8601SyncTime = syncPreviousTime.toISOString();
    const iso861CurrentTime = syncNextTime.toISOString();
    let url = `https://graph.microsoft.com/v1.0/me/calendars/${project.calendarId}/calendarView?startDateTime=${iso8601SyncTime}&endDateTime=${iso861CurrentTime}`;
    const mappedIssues = new Map<string, any>();
    const taskList: any[] = [],
      sessionArray: any[] = [];
    let events;

    do {
      events = null;
      events = await this.jiraClient.CallOutlook(
        userIntegration,
        this.jiraApiCalls.getCalendarEvents,
        url,
      );
      events.value.map((event: any) => {
        mappedIssues.set(event.id, event);
      });
      url = events['@odata.nextLink'];
    } while (url);

    const integratedEvents = await this.prisma.task.findMany({
      where: {
        workspaceId: user.activeWorkspaceId,
        integratedEventId: { in: [...mappedIssues.keys()] },
        source: IntegrationType.OUTLOOK,
      },
      select: {
        integratedEventId: true,
      },
    });
    // keep the task list that doesn't exist in the database
    for (let j = 0, len = integratedEvents.length; j < len; j++) {
      const key = integratedEvents[j]?.integratedEventId;
      key && mappedIssues.delete(key);
    }

    for (const [integratedEventId, integratedEvent] of mappedIssues) {
      taskList.push({
        userWorkspaceId: userWorkspace.id,
        workspaceId: project.workspaceId,
        title: integratedEvent.subject,
        projectName: project.projectName,
        projectId: project.id,
        integratedEventId,
        createdAt: new Date(integratedEvent.createdDateTime),
        updatedAt: new Date(integratedEvent.end.dateTime),
        jiraUpdatedAt: new Date(integratedEvent.lastModifiedDateTime),
        source: IntegrationType.OUTLOOK,
        dataSource: project.source,
        url: integratedEvent.webLink,
      });
    }
    const mappedEventId = new Map<string, number>();
    try {
      const [t, events] = await Promise.all([
        await this.prisma.task.createMany({
          data: taskList,
        }),
        await this.prisma.task.findMany({
          where: {
            projectId: project.id,
            source: IntegrationType.OUTLOOK,
          },
          select: {
            id: true,
            integratedEventId: true,
          },
        }),
      ]);

      for (let idx = 0; idx < events.length; idx++) {
        const event = events[idx];
        event.integratedEventId &&
          mappedEventId.set(event.integratedEventId, event.id);
      }
    } catch (err) {
      console.log(
        '🚀 ~ file: projects.service.ts:512 ~ ProjectsService ~ err:',
        err,
      );
      throw new APIException(
        'Could not import Calender Events',
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const [integratedEventId, integratedEvent] of mappedIssues) {
      const taskId = mappedEventId.get(integratedEventId);

      taskId &&
        sessionArray.push({
          startTime: new Date(integratedEvent.start.dateTime),
          endTime: new Date(integratedEvent.end.dateTime),
          taskId,
          status: SessionStatus.STOPPED,
          integratedEventId: integratedEvent.id,
          userWorkspaceId: userWorkspace.id,
        });
    }
    try {
      await this.prisma.session.createMany({
        data: sessionArray,
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: tasks.service.ts:986 ~ TasksService ~ error:',
        error,
      );
      throw new APIException(
        'Could not import Calender Events',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

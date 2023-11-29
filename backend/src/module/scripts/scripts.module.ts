import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { ScriptsController } from './scripts.controller';
import { TasksService } from '../tasks/tasks.service';
import { IntegrationDatabase } from 'src/database/integrations';
import { ProjectDatabase } from 'src/database/projects';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsService } from '../integrations/integrations.service';
import { MyGateway } from '../notifications/socketGateway';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from '../sprints/sprints.service';
import { TasksDatabase } from 'src/database/tasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { JiraClientService } from '../helper/client';
import { ProjectsService } from '../projects/projects.service';
import { JiraClient } from 'src/utils/jira';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { UsersDatabase } from 'src/database/users';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { SprintDatabase } from 'src/database/sprints';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { EmailService } from '../email/email.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { WebhooksService } from '../webhooks/webhooks.service';
import { SessionsService } from '../sessions/sessions.service';
import { SessionDatabase } from 'src/database/sessions';

@Module({
  imports: [HttpModule.register({})],
  controllers: [ScriptsController],
  providers: [
    ScriptsService,
    TasksService,
    WorkspacesService,
    WorkspaceDatabase,
    ProjectsService,
    TasksDatabase,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
    IntegrationDatabase,
    IntegrationsService,
    UserIntegrationDatabase,
    UsersDatabase,
    UserWorkspaceDatabase,
    JiraApiCalls,
    JiraClient,
    JiraClientService,
    MyGateway,
    SprintsService,
    EmailService,
    AuthService,
    JwtService,
    WebhooksService,
    SessionsService,
    SessionDatabase,
  ],
})
export class ScriptsModule {}

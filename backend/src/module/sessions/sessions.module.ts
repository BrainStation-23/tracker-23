import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionsController } from './sessions.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SessionsService } from './sessions.service';
import { TasksService } from '../tasks/tasks.service';
import { MyGateway } from '../notifications/socketGateway';
import { AuthService } from '../auth/auth.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { SprintsService } from '../sprints/sprints.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { TasksDatabase } from 'src/database/tasks';
import { UserWorkspaceDatabase } from '../../database/userWorkspaces';
import { SessionDatabase } from '../../database/sessions';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { IntegrationDatabase } from 'src/database/integrations';
import { NotificationModule } from '../notifications/notifications.module';
import { UsersDatabase } from 'src/database/users';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { JiraClient } from 'src/utils/jira';
import { JiraClientService } from '../helper/client';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule, NotificationModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    TasksService,
    AuthService,
    JwtService,
    IntegrationsService,
    WorkspacesService,
    SprintsService,
    EmailService,
    WorkspaceDatabase,
    TasksDatabase,
    UserWorkspaceDatabase,
    SessionDatabase,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
    IntegrationDatabase,
    UserIntegrationDatabase,
    UsersDatabase,
    JiraApiCalls,
    JiraClientService,
  ],
  exports: [SessionsService],
})
export class SessionsModule {}

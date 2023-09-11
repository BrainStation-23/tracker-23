import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { SessionsService } from '../sessions/sessions.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TasksService } from '../tasks/tasks.service';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { SessionDatabase } from 'src/database/sessions';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { MyGateway } from '../notifications/socketGateway';
import { SprintsService } from '../sprints/sprints.service';
import { TasksDatabase } from 'src/database/tasks';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { IntegrationDatabase } from 'src/database/integrations';

@Module({
  imports: [HttpModule.register({})],
  providers: [
    WebhooksService,
    IntegrationsService,
    SessionsService,
    WorkspacesService,
    TasksService,
    UserWorkspaceDatabase,
    SessionDatabase,
    WorkspaceDatabase,
    MyGateway,
    SprintsService,
    TasksDatabase,
    AuthService,
    JwtService,
    EmailService,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
    UserIntegrationDatabase,
    UserIntegrationDatabase,
    IntegrationDatabase,
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}

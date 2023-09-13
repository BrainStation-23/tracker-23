import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtService } from '@nestjs/jwt';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TasksService } from '../tasks/tasks.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from '../sprints/sprints.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { TasksDatabase } from 'src/database/tasks';
import { ProjectDatabase } from '../../database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { IntegrationDatabase } from 'src/database/integrations';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule, NotificationModule],
  providers: [
    TasksService,
    IntegrationsService,
    WorkspacesService,
    SprintsService,
    ProjectsService,
    AuthService,
    JwtService,
    EmailService,
    WorkspaceDatabase,
    TasksDatabase,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
    IntegrationDatabase,
    UserIntegrationDatabase,
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

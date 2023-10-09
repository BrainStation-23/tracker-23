import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsService } from './integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { IntegrationDatabase } from 'src/database/integrations';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { UsersDatabase } from 'src/database/users';
import { TasksDatabase } from 'src/database/tasks';
import { ProjectDatabase } from 'src/database/projects';
import { EmailService } from '../email/email.service';

@Module({
  imports: [HttpModule.register({}), WorkspacesModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    WorkspacesService,
    WorkspaceDatabase,
    IntegrationDatabase,
    UserIntegrationDatabase,
    UsersDatabase,
    TasksDatabase,
    ProjectDatabase,
    EmailService,
  ],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

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
  ],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

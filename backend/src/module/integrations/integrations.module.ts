import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsService } from './integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { IntegrationDatabase } from 'src/database/integrations';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [HttpModule.register({}), WorkspacesModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    WorkspacesService,
    WorkspaceDatabase,
    IntegrationDatabase,
    UserIntegrationDatabase,
  ],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

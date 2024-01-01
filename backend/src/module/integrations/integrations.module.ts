import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsService } from './integrations.service';
import { IntegrationDatabase } from 'src/database/integrations';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [HttpModule.register({}), WorkspacesModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    IntegrationDatabase,
    UserIntegrationDatabase,
  ],
  exports: [IntegrationsService, IntegrationDatabase, UserIntegrationDatabase],
})
export class IntegrationsModule {}

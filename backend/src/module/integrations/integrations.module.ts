import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsService } from './integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';

@Module({
  imports: [HttpModule.register({})],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, WorkspacesService, WorkspaceDatabase],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

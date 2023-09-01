import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from './sprints.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspaceDatabase } from 'src/database/workspaces';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  providers: [
    SprintsService,
    IntegrationsService,
    WorkspacesService,
    WorkspaceDatabase,
  ],
  controllers: [SprintsController],
  exports: [SprintsService],
})
export class SprintsModule {}

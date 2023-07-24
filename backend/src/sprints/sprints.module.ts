import { IntegrationsModule } from 'src/integrations/integrations.module';
import { SprintsController } from 'src/sprints/sprints.controller';
import { SprintsService } from 'src/sprints/sprints.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  providers: [SprintsService, IntegrationsService, WorkspacesService],
  controllers: [SprintsController],
  exports: [SprintsService],
})
export class SprintsModule {}

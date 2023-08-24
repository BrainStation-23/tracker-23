import { IntegrationsModule } from 'src/integrations/integrations.module';
import { SprintsService } from 'src/sprints/sprints.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TasksService } from 'src/tasks/tasks.service';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  providers: [
    TasksService,
    IntegrationsService,
    WorkspacesService,
    SprintsService,
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

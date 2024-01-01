import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SprintsService } from './sprints.service';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { TasksDatabase } from 'src/database/tasks';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsModule } from '../projects/projects.module';
import { HelperModule } from '../helper/helper.module';

@Module({
  imports: [
    HttpModule.register({}),
    IntegrationsModule,
    WorkspacesModule,
    ProjectsModule,
    HelperModule,
  ],
  providers: [
    SprintsService,
    SprintTaskDatabase,
    SprintDatabase,
    TasksDatabase,
    JiraApiCalls,
  ],
  controllers: [SprintsController],
  exports: [SprintsService],
})
export class SprintsModule {}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SprintsController } from './sprints.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from './sprints.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { TasksDatabase } from 'src/database/tasks';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { IntegrationDatabase } from 'src/database/integrations';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { UsersDatabase } from 'src/database/users';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  providers: [
    SprintsService,
    IntegrationsService,
    WorkspacesService,
    WorkspaceDatabase,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
    TasksDatabase,
    IntegrationDatabase,
    UserIntegrationDatabase,
    UsersDatabase,
  ],
  controllers: [SprintsController],
  exports: [SprintsService],
})
export class SprintsModule {}

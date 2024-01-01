import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SessionsService } from './sessions.service';
import { TasksService } from '../tasks/tasks.service';
import { SprintsService } from '../sprints/sprints.service';
import { TasksDatabase } from 'src/database/tasks';
import { SessionDatabase } from '../../database/sessions';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { NotificationModule } from '../notifications/notifications.module';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { HelperModule } from '../helper/helper.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    HttpModule.register({}),
    IntegrationsModule,
    NotificationModule,
    HelperModule,
    WorkspacesModule,
  ],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionDatabase,
    TasksService,
    TasksDatabase,
    SprintsService,
    SprintDatabase,
    SprintTaskDatabase,
    ProjectDatabase,
    JiraApiCalls,
  ],
  exports: [SessionsService, SessionDatabase],
})
export class SessionsModule {}

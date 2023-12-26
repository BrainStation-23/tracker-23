import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SprintsModule } from '../sprints/sprints.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TasksDatabase } from 'src/database/tasks';
import { NotificationModule } from '../notifications/notifications.module';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { HelperModule } from '../helper/helper.module';

@Module({
  imports: [
    HttpModule.register({}),
    SprintsModule,
    IntegrationsModule,
    NotificationModule,
    WorkspacesModule,
    HelperModule,
  ],
  providers: [TasksService, TasksDatabase, JiraApiCalls],
  controllers: [TasksController],
  exports: [TasksService, TasksDatabase],
})
export class TasksModule {}

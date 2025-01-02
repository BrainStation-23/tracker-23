import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SprintsModule } from '../sprints/sprints.module';
import { WorkerService } from './worker.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TasksDatabase } from 'src/database/tasks';
import { NotificationModule } from '../notifications/notifications.module';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { HelperModule } from '../helper/helper.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UsersDatabase } from 'src/database/users';
import { AzureDevApiCalls } from 'src/utils/azureDevApiCall/api';

@Module({
  imports: [
    HttpModule.register({}),
    SprintsModule,
    IntegrationsModule,
    NotificationModule,
    WorkspacesModule,
    HelperModule,
  ],
  providers: [
    WorkerService,
    TasksDatabase,
    JiraApiCalls,
    AuthService,
    JwtService,
    EmailService,
    UsersDatabase,
    AzureDevApiCalls,
  ],
  controllers: [],
  exports: [WorkerService],
})
export class WorkerModule {}

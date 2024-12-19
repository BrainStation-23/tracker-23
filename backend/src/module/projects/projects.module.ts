import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TasksService } from '../tasks/tasks.service';
import { SprintsService } from '../sprints/sprints.service';
import { TasksDatabase } from 'src/database/tasks';
import { ProjectDatabase } from '../../database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { NotificationModule } from '../notifications/notifications.module';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { HelperModule } from '../helper/helper.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { JiraService } from '../jira/jira.service';
import { ReportsModule } from '../reports/reports.module';
import { JwtService } from '@nestjs/jwt';
import { UsersDatabase } from 'src/database/users';
import { EmailService } from '../email/email.service';
import { AuthService } from '../auth/auth.service';
import { RabbitMQService } from '../queue/queue.service';
import { WorkerService } from '../worker/worker.service';
import { WebhookDatabase } from 'src/database/webhook';
import { AzureDevApiCalls } from 'src/utils/azureDevApiCall/api';

@Module({
  imports: [
    HttpModule.register({}),
    IntegrationsModule,
    NotificationModule,
    WorkspacesModule,
    HelperModule,
    WebhooksModule,
    ReportsModule,
  ],
  providers: [
    ProjectsService,
    ProjectDatabase,
    TasksService,
    TasksDatabase,
    SprintsService,
    SprintDatabase,
    SprintTaskDatabase,
    JiraApiCalls,
    AzureDevApiCalls,
    JiraService,
    AuthService,
    JwtService,
    EmailService,
    UsersDatabase,
    RabbitMQService,
    WorkerService,
    WebhookDatabase,
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService, ProjectDatabase],
})
export class ProjectsModule {}

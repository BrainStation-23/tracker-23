import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SessionsModule } from '../sessions/sessions.module';
import { HelperModule } from '../helper/helper.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { OutlookApiCalls } from 'src/utils/outlookApiCall/api';
import { WebhookDatabase } from 'src/database/webhook';
import { ProjectDatabase } from 'src/database/projects';
import { TasksDatabase } from 'src/database/tasks';

@Module({
  imports: [
    HttpModule.register({}),
    IntegrationsModule,
    SessionsModule,
    HelperModule,
    WorkspacesModule,
  ],
  providers: [
    WebhooksService,
    WebhookDatabase,
    JiraApiCalls,
    OutlookApiCalls,
    ProjectDatabase,
    TasksDatabase,
  ],
  controllers: [WebhooksController],
  exports: [WebhooksService],
})
export class WebhooksModule {}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SessionsModule } from '../sessions/sessions.module';
import { HelperModule } from '../helper/helper.module';

@Module({
  imports: [
    HttpModule.register({}),
    IntegrationsModule,
    SessionsModule,
    HelperModule,
  ],
  providers: [WebhooksService, JiraApiCalls],
  controllers: [WebhooksController],
  exports: [WebhooksService],
})
export class WebhooksModule {}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { SessionsService } from '../sessions/sessions.service';

@Module({
  imports: [HttpModule.register({})],
  providers: [WebhooksService, IntegrationsService, SessionsService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}

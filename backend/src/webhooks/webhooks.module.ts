import { SessionsModule } from 'src/sessions/sessions.module';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [HttpModule.register({}), SessionsModule],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}

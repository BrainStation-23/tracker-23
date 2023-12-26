import { Module } from '@nestjs/common';
import { JiraClientService } from './client';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  controllers: [],
  providers: [JiraClientService],
  exports: [JiraClientService],
})
export class HelperModule {}

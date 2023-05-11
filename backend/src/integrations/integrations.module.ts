import { Module } from '@nestjs/common';
import { JiraModule } from './jira/jira.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [JiraModule, HttpModule.register({})],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
})
export class IntegrationsModule {}

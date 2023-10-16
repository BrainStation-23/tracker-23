import { Module } from '@nestjs/common';
import { JiraClientService } from './client';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';

@Module({
  imports: [HttpModule.register({})],
  controllers: [],
  providers: [JiraClientService, ConfigService, UserIntegrationDatabase],
})
export class HelperModule {}

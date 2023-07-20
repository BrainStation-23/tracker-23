import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Module({
  imports: [HttpModule.register({})],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, WorkspacesService],
})
export class IntegrationsModule {}

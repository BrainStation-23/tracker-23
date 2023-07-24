import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { IntegrationsService } from 'src/integrations/integrations.service';

@Module({
  imports: [HttpModule.register({})],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, WorkspacesService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

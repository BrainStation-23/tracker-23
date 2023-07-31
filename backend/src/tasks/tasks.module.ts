import { AuthService } from 'src/auth/auth.service';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { MyGateway } from 'src/notifications/socketGateway';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SprintsModule } from '../sprints/sprints.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { SprintsService } from 'src/sprints/sprints.service';

@Module({
  imports: [HttpModule.register({}), SprintsModule, IntegrationsModule],
  providers: [
    TasksService,
    MyGateway,
    AuthService,
    JwtService,
    IntegrationsService,
    WorkspacesService,
    SprintsService,
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}

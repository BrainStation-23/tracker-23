import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SprintsModule } from '../sprints/sprints.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { MyGateway } from '../notifications/socketGateway';
import { AuthService } from '../auth/auth.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from '../sprints/sprints.service';
import { EmailService } from '../email/email.service';
import { WorkspaceDatabase } from 'src/database/workspaces';

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
    EmailService,
    WorkspaceDatabase,
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}

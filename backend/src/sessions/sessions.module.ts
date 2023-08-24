import { AuthService } from 'src/auth/auth.service';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { MyGateway } from 'src/notifications/socketGateway';
import { SessionsController } from 'src/sessions/sessions.controller';
import { SessionsService } from 'src/sessions/sessions.service';
import { TasksService } from 'src/tasks/tasks.service';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { SprintsService } from 'src/sprints/sprints.service';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    TasksService,
    MyGateway,
    AuthService,
    JwtService,
    IntegrationsService,
    WorkspacesService,
    SprintsService,
    EmailService,
  ],
  exports: [SessionsService],
})
export class SessionsModule {}

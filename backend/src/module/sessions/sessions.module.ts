import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionsController } from './sessions.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SessionsService } from './sessions.service';
import { TasksService } from '../tasks/tasks.service';
import { MyGateway } from '../notifications/socketGateway';
import { AuthService } from '../auth/auth.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { SprintsService } from '../sprints/sprints.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { TasksDatabase } from 'src/database/tasks';
import { UserWorkspaceDatabase } from '../../database/userWorkspaces';
import { SessionDatabase } from '../../database/sessions';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';

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
    WorkspaceDatabase,
    TasksDatabase,
    UserWorkspaceDatabase,
    SessionDatabase,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
  ],
  exports: [SessionsService],
})
export class SessionsModule {}

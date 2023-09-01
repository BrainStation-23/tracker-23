import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtService } from '@nestjs/jwt';
import { IntegrationsModule } from '../integrations/integrations.module';
import { MyGateway } from '../notifications/socketGateway';
import { TasksService } from '../tasks/tasks.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from '../sprints/sprints.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { WorkspaceDatabase } from 'src/database/workspaces';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  providers: [
    MyGateway,
    TasksService,
    IntegrationsService,
    WorkspacesService,
    SprintsService,
    ProjectsService,
    AuthService,
    JwtService,
    EmailService,
    WorkspaceDatabase,
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

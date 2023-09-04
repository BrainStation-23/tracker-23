import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SprintsModule } from 'src/module/sprints/sprints.module';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { TasksService } from 'src/module/tasks/tasks.service';
import { MyGateway } from 'src/module/notifications/socketGateway';
import { AuthService } from 'src/module/auth/auth.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from 'src/module/workspaces/workspaces.service';
import { EmailService } from 'src/module/email/email.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { ProjectDatabase } from 'src/database/projects';

@Module({
  imports: [HttpModule.register({}), SprintsModule],
  controllers: [JiraController],
  providers: [
    JiraService,
    TasksService,
    MyGateway,
    AuthService,
    JwtService,
    IntegrationsService,
    WorkspacesService,
    EmailService,
    WorkspaceDatabase,
    ProjectDatabase,
  ],
})
export class JiraModule {}

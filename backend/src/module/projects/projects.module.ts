import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtService } from '@nestjs/jwt';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TasksService } from '../tasks/tasks.service';
import { SprintsService } from '../sprints/sprints.service';
import { AuthService } from '../auth/auth.service';
import { TasksDatabase } from 'src/database/tasks';
import { ProjectDatabase } from '../../database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { NotificationModule } from '../notifications/notifications.module';
import { JiraApiCalls } from 'src/utils/jiraApiCall/api';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { HelperModule } from '../helper/helper.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../user/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    HttpModule.register({}),
    IntegrationsModule,
    NotificationModule,
    IntegrationsModule,
    WorkspacesModule,
    HelperModule,
    WebhooksModule,
    SessionsModule,
    UsersModule,
    EmailModule,
  ],
  providers: [
    TasksService,
    SprintsService,
    ProjectsService,
    AuthService,
    JwtService,
    TasksDatabase,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
    JiraApiCalls,
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService, ProjectDatabase],
})
export class ProjectsModule {}

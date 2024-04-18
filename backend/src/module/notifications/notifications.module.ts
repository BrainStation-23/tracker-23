import { Module } from '@nestjs/common';
import { NotificationController } from './notifications.controller';
import { HttpModule } from '@nestjs/axios';
import { NotificationsService } from './notifications.service';
import { MyGateway } from './socketGateway';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { UsersDatabase } from 'src/database/users';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { ProjectDatabase } from 'src/database/projects';
import { TasksDatabase } from 'src/database/tasks';
import { ReportsModule } from '../reports/reports.module';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [HttpModule.register({}), ReportsModule, PagesModule],
  controllers: [NotificationController],
  providers: [
    NotificationsService,
    AuthService,
    JwtService,
    WorkspacesService,
    EmailService,
    WorkspaceDatabase,
    MyGateway,
    UsersDatabase,
    UserWorkspaceDatabase,
    ProjectDatabase,
    TasksDatabase,
  ],
  exports: [MyGateway],
})
export class NotificationModule {}

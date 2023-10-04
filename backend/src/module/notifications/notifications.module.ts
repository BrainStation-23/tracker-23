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
import { TasksDatabase } from 'src/database/tasks';
import { ProjectDatabase } from 'src/database/projects';

@Module({
  imports: [HttpModule.register({})],
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
    TasksDatabase,
    ProjectDatabase,
  ],
  exports: [MyGateway],
})
export class NotificationModule {}

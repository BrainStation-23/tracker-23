import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { UsersDatabase } from 'src/database/users';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { NotificationModule } from '../notifications/notifications.module';
import { TasksDatabase } from 'src/database/tasks';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { ProjectDatabase } from 'src/database/projects';

@Module({
  imports: [HttpModule.register({}), NotificationModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    JwtService,
    UsersDatabase,
    WorkspacesService,
    EmailService,
    WorkspaceDatabase,
    TasksDatabase,
    UserWorkspaceDatabase,
    ProjectDatabase
  ],
  exports: [],
})
export class UsersModule {}

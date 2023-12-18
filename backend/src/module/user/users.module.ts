import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersDatabase } from 'src/database/users';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { NotificationModule } from '../notifications/notifications.module';
import { TasksDatabase } from 'src/database/tasks';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { ProjectDatabase } from 'src/database/projects';
import { SessionDatabase } from 'src/database/sessions';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { EmailModule } from '../email/email.module';
@Module({
  imports: [HttpModule.register({}), NotificationModule, EmailModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersDatabase,
    WorkspacesService,
    WorkspaceDatabase,
    TasksDatabase,
    UserWorkspaceDatabase,
    ProjectDatabase,
    UserIntegrationDatabase,
    SessionDatabase,
  ],
  exports: [UsersDatabase, UsersService],
})
export class UsersModule {}

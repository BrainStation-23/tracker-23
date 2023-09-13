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
  ],
  exports: [],
})
export class UsersModule {}

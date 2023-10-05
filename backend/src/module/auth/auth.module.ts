import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { GoogleOAuth2Controller } from './controllers/google-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { APP_FILTER } from '@nestjs/core';
import { TokenErrorFilter } from 'src/filters/token-error.filter';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { UsersDatabase } from 'src/database/users';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { TasksDatabase } from 'src/database/tasks';
import { ProjectDatabase } from 'src/database/projects';

@Module({
  imports: [
    HttpModule.register({}),
    JwtModule.register({}),
    PassportModule.register({}),
  ],
  controllers: [AuthController, GoogleOAuth2Controller],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    WorkspacesService,
    EmailService,
    WorkspaceDatabase,
    UsersDatabase,
    UserWorkspaceDatabase,
    TasksDatabase,
    ProjectDatabase,
    {
      provide: APP_FILTER,
      useClass: TokenErrorFilter,
    },
  ],
})
export class AuthModule {}

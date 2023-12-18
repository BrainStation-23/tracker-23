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
import { EmailModule } from '../email/email.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { UsersModule } from '../user/users.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    HttpModule.register({}),
    JwtModule.register({}),
    PassportModule.register({}),
    EmailModule,
    WorkspacesModule,
    UsersModule,
    ProjectsModule,
  ],
  controllers: [AuthController, GoogleOAuth2Controller],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_FILTER,
      useClass: TokenErrorFilter,
    },
  ],
})
export class AuthModule {}

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
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from 'src/email/email.service';

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

    {
      provide: APP_FILTER,
      useClass: TokenErrorFilter,
    },
  ],
})
export class AuthModule {}

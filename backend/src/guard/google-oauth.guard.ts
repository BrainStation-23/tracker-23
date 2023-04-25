import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    console.log('🚀 ~ file: google-oauth.guard.ts:7 ~ :', 'google');
    // console.log('AuthGuard');
    super({
      accessType: 'offline',
    });
  }
}

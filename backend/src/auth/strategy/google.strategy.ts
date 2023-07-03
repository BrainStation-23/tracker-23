import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private config: ConfigService) {

    console.log("clientID: config.get('GOOGLE_CLIENT_ID'===========>>>>>", config.get('GOOGLE_CLIENT_ID'))
    console.log("clientSecret: config.get('GOOGLE_CLIENT_SECRET')'===========>>>>>", config.get('GOOGLE_CLIENT_SECRET'))
    console.log("callbackURL: config.get('GOOGLE_CALLBACK_URL')'===========>>>>>", config.get('GOOGLE_CALLBACK_URL'))

    super({
      clientID: '855361554866-s7p0pluushdetqk6rc3fvlnchtt33v8p.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://yellow-mushroom-074048700.3.azurestaticapps.net/socialLogin/redirect',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
  async authenticate(request: any, options?: any) {
    const code = request.body.code;
    const result = await super.authenticate(request, { ...options, code });
    return result;
  }
}

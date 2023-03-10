import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get('FACEBOOK_APP_ID'),
      clientSecret: config.get('FACEBOOK_APP_SECRET'),
      callbackURL: config.get('FACEBOOK_CALLBACK_URL'),
      scope: 'email',
      profileFields: ['emails', 'name', 'displayName', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails && emails[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
    };
    const payload = {
      user,
      accessToken,
    };

    done(null, payload);
  }
}

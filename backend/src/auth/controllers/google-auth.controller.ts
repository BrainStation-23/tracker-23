import { Controller, Get, Redirect, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { GoogleOAuthGuard } from '../../guard/google-oauth.guard';

@Controller('auth/google')
export class GoogleOAuth2Controller {
  constructor(private readonly appService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    //
  }

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  @Redirect()
  googleAuthRedirect(@Request() req: Request) {
    console.log('google-redirect');
    return this.appService.googleLogin(req);
  }
}

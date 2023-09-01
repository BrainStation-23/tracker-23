import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { GoogleOAuthGuard } from 'src/guard/google-oauth.guard';

@Controller('auth/google')
export class GoogleOAuth2Controller {
  constructor(private readonly appService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    //
  }

  @Post('google-redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request) {
    console.log('google-redirect');
    return this.appService.googleLogin(req);
  }
}

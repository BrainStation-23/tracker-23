import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  Req,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Controller('auth/facebook')
export class FacebookOAuth2Controller {
  constructor(private readonly appService: AuthService) {}

  @Get()
  getHello(): string {
    return 'hello';
    // return this.appService.getHello();
  }

  @Get('/login')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/redirect')
  @UseGuards(AuthGuard('facebook'))
  @Redirect()
  async facebookLoginRedirect(@Req() req: Request): Promise<any> {
    console.log('facebook-redirect');
    return this.appService.facebookLogin(req);
  }
}

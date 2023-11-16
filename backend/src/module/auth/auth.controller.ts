import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Req,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ForgotPasswordDto, InvitedUserLoginDto,
  InvitedUserRegisterDto,
  LoginDto,
  PasswordResetDto,
  RegisterDto,
} from './dto';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @Body() reqBody: ForgotPasswordDto,
    @Req() req: Request,
  ) {
    return await this.usersService.forgotPassword(reqBody, req);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('resetPassword/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() reqBody: PasswordResetDto,
  ) {
    return await this.usersService.resetPassword(token, reqBody);
  }

  @Post('/invitedUser/register')
  async invitedUserRegister(@Body() reqBody: InvitedUserRegisterDto) {
    return await this.usersService.createInvitedUser(reqBody);
  }

  @Post('/invitedUser/login')
  async invitedUserLogin(@Body() reqBody: InvitedUserLoginDto) {
    return await this.usersService.loginInvitedUser(reqBody);
  }
}

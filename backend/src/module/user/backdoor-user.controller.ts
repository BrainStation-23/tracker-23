import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('backdoor/users')
export class BackdoorUserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/statistics')
  async getStatistics(@Query('token') token: string) {
    return await this.usersService.getStatistics(token);
  }
}
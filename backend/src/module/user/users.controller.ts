import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { GetUser } from "src/decorator";
import { User } from "@prisma/client";
import { JwtAuthGuard } from "src/guard";
import { CreateSettingsReqDto } from "./dto/create.settings.dto";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@GetUser() user: User) {
    return await this.usersService.getUsers(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-role/:userId')
  async updateRole(@GetUser() user: User, @Param('userId') userId: number) {
    return await this.usersService.updateRole(user, +userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/settings')
  async createSettings(@GetUser() user: User, @Body() data: CreateSettingsReqDto) {
    return await this.usersService.createSettings(user, data);
  }
}
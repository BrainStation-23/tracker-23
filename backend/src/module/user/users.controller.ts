import { Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { GetUser } from "src/decorator";
import { User } from "@prisma/client";
import { JwtAuthGuard } from "src/guard";

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
}
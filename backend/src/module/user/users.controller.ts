import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/guard';
import { UpdateSettingsReqDto } from './dto/create.settings.dto';
import { UpdateRoleRequest } from './dto/update.role.request.dto';
import { UpdateApprovalUserRequest } from './dto/update.approvalUser.request.dto';
import { UserListByProjectIdReqDto } from './dto/getUserListByProjectId.dto';

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
  async updateRole(
    @GetUser() user: User,
    @Param('userId') userId: number,
    @Body() req: UpdateRoleRequest,
  ) {
    return await this.usersService.updateRole(user, +userId, req?.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/settings')
  async getSettings(@GetUser() user: User) {
    return await this.usersService.getSettings(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/settings')
  async updateSettings(
    @GetUser() user: User,
    @Body() data: UpdateSettingsReqDto,
  ) {
    return await this.usersService.updateSettings(user, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/userList')
  async getUserList(@GetUser() user: User) {
    return await this.usersService.getUserList(user);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('/userList/:userId')
  async updateApprovalUser(
    @GetUser() user: User,
    @Param('userId') userId: number,
    @Body() req: UpdateApprovalUserRequest,
  ) {
    console.log(
      '🚀 ~ file: users.controller.ts:56 ~ UsersController ~ req:',
      req,
    );

    return await this.usersService.updateApprovalUser(user, userId, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/userListByProjectId')
  async userListByProjectId(
    @GetUser() user: User,
    @Query() query: UserListByProjectIdReqDto,
  ) {
    return await this.usersService.userListByProjectId(user, query);
  }
}

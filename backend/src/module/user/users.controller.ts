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
import {
  UpdateApprovalUserRequest,
  UpdateRoleRequest,
  UpdateUserOnboardingStepReqBody,
  UserListByProjectIdReqDto,
} from './dto';

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

  @UseGuards(JwtAuthGuard)
  @Patch('/update/:userId')
  async updateUserById(
    @Param('userId') userId: string,
    @Body() reqBody: UpdateUserOnboardingStepReqBody,
  ) {
    return await this.usersService.updateUserById(Number(userId), reqBody);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/delete/:userId')
  async deleteUserById(@Param('userId') userId: string) {
    return await this.usersService.deleteUserById(Number(userId));
  }
}

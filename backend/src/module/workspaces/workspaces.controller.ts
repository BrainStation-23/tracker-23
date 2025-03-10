import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { ReqStatusBody, SendInvitationReqBody, WorkspaceReqBody } from './dto';
import { JwtAuthGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { Response } from 'express';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createWorkspace(
    @GetUser() user: User,
    @Body() reqBody: WorkspaceReqBody,
  ) {
    return this.workspacesService.createWorkspace(
      user,
      reqBody?.name,
      reqBody?.changeWorkspace,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getWorkspaceList(@GetUser() user: User) {
    return this.workspacesService.getWorkspaceList(user);
  }

  @Get('/users')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceUsers(@GetUser() user: User) {
    return await this.workspacesService.getWorkspaceUsers(user);
  }

  @Get(':workspaceId')
  @UseGuards(JwtAuthGuard)
  async getWorkspace(@Param('workspaceId', ParseIntPipe) workspaceId: number) {
    return this.workspacesService.getWorkspace(workspaceId);
  }

  @Patch(':workspaceId')
  @UseGuards(JwtAuthGuard)
  async updateWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() reqBody: WorkspaceReqBody,
  ) {
    return this.workspacesService.updateWorkspace(workspaceId, reqBody);
  }

  @Delete(':workspaceId')
  @UseGuards(JwtAuthGuard)
  async deleteWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Res() res: Response,
  ) {
    return this.workspacesService.deleteWorkspace(workspaceId, res);
  }

  @Patch('/change-workspace/:workspaceId')
  @UseGuards(JwtAuthGuard)
  async changeActiveWorkspace(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ) {
    return await this.workspacesService.changeActiveWorkspace(
      +workspaceId,
      +user?.id,
    );
  }

  @Patch('/change-role/:userWorkspaceId')
  @UseGuards(JwtAuthGuard)
  async changeUserWorkspaceRole(
    @Param('userWorkspaceId') userWorkspaceId: number,
    @Body() reqStatus: ReqStatusBody,
  ) {
    return await this.workspacesService.invitationResponse(
      Number(userWorkspaceId),
      reqStatus.status,
    );
  }

  @Post('/invitation/send')
  @UseGuards(JwtAuthGuard)
  async sendInvitation(
    @GetUser() user: User,
    @Body() reqBody: SendInvitationReqBody,
  ) {
    return await this.workspacesService.sendInvitation(user, reqBody);
  }

  @Get('/invitation/list')
  @UseGuards(JwtAuthGuard)
  async getInvitationList(@GetUser() user: User) {
    return await this.workspacesService.getInvitationList(user);
  }

  @Patch('/invitation/response/:userWorkspaceId')
  @UseGuards(JwtAuthGuard)
  async invitationResponse(
    @Param('userWorkspaceId') userWorkspaceId: number,
    @Body() reqStatus: ReqStatusBody,
  ) {
    return await this.workspacesService.invitationResponse(
      Number(userWorkspaceId),
      reqStatus.status,
    );
  }

  @Get('/verify/invited-user/:token')
  async verifyInvitedUser(@Param('token') token: string) {
    return await this.workspacesService.verifyInvitedUser(token);
  }
}

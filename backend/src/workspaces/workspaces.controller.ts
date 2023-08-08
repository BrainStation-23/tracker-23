import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceReqBody } from './dto';
import { JwtAuthGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';

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
      user.id,
      reqBody?.name,
      Boolean(reqBody?.changeWorkspace),
    );
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceList(@GetUser() user: User) {
    return this.workspacesService.getWorkspaceList(user);
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
  ) {
    return this.workspacesService.deleteWorkspace(workspaceId);
  }

  @Patch('/change-workspace/:workspaceId')
  @UseGuards(JwtAuthGuard)
  async changeActiveWorkspace(
    @GetUser() user: User,
    @Param('workspaceId') workspaceId: string,
  ) {
    return await this.workspacesService.changeActiveWorkspace(+workspaceId, +user?.id);
  }
}

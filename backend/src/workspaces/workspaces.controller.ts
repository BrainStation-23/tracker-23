import {
  Body,
  Controller,
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

@Controller('workspace')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createWorkspace(
    @GetUser() user: User,
    @Body() reqBody: WorkspaceReqBody,
  ) {
    return this.workspacesService.createWorkspace(user.id, reqBody.name);
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
}

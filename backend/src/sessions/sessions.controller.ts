import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';

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
import { User } from '@prisma/client';

import { ManualTimeEntryReqBody, SessionDto, SessionReqBodyDto } from './dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':taskId')
  async getSessions(
    @GetUser() user: User,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return await this.sessionsService.getSessions(user, taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async startSession(@GetUser() user: User, @Body() dto: SessionDto) {
    return await this.sessionsService.createSession(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':taskId')
  async stopSession(
    @GetUser() user: User,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return await this.sessionsService.stopSession(user, taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add-work-log')
  async manualTimeEntry(
    @GetUser() user: User,
    @Body() manualTimeEntryReqBody: ManualTimeEntryReqBody,
  ) {
    return this.sessionsService.manualTimeEntry(user, manualTimeEntryReqBody);
  }

  @Patch('update-session/:sessionId')
  @UseGuards(JwtAuthGuard)
  async updateSession(
    @GetUser() user: User,
    @Param('sessionId') sessionId: string,
    @Body() reqBody: SessionReqBodyDto,
  ) {
    console.log(sessionId);
    return this.sessionsService.updateSession(user, sessionId, reqBody);
  }

  @Delete('delete-session/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSession(@GetUser() user: User, @Param('id') id: string) {
    return this.sessionsService.deleteSession(user, id);
  }
}

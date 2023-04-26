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
import { User } from '@prisma/client';
import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';
import { ManualTimeEntryReqBody, SessionDto } from './dto';
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

  @Patch('add-work-log')
  @UseGuards(JwtAuthGuard)
  async manualTimeEntry(
    @GetUser() user: User,
    @Body() manualTimeEntryReqBody: ManualTimeEntryReqBody,
  ) {
    return this.sessionsService.manualTimeEntry(user, manualTimeEntryReqBody);
  }
}

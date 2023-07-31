import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { JwtAuthGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { GetSprintListQueryDto } from './dto';

@Controller('sprints')
export class SprintsController {
  constructor(private sprintsService: SprintsService) {}

  @Get('sprint-list')
  @UseGuards(JwtAuthGuard)
  async getSprintList(
    @GetUser() user: User,
    @Query() reqBody: GetSprintListQueryDto,
  ) {
    return this.sprintsService.getSprintList(user, reqBody);
  }

  @Get('active-sprintTasks')
  @UseGuards(JwtAuthGuard)
  async getActiveSprintTasks(
    @GetUser() user: User,
    @Query() reqBody: GetSprintListQueryDto,
  ) {
    return this.sprintsService.getActiveSprintTasks(user, reqBody);
  }
}

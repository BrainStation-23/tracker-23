import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { JwtAuthGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';

@Controller('sprints')
export class SprintsController {
  constructor(private sprintsService: SprintsService) {}
  @Post('board-list')
  @UseGuards(JwtAuthGuard)
  async getBoardList(@GetUser() user: User) {
    return this.sprintsService.getBoardList(user);
  }
}

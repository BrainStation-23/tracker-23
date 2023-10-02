import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guard';
import { ExportTeamTaskDataQuery, GetTaskQuery } from '../tasks/dto';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  // @Header('Content-Type', 'text/xlsx')
  async exportDataToExcel(
    @Res() res: Response,
    @GetUser() user: User,
    @Query() query: GetTaskQuery,
  ): Promise<void> {
    await this.exportService.exportToExcel(user, query, res);
  }
  //TODO: only for management level roles
  @Get('/team')
  @UseGuards(JwtAuthGuard)
  // @Header('Content-Type', 'text/xlsx')
  async exportTeamDataToExcel(
    @Res() res: Response,
    @GetUser() user: User,
    @Query() query: ExportTeamTaskDataQuery,
  ): Promise<void> {
    await this.exportService.exportTeamDataToExcel(user, query, res);
  }
}

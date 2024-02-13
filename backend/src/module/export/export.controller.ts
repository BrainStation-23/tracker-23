import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guard';
import {
  ExportTeamTaskDataQuery,
  GetTaskQuery,
  GetTimeSheetQueryDto,
} from '../tasks/dto';
import { SprintReportFilterDto } from '../sessions/dto/sprint-report.dto';
import {
  NewSprintViewQueryDto,
  SprintViewReqBodyDto,
} from '../sprints/dto/sprintView.dto';

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

  @Get('sprint-report')
  @UseGuards(JwtAuthGuard)
  // @Header('Content-Type', 'text/xlsx')
  async exportSprintReportDataToExcel(
    @Res() res: Response,
    @GetUser() user: User,
    @Query() query: SprintReportFilterDto,
  ): Promise<void> {
    await this.exportService.exportSprintReportDataToExcel(user, query, res);
  }

  @Get('user-task-list')
  @UseGuards(JwtAuthGuard)
  async getUserTaskList(@GetUser() user: User, @Query() query: GetTaskQuery) {
    return await this.exportService.getTasksWithDetails(user, query);
  }

  @Get('time-sheet')
  @UseGuards(JwtAuthGuard)
  async exportTimeSheetDataToExcel(
    @Res() res: Response,
    @GetUser() user: User,
    @Query() query: GetTimeSheetQueryDto,
  ): Promise<void> {
    await this.exportService.exportTimeSheetDataToExcel(user, query, res);
  }

  @Get('time-line-sheet')
  @UseGuards(JwtAuthGuard)
  async exportTimeLineSheetToExcel(
    @Res() res: Response,
    @GetUser() user: User,
    @Query() query: NewSprintViewQueryDto,
  ): Promise<void> {
    await this.exportService.exportTimeLineSheetToExcel(user, query, res);
  }

  @Get('sprint-view-sheet')
  @UseGuards(JwtAuthGuard)
  async exportSprintViewSheetToExcel(
    @Res() res: Response,
    @GetUser() user: User,
    @Query() query: SprintViewReqBodyDto,
  ): Promise<void> {
    await this.exportService.exportSprintViewSheetToExcel(user, query, res);
  }
}

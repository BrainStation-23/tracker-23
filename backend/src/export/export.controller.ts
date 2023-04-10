import { Controller, Get, Query, Res, UseGuards, Header } from '@nestjs/common';
import { ExportService } from './export.service';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { GetTaskQuery } from 'src/tasks/dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guard';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'text/xlsx')
  async exportDataToExcel(
    @Res() res: Response,
    @GetUser() user: User,
    @Query() query: GetTaskQuery,
  ): Promise<void> {
    const data: any[] = await this.exportService.getTasks(user, query);
    await this.exportService.exportToExcel(data, res);
  }
}

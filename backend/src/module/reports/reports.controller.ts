import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from 'src/guard';
import { Report } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(@Body() createReportDto: CreateReportDto) {
    return await this.reportsService.createReport(createReportDto);
  }
  @Get(':reportId')
  async getReportById(@Param('reportId') reportId: string) {
    return await this.reportsService.getReportById(+reportId);
  }

  @Get('pageId/:pageId')
  async getReportsByPageId(
    @Param('pageId') pageId: string,
  ): Promise<Report[] | []> {
    return await this.reportsService.getReportsByPageId(+pageId);
  }

  @Patch(':reportId')
  async updateReport(
    @Param('reportId') reportId: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.updateReport(+reportId, updateReportDto);
  }

  @Delete(':reportId')
  async removeReport(@Param('reportId') reportId: string) {
    return await this.reportsService.removeReport(+reportId);
  }
}

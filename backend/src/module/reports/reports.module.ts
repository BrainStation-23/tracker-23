import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportDatabase } from 'src/database/reports';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PagesModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportDatabase],
  exports: [ReportsService],
})
export class ReportsModule {}

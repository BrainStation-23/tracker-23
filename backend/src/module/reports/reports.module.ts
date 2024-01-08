import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ReportDatabase } from 'src/database/reports';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [WorkspacesModule, PagesModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportDatabase],
})
export class ReportsModule {}

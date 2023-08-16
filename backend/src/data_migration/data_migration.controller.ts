import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard';
import { DataMigrationService } from './data_migration.service';

@Controller('migrate')
export class DataMigrationController {
  constructor(private dataMigrationService: DataMigrationService) {}

  @Get('user')
  // @UseGuards(JwtAuthGuard)
  async getAndCreateUser() {
    return this.dataMigrationService.getAndCreateUser();
  }
  @Get('task')
  @UseGuards(JwtAuthGuard)
  async getAndCreateTask() {
    return this.dataMigrationService.getAndCreateTask();
  }
}

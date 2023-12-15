import { Controller, Get } from '@nestjs/common';
import { DataMigrationService } from './data_migration.service';

@Controller('migrate')
export class DataMigrationController {
  constructor(private dataMigrationService: DataMigrationService) {}

  @Get('user')
  // @UseGuards(JwtAuthGuard)
  async getAndCreateUser() {
    return this.dataMigrationService.getAndCreateUsers();
  }
  @Get('task')
  // @UseGuards(JwtAuthGuard)
  async getAndCreateTask() {
    return this.dataMigrationService.getAndCreateTasks();
  }

  @Get('user/update-status')
  // @UseGuards(JwtAuthGuard)
  async updateUserStatus() {
    return await this.dataMigrationService.updateUserStatus();
  }
}

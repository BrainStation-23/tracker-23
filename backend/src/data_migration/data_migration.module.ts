import { Global, Module } from '@nestjs/common';
import { DataMigrationService } from './data_migration.service';

@Global()
@Module({
  providers: [DataMigrationService],
  exports: [DataMigrationService],
})
export class DataMigrationModule {}

import { Global, Module } from '@nestjs/common';
import { DataMigrationService } from './data_migration.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaService2 } from 'src/prisma2/prisma.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { DataMigrationController } from './data_migration.controller';

@Global()
@Module({
  providers: [
    DataMigrationService,
    PrismaService,
    PrismaService2,
    WorkspacesService,
  ],
  controllers: [DataMigrationController],
  exports: [DataMigrationService],
})
export class DataMigrationModule {}

import { Global, Module } from '@nestjs/common';
import { DataMigrationService } from './data_migration.service';
import { PrismaService2 } from 'src/module/prisma2/prisma.service';
import { DataMigrationController } from './data_migration.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { UsersDatabase } from 'src/database/users';
import { TasksDatabase } from 'src/database/tasks';

@Global()
@Module({
  providers: [
    DataMigrationService,
    PrismaService,
    PrismaService2,
    WorkspacesService,
    WorkspaceDatabase,
    UsersDatabase,
    TasksDatabase,
  ],
  controllers: [DataMigrationController],
  exports: [DataMigrationService],
})
export class DataMigrationModule {}

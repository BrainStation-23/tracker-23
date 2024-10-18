import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { HttpModule } from '@nestjs/axios';
import { ExportDatabase } from 'src/database/exports';
import { SessionsModule } from '../sessions/sessions.module';
import { SprintsModule } from '../sprints/sprints.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TasksService } from '../tasks/tasks.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    HttpModule.register({}),
    SessionsModule,
    SprintsModule,
    WorkspacesModule,
    TasksModule,
  ],
  controllers: [ExportController],
  providers: [ExportService, ExportDatabase],
})
export class ExportModule {}

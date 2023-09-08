import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from '../sprints/sprints.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { ProjectDatabase } from 'src/database/projects';
import { SprintDatabase } from 'src/database/sprints';
import { SprintTaskDatabase } from 'src/database/sprintTasks';
import { TasksDatabase } from 'src/database/tasks';

@Module({
  imports: [HttpModule.register({})],
  controllers: [ExportController],
  providers: [
    ExportService,
    PrismaService,
    WorkspacesService,
    IntegrationsService,
    SprintsService,
    WorkspaceDatabase,
    ProjectDatabase,
    SprintDatabase,
    SprintTaskDatabase,
    TasksDatabase
  ],
})
export class ExportModule {}

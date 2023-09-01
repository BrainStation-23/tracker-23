import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SprintsService } from '../sprints/sprints.service';
import { WorkspaceDatabase } from 'src/database/workspaces';

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
  ],
})
export class ExportModule {}

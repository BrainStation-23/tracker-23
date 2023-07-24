import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  controllers: [ExportController],
  providers: [
    ExportService,
    PrismaService,
    WorkspacesService,
    IntegrationsService,
  ],
})
export class ExportModule {}

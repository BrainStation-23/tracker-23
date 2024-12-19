import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AzureDevController } from './azure_dev.controller';
import { AzureDevService } from './azure_dev.service';
import { ProjectsModule } from '../projects/projects.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    HttpModule.register({}),
    ProjectsModule,
    WorkspacesModule,
    IntegrationsModule,
    TasksModule,
  ],
  controllers: [AzureDevController],
  providers: [AzureDevService],
})
export class AzureDevModule {}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
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
  controllers: [JiraController],
  providers: [JiraService],
})
export class JiraModule {}

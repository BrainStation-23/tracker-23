import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { ProjectDatabase } from 'src/database/projects';
import { EmailModule } from '../email/email.module';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { TasksDatabase } from 'src/database/tasks';
import { PagesModule } from '../pages/pages.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [EmailModule, PagesModule, ReportsModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspaceDatabase,
    WorkspacesService,
    ProjectDatabase,
    UserWorkspaceDatabase,
    TasksDatabase,
  ],
  exports: [WorkspacesService, UserWorkspaceDatabase],
})
export class WorkspacesModule {}

import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { ProjectDatabase } from 'src/database/projects';
import { EmailModule } from '../email/email.module';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';

@Module({
  imports: [HttpModule.register({}), EmailModule],
  providers: [
    WorkspacesService,
    WorkspaceDatabase,
    ProjectDatabase,
    UserWorkspaceDatabase,
  ],
  controllers: [WorkspacesController],
  exports: [WorkspacesService, UserWorkspaceDatabase],
})
export class WorkspacesModule {}

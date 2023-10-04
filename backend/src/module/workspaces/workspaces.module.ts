import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { UsersDatabase } from 'src/database/users';
import { TasksDatabase } from 'src/database/tasks';
import { UsersModule } from '../user/users.module';
import { ProjectDatabase } from 'src/database/projects';

@Module({
  imports: [HttpModule.register({})],
  providers: [
    WorkspacesService,
    WorkspaceDatabase,
    UsersDatabase,
    TasksDatabase,
    ProjectDatabase,
  ],
  controllers: [WorkspacesController],
  exports: [WorkspacesService, WorkspaceDatabase],
})
export class WorkspacesModule {}

import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { HttpModule } from '@nestjs/axios';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { UsersDatabase } from 'src/database/users';
import { TasksDatabase } from 'src/database/tasks';
import { UsersModule } from '../user/users.module';
import { ProjectDatabase } from 'src/database/projects';
import { EmailModule } from '../email/email.module';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [HttpModule.register({}), EmailModule, UsersModule],
  providers: [
    WorkspacesService,
    WorkspaceDatabase,
    TasksDatabase,
    ProjectDatabase,
    UserWorkspaceDatabase,
  ],
  controllers: [WorkspacesController],
  exports: [WorkspacesService, WorkspaceDatabase, UserWorkspaceDatabase],
})
export class WorkspacesModule {}

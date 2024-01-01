import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersDatabase } from 'src/database/users';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TasksModule } from '../tasks/tasks.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { SessionsModule } from '../sessions/sessions.module';
import { ProjectsModule } from '../projects/projects.module';
@Module({
  imports: [
    HttpModule.register({}),
    WorkspacesModule,
    TasksModule,
    IntegrationsModule,
    SessionsModule,
    ProjectsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersDatabase],
  exports: [UsersService, UsersDatabase],
})
export class UsersModule {}

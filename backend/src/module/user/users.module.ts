import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersDatabase } from 'src/database/users';
import { UsersController } from './users.controller';
import { BackdoorUserController } from './backdoor-user.controller';
import { UsersService } from './users.service';
import { WorkspacesModule } from 'src/module/workspaces/workspaces.module';
import { TasksModule } from 'src/module/tasks/tasks.module';
import { IntegrationsModule } from 'src/module/integrations/integrations.module';
import { SessionsModule } from 'src/module/sessions/sessions.module';
import { ProjectsModule } from 'src/module/projects/projects.module';
import { OnboardingModule } from 'src/module/onboarding/onboarding.module';
@Module({
  imports: [
    HttpModule.register({}),
    WorkspacesModule,
    TasksModule,
    IntegrationsModule,
    SessionsModule,
    ProjectsModule,
    OnboardingModule,
  ],
  controllers: [UsersController, BackdoorUserController],
  providers: [UsersService, UsersDatabase],
  exports: [UsersService, UsersDatabase],
})
export class UsersModule {}

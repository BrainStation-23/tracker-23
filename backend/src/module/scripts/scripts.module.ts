import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { ScriptsController } from './scripts.controller';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { UsersModule } from '../user/users.module';
import { HelperModule } from '../helper/helper.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    HttpModule.register({}),
    TasksModule,
    WorkspacesModule,
    ProjectsModule,
    SprintsModule,
    IntegrationsModule,
    UsersModule,
    WorkspacesModule,
    HelperModule,
    EmailModule,
  ],
  controllers: [ScriptsController],
  providers: [ScriptsService, JwtService],
})
export class ScriptsModule {}

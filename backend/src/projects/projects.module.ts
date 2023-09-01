import { IntegrationsModule } from 'src/integrations/integrations.module';
import { SprintsService } from 'src/sprints/sprints.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TasksService } from 'src/tasks/tasks.service';
import { MyGateway } from 'src/notifications/socketGateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [HttpModule.register({}), IntegrationsModule],
  providers: [
    MyGateway,
    TasksService,
    IntegrationsService,
    WorkspacesService,
    SprintsService,
    ProjectsService,
    AuthService,
    JwtService,
    EmailService
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

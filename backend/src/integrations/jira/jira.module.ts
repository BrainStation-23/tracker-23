import { AuthService } from 'src/auth/auth.service';
import { IntegrationsService } from 'src/integrations/integrations.service';
import { JiraController } from 'src/integrations/jira/jira.controller';
import { JiraService } from 'src/integrations/jira/jira.service';
import { MyGateway } from 'src/notifications/socketGateway';
import { SprintsModule } from 'src/sprints/sprints.module';
import { TasksService } from 'src/tasks/tasks.service';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule.register({}), SprintsModule],
  controllers: [JiraController],
  providers: [
    JiraService,
    TasksService,
    MyGateway,
    AuthService,
    JwtService,
    IntegrationsService,
  ],
})
export class JiraModule {}

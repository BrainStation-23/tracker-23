import { Module } from '@nestjs/common';
import { JiraService } from './jira.service';
import { JiraController } from './jira.controller';
import { HttpModule } from '@nestjs/axios';
import { TasksService } from 'src/tasks/tasks.service';
import { MyGateway } from 'src/notifications/socketGateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule.register({})],
  controllers: [JiraController],
  providers: [JiraService, TasksService, MyGateway, AuthService, JwtService],
})
export class JiraModule {}

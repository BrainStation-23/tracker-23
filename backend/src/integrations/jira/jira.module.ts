import { Module } from '@nestjs/common';
import { JiraService } from './jira.service';
import { JiraController } from './jira.controller';
import { HttpModule } from '@nestjs/axios';
import { TasksService } from 'src/tasks/tasks.service';

@Module({
  imports: [HttpModule.register({})],
  controllers: [JiraController],
  providers: [JiraService, TasksService],
})
export class JiraModule {}

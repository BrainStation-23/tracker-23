import { Module } from '@nestjs/common';
import { JiraService } from './jira.service';
import { JiraController } from './jira.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  controllers: [JiraController],
  providers: [JiraService],
})
export class JiraModule {}

import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { ScriptsController } from './scripts.controller';
import { HttpModule } from '@nestjs/axios';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsModule } from '../projects/projects.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    HttpModule.register({}),
    TasksModule,
    ProjectsModule,
    IntegrationsModule,
  ],
  controllers: [ScriptsController],
  providers: [ScriptsService],
})
export class ScriptsModule {}

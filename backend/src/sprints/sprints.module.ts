import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SprintsController } from './sprints.controller';
import { SprintsService } from './sprints.service';
import { TasksModule } from 'src/tasks/tasks.module';
@Module({
  imports: [HttpModule.register({}), TasksModule],
  providers: [SprintsService],
  controllers: [SprintsController],
})
export class SprintsModule {}

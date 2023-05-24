import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { HttpModule } from '@nestjs/axios';
import { MyGateway } from 'src/notification/notification';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule.register({})],
  providers: [TasksService, MyGateway, AuthService, JwtService],
  controllers: [TasksController],
})
export class TasksModule {}

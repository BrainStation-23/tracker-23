import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { HttpModule } from '@nestjs/axios';
import { TasksService } from 'src/tasks/tasks.service';
import { MyGateway } from 'src/notifications/socketGateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule.register({})],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    TasksService,
    MyGateway,
    AuthService,
    JwtService,
  ],
})
export class SessionsModule {}

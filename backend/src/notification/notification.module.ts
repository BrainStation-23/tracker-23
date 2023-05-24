import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { MyGateway } from './notification';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [NotificationController],
  providers: [AuthService, MyGateway, JwtService],
})
export class NotificationModule {}

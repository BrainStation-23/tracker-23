import { Module } from '@nestjs/common';
import { NotificationController } from './notifications.controller';
import { MyGateway } from './socketGateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [NotificationController],
  providers: [AuthService, MyGateway, JwtService],
})
export class NotificationModule {}

import { Module } from '@nestjs/common';
import { NotificationController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  controllers: [NotificationController],
  providers: [NotificationsService],
})
export class NotificationModule {}

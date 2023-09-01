import { Module } from '@nestjs/common';
import { NotificationController } from './notifications.controller';
import { HttpModule } from '@nestjs/axios';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [HttpModule.register({})],
  controllers: [NotificationController],
  providers: [NotificationsService],
})
export class NotificationModule {}

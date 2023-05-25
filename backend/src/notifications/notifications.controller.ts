import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';

import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationsService) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@GetUser() user: User): Promise<any> {
    return this.notificationService.getNotifications(user);
  }
}

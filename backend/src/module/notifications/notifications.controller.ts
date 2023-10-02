import { GetUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';

import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
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

  @Patch('seen/:id')
  @UseGuards(JwtAuthGuard)
  async seenSingleNotification(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<any> {
    return this.notificationService.seenSingleNotification(user, id);
  }
  @Patch('seen-all')
  @UseGuards(JwtAuthGuard)
  async seenAllNotifications(@GetUser() user: User): Promise<any> {
    return this.notificationService.seenAllNotifications(user);
  }
}

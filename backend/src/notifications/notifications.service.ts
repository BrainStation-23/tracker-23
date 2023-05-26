import { PrismaService } from 'src/prisma/prisma.service';

import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async getNotifications(user: User) {
    return await this.prisma.notification.findMany({
      take: 50,
      where: {
        userId: user.id,
        seen: false,
      },
    });
  }

  async seenSingleNotification(user: User, id: string) {
    return await this.prisma.notification.update({
      where: {
        id: Number(id),
      },
      data: { seen: true },
    });
  }

  async seenAllNotifications(user: User) {
    return await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
      },
      data: { seen: true },
    });
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { APIException } from '../exception/api.exception';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async getNotifications(user: User) {
    try {
      return await this.prisma.notification.findMany({
        take: 50,
        where: {
          userId: user.id,
          cleared: false,
        },
        orderBy: {
          createdAt: 'desc', // Order by createdAt field in descending order (latest first)
        },
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: notifications.service.ts:19 ~ NotificationsService ~ getNotifications ~ error:',
        error,
      );
      return [];
    }
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
  async clearAllNotifications(user: User) {
    return await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
      },
      data: { cleared: true },
    });
  }
}

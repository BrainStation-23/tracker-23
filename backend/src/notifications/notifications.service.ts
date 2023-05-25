import { PrismaService } from 'src/prisma/prisma.service';

import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async getNotifications(user: User) {
    return await this.prisma.notification.findMany({
      where: {
        userId: user.id,
      },
    });
  }
}

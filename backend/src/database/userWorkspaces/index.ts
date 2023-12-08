import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../module/prisma/prisma.service';
import { UserWorkspace } from '@prisma/client';

@Injectable()
export class UserWorkspaceDatabase {
  constructor(private prisma: PrismaService) {}

  async getSingleUserWorkspace(
    filter: Record<string, any>,
  ): Promise<UserWorkspace | null> {
    try {
      return await this.prisma.userWorkspace.findUnique({
        where: {
          userWorkspaceIdentifier: {
            userId: filter.userId,
            workspaceId: filter.workspaceId,
          },
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getUserWorkspaceList(filter: Record<string, any>): Promise<any[] | []> {
    try {
      return await this.prisma.userWorkspace.findMany({
        where: filter,
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async updateUserWorkspace(
    id: number,
    update: Record<string, any>,
  ): Promise<UserWorkspace | null> {
    try {
      return await this.prisma.userWorkspace.update({
        where: { id },
        data: update,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async checkEmail(code: string) {
    try {
      const userWorkspace = await this.prisma.userWorkspace.findFirst({
        where: {
          invitationId: code,
        },
        include: {
          user: true,
        },
      });
      return userWorkspace;
    } catch (err) {
      console.log(
        '🚀 ~ file: index.ts:52 ~ UserWorkspaceDatabase ~ checkEmail ~ err:',
        err,
      );
      return null;
    }
  }
}

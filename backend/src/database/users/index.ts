import { Injectable } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { PrismaService } from "src/module/prisma/prisma.service";
import { UpdateSettingsReqDto } from "src/module/user/dto/create.settings.dto";

@Injectable()
export class UsersDatabase {
  constructor(private prisma: PrismaService) {}

  async findUsers(user: User) {
    try {
      const workspace =
        user.activeWorkspaceId &&
        (await this.prisma.workspace.findUnique({
          where: {
            id: user.activeWorkspaceId,
          },
          select: {
            userWorkspaces: true,
          },
        }));

      const userWorkspaces = workspace && workspace.userWorkspaces;
      const userIds =
        userWorkspaces &&
        userWorkspaces?.map((userWorkspace) => userWorkspace?.userId);

      return (
        userIds &&
        (await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        }))
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async updateRole(user: User, userId: number, role: Role) {
    try {
      const userWorkspace =
        user.activeWorkspaceId &&
        (await this.prisma.userWorkspace.findFirst({
          where: {
            userId,
            workspaceId: user.activeWorkspaceId,
          },
        }));
      if (!userWorkspace) return null;

      return await this.prisma.userWorkspace.update({
        where: { id: userWorkspace.id },
        data: { role: { set: role } },
      });
    } catch (error) {
      //console.log(error);
      return null;
    }
  }

  async createSettings(user: User) {
    try {
      return (
        user.activeWorkspaceId &&
        (await this.prisma.settings.create({
          data: {
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
        }))
      );
    } catch (error) {
      console.log('🚀 ~ file: index.ts:80 ~ UsersDatabase ~ error:', error);
      return null;
    }
  }

  async updateSettings(user: User, settings: UpdateSettingsReqDto) {
    try {
      return (
        user.activeWorkspaceId &&
        (await this.prisma.settings.update({
          where: {
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
          data: settings,
        }))
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
import { Injectable } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { PrismaService } from "src/module/prisma/prisma.service";

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

  async updateRole(user: User, userId: number) {
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
      const updatedRole =
        userWorkspace.role === Role.ADMIN ? Role.USER : Role.ADMIN;

      return await this.prisma.userWorkspace.update({
        where: { id: userWorkspace.id },
        data: { role: { set: updatedRole } },
      });
    } catch (error) {
      //console.log(error);
      return null;
    }
  }
}
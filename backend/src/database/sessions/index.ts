import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../module/prisma/prisma.service";
import {Session} from "@prisma/client";

@Injectable()
export class SessionDatabase {
  constructor(private prisma: PrismaService) {}

  async getSessions(filter: any) {
    try {
      return await this.prisma.session.findMany({
        where: filter,
        include: {
          task: true,
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getUsers(userIds: number[]) {
    try {
      return await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          picture: true,
          email: true,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserWorkspaceList(filter: any) {
    try {
      return await this.prisma.userWorkspace.findMany({
        where: filter,
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              picture: true,
              email: true,
            },
          },
        },
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
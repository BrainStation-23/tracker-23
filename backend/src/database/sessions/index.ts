import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../module/prisma/prisma.service';

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

  async updateTask(filter: any, update: any) {
    try {
      return await this.prisma.task.update({
        where: filter,
        data: update,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getSession(taskId: number) {
    try {
      return await this.prisma.session.findFirst({
        where: { taskId, endTime: null },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createSession(newSession: any) {
    try {
      return await this.prisma.session.create({
        data: newSession,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async deleteSession(sessionId: number) {
    try {
      return await this.prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateSessionById(sessionId: number, update: any) {
    try {
      return await this.prisma.session.update({
        where: { id: sessionId },
        data: update,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getSessionById(sessionId: number) {
    try {
      return await this.prisma.session.findUnique({
        where: { id: sessionId },
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

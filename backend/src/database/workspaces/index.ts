import { Injectable } from '@nestjs/common';
import { Role, UserWorkspaceStatus } from '@prisma/client';
import {
  SendInvitationReqBody,
  WorkspaceReqBody,
} from 'src/module/workspaces/dto';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class WorkspaceDatabase {
  constructor(private prisma: PrismaService) {}
  async getWorkspace(workspaceId: number) {
    try {
      return await this.prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async createWorkspace(userId: number, name: string) {
    try {
      return await this.prisma.workspace.create({
        data: {
          creatorUserId: userId,
          name: name,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async getWorkspaceList(query: Record<string, any>) {
    try {
      return await this.prisma.workspace.findMany({
        where: query,
        include: { userWorkspaces: true },
      });
    } catch (err) {
      return [];
    }
  }

  async updateWorkspace(workspaceId: number, reqBody: WorkspaceReqBody) {
    try {
      return this.prisma.workspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          name: reqBody.name,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async deleteWorkspace(workspaceId: number) {
    try {
      return await this.prisma.workspace.delete({
        where: {
          id: workspaceId,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async createUserWorkspace(
    userId: number,
    workspaceId: number,
    role: Role,
    status: UserWorkspaceStatus,
    inviterUserId?: number,
    invitationId?: string,
    invitedAt?: Date,
  ) {
    const userWorkspaceData: any = {
      role,
      userId,
      workspaceId,
      status,
      ...(inviterUserId && { inviterUserId }),
      ...(invitationId && { invitationId }),
      ...(invitedAt && { invitedAt }),
    };

    const includeData = {
      workspace: {
        select: {
          id: true,
          name: true,
          picture: true,
          creatorUserId: true,
        },
      },
      ...(inviterUserId && {
        inviter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            picture: true,
            activeWorkspaceId: true,
          },
        },
      }),
    };
    try {
      return await this.prisma.userWorkspace.create({
        data: userWorkspaceData,
        include: includeData,
      });
    } catch (err) {
      return null;
    }
  }

  async getUserWorkspace(
    userId: number,
    workspaceId: number,
    status?: UserWorkspaceStatus[],
  ) {
    try {
      return await this.prisma.userWorkspace.findFirst({
        where: {
          userId,
          workspaceId,
          ...(status && {
            status: {
              in: status,
            },
          }),
        },
      });
    } catch (err) {
      return null;
    }
  }

  async getUserWorkspaceList(filters: {
    userId: number;
    status?: UserWorkspaceStatus;
    inviterUserId?: { not: null };
  }) {
    try {
      return await this.prisma.userWorkspace.findMany({
        where: {
          userId: filters.userId,
          status: filters.status,
          inviterUserId: filters.inviterUserId,
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              picture: true,
              creatorUserId: true,
            },
          },
          inviter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              picture: true,
              activeWorkspaceId: true,
            },
          },
        },
      });
    } catch (err) {
      return [];
    }
  }

  async updateUserWorkspace(
    userWorkspaceId: number,
    reqStatus: UserWorkspaceStatus,
  ) {
    try {
      return await this.prisma.userWorkspace.update({
        where: {
          id: userWorkspaceId,
        },
        data: {
          status: reqStatus,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async updateUser(userId: number, workspaceId: number) {
    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          activeWorkspaceId: workspaceId,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async findUser(reqBody: SendInvitationReqBody) {
    try {
      return await this.prisma.user.findFirst({
        where: {
          email: reqBody.email,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async getWorkspaceUsers(workspaceId: number) {
    try {
      return this.prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          userWorkspaces: {
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  picture: true,
                },
              },
            },
          },
        },
      });
    } catch (err) {
      return null;
    }
  }
}

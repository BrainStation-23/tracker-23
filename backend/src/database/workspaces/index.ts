import { Injectable } from '@nestjs/common';
import { Role, Settings, User, UserWorkspaceStatus } from '@prisma/client';
import {
  SendInvitationReqBody,
  WorkspaceReqBody,
  userWorkspaceType,
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
      console.log(
        '🚀 ~ file: index.ts:21 ~ WorkspaceDatabase ~ getWorkspace ~ err:',
        err,
      );
      return null;
    }
  }

  async createWorkspace(userId: number, name: string, prisma: any) {
    try {
      return await prisma.workspace.create({
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

  async createUserWorkspace({
    userId,
    workspaceId,
    role,
    status,
    inviterUserId,
    invitationId,
    invitedAt,
    prisma,
  }: userWorkspaceType) {
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
      return await prisma.userWorkspace.create({
        data: userWorkspaceData,
        include: includeData,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async createUserWorkspaceWithPrisma({
    userId,
    workspaceId,
    role,
    status,
    inviterUserId,
    invitationId,
    invitedAt,
  }: userWorkspaceType) {
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
      console.log(err);
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
        include: { workspace: true, inviter: true },
        data: {
          status: reqStatus,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async updateRejectedUserWorkspace(
    rejectedUserWorkspaceId: number,
    role: Role,
    status: UserWorkspaceStatus,
    inviterUserId: number,
    invitationId: string,
  ) {
    try {
      return await this.prisma.userWorkspace.update({
        where: { id: rejectedUserWorkspaceId },
        data: {
          role,
          status,
          inviterUserId,
          invitationId,
          invitedAt: new Date(Date.now()),
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
      console.log('🚀 ~ file: index.ts:303 ~ WorkspaceDatabase ~ err:', err);
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

  async updateUserWithTransactionPrismaInstance(
    userId: number,
    workspaceId: number,
    prisma: any,
  ) {
    try {
      return await prisma.user.update({
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

  async findUser(reqBody: SendInvitationReqBody): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          email: reqBody.email.toLowerCase(),
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
              role: true,
              designation: true,
              status: true,
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

  async getUser(userId: number) {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createSettings(
    workspaceId: number,
    prisma: any,
  ): Promise<Settings | null> {
    try {
      return await prisma.settings.create({
        data: {
          workspaceId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createInvitedUser(email: string, activeWorkspaceId: number) {
    try {
      return await this.prisma.user.create({
        data: {
          email,
          activeWorkspaceId,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserWorkspaceByToken(invitationId: string) {
    try {
      return await this.prisma.userWorkspace.findFirst({
        where: {
          invitationId,
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

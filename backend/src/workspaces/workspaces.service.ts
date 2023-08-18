import { HttpStatus, Injectable } from '@nestjs/common';
import { Role, User, UserWorkspaceStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReqStatusBody, SendInvitationReqBody, WorkspaceReqBody } from './dto';
import { APIException } from 'src/internal/exception/api.exception';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(userId: number, name: string, changeWorkspace = true) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: name,
        creatorUserId: userId,
      },
    });

    try {
      await this.prisma.userWorkspace.create({
        data: {
          role: Role.ADMIN,
          userId: userId,
          workspaceId: workspace.id,
          status: UserWorkspaceStatus.ACTIVE,
        },
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: workspaces.service.ts:34 ~ WorkspacesService ~ createWorkspace ~ error:',
        error,
      );
    }
    //no need to throw error, as it deosn't concern the creation phase
    changeWorkspace &&
      (await this.changeActiveWorkspace(+workspace?.id, +userId));

    return workspace;
  }

  async getWorkspace(workspaceId: number) {
    return await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });
  }

  async getWorkspaceList(user: User) {
    try {
      const userId = user.id;
      console.log(
        '🚀 ~ file: workspaces.service.ts:46 ~ WorkspacesService ~ getWorkspaceList ~ userId:',
        userId,
      );
      const userWorkspaces = await this.prisma.userWorkspace.findMany({
        where: {
          userId,
          status: UserWorkspaceStatus.ACTIVE,
        },
      });
      const workSpaceIds = userWorkspaces.map(
        (userWorkspace) => userWorkspace.workspaceId,
      );
      const workspaces = await this.prisma.workspace.findMany({
        where: {
          id: { in: workSpaceIds },
        },
        include: { userWorkspaces: true },
      });
      return { user, workspaces };
    } catch (error) {
      console.log(
        '🚀 ~ file: workspaces.service.ts:62 ~ WorkspacesService ~ getWorkspaceList ~ error:',
        error,
      );
    }
  }
  async getOwnedWorkspaceList(userId: number) {
    return await this.prisma.workspace.findMany({
      where: {
        creatorUserId: userId,
      },
    });
  }

  async updateWorkspace(workspaceId: number, reqBody: WorkspaceReqBody) {
    return await this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name: reqBody.name,
      },
    });
  }

  async deleteWorkspace(workspaceId: number) {
    return await this.prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  }

  async getUserWorkspace(user: User) {
    try {
      return (
        user.activeWorkspaceId &&
        (await this.prisma.userWorkspace.findFirst({
          where: {
            userId: user.id,
            workspaceId: user.activeWorkspaceId,
          },
        }))
      );
    } catch (err) {
      return null;
    }
  }

  async changeActiveWorkspace(workspaceId: number, userId: number) {
    const userWorkspaceExists = await this.prisma.userWorkspace.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!userWorkspaceExists) {
      throw new APIException('Invalid workspace id', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          activeWorkspaceId: workspaceId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new APIException(
        'Can not change workspace',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendInvitation(user: User, reqBody: SendInvitationReqBody) {
    const invitedUser = await this.prisma.user.findFirst({
      where: {
        email: reqBody.email,
      },
    });
    if (!invitedUser) {
      throw new APIException('User Not found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace =
      user.activeWorkspaceId &&
      (await this.prisma.userWorkspace.findFirst({
        where: {
          userId: invitedUser?.id,
          workspaceId: user.activeWorkspaceId,
          status: {
            in: [UserWorkspaceStatus.ACTIVE, UserWorkspaceStatus.INVITED],
          },
        },
      }));

    if (userWorkspace) {
      throw new APIException(
        'This user already active or exist in this workspace',
        HttpStatus.BAD_REQUEST,
      );
    }
    const invitationToken = uuidv4();
    try {
      const newUserWorkspace =
        user.activeWorkspaceId &&
        (await this.prisma.userWorkspace.create({
          data: {
            userId: invitedUser.id,
            workspaceId: user.activeWorkspaceId,
            role: reqBody.role,
            inviterUserId: user.id,
            invitationId: invitationToken,
            status: UserWorkspaceStatus.INVITED,
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
        }));
      return newUserWorkspace;
    } catch (err) {
      throw new APIException(
        'Something is wrong to create user workspace',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getInvitationList(user: User) {
    try {
      return await this.prisma.userWorkspace.findMany({
        where: {
          userId: user.id,
          inviterUserId: { not: null },
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
      throw new APIException(
        'Can not get invitation list',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async invitationResponse(
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
      throw new APIException(
        'Can not change the invitation status',
        HttpStatus.NOT_MODIFIED,
      );
    }
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { Role, User, UserWorkspace, UserWorkspaceStatus } from '@prisma/client';
import { SendInvitationReqBody, WorkspaceReqBody } from './dto';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { APIException } from '../exception/api.exception';
import { WorkspaceDatabase } from 'src/database/workspaces';
@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private workspaceDatabase: WorkspaceDatabase,
  ) {}

  async createWorkspace(
    userId: number,
    name: string,
    changeWorkspace?: boolean,
  ) {
    const workspace = await this.workspaceDatabase.createWorkspace(
      userId,
      name,
    );
    if (!workspace) {
      throw new APIException(
        'Can not create Workspace!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const userWorkspace = await this.workspaceDatabase.createUserWorkspace(
      userId,
      workspace.id,
      Role.ADMIN,
      UserWorkspaceStatus.ACTIVE,
    );
    if (!userWorkspace) {
      throw new APIException(
        'Can not create userWorkspace!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    //no need to throw error, as it deosn't concern the creation phase
    changeWorkspace &&
      (await this.changeActiveWorkspace(+workspace.id, +userId));

    return workspace;
  }

  async getWorkspace(workspaceId: number) {
    const getWorkspace = await this.workspaceDatabase.getWorkspace(workspaceId);
    if (!getWorkspace) {
      throw new APIException('Workspace not found!', HttpStatus.BAD_REQUEST);
    }
  }

  async getWorkspaceList(user: User) {
    const userWorkspaces = await this.workspaceDatabase.getUserWorkspaceList({
      userId: user.id,
      status: UserWorkspaceStatus.ACTIVE,
    });

    const workSpaceIds = userWorkspaces.map(
      (userWorkspace: UserWorkspace) => userWorkspace.workspaceId,
    );

    const workspaces = await this.workspaceDatabase.getWorkspaceList({
      id: { in: workSpaceIds },
    });
    return { user, workspaces };
  }
  async getOwnedWorkspaceList(userId: number) {
    return await this.workspaceDatabase.getWorkspaceList({
      creatorUserId: userId,
    });
  }

  async updateWorkspace(workspaceId: number, reqBody: WorkspaceReqBody) {
    const updatedWorkspace = await this.workspaceDatabase.updateWorkspace(
      workspaceId,
      reqBody,
    );
    if (!updatedWorkspace) {
      throw new APIException(
        'Can not update Workspace!',
        HttpStatus.NOT_MODIFIED,
      );
    }
  }

  async deleteWorkspace(workspaceId: number) {
    const deletedWorkspace = await this.workspaceDatabase.deleteWorkspace(
      workspaceId,
    );
    if (!deletedWorkspace) {
      throw new APIException(
        'Can not delete Workspace!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserWorkspace(user: User) {
    const userWorkspace =
      user.activeWorkspaceId &&
      (await this.workspaceDatabase.getUserWorkspace(
        user.id,
        user.activeWorkspaceId,
      ));
    if (!userWorkspace) {
      throw new APIException(
        'UserWorkspace not found!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return userWorkspace;
  }

  async changeActiveWorkspace(workspaceId: number, userId: number) {
    const userWorkspaceExists = await this.workspaceDatabase.getUserWorkspace(
      userId,
      workspaceId,
    );
    if (!userWorkspaceExists) {
      throw new APIException(
        'Invalid UserWorkspace id',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateUser = await this.workspaceDatabase.updateUser(
      userId,
      workspaceId,
    );
    if (!updateUser) {
      throw new APIException(
        'Can not change workspace',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendInvitation(user: User, reqBody: SendInvitationReqBody) {
    const invitedUser = await this.workspaceDatabase.findUser(reqBody);
    if (!invitedUser) {
      throw new APIException('User Not found', HttpStatus.BAD_REQUEST);
    }

    const userWorkspace =
      user.activeWorkspaceId &&
      (await this.workspaceDatabase.getUserWorkspace(
        invitedUser?.id,
        user.activeWorkspaceId,
        [UserWorkspaceStatus.ACTIVE, UserWorkspaceStatus.INVITED],
      ));

    if (userWorkspace) {
      throw new APIException(
        'This user already active or invited in this workspace',
        HttpStatus.BAD_REQUEST,
      );
    }
    // invitationToken can be used for sending invitation with mail
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationHashedToken = crypto
      .createHash('sha256')
      .update(invitationToken)
      .digest('hex');

    const newUserWorkspace =
      user.activeWorkspaceId &&
      (await this.workspaceDatabase.createUserWorkspace(
        invitedUser.id,
        user.activeWorkspaceId,
        reqBody.role,
        UserWorkspaceStatus.INVITED,
        user.id,
        invitationHashedToken,
        new Date(Date.now()),
      ));
    if (!newUserWorkspace) {
      throw new APIException(
        'Can not send invitation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return newUserWorkspace;
  }

  async getInvitationList(user: User) {
    return await this.workspaceDatabase.getUserWorkspaceList({
      userId: user.id,
      inviterUserId: { not: null },
    });
  }

  async invitationResponse(
    userWorkspaceId: number,
    reqStatus: UserWorkspaceStatus,
  ) {
    const updatedUserWorkspace =
      await this.workspaceDatabase.updateUserWorkspace(
        userWorkspaceId,
        reqStatus,
      );
    if (!updatedUserWorkspace) {
      throw new APIException(
        'Can not change the invitation status',
        HttpStatus.NOT_MODIFIED,
      );
    }
    return updatedUserWorkspace;
  }

  async getWorkspaceUsers(user: User) {
    const workspace =
      user.activeWorkspaceId &&
      (await this.workspaceDatabase.getWorkspaceUsers(user.activeWorkspaceId));
    if (!workspace) {
      throw new APIException('Workspace Not found', HttpStatus.BAD_REQUEST);
    }

    const users = workspace.userWorkspaces.map((userWorkspace) => {
      return {
        role: userWorkspace.role,
        designation: userWorkspace.designation,
        firstName: userWorkspace.user.firstName,
        lastName: userWorkspace.user.lastName,
        picture: userWorkspace.user.picture,
        id: userWorkspace.user.id,
      };
    });

    return users;
  }
}

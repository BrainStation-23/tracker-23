import { HttpStatus, Injectable } from '@nestjs/common';
import { Role, User, UserWorkspace, UserWorkspaceStatus } from '@prisma/client';
import { Response } from 'express';
import * as crypto from 'crypto';

import { SendInvitationReqBody, WorkspaceReqBody } from './dto';
import { APIException } from '../exception/api.exception';
import { WorkspaceDatabase } from 'src/database/workspaces';
import { ProjectDatabase } from 'src/database/projects';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class WorkspacesService {
  constructor(
    private workspaceDatabase: WorkspaceDatabase,
    private projectDatabase: ProjectDatabase,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  async createWorkspace(
    user: Partial<User>,
    name: string,
    changeWorkspace?: boolean,
  ) {
    const transaction = await this.prisma.$transaction(async (prisma: any) => {
      const workspace =
        user.id &&
        (await this.workspaceDatabase.createWorkspace(user.id, name, prisma));
      if (!workspace) {
        throw new APIException(
          'Can not create Workspace!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const userWorkspace =
        user.id &&
        (await this.workspaceDatabase.createUserWorkspace({
          userId: user.id,
          workspaceId: workspace.id,
          role: Role.ADMIN,
          status: UserWorkspaceStatus.ACTIVE,
          prisma,
        }));
      if (!userWorkspace) {
        throw new APIException(
          'Can not create userWorkspace!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      const updatedUser =
        changeWorkspace &&
        (await this.changeActiveWorkspaceWithTransactionPrismaInstance(
          +workspace.id,
          Number(user.id),
          prisma,
        ));

      await this.workspaceDatabase.createSettings(workspace.id, prisma);
      updatedUser &&
        (await this.createLocalProjectWithTransactionPrismaInstance(
          updatedUser,
          `${name}'s Project`,
          prisma,
        ));

      return [workspace, userWorkspace];
    });
    return transaction.length == 2 ? transaction[0] : null;
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

  async deleteWorkspace(workspaceId: number, res: Response) {
    const deletedWorkspace = await this.workspaceDatabase.deleteWorkspace(
      workspaceId,
    );
    if (!deletedWorkspace) {
      throw new APIException(
        'Can not delete Workspace!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return res.status(202).json({ message: 'Workspace Deleted' });
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

    return updateUser;
  }

  async changeActiveWorkspaceWithTransactionPrismaInstance(
    workspaceId: number,
    userId: number,
    prisma: any,
  ) {
    const updateUser = await this.workspaceDatabase.updateUserWithTransactionPrismaInstance(
        userId,
        workspaceId,
        prisma,
      );
    if (!updateUser) {
      throw new APIException(
        'Can not change workspace',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updateUser;
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

    const rejectedUserWorkspace =
      user.activeWorkspaceId &&
      (await this.workspaceDatabase.getUserWorkspace(
        invitedUser?.id,
        user.activeWorkspaceId,
        [UserWorkspaceStatus.REJECTED, UserWorkspaceStatus.DELETED],
      ));
    // invitationToken can be used for sending invitation with mail
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationHashedToken = crypto
      .createHash('sha256')
      .update(invitationToken)
      .digest('hex');
    // invitationToken can be used for sending invitation with mail
    let newUserWorkspace;
    if (rejectedUserWorkspace) {
      newUserWorkspace =
        user.activeWorkspaceId &&
        (await this.workspaceDatabase.updateRejectedUserWorkspace(
          rejectedUserWorkspace.id,
          reqBody.role,
          UserWorkspaceStatus.INVITED,
          user.id,
          invitationHashedToken,
        ));
    } else {
      newUserWorkspace =
        user.activeWorkspaceId &&
        (await this.workspaceDatabase.createUserWorkspaceWithPrisma({
          userId: invitedUser.id,
          workspaceId: user.activeWorkspaceId,
          role: reqBody.role,
          status: UserWorkspaceStatus.INVITED,
          inviterUserId: user.id,
          invitationId: invitationHashedToken,
          invitedAt: new Date(Date.now()),
        }));
    }
    if (!newUserWorkspace) {
      throw new APIException(
        'Can not send invitation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const emailBody = `I hope this message finds you well. I am pleased to extend an invitation for you to join our workspace. We believe that your
      expertise and contributions would be valuable to our team, and we look forward to working together. To accept the invitation, please go to
      your Invitations tab on the site and accept our invitation`;

    await this.emailService.sendEmail(
      'Invitation to new workspace',
      emailBody,
      reqBody.email,
    );

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

  async createLocalProject(user: User, projectName: string) {
    if (!user || (user && !user?.activeWorkspaceId))
      throw new APIException(
        'No userworkspace detected',
        HttpStatus.BAD_REQUEST,
      );

    const projectExists = await this.projectDatabase.getProject(
      {
        projectName,
        source: 'T23',
        workspaceId: user?.activeWorkspaceId,
      },
      {
        integration: true,
      },
    );

    if (projectExists)
      throw new APIException(
        'Project name already exists',
        HttpStatus.BAD_REQUEST,
      );

    const newProject =
      user?.activeWorkspaceId &&
      (await this.projectDatabase.createProject(
        projectName,
        user?.activeWorkspaceId,
      ));

    if (!newProject)
      throw new APIException(
        'Project could not be created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const statusCreated = await this.projectDatabase.createStatusDetail(
      newProject?.id,
    );
    if (!statusCreated)
      throw new APIException(
        'Could not create status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return newProject;
  }

  async createLocalProjectWithTransactionPrismaInstance(user: User, projectName: string, prisma: any) {
    const projectExists = await prisma.project.findFirst({
      where: {
        projectName,
        source: 'T23',
        workspaceId: user?.activeWorkspaceId,
      },
      include: {
        integration: true,
      },
    });

    if (projectExists)
      throw new APIException(
        'Project name already exists',
        HttpStatus.BAD_REQUEST,
      );

    const newProject =
      user?.activeWorkspaceId && await prisma.project.create({
        data: {
          projectName,
          workspaceId: user?.activeWorkspaceId,
          source: 'T23',
          integrated: true,
        },
      });

    if (!newProject)
      throw new APIException(
        'Project could not be created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const statusCreated = await prisma.statusDetail.createMany({
      data: [
        {
          projectId: newProject?.id,
          name: 'To Do',
          statusCategoryName: 'TO_DO',
        },
        {
          projectId: newProject?.id,
          name: 'In Progress',
          statusCategoryName: 'IN_PROGRESS',
        },
        {
          projectId: newProject?.id,
          name: 'Done',
          statusCategoryName: 'DONE',
        },
      ],
    });
    if (!statusCreated)
      throw new APIException(
        'Could not create status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    const localPrioritiesCreated =
      await this.projectDatabase.createLocalPrioritiesWithTransactionPrismaInstance(
        newProject?.id,
        prisma,
      );
    if (!localPrioritiesCreated)
      throw new APIException(
        'Could not create local priorities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return newProject;
  }
}

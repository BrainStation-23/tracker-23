import { Injectable } from '@nestjs/common';
import { Role, User, UserStatus } from '@prisma/client';
import {
  CreateUserData,
  GoogleLoginCreateUser,
  LoginDto,
} from 'src/module/auth/dto';
import { PrismaService } from 'src/module/prisma/prisma.service';
import { UpdateSettingsReqDto } from 'src/module/user/dto/create.settings.dto';

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

  async updateSettings(user: User, settings: UpdateSettingsReqDto) {
    try {
      return (
        user.activeWorkspaceId &&
        (await this.prisma.settings.update({
          where: {
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

  async createUser(data: CreateUserData) {
    try {
      return await this.prisma.user.create({
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          picture: true,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateUser(user: Partial<User>, update: any) {
    try {
      return await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: update,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateApprovalUser(userId: number, update: any) {
    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: update,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          activeWorkspaceId: true,
          picture: true,
          approved: true,
          status: true,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findValidUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          activeWorkspaceId: true,
          picture: true,
          approved: true,
        },
      });
      if (user?.firstName) return user;
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async findUserWithHash(dto: LoginDto) {
    try {
      return await this.prisma.user.findUnique({
        where: { email: dto?.email?.toLowerCase() },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          hash: true,
          approved: true,
          status: true,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createGoogleLoginUser(data: GoogleLoginCreateUser) {
    try {
      const onboadingSteps = [
        {
          step: 'ACCESS_SELECTION',
          index: 1,
          completed: false,
          finalStep: false,
          optional: false,
        },
        {
          step: 'INVITATION',
          index: 2,
          completed: false,
          finalStep: true,
          optional: false,
        },
      ];
      const newModifiedData = {
        ...data,
        onboadingSteps: [...onboadingSteps],
        status: UserStatus.ONBOARD,
      };
      return await this.prisma.user.create({
        data: newModifiedData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          picture: true,
          activeWorkspaceId: true,
          approved: true,
          status: true,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateGoogleLoginUser(data: GoogleLoginCreateUser) {
    try {
      return await this.prisma.user.update({
        where: {
          email: data.email,
        },
        data,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUniqueUser(filter: Partial<User>) {
    try {
      return await this.prisma.user.findUnique({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUserByResetCredentials(hashedToken: string) {
    try {
      return await this.prisma.user.findFirst({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpires: { gt: new Date(Date.now()) },
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateUserById(
    filter: Record<string, any>,
    reqBody: Record<string, any>,
  ) {
    try {
      return await this.prisma.user.update({
        where: filter,
        data: reqBody,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          approved: true,
          status: true,
          picture: true,
          onboadingSteps: true,
        },
      });
    } catch (err) {
      return null;
    }
  }

  async deleteUserById(filter: Record<string, any>) {
    try {
      return await this.prisma.user.delete({
        where: filter,
      });
    } catch (err) {
      return null;
    }
  }
}

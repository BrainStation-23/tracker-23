import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User, UserWorkspaceStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspaceReqBody } from './dto';

@Injectable()
export class WorkspacesService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async createWorkspace(userId: number, name: string) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: name,
        creatorUserId: userId,
      },
    });

    await this.prisma.userWorkspace.create({
      data: {
        role: Role.ADMIN,
        userId: userId,
        workspaceId: workspace.id,
        status: UserWorkspaceStatus.ACTIVE,
      },
    });
  }

  async getWorkspace(workspaceId: number) {
    return await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });
  }

  async getWorkspaceList(userId: number) {
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
    return (
      user.activeWorkspaceId &&
      (await this.prisma.userWorkspace.findFirst({
        where: {
          userId: user.id,
          workspaceId: user.activeWorkspaceId,
        },
      }))
    );
  }
}

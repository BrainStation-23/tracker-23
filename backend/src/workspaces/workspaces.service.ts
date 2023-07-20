import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
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
    return await this.prisma.workspace.create({
      data: {
        name: name,
        creatorUserId: userId,
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

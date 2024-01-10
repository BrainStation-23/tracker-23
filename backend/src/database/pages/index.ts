import { Injectable } from '@nestjs/common';
import { Page } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class PageDatabase {
  constructor(private prisma: PrismaService) {}

  async createPage(page: Record<string, any>): Promise<Page | null> {
    try {
      return await this.prisma.page.create({
        data: {
          userWorkspaceId: page.userWorkspaceId,
          workspaceId: page.workspaceId,
          name: page.name,
        },
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: index.ts:19 ~ PageDatabase ~ createPage ~ error:',
        error,
      );
      return null;
    }
  }

  async findPage(name: string): Promise<Page | null> {
    try {
      return await this.prisma.page.findFirst({
        where: {
          name: name,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getPageById(id: number): Promise<Page | null> {
    try {
      return await this.prisma.page.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: index.ts:48 ~ PageDatabase ~ getPageById ~ error:',
        error,
      );
      return null;
    }
  }

  async getPages(query: Record<string, any>): Promise<Page[] | []> {
    try {
      return await this.prisma.page.findMany({
        where: query,
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: index.ts:43 ~ PageDatabase ~ getPages ~ error:',
        error,
      );
      return [];
    }
  }

  async updatePage(id: number, name: string): Promise<Page | null> {
    try {
      return await this.prisma.page.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: index.ts:60 ~ PageDatabase ~ updatePage ~ error:',
        error,
      );
      return null;
    }
  }

  async removePage(id: number): Promise<Page | null> {
    try {
      return await this.prisma.page.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: index.ts:78 ~ PageDatabase ~ removePage ~ error:',
        error,
      );
      return null;
    }
  }
}

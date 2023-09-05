import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class ProjectDatabase {
  constructor(private prisma: PrismaService) {}

  async getProject(filter: Record<string, any>): Promise<Project | null> {
    try {
      return await this.prisma.project.findFirst({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getLocalProjects(filter: Record<string, any>) {
    try {
      return await this.prisma.project.findMany({
        where: filter,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getLocalProjectsWithStatus(filter: Record<string, any>) {
    try {
      return await this.prisma.project.findMany({
        where: filter,
        include: {
          statuses: true,
        }
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

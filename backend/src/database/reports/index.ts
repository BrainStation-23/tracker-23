import { Injectable } from '@nestjs/common';
import { Report } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class ReportDatabase {
  constructor(private prisma: PrismaService) {}

  async findReport(query: Record<string, any>): Promise<Report | null> {
    try {
      return await this.prisma.report.findFirst({
        where: query,
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async createReport(report: Record<string, any>): Promise<Report | null> {
    try {
      return await this.prisma.report.create({
        data: {
          pageId: report.pageId,
          name: report.name,
          reportType: report.reportType,
        },
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getReportsByPageId(query: Record<string, any>): Promise<Report[] | []> {
    try {
      return await this.prisma.report.findMany({
        where: query,
      });
    } catch (err) {
      console.log(
        '🚀 ~ file: index.ts:41 ~ ReportDatabase ~ getReportsByPageId ~ err:',
        err,
      );
      return [];
    }
  }

  async getReportsById(query: Record<string, any>): Promise<Report | null> {
    try {
      return await this.prisma.report.findUnique({
        where: query,
      });
    } catch (err) {
      console.log(
        '🚀 ~ file: index.ts:55 ~ ReportDatabase ~ getReportsById ~ err:',
        err,
      );
      return null;
    }
  }

  async updateReport(
    id: number,
    report: Record<string, any>,
  ): Promise<Report | null> {
    try {
      return await this.prisma.report.update({
        where: {
          id: id,
        },
        data: report,
      });
    } catch (err) {
      console.log('🚀 ~ file: index.ts:75 ~ ReportDatabase ~ err:', err);
      return null;
    }
  }

  async removeReport(query: Record<string, any>): Promise<Report | null> {
    try {
      return await this.prisma.report.delete({
        where: query,
      });
    } catch (err) {
      console.log(
        '🚀 ~ file: index.ts:87 ~ ReportDatabase ~ removeReport ~ err:',
        err,
      );
      return null;
    }
  }

  async getSprintsByProjectId(projectId: number) {
    try {
      return await this.prisma.sprint.findMany({
        where: {
          projectId: projectId,
        },
      });
    } catch (err) {
      console.log('🚀 ~ ReportDatabase ~ getSprintByProjectId ~ err:', err);
      return [];
    }
  }
}

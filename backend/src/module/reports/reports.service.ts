import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportDatabase } from 'src/database/reports';
import { Report } from '@prisma/client';
import { APIException } from '../exception/api.exception';
import { PageDatabase } from 'src/database/pages';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportDatabase: ReportDatabase,
    private readonly pageDatabase: PageDatabase,
  ) {}
  async createReport(createReportDto: CreateReportDto) {
    const doesExistPage = await this.pageDatabase.getPageById(
      createReportDto.pageId,
    );
    if (!doesExistPage) {
      throw new APIException(
        'Page Does not exist with requested pageId',
        HttpStatus.BAD_REQUEST,
      );
    }
    const report = {
      name: createReportDto.name,
      pageId: createReportDto.pageId,
      reportType: createReportDto.reportType,
    };
    const createdPage = await this.reportDatabase.createReport(report);
    if (!createdPage) {
      throw new APIException(
        'Failed to create report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return createdPage;
  }

  async getReportsByPageId(pageId: number): Promise<Report[] | []> {
    return await this.reportDatabase.getReportsByPageId({ pageId });
  }

  async getReportById(id: number): Promise<Report | null> {
    const report = await this.reportDatabase.getReportsById({ id });
    if (!report) {
      throw new APIException(
        'Report does not exist with requested id',
        HttpStatus.BAD_REQUEST,
      );
    }
    return report;
  }

  async updateReport(
    id: number,
    query: UpdateReportDto,
  ): Promise<Report | null> {
    const sprintIds = query.sprintIds as unknown as string;
    const sprintIdArray =
      sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));

    const projectIds = query.projectIds as unknown as string;
    const projectIdArray =
      projectIds && projectIds.split(',').map((item) => Number(item.trim()));

    const types = query.types as unknown as string;
    const typeArray = types && types.split(',');

    const userIds = query.userIds as unknown as string;
    const userIdArray =
      userIds && userIds.split(',').map((item) => Number(item.trim()));

    const reqConfigBody = {
      ...(query.startDate && {
        startDate: query.startDate,
      }),
      ...(query.endDate && {
        endDate: query.endDate,
      }),
      ...(query.projectIds && { projectIds: projectIdArray }),
      ...(query.sprintIds && { sprintIds: sprintIdArray }),
      ...(query.types && { types: typeArray }),
      ...(query.userIds && { userIds: userIdArray }),
    };

    const reqBody = {
      ...(query.name && { name: query.name }),
      config: [reqConfigBody],
    };
    const updatedReport = await this.reportDatabase.updateReport(id, reqBody);
    if (!updatedReport) {
      throw new APIException('Failed to update report', HttpStatus.BAD_REQUEST);
    }

    return updatedReport;
  }

  async removeReport(id: number): Promise<Report | null> {
    const deletedReport = await this.reportDatabase.removeReport({ id });
    if (!deletedReport) {
      throw new APIException('Failed to delete report', HttpStatus.BAD_REQUEST);
    }
    return deletedReport;
  }
}

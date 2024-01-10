import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportDatabase } from 'src/database/reports';
import { Report, User } from '@prisma/client';
import { APIException } from '../exception/api.exception';
import { PageDatabase } from 'src/database/pages';
import { PagesService } from '../pages/pages.service';
import { SprintDatabase } from 'src/database/sprints';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportDatabase: ReportDatabase,
    private readonly pageDatabase: PageDatabase,
    private readonly pageService: PagesService,
    private readonly sprintDatabase: SprintDatabase,
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

  async updateReportConfig(
    user: User,
    query: { projectIds?: number[]; type?: string },
  ) {
    try {
      const pages = await this.pageService.getPages(user);
      const reports: any[] = [];
      pages.map((page) => {
        reports.push(...page.reports);
      });

      const sprintIdsByProject: number[] = [];
      if (query.projectIds) {
        const sprints = await this.reportDatabase.getSprintsByProjectId({
          projectId: { in: query.projectIds },
        });
        sprints.map((sprint) => sprintIdsByProject.push(sprint.id));
      }

      for (let index = 0; index < reports.length; index++) {
        const report = reports[index];
        const ReportProjectIds: number[] = report.config[0]?.projectIds;
        const ReportSprintIds: number[] = report.config[0]?.sprintIds;
        const types: string[] = report.config[0]?.types;

        if (ReportProjectIds && query.projectIds) {
          const filteredReportProjectIds = ReportProjectIds.filter(
            (id) => !query.projectIds?.includes(id),
          );
          report.config[0].projectIds = filteredReportProjectIds;
        }
        if (ReportSprintIds) {
          const filteredReportSprintIds = ReportSprintIds.filter(
            (id) => !sprintIdsByProject.includes(id),
          );
          report.config[0].sprintIds = filteredReportSprintIds;
        }
        if (types && query.type && types.includes(query.type)) {
          types.splice(types.indexOf(query.type), 1);
          report.config[0].types = types;
        }

        await this.reportDatabase.updateReport(Number(report.id), {
          config: [report.config[0]],
        });
      }
    } catch (err) {
      return null;
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IntegrationType, Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetTaskQuery } from 'src/tasks/dto';
import * as tmp from 'tmp';
import { Workbook } from 'exceljs';
import { Response } from 'express';
@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}
  async exportToExcel(
    user: User,
    query: GetTaskQuery,
    // sheetName: string,
    // fileName: string,
    res: Response,
  ): Promise<any> {
    const data: Task[] = await this.getTasks(user, query);
    if (!(data.length > 0) || !data) {
      throw new NotFoundException('No data to download');
    }

    const rows = [];
    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    const book = new Workbook();
    const sheet = book.addWorksheet(`Sheet 1`);
    rows.unshift(Object.keys(data[0]));
    sheet.addRows(rows);

    const file: any = await new Promise((resolve) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `MyExcelSheet`,
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          book.xlsx
            .writeFile(file)
            .then(() => {
              resolve(file);
            })
            .catch((err) => {
              throw new BadRequestException(err);
            });
        },
      );
    });
    res.download(file);
  }
  async getTasks(user: User, query: GetTaskQuery): Promise<any[]> {
    try {
      const { priority, status, text } = query;
      let { startDate, endDate } = query as unknown as GetTaskQuery;

      const jiraIntegration = await this.prisma.integration.findFirst({
        where: { userId: user.id, type: IntegrationType.JIRA },
      });

      const priority1: any = (priority as unknown as string)?.split(',');
      const status1: any = (status as unknown as string)?.split(',');

      startDate = startDate && new Date(startDate);
      endDate = endDate && new Date(endDate);
      if (endDate) {
        const oneDay = 3600 * 24 * 1000;
        endDate = new Date(endDate.getTime() + oneDay);
      }

      const databaseQuery = {
        userId: user.id,
        OR: [
          {
            assigneeId: jiraIntegration?.jiraAccountId,
            source: IntegrationType.JIRA,
          },
          {
            source: IntegrationType.TRACKER23,
          },
        ],
        ...(startDate &&
          endDate && {
            createdAt: { lte: endDate },
            updatedAt: { gte: startDate },
          }),
        ...(priority1 && { priority: { in: priority1 } }),
        ...(status1 && { status: { in: status1 } }),
        ...(text && {
          title: {
            contains: text,
            mode: 'insensitive',
          },
        }),
      };

      const tasks = await this.prisma.task.findMany({
        where: databaseQuery,
        select: {
          title: true,
          description: true,
          assigneeId: true,
          projectName: true,
          estimation: true,
          status: true,
          due: true,
          priority: true,
          labels: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          source: true,
          sessions: {
            select: {
              startTime: true,
              endTime: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              authorId: true,
              worklogId: true,
            },
          },
        },
      });
      return tasks;
    } catch (err) {
      console.log(err.message);
      return [];
    }
  }
}

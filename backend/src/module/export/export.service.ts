import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, Task, User } from '@prisma/client';
import * as tmp from 'tmp';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { SprintsService } from '../sprints/sprints.service';
import { ExportTeamTaskDataQuery, GetTaskQuery } from '../tasks/dto';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { ExportDatabase } from 'src/database/exports';
import { SprintReportFilterDto } from '../sessions/dto/sprint-report.dto';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class ExportService {
  constructor(
    private sprintService: SprintsService,
    private userWorkspaceDatabase: UserWorkspaceDatabase,
    private exportDatabase: ExportDatabase,
    private sessionsService: SessionsService,
  ) {}

  async exportToExcel(
    user: User,
    query: GetTaskQuery,
    res: Response,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const data: Task[] = await this.getTasks(user, query);
    if (!(data?.length > 0)) {
      throw new NotFoundException('No data to download');
    }

    await this.generateExcelFiles(res, data);
  }

  async exportTeamDataToExcel(
    user: User,
    query: ExportTeamTaskDataQuery,
    res: Response,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const data: Task[] = await this.getTasks(user, query);
    if (!(data?.length > 0)) {
      throw new NotFoundException('No data to download');
    }

    await this.generateExcelFiles(res, data);
  }

  async getTasks(user: User, query: GetTaskQuery) {
    let userWorkspace: any[] = [],
      userWorkspaceIds: number[] = [];
    const { priority, status, text } = query;
    const sprintIds = query.sprintId as unknown as string;
    const projectIds = query.projectIds as unknown as string;

    let { startDate, endDate } = query as unknown as GetTaskQuery;
    const sprintIdArray =
      sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));
    const projectIdArray =
      projectIds && projectIds.split(',').map((item) => Number(item.trim()));

    const currentUserWorkspace =
      user.activeWorkspaceId &&
      (await this.userWorkspaceDatabase.getSingleUserWorkspace({
        userId: user.id,
        workspaceId: user.activeWorkspaceId,
      }));
    if (query?.userIds) {
      if (currentUserWorkspace && currentUserWorkspace.role === Role.ADMIN) {
        const userIds = query?.userIds as unknown as string;
        const arrayOfUserIds = userIds?.split(',');
        const userIdsArray = arrayOfUserIds?.map(Number);
        userWorkspace =
          userIdsArray &&
          (await this.userWorkspaceDatabase.getUserWorkspaceList({
            userId: {
              in: userIdsArray,
            },
            workspaceId: user?.activeWorkspaceId,
          }));

        userWorkspaceIds = userWorkspace?.map(
          (workspace: any) => workspace?.id,
        );
      } else return [];
    }
    if (!currentUserWorkspace && userWorkspace?.length === 0) {
      return [];
    }

    const priority1: any = (priority as unknown as string)?.split(',');
    const status1: any = (status as unknown as string)?.split(',');
    startDate = startDate && new Date(startDate);
    endDate = endDate && new Date(endDate);
    if (endDate) {
      const oneDay = 3600 * 24 * 1000;
      endDate = new Date(endDate.getTime() + oneDay);
    }

    if (sprintIdArray && sprintIdArray.length) {
      // const integrationId = jiraIntegration?.jiraAccountId ?? '-1';
      const taskIds = await this.sprintService.getSprintTasksIds(sprintIdArray);

      return await this.exportDatabase.getTasks({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        userWorkspaceIds,
        currentUserWorkspace,
        taskIds,
        projectIdArray,
        priority1,
        status1,
        text,
      });
    }

    return await this.exportDatabase.getTasksWithinTimeRange({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      userWorkspaceIds,
      currentUserWorkspace,
      startDate,
      endDate,
      projectIdArray,
      priority1,
      status1,
      text,
    });
  }

  //private functions
  async generateExcelFiles(res: Response, data: Task[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const rows = [];
    const modifiedData = data?.map((doc: any) => {
      const modifiedDoc = {
        ...doc,
        totalSpent: this.getTotalSpentTime(doc.sessions),
        userName:
          doc?.userWorkspace?.user?.firstName +
          doc?.userWorkspace?.user?.lastName,
        email: doc?.userWorkspace?.user?.email,
      };
      //console.log(modifiedDoc)
      // Format the sessions data to be user-friendly
      const formattedSessions = doc.sessions.map((session: any) => {
        return {
          'Start Time': session.startTime,
          'End Time': session.endTime,
          Status: session.status,
        };
      });

      modifiedDoc.sessions = formattedSessions;
      delete modifiedDoc?.userWorkspace;
      delete doc?.userWorkspace;
      //console.log(modifiedDoc);

      rows.push(Object.values(modifiedDoc));
      return {
        ...doc,
        totalSpent: this.getTotalSpentTime(doc.sessions),
        userName:
          doc?.userWorkspace?.user?.firstName +
          doc?.userWorkspace?.user?.lastName,
        email: doc?.userWorkspace?.user?.email,
      };
    });
    const book = new Workbook();
    const sheet = book.addWorksheet(`Sheet 1`);
    // Get the column names from the data structure
    const columnNames = Object.keys(modifiedData[0]);

    // Modify the column names as desired
    const modifiedColumnNames = columnNames.map((name) => {
      if (name === 'title') {
        return 'Task Title';
      } else if (name === 'description') {
        return 'Description';
      } else if (name === 'assigneeId') {
        return 'Assignee ID';
      } else if (name === 'projectName') {
        return 'Project Name';
      } else if (name === 'estimation') {
        return 'Estimation';
      } else if (name === 'status') {
        return 'Status';
      } else if (name === 'due') {
        return 'Due Date';
      } else if (name === 'priority') {
        return 'Priority';
      } else if (name === 'labels') {
        return 'Labels';
      } else if (name === 'createdAt') {
        return 'Created At';
      } else if (name === 'updatedAt') {
        return 'Updated At';
      } else if (name === 'userId') {
        return 'User ID';
      } else if (name === 'source') {
        return 'Source';
      } else if (name === 'sessions') {
        return 'Sessions';
      } else if (name === 'url') {
        return 'URL';
      } else if (name === 'userName') {
        return 'User Name';
      } else if (name === 'email') {
        return 'Email';
      } else if (name === 'totalSpent') {
        return 'Total Spent';
      } else if (name === 'key') {
        return 'Key';
      }
      return name;
    });
    rows.unshift(modifiedColumnNames);

    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };

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

  getTotalSpentTime(sessions: any) {
    let total = 0;
    sessions?.forEach((session: any) => {
      if (session.endTime) {
        const startTime: any = new Date(session.startTime);
        const endTime: any = new Date(session.endTime);
        total += endTime - startTime;
      } else {
        const startTime: any = new Date(session.startTime);
        const endTime: any = new Date();
        total += endTime - startTime;
      }
    });

    if (!sessions || sessions?.length === 0)
      return this.getFormattedTotalTime(0);
    else {
      const time = this.getFormattedTotalTime(total);
      return time;
    }
  }

  getFormattedTotalTime(time: number) {
    if (!time) return null;
    let tmp = time;
    tmp = Math.round(tmp / 1000);
    const seconds = tmp % 60;
    tmp = Math.floor(tmp / 60);
    const mins = tmp % 60;
    tmp = Math.floor(tmp / 60);
    if (mins + tmp === 0) {
      return `${seconds ? seconds + ' s' : ''}
      `;
    }
    return `${tmp ? tmp + 'hrs ' : ''}${mins ? mins + 'm' : ''}
    `;
    // ${
    //   seconds ?? seconds + "s"
    // }
  }

  async exportSprintReportDataToExcel(
    user: User,
    query: SprintReportFilterDto,
    res: Response,
  ) {
    const data =
      await this.sessionsService.usersSpentAndEstimationReportOnSprint(
        user,
        query,
      );
    if (!data) {
      throw new NotFoundException('No data to download');
    }
    const userNameHeaders = [' '];
    data.columns.forEach((user) => {
      userNameHeaders.push(`${user.name}`);
      userNameHeaders.push(' ');
    });
    const headers = ['Sprint'];
    data.columns.forEach(() => {
      headers.push('Estimation');
      headers.push('Time Spent');
    });

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sprint report sheet');
    worksheet.addRow(userNameHeaders);
    worksheet.addRow(headers);
    // Add data rows
    data.rows.forEach((row) => {
      const rowData = [row.name];
      row.users.forEach((user: any) => {
        rowData.push(user.estimation, user.timeSpent);
      });
      worksheet.addRow(rowData);
    });

    worksheet.mergeCells('A1', 'A2');
    const mergedCell = worksheet.getCell('A1');
    mergedCell.value = 'Sprint';

    const row1 = worksheet.findRow(1);
    let col = 2;
    let cell1: any;
    row1?.eachCell((cell, colNumber) => {
      if (colNumber === col) {
        cell1 = cell;
        col += 2;
      } else if (colNumber !== 1) {
        worksheet.mergeCells(`${cell1.model.address}:${cell.model.address}`);
      }
    });

    console.log('Excel sheet generated successfully.');
    const file: any = await new Promise((resolve) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `SprintReport`,
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          workbook.xlsx
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
}

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
import {
  ExportTeamTaskDataQuery,
  GetTaskQuery,
  GetTimeSheetQueryDto,
} from '../tasks/dto';
import { UserWorkspaceDatabase } from 'src/database/userWorkspaces';
import { ExportDatabase } from 'src/database/exports';
import { SprintReportFilterDto } from '../sessions/dto/sprint-report.dto';
import { SessionsService } from '../sessions/sessions.service';
import { TasksService } from '../tasks/tasks.service';
import {
  NewSprintViewQueryDto,
  ScrumViewReqBodyDto,
  SprintViewReqBodyDto,
} from '../sprints/dto/sprintView.dto';
import * as dayjs from 'dayjs';
import { Key } from 'readline';

@Injectable()
export class ExportService {
  constructor(
    private sprintService: SprintsService,
    private userWorkspaceDatabase: UserWorkspaceDatabase,
    private exportDatabase: ExportDatabase,
    private sessionsService: SessionsService,
    private taskService: TasksService,
  ) {}

  async exportToExcel(
    user: User,
    query: GetTaskQuery,
    res: Response,
  ): Promise<any> {
    const data = await this.getTasks(user, query);
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

    const types = query.types as unknown as string;

    const currentUserWorkspace =
      user?.activeWorkspaceId &&
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
      const taskIds = await this.sprintService.getSprintTasksIds(sprintIdArray);

      return await this.exportDatabase.getTasks({
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
      userWorkspaceIds,
      currentUserWorkspace,
      startDate,
      endDate,
      projectIdArray,
      priority1,
      status1,
      text,
      types,
    });
  }

  //private functions
  async generateExcelFiles(res: Response, data: any[]) {
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

  async exportTimeSheetDataToExcel(
    user: User,
    query: GetTimeSheetQueryDto,
    res: Response,
  ) {
    const data = await this.sessionsService.getTimeSheetPerDay(user, query);
    if (!data) {
      throw new NotFoundException('No data to download');
    }
    const headers = ['User'];
    data.columns.forEach((date) => {
      headers.push(`${date}`);
    });
    headers.push('Total');

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Time sheet report for per day');
    worksheet.addRow(headers);
    for (let index = 0; index < data.rows.length; index++) {
      const row = data.rows[index];
      const rowData = [row.name];
      for (let idx = 0; idx < data.columns.length; idx++) {
        const date = data.columns[idx];
        rowData.push(row[date]);
      }
      rowData.push(row.totalTime);
      worksheet.addRow(rowData);
    }

    console.log('Excel sheet generated successfully.');
    const file: any = await new Promise((resolve) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `PerDayTimeSheet`,
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

  async getTasksWithDetails(user: User, query: GetTaskQuery) {
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
    const types = query.types as unknown as string;

    const currentUserWorkspace =
      user?.activeWorkspaceId &&
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
      const taskIds = await this.sprintService.getSprintTasksIds(sprintIdArray);

      return await this.exportDatabase.getTasksWithDetails({
        userWorkspaceIds,
        currentUserWorkspace,
        taskIds,
        projectIdArray,
        priority1,
        status1,
        text,
      });
    }

    return await this.exportDatabase.getTasksWithinTimeRangeWithDetails({
      userWorkspaceIds,
      currentUserWorkspace,
      startDate,
      endDate,
      projectIdArray,
      priority1,
      status1,
      text,
      types,
    });
  }

  async exportTimeLineSheetToExcel(
    user: User,
    query: NewSprintViewQueryDto,
    res: Response,
  ) {
    const data: any = await this.sprintService.newSprintView(user, query);
    if (!data) {
      throw new NotFoundException('No data to download');
    }

    const overallProgress: any[] = [' '];
    const headers = ['Developer Name'];
    data.columns.forEach((element: any) => {
      const calculatedProgress = this.calculateProgress(
        element.value.devProgress.spentTime,
        element.value.devProgress.estimatedTime,
      );
      if (element.key === 'AssignTasks') {
        overallProgress.push(`Sprint Overall Progress ${calculatedProgress} %`);
        headers.push(`${element.key}`);
      } else {
        const date = dayjs(element.key);
        const formattedDate = date.format('DD MMM');
        const headerDate = date.format('DD/MM/YYYY');
        overallProgress.push(
          `${formattedDate} Progress ${calculatedProgress} %`,
        );
        headers.push(headerDate);
      }
    });
    overallProgress.sort((a, b) => a - b);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Time-line sheet sprint report');
    const topRow = worksheet.addRow(overallProgress);
    const topSecondRow = worksheet.addRow(headers);
    for (let index = 0; index < data.rows.length; index++) {
      const mappedUserData = new Map<string, any[]>();
      const row = data.rows[index];

      const assignRow = row.data.find(
        (item: any) => item.key === 'AssignTasks',
      );
      const calculatedAssignProgress = this.calculateProgress(
        assignRow.value.devProgress.spentTime,
        assignRow.value.devProgress.estimatedTime,
      );
      if (assignRow.key === 'AssignTasks') {
        mappedUserData.set(assignRow.key, [
          `Overall Progress ${calculatedAssignProgress} %`,
          ...assignRow.value.tasks.map((task: any) => task.title),
        ]);
      }
      for (let idx = 0; idx < data.columns.length; idx++) {
        const columnKey = data.columns[idx].key;
        if (columnKey === 'AssignTasks') continue;
        const AssignTasks = row.data.find((item: any) => {
          if (new Date(item.key).getTime() === new Date(columnKey).getTime())
            return true;
          return false;
        });
        const calculatedUserProgress = this.calculateProgress(
          AssignTasks.value.devProgress.spentTime,
          AssignTasks.value.devProgress.estimatedTime,
        );
        const dayjsDate = dayjs(AssignTasks.key);
        const formattedDate = dayjsDate.format('DD MMM');
        mappedUserData.set(AssignTasks.key, [
          `${formattedDate} Progress ${calculatedUserProgress} %`,
          ...AssignTasks.value.tasks.map((task: any) => task.title),
        ]);
      }
      const len = mappedUserData.get('AssignTasks')?.length ?? 0;
      for (let index = 0; index < len; index++) {
        let rowData = [''];
        if (index === len / 2) {
          rowData = [row.name];
        }
        for (const value of mappedUserData.values()) {
          rowData.push(value[index] ?? ' ');
        }
        worksheet.addRow(rowData);
      }
      worksheet.addRow('');
    }

    worksheet.columns.forEach((column) => {
      column.width = 35;
      column.alignment = { vertical: 'middle', horizontal: 'left' }; // Align cells to the middle and center
    });
    worksheet.eachRow((row) => {
      row.height = 25;
      row.alignment = { vertical: 'middle', horizontal: 'left' }; // Align cells to the middle and center
    });

    topRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    topSecondRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const file: any = await new Promise((resolve) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `time_line`,
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

    console.log(
      '🚀 ~ file: export.service.ts:585 ~ ExportService ~ res:',
      file,
    );
    res.download(file);
  }

  private calculateProgress(spent: number, estimatedTime: number) {
    if (!estimatedTime) return 0;
    const exceededTime =
      spent > estimatedTime ? Math.abs(spent - estimatedTime) : 0;
    const value = Math.round(
      exceededTime > 0 ? 100 : (spent * 100) / estimatedTime,
    );
    return value;
  }

  async exportSprintViewSheetToExcel(
    user: User,
    query: SprintViewReqBodyDto,
    res: Response,
  ) {
    const { data, sprintInfo } = await this.sprintService.sprintView(
      user,
      query,
    );
    if (!data.length) {
      throw new NotFoundException('No data to download');
    }

    const headers = [
      'Date',
      'Developer name',
      'Sprint Assign Task',
      'Yesterday Task',
      'Today Task',
    ];
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sprint View Sheet');
    const { total = 0, done = 0 } = sprintInfo || {};
    const sprintProgress = Number((total * 100) / done).toFixed(2);
    // const sprintProgress = Number(
    //   (sprintInfo.total * 100) / sprintInfo.done,
    // ).toFixed(2);
    const topRow = worksheet.addRow([
      '',
      '',
      `Sprint Progress ${sprintProgress} %`,
    ]);
    const headerRow = worksheet.addRow(headers);
    topRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    worksheet.columns.forEach((column) => {
      column.width = 50;
    });
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.forEach((dateData: any) => {
      const { date, users } = dateData;
      if (!users.length) {
        return;
      }
      let isFirstDateRow = true;
      let userRowIndex = worksheet.rowCount + 1;
      let dateRowIndex = worksheet.rowCount + 1;
      let dateMaxTasks: any = 0;
      users.forEach((user: any) => {
        const { name, assignedTasks, devProgress, todayTasks, yesterdayTasks } =
          user;
        const maxTasks = Math.max(
          assignedTasks.length,
          todayTasks.length,
          yesterdayTasks.length,
        );
        dateMaxTasks += maxTasks;
        const progress = Number(
          (devProgress.total * 100) / devProgress.done,
        ).toFixed(2);
        assignedTasks.unshift({ title: `Dev Progress ${progress}%` });
        todayTasks.unshift({ title: '' });
        yesterdayTasks.unshift({ title: '' });

        for (let i = 0; i < maxTasks; i++) {
          const taskRow = [
            isFirstDateRow ? date : '',
            i === 0 ? name : '',
            assignedTasks[i]?.title || '',
            todayTasks[i]?.title || '',
            yesterdayTasks[i]?.title || '',
          ];
          const row = worksheet.addRow(taskRow);

          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Align cells to the middle and center
          });
          for (let index = 3; index <= row.cellCount; index++) {
            const cell = row.findCell(index);
            if (cell) {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          }
          if (i === 0 && assignedTasks[i]?.title.startsWith('Dev Progress')) {
            const cell = row.findCell(3);
            if (cell) {
              cell.font = { bold: true };
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
          }
          isFirstDateRow = false;
        }
        const startRowIndex = userRowIndex;
        const endRowIndex = startRowIndex + maxTasks - 1;
        try {
          worksheet.mergeCells(startRowIndex, 2, endRowIndex, 2);
        } catch (err) {}
        userRowIndex = endRowIndex + 1;

        worksheet.columns.forEach((column) => {
          column.width = 20;
        });
        worksheet.eachRow((row) => {
          row.height = 25;
        });

        for (
          let columnIndex = 3;
          columnIndex <= worksheet.columns.length;
          columnIndex++
        ) {
          worksheet.getColumn(columnIndex).width = 50;
        }
      });
      const startDateRowIndex = dateRowIndex;
      const endDateRowIndex = startDateRowIndex + dateMaxTasks - 1;
      try {
        worksheet.mergeCells(startDateRowIndex, 1, endDateRowIndex, 1);
      } catch (err) {}
      dateRowIndex = endDateRowIndex + 1;
    });

    const file: any = await new Promise((resolve) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `sprintViewSheet`,
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

    console.log(
      '🚀 ~ file: export.service.ts:585 ~ ExportService ~ res:',
      file,
    );
    res.download(file);
  }

  async exportScrumViewSheetToExcel(
    user: User,
    query: ScrumViewReqBodyDto,
    res: Response,
  ) {
    const paramDate = query.startDate;
    const paramProjectIds = query.projectIds ? query.projectIds : [];

    const { date, resData } = await this.taskService.getTasksByWeek(
      user,
      paramProjectIds,
      paramDate,
    );

    const formattedDate = new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const headers = [
      `${formattedDate}`,
      ' ',
      'Plan for this week',
      'What will do today',
      'Est. Hours',
      'What did yesterday',
      'Spent Hours',
      'Blocker (if any)',
    ];

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Scrum View Sheet');

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    worksheet.columns.forEach((column) => {
      column.width = 50;
    });

    resData.forEach((data: any) => {
      const { user, tasks, todayTasks, yesterdayTasks } = data;

      const estimationToday = todayTasks.reduce(
        (total: any, task: { estimation: any }) =>
          total + (task.estimation || 0),
        0,
      );
      const spentLast = yesterdayTasks.reduce(
        (total: any, task: { spentHours: any }) =>
          total + (task.spentHours || 0),
        0,
      );
      const userName = user ? `${user.firstName} ${user.lastName}` : ' ';

      const numTasks = Math.max(
        tasks.length,
        todayTasks.length,
        yesterdayTasks.length,
      );

      const lastRowIndex = worksheet.lastRow?.number || 1;
      const startRowIndex = lastRowIndex + 1;

      const userCellValue = `${userName}\nEst. Today: ${estimationToday}\nSpent Last: ${spentLast}`;
      // Add first task row (with user name)
      const row = worksheet.addRow([
        userCellValue,
        tasks[0]?.key || '',
        tasks[0]?.title || '',
        todayTasks[0]?.title || '',
        todayTasks[0]?.estimation || '',
        yesterdayTasks[0]?.title || '',
        yesterdayTasks[0]?.spentHours || '',
        tasks[0]?.description || '',
      ]);

      row.eachCell((cell) => {
        cell.alignment = { wrapText: true };
      });
      row.height = 25 * (Math.ceil((tasks[0]?.title?.length || 0) / 50) || 1);

      // Add remaining tasks for this user (without repeating the name)
      for (let i = 1; i < numTasks; i++) {
        worksheet.addRow([
          '', // Empty User cell
          tasks[i]?.key || '',
          tasks[i]?.title || '',
          todayTasks[i]?.title || '',
          todayTasks[i]?.estimation || '',
          yesterdayTasks[i]?.title || '',
          yesterdayTasks[i]?.spentHours || '',
          tasks[i]?.description || '',
        ]);
      }

      // Merge the user's name cell across rows if necessary
      const endRowIndex = startRowIndex + numTasks - 1;
      if (numTasks > 1) {
        worksheet.mergeCells(`A${startRowIndex}:A${endRowIndex}`);
        const mergedUserCell = worksheet.getCell(`A${startRowIndex}`);
        mergedUserCell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    await workbook.xlsx.write(res);
    res.end();
  }
}

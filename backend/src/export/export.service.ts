import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IntegrationType, Task, User, UserIntegration } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExportTeamTaskDataQuery, GetTaskQuery } from 'src/tasks/dto';
import * as tmp from 'tmp';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { APIException } from 'src/internal/exception/api.exception';
import { SprintsService } from 'src/sprints/sprints.service';
@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private sprintService: SprintsService,
  ) {}

  async exportToExcel(
    user: User,
    query: GetTaskQuery,
    res: Response,
  ): Promise<any> {
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
    const data: Task[] = await this.getTasks(user, query);
    if (!(data?.length > 0)) {
      throw new NotFoundException('No data to download');
    }

    await this.generateExcelFiles(res, data);
  }

  async getTasks(user: User, query: any): Promise<any[]> {
    {
      try {
        console.log(
          '🚀 ~ file: export.service.ts:118 ~ ExportService ~ getTasks ~ query:',
          query.status,
        );

        const { priority, status, text } = query;
        const sprintIds = query.sprintId as unknown as string;
        const projectIds = query.projectIds as unknown as string;

        let { startDate, endDate } = query as unknown as GetTaskQuery;
        const sprintIdArray =
          sprintIds && sprintIds.split(',').map((item) => Number(item.trim()));
        const projectIdArray =
          projectIds &&
          projectIds.split(',').map((item) => Number(item.trim()));
        let userWorkspace;
        let userIds, userIdArray, userWorkspaceIds: number[];
        if (query?.userIds) {
          userIds = query?.userIds as unknown as string;
          userIdArray =
            userIds && userIds.split(',').map((item) => Number(item.trim()));
          userWorkspace =
            user?.activeWorkspaceId &&
            (await this.prisma.userWorkspace.findMany({
              where: {
                userId: {
                  //@ts-ignore
                  in: userIdArray,
                },
                workspaceId: user?.activeWorkspaceId,
              },
            }));

          if (!userWorkspace || userWorkspace?.length === 0) {
            return [];
          }

          userWorkspaceIds = userWorkspace?.map(
            (workspace: any) => workspace?.id,
          );
        } else {
          userWorkspace =
            user.activeWorkspaceId &&
            (await this.prisma.userWorkspace.findFirst({
              where: {
                userId: user.id,
                workspaceId: user.activeWorkspaceId,
              },
            }));
          if (!userWorkspace) {
            return [];
          }
        }

        const priority1: any = (priority as unknown as string)?.split(',');
        const status1: any = (status as unknown as string)?.split(',');
        startDate = startDate && new Date(startDate);
        endDate = endDate && new Date(endDate);
        if (endDate) {
          const oneDay = 3600 * 24 * 1000;
          endDate = new Date(endDate.getTime() + oneDay);
        }
        let tasks: any[] = [];

        if (sprintIdArray && sprintIdArray.length) {
          // const integrationId = jiraIntegration?.jiraAccountId ?? '-1';
          const taskIds = await this.sprintService.getSprintTasksIds(
            sprintIdArray,
          );

          console.log({
            //@ts-ignore
            userWorkspaceId: userWorkspace.id,
            source: IntegrationType.JIRA,
            id: { in: taskIds },
            ...(projectIdArray && {
              projectId: { in: projectIdArray.map((id) => Number(id)) },
            }),
            ...(priority1 && { priority: { in: priority1 } }),
            ...(status1 && { status: { in: status1 } }),
            ...(text && {
              title: {
                contains: text,
                mode: 'insensitive',
              },
            }),
          });


          return await this.prisma.task.findMany({
            where: {
              //@ts-ignore
              userWorkspaceId: userWorkspaceIds
                ? { in: userWorkspaceIds }
                : //@ts-ignore
                  userWorkspace.id,
              source: IntegrationType.JIRA,
              id: { in: taskIds },
              ...(projectIdArray && {
                projectId: { in: projectIdArray.map((id) => Number(id)) },
              }),
              ...(priority1 && { priority: { in: priority1 } }),
              ...(status1 && { status: { in: status1 } }),
              ...(text && {
                title: {
                  contains: text,
                  mode: 'insensitive',
                },
              }),
            },
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
              userWorkspaceId: true,
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
              url: true,
            },
          });
        } else {
          const databaseQuery = {
            //@ts-ignore
            userWorkspaceId: userWorkspaceIds
              ? { in: userWorkspaceIds }
              : //@ts-ignore
                userWorkspace.id,
            ...(projectIdArray && {
              projectId: { in: projectIdArray.map((id) => Number(id)) },
            }),
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
          console.log(databaseQuery);

          tasks = await this.prisma.task.findMany({
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
              userWorkspaceId: true,
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
              url: true,
            },
          });
        }
        return tasks;
      } catch (err) {
        console.log(err.message);
        throw new APIException(
          'Can not export file!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  //private functions
  async generateExcelFiles(res: Response, data: Task[]) {
    const rows = [];
    data.forEach((doc: any) => {
      const modifiedDoc = { ...doc };

      // Format the sessions data to be user-friendly
      const formattedSessions = doc.sessions.map((session: any) => {
        return {
          'Start Time': session.startTime,
          'End Time': session.endTime,
          Status: session.status,
        };
      });

      modifiedDoc.sessions = formattedSessions;

      rows.push(Object.values(modifiedDoc));
    });
    const book = new Workbook();
    const sheet = book.addWorksheet(`Sheet 1`);
    // Get the column names from the data structure
    const columnNames = Object.keys(data[0]);

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
}

import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';
import axios from 'axios';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';
import { GetSprintListQueryDto } from './dto';
@Injectable()
export class SprintsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private taskService: TasksService,
  ) {}

  async getBoardList(user: User) {
    const sprint_list: any[] = [];
    const issue_list: any[] = [];
    const validSprint: any[] = [];
    const toBeUpdated: any[] = [];
    const sprintPromises: Promise<any>[] = [];
    const issuePromises: Promise<any>[] = [];
    const updated_integration = await this.taskService.updateIntegration(user);
    // console.log(formateReqBody);
    const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/board`;
    const config = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${updated_integration?.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
    const boardList = await (await axios(config)).data;

    const mappedProjectId = new Map<number, number>();
    for (let index = 0; index < boardList.total; index++) {
      const board = boardList.values[index];
      mappedProjectId.set(Number(board.location.projectId), Number(board.id));
    }
    const getUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        projectIds: true,
      },
    });
    if (!getUser) {
      throw new APIException('User not found', HttpStatus.BAD_REQUEST);
    }

    for (let index = 0; index < getUser.projectIds.length; index++) {
      const projectId = getUser.projectIds[index];
      console.log(projectId);
      const boardId = mappedProjectId.get(projectId);
      console.log(boardId);
      const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/board/${boardId}/sprint`;
      const config = {
        method: 'get',
        url,
        headers: {
          Authorization: `Bearer ${updated_integration?.accessToken}`,
          'Content-Type': 'application/json',
        },
      };
      const res = axios(config);
      sprintPromises.push(res);
    }

    const sprintResponses = await Promise.all(
      sprintPromises.map((p) =>
        p.catch((err) => {
          console.error('This board has no sprint!');
        }),
      ),
    );
    sprintResponses.map((res) => {
      res &&
        res.data &&
        res.data.values.map((val: any) => {
          if (val) {
            // console.log(val);
            validSprint.push(val);
            if (val.startDate && val.endDate && val.completeDate) {
              sprint_list.push({
                jiraSprintId: Number(val.id),
                userId: user.id,
                state: val.state,
                name: val.name,
                startDate: new Date(val.startDate),
                endDate: new Date(val.startDate),
                completeDate: new Date(val.startDate),
              });
            } else {
              toBeUpdated.push(val.id);
              sprint_list.push({
                jiraSprintId: Number(val.id),
                userId: user.id,
                state: val.state,
                name: val.name,
              });
            }

            const url = `https://api.atlassian.com/ex/jira/${updated_integration?.siteId}/rest/agile/1.0/sprint/${val.id}/issue`;
            const config = {
              method: 'get',
              url,
              headers: {
                Authorization: `Bearer ${updated_integration?.accessToken}`,
                'Content-Type': 'application/json',
              },
            };
            const res = axios(config);
            issuePromises.push(res);
          }
        });
    });
    //Get all task related to the sprint
    const resolvedPromise = await Promise.all(issuePromises);

    const [deS, crtSprnt, sprints, tasks] = await Promise.all([
      await this.prisma.sprint.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      await this.prisma.sprint.createMany({
        data: sprint_list,
      }),
      await this.prisma.sprint.findMany({
        where: {
          userId: user.id,
        },
      }),
      await this.prisma.task.findMany({
        where: {
          source: IntegrationType.JIRA,
          userId: user.id,
        },
        select: {
          id: true,
          integratedTaskId: true,
        },
      }),
    ]);

    //relation between sprintId and jiraSprintId
    const mappedSprintId = new Map<number, number>();
    for (let index = 0; index < sprints.length; index++) {
      mappedSprintId.set(
        Number(sprints[index].jiraSprintId),
        sprints[index].id,
      );
    }

    //relation between taskId and integratedTaskId
    const mappedTaskId = new Map<number, number>();
    for (let index = 0; index < tasks.length; index++) {
      mappedTaskId.set(Number(tasks[index].integratedTaskId), tasks[index].id);
    }

    resolvedPromise.map((res: any) => {
      const urlArray = res.config.url.split('/');
      const jiraSprintId = urlArray[urlArray.length - 2];
      const sprintId = mappedSprintId.get(Number(jiraSprintId));

      res.data.issues.map((nestedRes: any) => {
        const taskId = mappedTaskId.get(Number(nestedRes.id));

        issue_list.push({
          sprintId: sprintId,
          taskId: taskId,
          userId: user.id,
        });
      });
    });

    const [DST, CST, sprintTasks] = await Promise.all([
      await this.prisma.sprintTask.deleteMany({
        where: {
          userId: user.id,
        },
      }),
      await this.prisma.sprintTask.createMany({
        data: issue_list,
      }),

      await this.prisma.sprintTask.findMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return { total: sprintTasks.length, sprintTasks };
  }

  async getSprintList(user: User, reqBody: GetSprintListQueryDto) {
    try {
      const st = reqBody.state as unknown as string;
      const array =
        st &&
        st
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim());

      return await this.prisma.sprint.findMany({
        where: {
          userId: user.id,
          state: { in: array },
        },
      });
    } catch (error) {
      return [];
    }
  }
}

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, User } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';
import { GetSprintListQueryDto } from './dto';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SprintsService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private taskService: TasksService,
  ) {}

  async createSprintAndTask(user: User) {
    const sprint_list: any[] = [];
    const issue_list: any[] = [];
    const validSprint: any[] = [];
    const toBeUpdated: any[] = [];
    const sprintPromises: Promise<any>[] = [];
    const issuePromises: Promise<any>[] = [];
    const updated_integration = await this.taskService.updateIntegration(user);
    if (!updated_integration) return null;
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

    const mappedBoardId = new Map<number, number>();
    for (let index = 0; index < boardList.total; index++) {
      const board = boardList.values[index];
      mappedBoardId.set(Number(board.location.projectId), Number(board.id));
    }

    const task_list = await this.prisma.task.findMany({
      where: {
        userId: user.id,
        source: IntegrationType.JIRA,
      },
    });

    const projectIdList = new Set();
    const projectIds: any[] = [];
    for (let index = 0; index < task_list.length; index++) {
      const projectId = task_list[index].projectId;
      if (
        updated_integration.jiraAccountId === task_list[index].assigneeId &&
        !projectIdList.has(projectId)
      ) {
        projectIdList.add(projectId);
        projectIds.push(Number(projectId));
      }
    }

    //Relation between ProjectId and local project id
    const project_list = await this.prisma.projects.findMany({
      where: { integrationID: updated_integration.id },
    });
    const mappedProjectId = new Map<number, number>();
    project_list.map((project: any) => {
      mappedProjectId.set(Number(project.id), Number(project.projectId));
    });

    for (let index = 0; index < projectIds.length; index++) {
      const projectId = mappedProjectId.get(projectIds[index]);
      // console.log(projectId);
      const boardId = projectId && mappedBoardId.get(projectId);
      // console.log(boardId);
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [deS, crtSprint, sprints] = await Promise.all([
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
    for (let index = 0; index < task_list.length; index++) {
      mappedTaskId.set(
        Number(task_list[index].integratedTaskId),
        task_list[index].id,
      );
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const tmpSprints = await this.prisma.sprint.findMany({
      where: {
        userId: user.id,
      },
    });
    if (tmpSprints.length === 0) await this.createSprintAndTask(user);
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

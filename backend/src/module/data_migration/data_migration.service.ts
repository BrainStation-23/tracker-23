import { HttpStatus, Injectable } from '@nestjs/common';
import { Task, UserWorkspace } from '@prisma/client';
import { PrismaService2 } from 'src/module/prisma2/prisma.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { APIException } from '../exception/api.exception';

@Injectable()
export class DataMigrationService {
  constructor(
    private prisma: PrismaService,
    private prisma2: PrismaService2,
    private workspacesService: WorkspacesService,
  ) {}

  async getAndCreateUsers() {
    try {
      const pageSize = 100; // Adjust the batch size as needed
      let skip = 0;
      let users: any[];

      do {
        users = await this.prisma2.user.findMany({
          skip,
          take: pageSize,
        });

        //console.log(`Fetching users: skip=${skip}, count=${users.length}`);

        await Promise.all(
          users.map(async (user) => {
            const doesExist = await this.prisma.user.findFirst({
              where: {
                email: user.email,
              },
            });
            if (!doesExist) {
              //console.log('hello');

              await this.createUser(user);
            }
          }),
        );

        skip += pageSize;
      } while (users.length === pageSize);
    } catch (error) {
      console.log(
        '🚀 ~ file: data_migration.service.ts:23 ~ DataMigrationService ~ getAndCreateUser ~ error:',
        error,
      );
    }
  }

  async createUser(user: any) {
    const data = {
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      hash: user?.hash,
    };
    try {
      const newUser = await this.prisma.user.create({
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      const workspace =
        newUser.firstName &&
        (await this.workspacesService.createWorkspace(
          newUser.id,
          `${newUser.firstName}'s Workspace`,
        ));
      const updateUser =
        workspace &&
        (await this.prisma.user.update({
          where: {
            id: newUser.id,
          },
          data: {
            activeWorkspaceId: workspace.id,
          },
        }));
      return updateUser;
    } catch (err) {
      throw new APIException(
        'Can not create user!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAndCreateTasks() {
    try {
      const pageSize = 100; // Adjust the batch size as needed
      let skip = 0;
      let tasks: any[];

      do {
        tasks = await this.prisma2.task.findMany({
          where: {
            source: 'TRACKER23',
          },
          skip,
          take: pageSize,
        });
        await Promise.all(
          tasks.map(async (task) => {
            const user2 = await this.prisma2.user.findUnique({
              where: {
                id: task.userId,
              },
            });

            const user = await this.prisma.user.findUnique({
              where: {
                email: user2?.email,
              },
            });

            const userWorkspace =
              user && (await this.workspacesService.getUserWorkspace(user));
            if (!userWorkspace) {
              throw new APIException(
                'userWorkspace not found',
                HttpStatus.BAD_REQUEST,
              );
            }
            await this.createTaskAndSession(task, userWorkspace);
          }),
        );

        skip += pageSize;
      } while (tasks.length === pageSize);
    } catch (error) {
      console.log(
        '🚀 ~ file: data_migration.service.ts:84 ~ DataMigrationService ~ getAndCreateTasks ~ error:',
        error,
      );
    }
  }

  async createTaskAndSession(task: Task, userWorkspace: UserWorkspace) {
    try {
      const createdTask = await this.createTask(task, userWorkspace);
      await this.createSession(task.id, createdTask.id, userWorkspace.id);
      return createdTask;
    } catch (err) {
      console.log(
        '🚀 ~ file: data_migration.service.ts:98 ~ DataMigrationService ~ createTaskAndSession ~ err:',
        err,
      );
    }
  }

  async createTask(task: Task, userWorkspace: UserWorkspace) {
    try {
      return await this.prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          estimation: task.estimation,
          due: task.due,
          priority: task.priority,
          status: task.status,
          labels: task.labels,
          userWorkspaceId: userWorkspace.id,
          workspaceId: userWorkspace.workspaceId,
        },
      });
    } catch (err) {
      console.log(
        '🚀 ~ file: data_migration.service.ts:110 ~ DataMigrationService ~ createTask ~ err:',
        err,
      );
      throw err; // Rethrow the error to handle it at a higher level if needed
    }
  }

  async createSession(
    taskId: number,
    createdTaskId: number,
    userWorkspaceId: number,
  ) {
    try {
      const sessions = await this.prisma2.session.findMany({
        where: {
          taskId,
        },
      });

      try {
        await Promise.all(
          sessions.map(async (session) => {
            await this.prisma.session.create({
              data: {
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                taskId: createdTaskId,
                userWorkspaceId,
              },
            });
          }),
        );
      } catch (err) {
        console.log(
          '🚀 ~ file: data_migration.service.ts:247 ~ DataMigrationService ~ createSession ~ err:',
          err,
        );
      }
    } catch (err) {
      console.log(
        '🚀 ~ file: data_migration.service.ts:129 ~ DataMigrationService ~ createSession ~ err:',
        err,
      );
      throw err; // Rethrow the error to handle it at a higher level if needed
    }
  }
}

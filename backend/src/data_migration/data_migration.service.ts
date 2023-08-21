import { HttpStatus, Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaService2 } from 'src/prisma2/prisma.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Injectable()
export class DataMigrationService {
  constructor(
    private prisma: PrismaService,
    private prisma2: PrismaService2,
    private workspacesService: WorkspacesService,
  ) {}

  // async getAndCreateUser() {
  //   try {
  //     const users = await this.prisma2.user.findMany();
  //     console.log(
  //       '🚀 ~ file: data_migration.service.ts:19 ~ DataMigrationService ~ getAndCreateUser ~ users:',
  //       users,
  //     );
  //     users.map(async (user) => {
  //       const doesExist = await this.prisma.user.findFirst({
  //         where: {
  //           email: user.email,
  //         },
  //       });
  //       if (!doesExist) {
  //         await this.createUser(user);
  //       }
  //     });
  //   } catch (error) {
  //     console.log(
  //       '🚀 ~ file: data_migration.service.ts:23 ~ DataMigrationService ~ getAndCreateUser ~ error:',
  //       error,
  //     );
  //   }
  // }

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

        console.log(`Fetching users: skip=${skip}, count=${users.length}`);

        await Promise.all(
          users.map(async (user) => {
            const doesExist = await this.prisma.user.findFirst({
              where: {
                email: user.email,
              },
            });
            if (!doesExist) {
              console.log('hello');

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

        console.log(`Fetching tasks: skip=${skip}, count=${tasks.length}`);

        await Promise.all(
          tasks.map(async (task) => {
            await this.createTaskAndSession(task);
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

  async createTaskAndSession(task: Task) {
    try {
      const createdTask = await this.createTask(task);
      await this.createSession(task.id);
      return createdTask;
    } catch (err) {
      console.log(
        '🚀 ~ file: data_migration.service.ts:98 ~ DataMigrationService ~ createTaskAndSession ~ err:',
        err,
      );
    }
  }

  async createTask(task: Task) {
    try {
      return this.prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          estimation: task.estimation,
          due: task.due,
          priority: task.priority,
          status: task.status,
          labels: task.labels,
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

  async createSession(taskId: number) {
    try {
      const sessions = await this.prisma2.session.findMany({
        where: {
          taskId,
        },
      });

      await Promise.all(
        sessions.map(async (session) => {
          await this.prisma.session.create({
            data: {
              startTime: session.startTime,
              endTime: session.endTime,
              status: session.status,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt,
              taskId: session.taskId,
            },
          });
        }),
      );
    } catch (err) {
      console.log(
        '🚀 ~ file: data_migration.service.ts:129 ~ DataMigrationService ~ createSession ~ err:',
        err,
      );
      throw err; // Rethrow the error to handle it at a higher level if needed
    }
  }
}

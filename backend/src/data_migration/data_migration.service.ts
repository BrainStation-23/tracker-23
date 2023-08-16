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
    private readonly prisma2: PrismaService2,
    private workspacesService: WorkspacesService,
  ) {}

  async getAndCreateUser() {
    try {
      const users = await this.prisma2.user.findMany();
      console.log(
        '🚀 ~ file: data_migration.service.ts:19 ~ DataMigrationService ~ getAndCreateUser ~ users:',
        users,
      );
      users.map(async (user) => {
        await this.createUser(user);
      });
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

  async getAndCreateTask() {
    const tasks = await this.prisma2.task.findMany({});
    tasks.map(async (task) => {
      await this.createTask(task);
    });
  }
  async createTask(task: Task) {
    // const userWorkspace = await this.workspacesService.getUserWorkspace(user);
    // if (!userWorkspace) {
    //   throw new APIException(
    //     'User workspace not found',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    const newTask = await this.prisma.task.create({
      data: {
        // userWorkspaceId: task.userWorkspaceId,
        title: task.title,
        description: task.description,
        estimation: task.estimation,
        due: task.due,
        priority: task.priority,
        status: task.status,
        labels: task.labels,
        // workspaceId: task.workspaceId,
      },
    });
    return newTask;
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { APIException } from 'src/internal/exception/api.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Injectable()
export class DataMigrationService {
  constructor(
    private prisma: PrismaService,
    private workspacesService: WorkspacesService,
  ) {}

  async getAndCreateUser() {
    const users = await this.prismaAzure.user.findMany({});
    users.map(async (user) => {
      await this.createUser(user);
    });
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
    const tasks = await this.prismaAzure.task.findMany({});
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
        userWorkspaceId: task.userWorkspaceId,
        title: task.title,
        description: task.description,
        estimation: task.estimation,
        due: task.due,
        priority: task.priority,
        status: task.status,
        labels: task.labels,
        workspaceId: task.workspaceId,
      },
    });
    return newTask;
  }
}

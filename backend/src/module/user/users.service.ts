import { HttpStatus, Injectable } from '@nestjs/common';
import { Role, User, UserWorkspaceStatus } from '@prisma/client';

import { WorkspaceDatabase } from 'src/database/workspaces/index';
import { UsersDatabase } from 'src/database/users';
import { APIException } from '../exception/api.exception';
import { UpdateSettingsReqDto } from './dto/create.settings.dto';
import { TasksDatabase } from 'src/database/tasks';
import { UpdateApprovalUserRequest } from './dto/update.approvalUser.request.dto';
import { UserListByProjectIdReqDto } from './dto/getUserListByProjectId.dto';
import { ProjectDatabase } from 'src/database/projects';
import { SessionDatabase } from 'src/database/sessions';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';

@Injectable()
export class UsersService {
  constructor(
    private usersDatabase: UsersDatabase,
    private workspaceDatabase: WorkspaceDatabase,
    private tasksDatabase: TasksDatabase,
    private projectDatabase: ProjectDatabase,
    private sessionDatabase: SessionDatabase,
    private userIntegrationDatabase: UserIntegrationDatabase,
  ) {}

  async getUsers(user: User) {
    if (!user || !user.activeWorkspaceId)
      throw new APIException(
        'No user workspace detected',
        HttpStatus.BAD_REQUEST,
      );

    return await this.usersDatabase.findUsers(user);
  }

  async updateRole(user: User, userId: number, role: Role) {
    if (!user || !user.activeWorkspaceId)
      throw new APIException(
        'No user workspace detected',
        HttpStatus.BAD_REQUEST,
      );

    const updateUserRole = await this.usersDatabase.updateRole(
      user,
      userId,
      role,
    );
    if (!updateUserRole)
      throw new APIException(
        'Restricted Action: User is not in your workspace.',
        HttpStatus.BAD_REQUEST,
      );

    return updateUserRole;
  }

  async updateSettings(user: User, data: UpdateSettingsReqDto) {
    if (!user.activeWorkspaceId)
      throw new APIException('No workspace detected', HttpStatus.BAD_REQUEST);

    const settingsExists = await this.tasksDatabase.getSettings(user);
    if (!settingsExists)
      throw new APIException('Cannot update settings', HttpStatus.BAD_REQUEST);

    const updatedSettings = await this.usersDatabase.updateSettings(user, data);
    if (!updatedSettings)
      throw new APIException(
        'Cannot update settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return updatedSettings;
  }

  async getSettings(user: User) {
    return await this.tasksDatabase.getSettings(user);
  }
  async getUserList(user: User) {
    if (user.email !== 'seefathimel1@gmail.com') {
      throw new APIException('You are not authorized', HttpStatus.FORBIDDEN);
    }
    return await this.usersDatabase.getAllUsers();
  }
  async updateApprovalUser(
    user: User,
    userId: any,
    req: UpdateApprovalUserRequest,
  ) {
    if (user.email !== 'seefathimel1@gmail.com') {
      throw new APIException('You are not authorized', HttpStatus.FORBIDDEN);
    }
    const updateUserId = parseInt(userId);
    return await this.usersDatabase.updateApprovalUser(updateUserId, req);
  }

  async userListByProjectId(user: User, query: UserListByProjectIdReqDto) {
    const projectIds = query?.projectIds as unknown as string;
    const arrayOfProjectIds = projectIds?.split(',');
    const projectIdsArray = arrayOfProjectIds?.map(Number);
    const projects = await this.projectDatabase.getProjects({
      ...(query?.projectIds && {
        id: { in: projectIdsArray },
      }),
      workspaceId: user.activeWorkspaceId,
      integrated: true,
    });

    const getUserWorkspaceList =
      await this.sessionDatabase.getUserWorkspaceList({
        workspaceId: user.activeWorkspaceId,
        status: UserWorkspaceStatus.ACTIVE,
      });

    const userMap = new Map<number, any>();

    for (const project of projects) {
      for (
        let index = 0, len = getUserWorkspaceList.length;
        index < len;
        index++
      ) {
        const userWorkspace = getUserWorkspaceList[index];
        const userIntegration =
          await this.userIntegrationDatabase.getUserIntegration({
            UserIntegrationIdentifier: {
              integrationId: project.integrationId,
              userWorkspaceId: userWorkspace.id,
            },
          });

        if (userIntegration && !userMap.has(userWorkspace.id)) {
          userMap.set(userWorkspace.id, {
            id: userWorkspace.user.id,
            name: userWorkspace.user.lastName
              ? userWorkspace.user.firstName + ' ' + userWorkspace.user.lastName
              : userWorkspace.user.firstName,
            picture: userWorkspace.user.picture,
          });
        }
      }
    }
    return [...userMap.values()];
  }
}

import { HttpStatus, Injectable } from "@nestjs/common";
import { Role, User } from "@prisma/client";

import { WorkspaceDatabase } from 'src/database/workspaces/index';
import { UsersDatabase } from "src/database/users";
import { APIException } from "../exception/api.exception";
import { UpdateSettingsReqDto } from './dto/create.settings.dto';
import { TasksDatabase } from "src/database/tasks";

@Injectable()
export class UsersService {
  constructor(
    private usersDatabase: UsersDatabase,
    private workspaceDatabase: WorkspaceDatabase,
    private tasksDatabase: TasksDatabase,
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

    const updateUserRole = await this.usersDatabase.updateRole(user, userId, role);
    if (!updateUserRole)
      throw new APIException(
        'Restricted Action: User is not in your workspace.',
        HttpStatus.BAD_REQUEST,
      );

    return updateUserRole;
  }

  async updateSettings(user: User, data: UpdateSettingsReqDto) {
    if(!user.activeWorkspaceId) throw new APIException('No workspace detected', HttpStatus.BAD_REQUEST);

    const settingsExists = await this.tasksDatabase.getSettings(user);
    if(!settingsExists)
      throw new APIException(
        'Cannot update settings',
        HttpStatus.BAD_REQUEST,
      );

    const updatedSettings = await this.usersDatabase.updateSettings(user, data);
    if (!updatedSettings)
      throw new APIException('Cannot update settings', HttpStatus.INTERNAL_SERVER_ERROR);

    return updatedSettings;
  }
}
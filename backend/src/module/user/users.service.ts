import { HttpStatus, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

import { WorkspaceDatabase } from 'src/database/workspaces/index';
import { UsersDatabase } from "src/database/users";
import { APIException } from "../exception/api.exception";
import { CreateSettingsReqDto } from "./dto/create.settings.dto";

@Injectable()
export class UsersService {
  constructor(private usersDatabase: UsersDatabase, private workspaceDatabase: WorkspaceDatabase) {}

  async getUsers(user: User) {
    if (!user || !user.activeWorkspaceId)
      throw new APIException(
        'No user workspace detected',
        HttpStatus.BAD_REQUEST,
      );

    return await this.usersDatabase.findUsers(user);
  }

  async updateRole(user: User, userId: number) {
    if (!user || !user.activeWorkspaceId)
      throw new APIException(
        'No user workspace detected',
        HttpStatus.BAD_REQUEST,
      );

    const updateUserRole = await this.usersDatabase.updateRole(user, userId);
    if (!updateUserRole)
      throw new APIException(
        'Restricted Action: User is not in your workspace.',
        HttpStatus.BAD_REQUEST,
      );

    return updateUserRole;
  }

  async createSettings(user: User, data: CreateSettingsReqDto){
    const userWorkspace = user.activeWorkspaceId && await this.workspaceDatabase.getUserWorkspace(user.id, user.activeWorkspaceId);
    if(!userWorkspace)
      throw new APIException('No workspace detected', HttpStatus.BAD_REQUEST);

    const newSettings = await this.usersDatabase.createSettings({...data, userId: user.id, userWorkspaceId: userWorkspace.id});
    if(!newSettings) throw new APIException('Could not create settings',HttpStatus.INTERNAL_SERVER_ERROR);

    return newSettings;
  }
}
import { HttpStatus, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { UsersDatabase } from "src/database/users";
import { APIException } from "../exception/api.exception";

@Injectable()
export class UsersService {
  constructor(private usersDatabase: UsersDatabase) {}

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
}
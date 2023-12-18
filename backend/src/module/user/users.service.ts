import { HttpStatus, Injectable } from '@nestjs/common';
import { Role, User, UserStatus, UserWorkspaceStatus } from '@prisma/client';
import { UsersDatabase } from 'src/database/users';
import { APIException } from '../exception/api.exception';
import { UpdateSettingsReqDto } from './dto/create.settings.dto';
import { TasksDatabase } from 'src/database/tasks';
import {
  UpdateApprovalUserRequest,
  UpdateUserOnboardingStepReqBody,
} from './dto/update.approvalUser.request.dto';
import { UserListByProjectIdReqDto } from './dto/getUserListByProjectId.dto';
import { ProjectDatabase } from 'src/database/projects';
import { SessionDatabase } from 'src/database/sessions';
import { UserIntegrationDatabase } from 'src/database/userIntegrations';
import { SendInvitationReqBody } from '../workspaces/dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class UsersService {
  constructor(
    private usersDatabase: UsersDatabase,
    private workspacesService: WorkspacesService,
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
            userId: userWorkspace.user.id,
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

  async deleteUserById(userId: number) {
    const deletedUser = await this.usersDatabase.deleteUserById({ id: userId });
    if (!deletedUser) {
      throw new APIException(
        'Can not delete this user!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return deletedUser;
  }

  async updateUserById(
    userId: number,
    reqBody: UpdateUserOnboardingStepReqBody,
  ) {
    const user = await this.usersDatabase.findUniqueUser({ id: userId });
    if (!user) {
      throw new APIException('User not found!', HttpStatus.BAD_REQUEST);
    }
    const emailIds = reqBody?.emails as unknown as string;
    const arrayOfEmailIds = emailIds?.split(',');
    if (reqBody?.emails) {
      for (let index = 0, len = arrayOfEmailIds.length; index < len; index++) {
        const email = arrayOfEmailIds[index];
        const reqBody: SendInvitationReqBody = {
          email,
          role: Role.USER,
        };
        const invitedUser = await this.workspacesService.sendInvitation(
          user,
          reqBody,
        );
        if (!invitedUser) {
          throw new APIException(
            'Could not send invitation',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    // Find the index of the onboarding step to update
    const indexToUpdate = user.onboadingSteps.findIndex(
      (step: any) => step.index === Number(reqBody.index),
    );
    if (indexToUpdate === -1) {
      throw new APIException(
        'Onboarding step not found!',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Assert the type of onboarding step
    const onboardingStep = user.onboadingSteps[indexToUpdate] as {
      step: string;
      index: number;
      optional: boolean;
      completed: boolean;
      finalStep: boolean;
    };
    user.onboadingSteps[indexToUpdate] = {
      step: onboardingStep.step,
      index: onboardingStep.index,
      optional: onboardingStep.optional,
      completed: reqBody.completed,
      finalStep: onboardingStep.finalStep,
    };

    const updatedUser = await this.usersDatabase.updateUserById(
      { id: userId },
      {
        onboadingSteps: user.onboadingSteps,
        ...(onboardingStep.finalStep &&
          reqBody.completed && { status: UserStatus.ACTIVE }),
      },
    );
    if (!updatedUser) {
      throw new APIException(
        'Can not update this user!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return updatedUser;
  }
}

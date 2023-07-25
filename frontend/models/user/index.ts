export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  activeWorkspaceId?: number;
}

export interface WorkspaceDto {
  id: number;
  name: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
  creatorUserId: number;
  userWorkspaces: UserWorkspaceDto[];
}

export interface UserWorkspaceDto {
  id: number;
  role: string;
  valid: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  workspaceId: number;
  inviterId?: number;
  invitationID?: number;
  status: string;
}

export interface GetWorkspaceListWithUserDto {
  user: UserDto;
  workspaces: WorkspaceDto[];
}

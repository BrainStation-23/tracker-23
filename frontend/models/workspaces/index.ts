import { UserDto } from "models/user";

export interface WorkspaceDto {
  id: number;
  name: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
  creatorUserId: number;
  active?: boolean;
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
  inviterId: number | null;
  invitationID: number | null;
  status: string;
}

export interface GetWorkspaceListWithUserDto {
  user: UserDto;
  workspaces: WorkspaceDto[];
}

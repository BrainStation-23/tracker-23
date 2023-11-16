import { UserWorkspaceDto, WorkspaceDto } from "models/workspaces";

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  activeWorkspaceId?: number;
  role?: string;
  picture?: string;
  designation?: string;
  activeWorkspace?: WorkspaceDto;
  activeUserWorkspace?: UserWorkspaceDto;
  approved?: boolean;
}

export interface updateApprovalUserDto {
  approved: boolean;
}

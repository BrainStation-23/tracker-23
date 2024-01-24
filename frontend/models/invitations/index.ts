import {
  UserDto,
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from "models/user";

interface Workspace {
  id: number;
  name: string;
  picture: string | null;
  createdAt?: string;
  updatedAt?: string;
  creatorUserId: number;
}

export interface InviteUserWorkspaceDto {
  id: number;
  role: WorkspaceMemberRole;
  valid: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  picture?: any;
  workspaceId: number;
  inviterId: number;
  invitationId: string | null;
  status: WorkspaceMemberStatus;
  designation?: string;
  workspace: Workspace;
  inviter: UserDto;
}

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
  status?: "ACTIVE" | "ONBOARD";
  onboadingSteps?: StepInfo[];
}

export enum WorkspaceMemberStatusEnum {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  INVITED = "Invited",
  DELETED = "Deleted",
  REJECTED = "Rejected",
}

export type WorkspaceMemberStatus = keyof typeof WorkspaceMemberStatusEnum;

export enum WorkspaceMemberRoleEnum {
  ADMIN = "Admin",
  USER = "User",
}

export type WorkspaceMemberRole = keyof typeof WorkspaceMemberRoleEnum;

export interface WorkspaceMemberDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  activeWorkspaceId?: number;
  role: WorkspaceMemberRole;
  picture?: string;
  designation?: string;
  approved?: boolean;
  status: WorkspaceMemberStatus;
}

export enum WorkspaceMemberRoleBGColorEnum {
  ADMIN = "#F0FFE2",
  USER = "#E4F2FF",
}

type WorkspaceMemberRoleBGColorMap = {
  [K in keyof typeof WorkspaceMemberRoleEnum]: (typeof WorkspaceMemberRoleBGColorEnum)[K];
};

export type WorkspaceMemberRoleBGColor = WorkspaceMemberRoleBGColorMap;

export enum WorkspaceMemberRoleBorderColorEnum {
  ADMIN = "#6CAE2B",
  USER = "#56A2E9",
}

// type WorkspaceMemberRoleBorderColorMap = {
//   [K in keyof typeof WorkspaceMemberRoleBorderColorEnum]: (typeof WorkspaceMemberRoleBorderColorEnum)[K];
// };

export enum WorkspaceMemberStatusBGColorEnum {
  ACTIVE = "#F0FFE2",
  INACTIVE = "#F9F9F9",
  INVITED = "#E4F2FF",
  DELETED = "#FFF0ED",
  REJECTED = "#FFF4E8",
}

type WorkspaceMemberStatusBGColorMap = {
  [K in keyof typeof WorkspaceMemberStatusEnum]: (typeof WorkspaceMemberStatusBGColorEnum)[K];
};

export type WorkspaceMemberStatusBGColor = WorkspaceMemberStatusBGColorMap;

export enum WorkspaceMemberStatusBorderColorEnum {
  ACTIVE = "#6CAE2B",
  INACTIVE = "#ADACB0",
  INVITED = "#56A2E9",
  DELETED = "#FE8A6F",
  REJECTED = "#FF8F00",
}

type WorkspaceMemberStatusBorderColorMap = {
  [K in keyof typeof WorkspaceMemberStatusBorderColorEnum]: (typeof WorkspaceMemberStatusBorderColorEnum)[K];
};

export type WorkspaceMemberStatusBorderColor =
  WorkspaceMemberStatusBorderColorMap;

export interface updateApprovalUserDto {
  approved: boolean;
}
export interface updateOnboardingUserDto {
  index: number;
  completed: boolean;
  emails?: string;
}

export interface StepInfo {
  step: "ACCESS_SELECTION" | "INVITATION";
  index: number;
  optional: boolean;
  completed: boolean;
  finalStep: boolean;
}

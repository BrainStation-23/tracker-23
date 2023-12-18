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
  onboadingSteps: StepInfo[];
}

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

import {
  CreateLocalProjectModel,
  CreateWorkspaceModel,
  SearchParamsModel,
  SprintUserReportParamsModel,
} from "models/apiParams";
import {
  ForgotPasswordDto,
  LoginDto,
  LoginResponseDto,
  ResetPasswordDto,
} from "models/auth";
import { SendWorkspaceInviteDto } from "models/invitation";
import {
  CreateReportDto,
  CreateReportPageDto,
  getTimeSheetReportDto,
  SprintReportDto,
  SprintUserReportDto,
  SprintViewReportDto,
  SprintViewTimelineReportDto,
  UpdateReportDto,
  UpdateReportPageDto,
} from "models/reports";
import {
  AddWorkLogParams,
  CreateTaskDto,
  UpdateTaskEstimationParams,
  UpdateTaskStatusParams,
} from "models/tasks";
import { updateApprovalUserDto, WorkspaceMemberStatus } from "models/user";

import { RegisterDto } from "../models/auth/index";
import { TaskDto } from "../models/tasks/index";
import {
  updateOnboardingUserDto,
  WorkspaceMemberDto,
} from "../models/user/index";

export interface apiFunction {
  login: (data: LoginDto) => Promise<LoginResponseDto | undefined>;
  loginFromInvite: (data: LoginDto) => Promise<LoginResponseDto | undefined>;
  googleLogin: (
    code: string,
    invitationCode?: string
  ) => Promise<LoginResponseDto | undefined>;
  logout: () => {};
  registerUser: (data: RegisterDto) => Promise<LoginResponseDto | undefined>;
  sendOTP: (data: RegisterDto) => Promise<LoginResponseDto | undefined>;
  registerUserFromInvite: (
    data: RegisterDto
  ) => Promise<LoginResponseDto | undefined>;
  createTask: (data: CreateTaskDto) => Promise<TaskDto>;
  deleteTask: (data: any) => Promise<any | undefined>;
  getTasks: (searchParams?: SearchParamsModel) => Promise<any>;
  getTaskListReport: (searchParams?: SearchParamsModel) => Promise<any>;
  exportTasks: (searchParams?: SearchParamsModel) => Promise<any>;
  exportSprintReport: (
    searchParams?: SprintUserReportParamsModel
  ) => Promise<any>;
  syncTasks: () => Promise<any>;
  syncProjectTasks: (projectId: number) => Promise<any>;
  syncStatus: (token?: string) => Promise<any>;
  getIntegrations: (token?: string) => Promise<any>;
  uninstallIntegration: (id: number) => Promise<any>;
  deleteIntegration: (id: number) => Promise<any>;
  selectJiraIntegration: (id: string) => Promise<any>;
  createSession: (taskID: string) => Promise<any>;
  stopSession: (taskID: string) => Promise<any>;
  authJira: () => Promise<any>;
  getJiraLink: () => Promise<any>;
  getOutlookLink: () => Promise<any>;
  sendJiraCode: (code: string) => Promise<any>;
  sendOutlookCode: (code: string) => Promise<any>;
  getProjectWiseHour: (dates?: any) => Promise<any>;
  getSpentTimePerDay: (dates?: any) => Promise<any>;
  addManualWorkLog: (data: AddWorkLogParams) => Promise<any>;
  updateTaskSTatus: (taskId: any, data: UpdateTaskStatusParams) => Promise<any>;
  updateTaskEstimation: (
    taskId: any,
    data: UpdateTaskEstimationParams
  ) => Promise<any>;
  pinTask: (taskId: any, pinned: boolean) => Promise<any>;
  getIntegratedProjectStatuses: () => Promise<any>;
  getNotifications: () => Promise<any>;
  markNotificationSeen: (id: number) => Promise<any>;
  markAllNotificationsSeen: () => Promise<any>;
  markAllNotificationsCleared: () => Promise<any>;
  deleteSession: (sessionId: number) => Promise<any>;
  updateSession: (sessionId: number, data: AddWorkLogParams) => Promise<any>;
  getJiraSprints: () => Promise<any>;
  getReportSprints: () => Promise<any>;
  getAllProjects: () => Promise<any>;
  getAllReportProjects: () => Promise<any>;
  getWorkspaceList: () => Promise<any>;
  getWorkspaceMembers: () => Promise<WorkspaceMemberDto[] | false>;
  getWorkspaceSettings: () => Promise<any>;
  createWorkspace: (data: CreateWorkspaceModel) => Promise<any>;
  updateWorkspace: (data: CreateWorkspaceModel, id: number) => Promise<any>;
  changeWorkspace: (id: number) => Promise<any>;
  deleteWorkspace: (id: number) => Promise<any>;
  getWorkspaceInvitationList: () => Promise<any>;
  sendWorkspaceInvitation: (data: SendWorkspaceInviteDto) => Promise<any>;
  acceptWorkspaceInvitation: (id: number) => Promise<any>;
  rejectWorkspaceInvitation: (id: number) => Promise<any>;
  updateMemberStatus: (
    id: number,
    status: WorkspaceMemberStatus
  ) => Promise<any>;
  importProject: (id: number) => Promise<any>;
  importCalendar: (ids: number[]) => Promise<any>;
  createProject: (data: CreateLocalProjectModel) => Promise<any>;
  deleteProjectTasks: (id: number) => Promise<any>;
  getJiraActiveSprintTasks: (searchParams?: SearchParamsModel) => Promise<any>;
  forgotPassword: (data?: ForgotPasswordDto) => Promise<any>;
  resetPassword: (token: string, data: ResetPasswordDto) => Promise<any>;
  updateSyncTime: (time: number) => Promise<any>;
  updateTimeFormat: (value: string) => Promise<any>;
  getTimeSheetReport: (data: getTimeSheetReportDto) => Promise<any>;
  exportTimeSheetReport: (data: getTimeSheetReportDto) => Promise<any>;
  getSprintUserReport: (
    data?: SprintUserReportParamsModel
  ) => Promise<SprintUserReportDto>;
  getSprintReport: (data?: any) => Promise<SprintReportDto>;
  getSprintViewReport: (data?: any) => Promise<SprintViewReportDto | false>;
  getSprintViewTimelineReport: (
    data?: any
  ) => Promise<SprintViewTimelineReportDto | false>;
  getInvitedUserInfo: (token: string) => Promise<any>;
  getAllUsers: () => Promise<any>;
  updateApprovalUser: (
    userId: number,
    data: updateApprovalUserDto
  ) => Promise<any>;
  updateOnboardingUser: (
    userId: number,
    data: updateOnboardingUserDto
  ) => Promise<any>;
  userListByProject: (projectIds: number[]) => Promise<any>;
  createReportPage: (data: CreateReportPageDto) => Promise<any>;
  createReport: (data: CreateReportDto) => Promise<any>;
  updateReport: (reportId: number, data: UpdateReportDto) => Promise<any>;
  updateReportPage: (
    reportId: number,
    data: UpdateReportPageDto
  ) => Promise<any>;
  deleteReportPage: (reportId: number) => Promise<any>;
  deleteReport: (reportId: number) => Promise<any>;
  getIntegrationTypesReportPage: () => Promise<any>;
}

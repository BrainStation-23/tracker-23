import { SearchParamsModel } from "models/apiParams";
import { LoginDto, LoginResponseDto } from "models/auth";
import {
  AddWorkLogParams,
  CreateTaskDto,
  UpdateTaskStatusParams,
} from "models/tasks";

import { RegisterDto } from "../models/auth/index";
import { TaskDto } from "../models/tasks/index";

export interface apiFunction {
  login: (data: LoginDto) => Promise<LoginResponseDto | undefined>;
  googleLogin: (code: string) => Promise<LoginResponseDto | undefined>;
  logout: () => {};
  registerUser: (data: RegisterDto) => Promise<RegisterDto | undefined>;
  createTask: (data: CreateTaskDto) => Promise<TaskDto>;
  deleteTask: (data: any) => Promise<any | undefined>;
  getTasks: (searchParams?: SearchParamsModel) => Promise<any>;
  exportTasks: (searchParams?: SearchParamsModel) => Promise<any>;
  syncTasks: (token?: string) => Promise<any>;
  syncStatus: (token?: string) => Promise<any>;
  getIntegrations: (token?: string) => Promise<any>;
  deleteIntegration: (id: number) => Promise<any>;
  createSession: (taskID: string) => Promise<any>;
  stopSession: (taskID: string) => Promise<any>;
  authJira: () => Promise<any>;
  getJiraLink: () => Promise<any>;
  sendJiraCode: (code: string) => Promise<any>;
  getProjectWiseHour: (dates?: any) => Promise<any>;
  getSpentTimePerDay: (dates?: any) => Promise<any>;
  addManualWorkLog: (data: AddWorkLogParams) => Promise<any>;
  updateTaskSTatus: (taskId: any, data: UpdateTaskStatusParams) => Promise<any>;
}

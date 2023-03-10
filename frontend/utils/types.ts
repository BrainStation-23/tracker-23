import { LoginDto, LoginResponseDto } from "models/auth";
import { CreateTaskDto } from "models/tasks";
import { RegisterDto } from "../models/auth/index";
import { TaskDto } from "../models/tasks/index";

export interface apiFunction {
  login: (data: LoginDto) => Promise<LoginResponseDto | undefined>;
  logout: () => {};
  registerUser: (data: RegisterDto) => Promise<RegisterDto | undefined>;
  createTask: (data: CreateTaskDto) => Promise<TaskDto>;
  deleteTask: (data: any) => Promise<any | undefined>;
  getTasks: (token?: string) => Promise<any>;
  syncTasks: (token?: string) => Promise<any>;
  getIntegrations: (token?: string) => Promise<any>;
  createSession: (taskID: string) => Promise<any>;
  stopSession: (taskID: string) => Promise<any>;
  authJira: () => Promise<any>;
  getJiraLink: () => Promise<any>;
  sendJiraCode: (code: string) => Promise<any>;
}

import { StatusType } from "@/storage/redux/projectsSlice";
import { TablePaginationConfig } from "antd";
import { FilterValue } from "antd/es/table/interface";
import { IntegrationType } from "models/integration";

export type CreateTaskDto = {
  title: string;
  estimation: number;
  priority: PriorityCategoryDto;
  label: string[];
  isRecurrent: boolean;
  frequency?: FrequencyDto;
  startTime?: Date;
  endTime?: Date;
  startDate?: Date;
  endDate?: Date;
};

export type CreateTaskValues = {
  title: string;
  estimation: number;
  projectId: number;
  occurrences?: number;
  repeat?: number;
  priority: PriorityCategoryDto;
  label: string[];
  isRecurrent: boolean;
  frequency?: FrequencyDto;
  timeRange?: Date[];
  startDate: Date;
  // dateRange?: Date[];
};

export type TaskDto = {
  statusType: any;
  key: any;
  totalSpent?: number;
  id: any;
  title: string;
  description: string;
  estimation: number;
  status: string;
  statusCategoryName: StatusDto;
  due: any;
  priority: string;
  labels: string[];
  source: IntegrationType;
  dataSource: string;
  createdAt: string;
  sessions: Session[];
  updatedAt: string;
  userId: any;
  pinned: boolean;
  percentage?: number;
  projectName?: string;
  projectId?: number;

  integratedTaskId: number;
  url: string;
  jiraUpdatedAt: string;
  userWorkspaceId: number;
  workspaceId: number;
  parentTaskId: number | null;
};

export interface IFormattedTask extends TaskDto {
  startTime: Date;
  endTime: Date;
  total: string;
  percentage: number;
  totalSpent: number;
}
export interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

export interface UserWorkspace {
  user: {
    firstName: string;
    lastName: string;
  };
}
export interface Session {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  taskId: number;
  integratedTaskId: number;
  worklogId: number;
  userWorkspaceId: number;
  userWorkspace: UserWorkspace;
}
export interface AddWorkLogParams {
  startTime: Date;
  endTime: Date;
  taskId: number;
}
export interface UpdateTaskStatusParams {
  status: StatusType;
}

export interface UpdateTaskEstimationParams {
  estimation: number;
}
export interface SprintDto {
  id: number;
  jiraSprintId: number;
  userId: number;
  state: string;
  name: string;
  startDate: string;
  endDate: string;
  completeDate: string;
  projectId?: number;
}

export enum TaskStatusEnum {
  TO_DO = "TO_DO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}
export type StatusDto = keyof typeof TaskStatusEnum;
export type PriorityCategoryDto = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
export type FrequencyDto = "DAILY" | "WEEKLY" | "BI-WEEKLY";

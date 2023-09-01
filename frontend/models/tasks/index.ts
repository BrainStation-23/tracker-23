import { StatusType } from "@/storage/redux/projectsSlice";
import { TablePaginationConfig } from "antd";
import { FilterValue } from "antd/es/table/interface";

export type CreateTaskDto = {
  title: string;
  estimation: number;
  priority: PriorityDto;
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
  priority: PriorityDto;
  label: string[];
  isRecurrent: boolean;
  frequency?: FrequencyDto;
  timeRange?: Date[];
  dateRange?: Date[];
};

export type TaskDto = {
  id: any;
  title: string;
  description: string;
  estimation: number;
  status: string;
  statusCategoryName: StatusDto;
  due: any;
  priority: PriorityDto;
  labels: string[];
  source: string;
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
}

export type StatusDto = "TO_DO" | "IN_PROGRESS" | "DONE";
export type PriorityDto = "HIGH" | "MEDIUM" | "LOW";
export type FrequencyDto = "DAILY" | "WEEKLY" | "BI-WEEKLY";

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
  createdAt: string;
  sessions: any;
  updatedAt: string;
  userId: any;
  pinned: boolean;
  percentage?: number;
  projectName?: string;
  projectId?: string;
};
export interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

export interface AddWorkLogParams {
  startTime: Date;
  endTime: Date;
  taskId: number;
}
export interface UpdateTaskStatusParams {
  status: StatusDto;
}

export type StatusDto = "TO_DO" | "IN_PROGRESS" | "DONE";
export type PriorityDto = "HIGH" | "MEDIUM" | "LOW";
export type FrequencyDto = "DAILY" | "WEEKLY" | "BI-WEEKLY";

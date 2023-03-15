import { TablePaginationConfig } from "antd";
import { FilterValue } from "antd/es/table/interface";

export type CreateTaskDto = {
  title: string;
};

export type TaskDto = {
  id: any;
  title: string;
  description: string;
  estimation: number;
  status: "IN_PROGRESS" | "TODO" | "DONE";
  due: any;
  priority: "MEDIUM" | "HIGH" | "LOW" | "NORMAL";
  labels: string[];
  createdAt: string;
  sessions: any;
  updatedAt: string;
  userId: any;
  percentage?: number;
};
export interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

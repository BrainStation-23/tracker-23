import { IntegrationType } from "models/integration";

export type getTimeSheetReportDto = {
  startDate?: any;
  endDate?: any;
  userIds?: any;
  projectIds?: number[];
  calendarIds?: number[];
  types?: IntegrationType[];
};

export interface SprintUser {
  userId: number;
  name: string;
  picture: string;
  estimation: number;
  timeSpent: number;
}

export interface SprintData {
  sprintId: number;
  name: string;
  users: SprintUser[];
}

export interface SprintUserReportDto {
  columns: SprintUser[];
  rows: SprintData[];
}

export type ReportPageTabs =
  | "Time Sheet"
  | "Sprint Estimate"
  | "Sprint Report"
  | "Task List"
  | "Sprint View Report";

// Define models for tasks
export interface SprintReportTask {
  title: string;
  key: string;
  status: string;
  statusCategoryName: string;
}

// Define models for user details
export interface SprintReporUser {
  userId: number;
  name: string;
  picture: string | null;
  devProgress: DevProgress;
  assignedTasks: SprintReportTask[];
  yesterdayTasks: SprintReportTask[];
  todayTasks: SprintReportTask[];
}

// Define models for date-wise user data
export interface SprintReporDateData {
  date: string;
  users: SprintReporUser[];
}

// Define models for sprint information
export interface SprintReporSprintInfo {
  name: string;
  projectName: string;
  total: number;
  done: number;
}

export interface SprintReportDto {
  data: SprintReporDateData[];
  sprintInfo: SprintReporSprintInfo;
}

export interface SprintViewReportTask {
  title: string;
  key: string;
  status: string;
  statusCategoryName: string;
}

export interface AssignTasks {
  devProgress: DevProgress;
  tasks: SprintViewReportTask[];
}

export interface SprintViewReportRow {
  userId: number;
  name: string;
  picture: string | null;
  email: string;
  AssignTasks: AssignTasks;
  [date: string]: AssignTasks | any;
}

export interface SprintViewReportTableRow {
  userId: number;
  name: string;
  picture: string | null;
  email: string;
  AssignTasks: AssignTasks;
  [date: string]: AssignTasks | any;
  userSpan: number;
  tasksSpan: number;
}

export interface SprintViewReportColumn {
  id: string;
  value: {
    devProgress: DevProgress;
  };
}

export interface SprintViewReportDto {
  columns: SprintViewReportColumn[];
  rows: SprintViewReportRow[];
}

interface DevProgress {
  total: number;
  done: number;
}

interface Style {
  background: string;
  color: string;
}

interface DateCellStyle {
  background: string;
  text: string;
}

export interface ModifiesSprintReportUser {
  userId: number;
  name: string;
  picture: string;
  devProgress: DevProgress;
  assignedTasks: SprintReportTask[];
  yesterdayTasks: SprintReportTask[]; // You may want to define a proper interface for tasks
  todayTasks: SprintReportTask[]; // You may want to define a proper interface for tasks
  date: string;
  sprintAssignedTasks: SprintReportTask[];
  dateColSpan: number;
  style: Style;
  dateCellStyle: DateCellStyle;
  userSpan: number;
  assignedTask: SprintReportTask | null;
  todayTask: SprintReportTask | null; // You may want to define a proper interface for tasks
  yesterdayTask: SprintReportTask | null; // You may want to define a proper interface for tasks
}

export interface ModifiesSprintViewReport {
  userId: number;
  name: string;
  picture: string | null;
  // devProgress: DevProgress;
  assignedTasks: SprintViewReportTask[];
  yesterdayTasks: SprintViewReportTask[]; // You may want to define a proper interface for tasks
  todayTasks: SprintViewReportTask[]; // You may want to define a proper interface for tasks
  date: string;
  // sprintAssignedTasks: SprintReportTask[];
  // dateColSpan: number;
  style: Style;
  // dateCellStyle: DateCellStyle;
  // userSpan: number;
  // assignedTask: SprintReportTask | null;
  // todayTask: SprintReportTask | null; // You may want to define a proper interface for tasks
  // yesterdayTask: SprintReportTask | null; // You may want to define a proper interface for tasks
}

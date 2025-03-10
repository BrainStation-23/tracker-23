import { IntegrationType } from "models/integration";
import { StatusDto } from "models/tasks";

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
  | "Sprint View Report"
  | "Sprint View Timeline Report"
  | "Scrum Report";

export enum ReportTypesEnum {
  "TIME_SHEET" = "Time Sheet",
  "SPRINT_ESTIMATION" = "Sprint Estimation",
  "TASK_LIST" = "Task List",
  "SPRINT_REPORT" = "Sprint Report",
  SPRINT_TIMELINE = "Sprint Timeline",
  "SCRUM_REPORT" = "Scrum Report",
}

export type ReportTypesDto = keyof typeof ReportTypesEnum;
export const ReportTypes: ReportTypesDto[] = Object.keys(
  ReportTypesEnum
) as ReportTypesDto[];

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
  statusCategoryName: StatusDto;
}

export interface SprintViewTimelineReportTask {
  title: string;
  key: string;
  status: string;
  statusCategoryName: StatusDto;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface AssignTasks {
  devProgress: DevProgress;
  tasks: SprintViewReportTask[];
}

export interface SprintViewAssignTasks {
  devProgress: TimeDevProgress;
  tasks: SprintViewReportTask[];
}

export interface SprintViewReportRow {
  userId: number;
  name: string;
  picture: string | null;
  email: string;
  AssignTasks: SprintViewAssignTasks;
  [date: string]: SprintViewAssignTasks | any;
}

export interface SprintViewTimelineReportData {
  key: string;
  value: {
    devProgress: TimeDevProgress;
    tasks: SprintViewTimelineReportTask[];
  };
}
export interface SprintViewTimelineReportRow {
  userId: number;
  name: string;
  picture: string | null;
  email: string;
  data: SprintViewTimelineReportData[];
}

export interface SprintViewReportTableRow {
  userId: number;
  name: string;
  picture: string | null;
  email: string;
  task: {
    [columnId: string]: SprintViewReportTask;
  };
  devProgress?: {
    [columnId: string]: TimeDevProgress;
  };
  userSpan: number;
  tasksSpan: number;
}

export interface SprintViewTimelineReportTableRow {
  rowKey: string | number;
  userId: number;
  name: string;
  picture: string | null;
  email: string;
  userSpan: number;
  groupRows: number;
  groupRowIndex: number;
  tasksSpan: number;
  task: {
    [columnId: string]: SprintViewReportTask;
  };
  timeRange?: {
    [columnId: string]: { start: string; end: string };
  };
  devProgress?: {
    [columnId: string]: TimeDevProgress;
  };
}

export interface SprintViewReportColumn {
  key: string;
  value: {
    devProgress: TimeDevProgress;
  };
}

export interface SprintViewTimelineReportColumn
  extends SprintViewReportColumn {}

export interface SprintViewReportDto {
  columns: SprintViewReportColumn[];
  rows: SprintViewReportRow[];
}

export interface SprintViewTimelineReportDto {
  columns: SprintViewTimelineReportColumn[];
  rows: SprintViewTimelineReportRow[];
}

interface DevProgress {
  total: number;
  done: number;
}

interface TimeDevProgress {
  estimatedTime: number;
  spentTime: number;
}

interface Style {
  background: string;
  color: string;
}

interface DateCellStyle {
  background: string;
  text?: string;
}

export interface ScrumReportTask {
  title: string;
  key: string;
  description: string;
  status: string;
  statusCategoryName: string;
  estimation: string;
  spentHours: string;
  
}

export interface ModifiesScrumReport {
  spentHours: number;
  rowKey: number | string;
  userId: number;
  name: string;
  estimationHours: number;
  weeklyPlannedTasks: ScrumReportTask[];
  yesterdayTasks: ScrumReportTask[];
  todayTasks: ScrumReportTask[];
  date: string;
  sprintAssignedTasks: ScrumReportTask[];
  dateColSpan: number;
  style: Style;
  dateCellStyle: DateCellStyle;
  userSpan: number;
  assignedTask: ScrumReportTask | null;
  todayTask: ScrumReportTask | null;
  yesterdayTask: ScrumReportTask | null;
  groupRows: number;
  groupRowIndex: number;
  userGroupRows: number;
  userGroupRowIndex: number;
}

export interface ModifiesSprintReportUser {
  rowKey: number | string;
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
  groupRows: number;
  groupRowIndex: number;
  userGroupRows: number;
  userGroupRowIndex: number;
}

export interface ModifiesScrumReportUser {
  rowKey: number | string;
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
  groupRows: number;
  groupRowIndex: number;
  userGroupRows: number;
  userGroupRowIndex: number;
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
export interface CreateReportPageDto {
  name: string;
}
export interface CreateReportDto {
  name: string;
  reportType: ReportTypesDto;
  pageId: number;
  config?: {
    filterDateType?: FilterDateType;
    endDate?: string ;
    startDate?: string; 
  }
  
}
export interface UpdateReportDto {
  name?: string;
  date?: string | Date;
  endDate?: string;
  startDate?: string;
  filterDateType?: FilterDateType;
  userIds?: number[];
  sprintIds?: number[];
  projectIds?: number[];
  calendarIds?: number[];
  types?: IntegrationType[];
  excludeUnworkedTasks?: boolean;
}
export interface UpdateReportPageDto {
  name: string;
}

export enum FilterDateType {
  YESTERDAY = "YESTERDAY",
  TODAY = "today",
  TOMORROW = "TOMORROW",
  THIS_WEEK = "this-week",
  PAST_WEEK = "last-week",
  NEXT_WEEK = "next-week",
  THIS_MONTH = "this-month",
  PAST_MONTH = "last-month",
  NEXT_MONTH = "next-month",
  CUSTOM_DATE = "CUSTOM_DATE",
}

export enum FilterReverseDateType {
  "today" = "TODAY",
  "yesterday" = "YESTERDAY",
  "tomorrow" = "TOMORROW",
  "this-week" = "THIS_WEEK",
  "last-week" = "PAST_WEEK",
  "next-week" = "NEXT_WEEK",
  "this-month" = "THIS_MONTH",
  "last-month" = "PAST_MONTH",
  "next-month" = "NEXT_MONTH",
  "CUSTOM_DATE" = "CUSTOM_DATE",
}

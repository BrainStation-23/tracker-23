export type getTimeSheetReportDto = {
  startDate?: any;
  endDate?: any;
  userIds?: any;
  projectIds?: number[];
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
  | "Task List";

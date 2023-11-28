export type getTimeSheetReportDto = {
  startDate?: any;
  endDate?: any;
  userIds?: any;
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

export interface SprintReportDto {
  columns: SprintUser[];
  rows: SprintData[];
}

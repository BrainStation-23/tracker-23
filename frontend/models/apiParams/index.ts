import { IntegrationType } from "models/integration";

export interface SearchParamsModel {
  searchText?: string;
  selectedDate?: any;
  priority?: string[];
  status?: string[];
  types?: IntegrationType[];
  projectIds?: number[];
  calendarIds?: number[];
  userIds?: number[];
  sprints?: number[];
}
export interface SprintUserReportParamsModel {
  selectedUsers?: number[];
  projectIds?: number[];
  sprints?: number[];
}
export interface SprintReportParamsModel {
  startDate: string;
  endDate: string;
  sprintId: number;
}

export interface CreateWorkspaceModel {
  name: string;
  changeWorkspace?: boolean;
  icon?: string;
}
export interface CreateLocalProjectModel {
  projectName: string;
}

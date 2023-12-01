export interface SearchParamsModel {
  searchText?: string;
  selectedDate?: any;
  priority?: string[];
  status?: string[];
  projectIds?: number[];
  sprints?: number[];
}
export interface SprintReportParamsModel {
  selectedUsers?: number[];
  projectIds?: number[];
  sprints?: number[];
}

export interface CreateWorkspaceModel {
  name: string;
  changeWorkspace?: boolean;
  icon?: string;
}
export interface CreateLocalProjectModel {
  projectName: string;
}

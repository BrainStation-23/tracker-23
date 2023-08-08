export interface SearchParamsModel {
  searchText?: string;
  selectedDate?: any;
  priority?: string[];
  status?: string[];
  projectIds?: number[];
  sprints?: number[];
}

export interface CreateWorkspaceModel {
  name: string;
  changeWorkspace?: boolean;
  icon?: string;
}

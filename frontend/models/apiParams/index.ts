import { SprintDto } from "models/tasks";

export interface SearchParamsModel {
  searchText?: string;
  selectedDate?: any;
  priority?: string[];
  status?: string[];
  sprints?: SprintDto[];
}

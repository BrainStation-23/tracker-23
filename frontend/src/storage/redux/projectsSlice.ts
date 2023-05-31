import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { StatusDto } from "models/tasks";

export interface ProjectStatus {
  id: string;
  name: string;
  untranslatedName: string;
  statusCategoryId: string;
  statusCategoryName: string;
  projectId: string;
}

export interface Project {
  id: number;
  projectId: string;
  integrationID: number;
  statuses: ProjectStatus[];
}
export interface StatusType {
  name: string;
  statusCategoryName: StatusDto;
}
export interface ProjectStatusesState {
  projects: Project[] | null;
  statuses: StatusType[] | null;
}
// Define the initial state using that type
const initialState: ProjectStatusesState = {
  projects: null,
  statuses: null,
};
function isSame(status: StatusType, ar: StatusType) {
  return (
    status.name === ar.name &&
    status.statusCategoryName === ar.statusCategoryName
  );
}
const projectsSlice = createSlice({
  name: "projectStatuses",
  initialState,
  reducers: {
    setProjectsSlice: (state, action: PayloadAction<Project[]>) => {
      const tmpArray: StatusType[] = [];
      action.payload.forEach((project: Project) => {
        project.statuses?.forEach((status: ProjectStatus) => {
          const tmpStatus = {
            name: status.name,
            statusCategoryName: status.statusCategoryName
              .replace(" ", "_")
              .toUpperCase() as StatusDto,
          };
          if (!tmpArray.find((item) => isSame(tmpStatus, item)))
            tmpArray.push(tmpStatus);
        });
      });
      state.projects = action.payload;
      state.statuses = tmpArray;
    },
    deleteProjectsSlice: (state) => {
      state.projects = null;
      state.statuses = null;
    },
    resetProjectsSlice: (state) => {
      state.projects = null;
    },
  },
});

export const { setProjectsSlice, deleteProjectsSlice, resetProjectsSlice } =
  projectsSlice.actions;

export default projectsSlice.reducer;

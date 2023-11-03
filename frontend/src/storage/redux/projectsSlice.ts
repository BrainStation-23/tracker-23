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
  projectName: string;
  projectKey?: string;
  source: string;
  integrated: Boolean;
  integrationID: number;
  workspaceId: number;
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
    addNewProjectSlice: (state, action: PayloadAction<Project>) => {
      // Create a new StatusType based on the added project's statuses
      const newStatuses: StatusType[] = action.payload.statuses.map(
        (status) => ({
          name: status.name,
          statusCategoryName: status.statusCategoryName
            .replace(" ", "_")
            .toUpperCase() as StatusDto,
        })
      );

      // Add the new project to the state's projects array
      state.projects = state.projects
        ? [...state.projects, action.payload]
        : [action.payload];

      // Update the statuses array with the new statuses, if they don't already exist
      newStatuses.forEach((newStatus) => {
        if (
          !state.statuses?.find((existingStatus) =>
            isSame(newStatus, existingStatus)
          )
        ) {
          state.statuses?.push(newStatus);
        }
      });
    },
  },
});

export const {
  setProjectsSlice,
  deleteProjectsSlice,
  resetProjectsSlice,
  addNewProjectSlice,
} = projectsSlice.actions;

export default projectsSlice.reducer;

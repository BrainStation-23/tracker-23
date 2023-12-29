import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IntegrationType } from "models/integration";
import { PriorityDto } from "models/projects";
import { SprintDto, StatusDto } from "models/tasks";

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
  priorities?: PriorityDto[];
  workspaceId: number;
  statuses: ProjectStatus[];
  integrationType: IntegrationType;
}
export interface StatusType {
  name: string;
  statusCategoryName: StatusDto;
}
export interface ProjectStatusesState {
  projects: Project[] | null;
  reportProjects: Project[] | null;
  statuses: StatusType[] | null;
  reportStatuses: StatusType[] | null;
  reportSprintList: SprintDto[];
  reportProjectPriorities: PriorityDto[];
  reportProjectPriorityNames: string[];
}
// Define the initial state using that type
const initialState: ProjectStatusesState = {
  projects: null,
  statuses: null,
  reportProjects: null,
  reportStatuses: null,
  reportSprintList: [],
  reportProjectPriorities: [],
  reportProjectPriorityNames: [],
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
      const priorityListArray: PriorityDto[][] = [];
      action.payload?.forEach((project: Project) => {
        priorityListArray.push(project.priorities);
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
      const priorities = priorityListArray.flat();
      state.reportProjectPriorities = priorities;
      const priorityNames = new Set(priorities.map((p) => p.name));
      state.reportProjectPriorityNames = Array.from(priorityNames);
    },
    setReportProjectsSlice: (state, action: PayloadAction<Project[]>) => {
      const tmpArray: StatusType[] = [];
      action.payload?.forEach((project: Project) => {
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
      state.reportProjects = action.payload;
      state.reportStatuses = tmpArray;
    },
    deleteProjectsSlice: (state) => {
      state.projects = null;
      state.statuses = null;
    },
    resetProjectsSlice: (state) => {
      state = initialState;
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
    setReportSprintListReducer: (state, action: PayloadAction<SprintDto[]>) => {
      state.reportSprintList = action.payload;
    },
    resetReportSprintListReducer: (state) => {
      state.reportSprintList = [];
    },
  },
});

export const {
  setProjectsSlice,
  setReportProjectsSlice,
  deleteProjectsSlice,
  resetProjectsSlice,
  addNewProjectSlice,
  setReportSprintListReducer,
  resetReportSprintListReducer,
} = projectsSlice.actions;

export default projectsSlice.reducer;

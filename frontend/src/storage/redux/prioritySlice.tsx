import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PriorityDto, ProjectDto } from "models/projects";

export interface PrioritiesState {
  priorities: PriorityDto[];
  priorityNames: string[];
}

const initialPriorities: PriorityDto[] = [];

const initialState: PrioritiesState = {
  priorities: initialPriorities,
  priorityNames: [],
};

const prioritySlice = createSlice({
  name: "priorities",
  initialState,
  reducers: {
    setPriorities: (state, action: PayloadAction<ProjectDto[]>) => {
      const priorityListArray = action.payload?.map(
        (project) => project.priorities
      );
      const priorities = priorityListArray.flat();
      state.priorities = priorities;
      const priorityNames = new Set(priorities.map((p) => p.name));
      state.priorityNames = Array.from(priorityNames);
    },
    addPrioritiesSlice: (state, action: PayloadAction<ProjectDto>) => {
      const priorityListArray = action.payload?.priorities;

      const priorities = state.priorities;
      for (const priority of priorityListArray) {
        if (!priorities.find((pp) => pp.id === priority.id)) {
          priorities.push(priority);
        }
      }
      state.priorities = priorities;
      const priorityNames = new Set(priorities.map((p) => p.name));
      state.priorityNames = Array.from(priorityNames);
    },
    resetPriorities: (state) => {
      state.priorities = initialPriorities;
      state.priorityNames = [];
    },
  },
});

export const { setPriorities, addPrioritiesSlice, resetPriorities } =
  prioritySlice.actions;

export default prioritySlice.reducer;

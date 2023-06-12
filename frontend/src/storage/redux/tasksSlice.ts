import { SprintDto, TaskDto } from "./../../../models/tasks/index";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TasksState {
  tasks: TaskDto[];
  runningTask: TaskDto | null;
  sprintList: SprintDto[];
}

const initialState: TasksState = {
  tasks: [],
  runningTask: null,
  sprintList: [],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasksReducer: (state, action: PayloadAction<TaskDto[]>) => {
      state.tasks = action.payload;
    },
    updateTaskStatusReducer: (
      state,
      action: PayloadAction<{ taskId: number; status: string }>
    ) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
      }
    },
    addTaskReducer: (state, action: PayloadAction<TaskDto>) => {
      state.tasks.push(action.payload);
    },
    deleteTaskReducer: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    updateEstimationTimeReducer: (
      state,
      action: PayloadAction<{ taskId: number; estimation: number }>
    ) => {
      const { taskId, estimation } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.estimation = estimation;
      }
    },
    updatePinnedStatusReducer: (
      state,
      action: PayloadAction<{ taskId: number; pinned: boolean }>
    ) => {
      const { taskId, pinned } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.pinned = pinned;
      }
    },
    setRunningTaskReducer: (state, action: PayloadAction<TaskDto>) => {
      state.runningTask = action.payload;
    },
    resetRunningTaskReducer: (state) => {
      state.runningTask = null;
    },
    setSprintListReducer: (state, action: PayloadAction<SprintDto[]>) => {
      state.sprintList = action.payload;
    },
    resetSprintListReducer: (state) => {
      state.sprintList = [];
    },
  },
});

export const {
  setTasksReducer,
  addTaskReducer,
  deleteTaskReducer,
  updateTaskStatusReducer,
  updateEstimationTimeReducer,
  updatePinnedStatusReducer,
  setRunningTaskReducer,
  resetRunningTaskReducer,
  setSprintListReducer,
  resetSprintListReducer,
} = tasksSlice.actions;

export default tasksSlice.reducer;

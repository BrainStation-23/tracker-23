import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkspaceDto } from "models/workspaces";

// Define the initial state using the WorkspaceState interface
interface WorkspaceState {
  workspaces: WorkspaceDto[];
  reload: Boolean;
}

const initialState: WorkspaceState = {
  workspaces: [],
  reload: false,
};

const workspacesSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspacesSlice: (state, action: PayloadAction<WorkspaceDto[]>) => {
      state.workspaces = action.payload;
    },
    resetWorkspacesSlice: (state) => {
      state.workspaces = [];
    },
    changeWorkspaceReloadStatusSlice: (state) => {
      state.reload = !state.reload;
    },
    updateWorkspaceSlice: (state, action: PayloadAction<WorkspaceDto>) => {
      const newWorkspaces = state.workspaces.map((workspace) => {
        if (workspace.id === action.payload.id) return action.payload;
        else return workspace;
      });
      state.workspaces = newWorkspaces;
    },
    deleteWorkspaceSlice: (state, action: PayloadAction<WorkspaceDto>) => {
      const newWorkspaces = state.workspaces.filter(
        (workspace) => workspace.id !== action.payload.id
      );
      state.workspaces = newWorkspaces;
    },
    addWorkspaceSlice: (state, action: PayloadAction<WorkspaceDto>) => {
      const newWorkspaces = state.workspaces;
      newWorkspaces.push(action.payload);
      state.workspaces = newWorkspaces;
    },
  },
});

export const {
  setWorkspacesSlice,
  resetWorkspacesSlice,
  changeWorkspaceReloadStatusSlice,
  updateWorkspaceSlice,
  deleteWorkspaceSlice,
  addWorkspaceSlice,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;

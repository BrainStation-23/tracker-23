import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkspaceDto } from "models/workspaces";

// Define the initial state using the WorkspaceState interface
interface WorkspaceState {
  workspaces: WorkspaceDto[];
  activeWorkspace?: WorkspaceDto;
  reload: Boolean;
}

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspace: null,
  reload: false,
};

const workspacesSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspacesSlice: (state, action: PayloadAction<WorkspaceDto[]>) => {
      const workspaces = action.payload;
      state.activeWorkspace =
        workspaces?.length > 0 &&
        workspaces.find((workspace: WorkspaceDto) => workspace.active);
      state.workspaces = action.payload;
    },
    resetWorkspacesSlice: (state) => {
      state.workspaces = [];
    },
    setActiveWorkspaceSlice: (
      state,
      action: PayloadAction<WorkspaceDto | null>
    ) => {
      state.activeWorkspace = action.payload;
    },
    changeWorkspaceReloadStatusSlice: (state) => {
      state.reload = !state.reload;
    },
    updateWorkspaceSlice: (state, action: PayloadAction<WorkspaceDto>) => {
      if (action.payload.id === state.activeWorkspace.id) {
        action.payload.active = true;
        state.activeWorkspace = action.payload;
      }
      const newWorkspaces = state.workspaces.map((workspace) => {
        if (workspace.id === action.payload.id) return action.payload;
        else return workspace;
      });
      state.workspaces = newWorkspaces;
    },
    deleteWorkspaceSlice: (state, action: PayloadAction<WorkspaceDto>) => {
      if (action.payload.id === state.activeWorkspace.id) {
        state.activeWorkspace = null;
      }
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
  setActiveWorkspaceSlice,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;

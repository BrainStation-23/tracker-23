import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkspaceDto } from "models/workspaces";

// Define the initial state using the WorkspaceState interface
interface WorkspaceState {
  workspaces: WorkspaceDto[];
}

const initialState: WorkspaceState = {
  workspaces: [],
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
  },
});

export const { setWorkspacesSlice, resetWorkspacesSlice } =
  workspacesSlice.actions;

export default workspacesSlice.reducer;

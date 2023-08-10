import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WorkspaceDto } from "models/workspaces";

// Define the initial state using the WorkspaceState interface
interface WorkspaceState {
  workspaces: WorkspaceDto[];
  reload : Boolean
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
    changeWorkspcarReloadStatusSlice:(state) => {
      state.reload =  !state.reload ;
    },
  },
});

export const { setWorkspacesSlice, resetWorkspacesSlice ,changeWorkspcarReloadStatusSlice} =
  workspacesSlice.actions;

export default workspacesSlice.reducer;

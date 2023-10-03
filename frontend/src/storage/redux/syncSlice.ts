import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SyncStatus {
  createdAt: string;
  id: string;
  status: string;
  updatedAt: string;
  userId: string;
}
interface SyncState {
  syncRunning: boolean;
  syncingProject: number | null;
  syncStatus: SyncStatus;
}
// Define the initial state using that type
const initialState: SyncState = {
  syncRunning: false,
  syncingProject: null,

  syncStatus: {
    createdAt: "",
    id: "",
    status: "",
    updatedAt: "",
    userId: "",
  },
};
const syncSlice = createSlice({
  name: "syncStatus",
  initialState,
  reducers: {
    setSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.syncStatus = action.payload;

      state.syncRunning = action.payload.status === "IN_PROGRESS";
      if (action.payload.status !== "IN_PROGRESS") state.syncingProject = null;
    },
    setSyncRunning: (state, action: PayloadAction<boolean>) => {
      state.syncRunning = action.payload;
      if (!action.payload) state.syncingProject = null;
    },
    setSyncingProjectReducer: (state, action: PayloadAction<number>) => {
      state.syncingProject = action.payload;
    },
  },
});

export const { setSyncStatus, setSyncRunning, setSyncingProjectReducer } =
  syncSlice.actions;

export default syncSlice.reducer;

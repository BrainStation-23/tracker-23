import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SyncStatus {
  createdAt: string;
  id: string;
  status: string;
  updatedAt: string;
  userId: string;
}
// Define the initial state using that type
const initialState = {
  syncRunning: false,
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
    },
    setSyncRunning: (state, action: PayloadAction<boolean>) => {
      state.syncRunning = action.payload;
    },
  },
});

export const { setSyncStatus, setSyncRunning } = syncSlice.actions;

export default syncSlice.reducer;

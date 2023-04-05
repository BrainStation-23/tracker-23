import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

// Define a type for the slice state
interface CounterState {
  syncing: boolean;
  syncStatus: SyncStatus;
}
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
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.syncStatus = action.payload;
      console.log(
        "🚀 ~ file: syncSlice.ts:38 ~ action.payload:",
        action.payload
      );
      state.syncRunning = action.payload.status === "IN_PROGRESS";
    },
    setSyncRunning: (state, action: PayloadAction<boolean>) => {
      state.syncRunning = action.payload;
    },
  },
});

export const { setSyncStatus, setSyncRunning } = syncSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.syncStatus;

export default syncSlice.reducer;

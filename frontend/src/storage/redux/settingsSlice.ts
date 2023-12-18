import { createSlice } from "@reduxjs/toolkit";

import type { PayloadAction } from "@reduxjs/toolkit";

interface SettingsSliceState {
  syncTime: number;
  timeFormat: "Day" | "Hour";
}

const initialState: SettingsSliceState = {
  syncTime: 0,
  timeFormat: "Day",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSyncTimeReducer: (state, action: PayloadAction<number>) => {
      state.syncTime = action.payload;
    },
    setTimeFormatReducer: (state, action: PayloadAction<"Day" | "Hour">) => {
      state.timeFormat = action.payload;
    },
    setSettingsReducer: (state, action: PayloadAction<SettingsSliceState>) => {
      if (action.payload.syncTime) state.syncTime = action.payload.syncTime;
      if (action.payload.timeFormat)
        state.timeFormat = action.payload.timeFormat;
    },
    resetSettingsReducer: (state) => {
      state = initialState;
    },
  },
});

export const {
  setSyncTimeReducer,
  setTimeFormatReducer,
  setSettingsReducer,
  resetSettingsReducer,
} = settingsSlice.actions;

export default settingsSlice.reducer;

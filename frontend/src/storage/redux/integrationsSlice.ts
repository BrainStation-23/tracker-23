import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Integration } from "models/integration";



interface IntegrationsState {
  integrations: Integration[];
}

const initialState: IntegrationsState = {
  integrations: [],
};

const integrationsSlice = createSlice({
  name: "integrations",
  initialState,
  reducers: {
    setIntegrationsSlice: (state, action: PayloadAction<Integration[]>) => {
      state.integrations = action.payload;
    },
    addIntegrationsSlice: (state, action: PayloadAction<Integration>) => {
      state.integrations.push(action.payload);
    },
    deleteIntegrationsSlice: (state, action: PayloadAction<number>) => {
      state.integrations = state.integrations.filter(
        (integration) => integration.id !== action.payload
      );
    },
    resetIntegrationsSlice: (state) => {
      state.integrations = [];
    },
  },
});

export const {
  setIntegrationsSlice,
  addIntegrationsSlice,
  deleteIntegrationsSlice,
  resetIntegrationsSlice,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;

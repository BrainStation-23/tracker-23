import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IntegrationDto, IntegrationType } from "models/integration";

interface IntegrationsState {
  integrations: IntegrationDto[];
  integrationTypes: IntegrationType[];
}

const initialState: IntegrationsState = {
  integrations: [],
  integrationTypes: [],
};

const integrationsSlice = createSlice({
  name: "integrations",
  initialState,
  reducers: {
    setIntegrationsSlice: (state, action: PayloadAction<IntegrationDto[]>) => {
      state.integrations = action.payload;
    },
    addIntegrationsSlice: (state, action: PayloadAction<IntegrationDto>) => {
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
    setIntegrationTypesSlice: (
      state,
      action: PayloadAction<IntegrationType[]>
    ) => {
      state.integrationTypes = action.payload;
    },
  },
});

export const {
  setIntegrationsSlice,
  addIntegrationsSlice,
  deleteIntegrationsSlice,
  resetIntegrationsSlice,
  setIntegrationTypesSlice,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;

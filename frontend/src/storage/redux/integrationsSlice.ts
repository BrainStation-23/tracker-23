import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IntegrationDto, IntegrationType } from "models/integration";

interface IntegrationsState {
  authorization: {
    type: IntegrationType;
    reauthorization: boolean;
  };
  integrations: IntegrationDto[];
  integrationTypes: IntegrationType[];
}

const initialState: IntegrationsState = {
  integrations: [],
  integrationTypes: [],
  authorization: {
    type: "JIRA",
    reauthorization: false,
  },
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
    setAuthorizationSlice: (
      state,
      action: PayloadAction<{ type: IntegrationType; value: boolean }>
    ) => {
      state.authorization.reauthorization = action.payload.value;
      state.authorization.type = action.payload.type;
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
  setAuthorizationSlice,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;

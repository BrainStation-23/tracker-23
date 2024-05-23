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
      
      state.integrationTypes = Array.from(
        new Set(state.integrations.map((tmp: IntegrationDto) => tmp.type))
      );
    },
    addIntegrationsSlice: (state, action: PayloadAction<IntegrationDto>) => {
      state.integrations.push(action.payload);

      state.integrationTypes = Array.from(
        new Set(state.integrations.map((tmp: IntegrationDto) => tmp.type))
      );
    },
    deleteIntegrationsSlice: (state, action: PayloadAction<number>) => {
      state.integrations = state.integrations.filter(
        (integration) => integration.id !== action.payload
      );

      state.integrationTypes = Array.from(
        new Set(state.integrations.map((tmp: IntegrationDto) => tmp.type))
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
  },
});

export const {
  setIntegrationsSlice,
  addIntegrationsSlice,
  deleteIntegrationsSlice,
  resetIntegrationsSlice,
  setAuthorizationSlice,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;

import { IntegrationType } from "models/integration";

import { createSlice } from "@reduxjs/toolkit";

import type { PayloadAction } from "@reduxjs/toolkit";
import { FilterDateType } from "models/reports";
export interface ReportConfig {
  id: number;
  projectIds?: number[];
  calendarIds?: number[];
  userIds?: number[];
  types?: IntegrationType[];
  sprintIds?: number[];
  endDate?: string;
  startDate?: string;
  filterDateType?: FilterDateType;
}

export type ReportType =
  | "TIME_SHEET"
  | "SPRINT_ESTIMATION"
  | "TASK_LIST"
  | "SPRINT_REPORT"
  | "SPRINT_TIMELINE";
export interface ReportData {
  id: number;
  name: string;
  config: ReportConfig;
  reportType: ReportType;
  pageId: number;
}

export interface ReportPageDto {
  id: number;
  name: string;
  userWorkspaceId: number;
  workspaceId: number;
  reports: ReportData[];
}

interface ReportsSliceState {
  reportPages: ReportPageDto[];
  integrationTypes: IntegrationType[];
  reportInEdit: ReportData | null;
}

const initialState: ReportsSliceState = {
  reportPages: [],
  integrationTypes: [],
  reportInEdit: null,
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setReportPages: (state, action: PayloadAction<ReportPageDto[]>) => {
      state.reportPages = action.payload;
    },
    addReport: (state, action: PayloadAction<ReportData>) => {
      for (let i = 0; i < state.reportPages.length; i++) {
        if (state.reportPages[i].id === action.payload.pageId)
          state.reportPages[i].reports.push(action.payload);
      }
    },
    setReportIntegrationTypesSlice: (
      state,
      action: PayloadAction<IntegrationType[]>
    ) => {
      state.integrationTypes = action.payload;
    },
    deleteReportSlice: (state, action: PayloadAction<ReportData>) => {
      for (let i = 0; i < state.reportPages.length; i++) {
        if (state.reportPages[i].id === action.payload.pageId)
          state.reportPages[i].reports = state.reportPages[i].reports.filter(
            (report) => report.id !== action.payload.id
          );
      }
    },
    addReportPage: (state, action: PayloadAction<ReportPageDto>) => {
      state.reportPages.push(action.payload);
    },
    deleteReportPageSlice: (state, action: PayloadAction<ReportPageDto>) => {
      state.reportPages = state.reportPages.filter(
        (report) => report.id !== action.payload.id
      );
    },
    updateReportPage: (
      state,
      action: PayloadAction<{ id: number; data: ReportData }>
    ) => {
      state.reportPages = state.reportPages.map((reportPage) => {
        if (reportPage.id === action.payload.id) {
          reportPage.reports = reportPage.reports?.map((report) => {
            if (report.id === action.payload.data.id)
              return action.payload.data;
            return report;
          });
        }
        return reportPage;
      });
    },
    deleteReportData: (state, action: PayloadAction<number>) => {
      if (state.reportPages.length > 0) {
        state.reportPages[0].reports = state.reportPages[0].reports.filter(
          (report) => report.id !== action.payload
        );
      }
    },
    updateReportSlice: (state, action: PayloadAction<ReportData>) => {
      for (let i = 0; i < state.reportPages.length; i++) {
        if (state.reportPages[i].id === action.payload.pageId)
          state.reportPages[i].reports = state.reportPages[i].reports.map(
            (report) =>
              report.id === action.payload.id ? action.payload : report
          );
      }
    },
    updateReportPageNameSlice: (
      state,
      action: PayloadAction<ReportPageDto>
    ) => {
      for (let i = 0; i < state.reportPages.length; i++) {
        if (state.reportPages[i].id === action.payload.id)
          state.reportPages[i].name = action.payload.name;
      }
    },
    resetReportPages: (state) => {
      state.reportPages = [];
    },
    setReportInEditSlice: (state, action: PayloadAction<ReportData | null>) => {
      state.reportInEdit = action.payload;
    },
  },
});

export const {
  setReportPages,
  addReport,
  addReportPage,
  deleteReportPageSlice,
  deleteReportData,
  updateReportSlice,
  deleteReportSlice,
  resetReportPages,
  setReportIntegrationTypesSlice,
  updateReportPageNameSlice,
  setReportInEditSlice,
} = reportsSlice.actions;

export default reportsSlice.reducer;

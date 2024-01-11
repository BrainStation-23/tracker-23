import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IntegrationType } from "models/integration";

export interface ReportConfig {
  id: number;
  projectIds?: number[];
  users?: number[];
  types?: IntegrationType[];
}

export type ReportType =
  | "TIME_SHEET"
  | "SPRINT_ESTIMATION"
  | "TASK_LIST"
  | "SPRINT_REPORT";
export interface ReportData {
  id: number;
  name: string;
  config: ReportConfig;
  reportType: ReportType;
  pageId: number;
}

interface ReportPage {
  id: number;
  name: string;
  userWorkspaceId: number;
  workspaceId: number;
  reports: ReportData[];
}

interface ReportsSliceState {
  reportPages: ReportPage[];
}

const initialState: ReportsSliceState = {
  reportPages: [
    {
      id: 1,
      name: "Page 1",
      userWorkspaceId: 23,
      workspaceId: 5,
      reports: [
        {
          id: 2,
          name: "report page 1",
          config: {
            id: 1,
            projectIds: [138, 139],
            users: [1, 35, 52],
            types: ["OUTLOOK", "JIRA"],
          },
          reportType: "TIME_SHEET",
          pageId: 1,
        },
        {
          id: 3,
          name: "report 2",
          config: {
            id: 1,
            projectIds: [138, 139],
            users: [1, 35, 52],
            types: ["OUTLOOK", "JIRA"],
          },
          reportType: "TASK_LIST",
          pageId: 1,
        },
      ],
    },
    {
      id: 2,
      name: "Page 2",
      userWorkspaceId: 23,
      workspaceId: 5,
      reports: [
        {
          id: 2,
          name: "report 1",
          config: {
            id: 1,
            projectIds: [138, 139],
            users: [1, 52],
            types: ["OUTLOOK", "JIRA"],
          },
          reportType: "TIME_SHEET",
          pageId: 1,
        },
        {
          id: 3,
          name: "report 4",
          config: {
            id: 1,
            projectIds: [138, 139],
            users: [1, 35],
            types: ["OUTLOOK", "JIRA"],
          },
          reportType: "TIME_SHEET",
          pageId: 1,
        },
      ],
    },
    {
      id: 3,
      name: "Page 3",
      userWorkspaceId: 23,
      workspaceId: 5,
      reports: [
        {
          id: 2,
          name: "report 1",
          config: {
            id: 1,
            projectIds: [138, 139],
            users: [1, 52],
            types: ["OUTLOOK", "JIRA"],
          },
          reportType: "TASK_LIST",
          pageId: 1,
        },
        {
          id: 3,
          name: "report 4",
          config: {
            id: 1,
            projectIds: [138, 139],
            users: [1, 35],
            types: ["OUTLOOK", "JIRA"],
          },
          reportType: "TASK_LIST",
          pageId: 1,
        },
      ],
    },
  ],
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setReportsData: (state, action: PayloadAction<ReportPage[]>) => {
      state.reportPages = action.payload;
    },
    addReportData: (state, action: PayloadAction<ReportData>) => {
      if (state.reportPages.length > 0) {
        state.reportPages[0].reports.push(action.payload);
      }
    },
    updateReportData: (
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
    resetReportsData: (state) => {
      state.reportPages = [];
    },
  },
});

export const {
  setReportsData,
  addReportData,
  deleteReportData,
  resetReportsData,
} = reportsSlice.actions;

export default reportsSlice.reducer;

import { config } from "config";
import { apiFunction } from "utils/types";
import {
  authJiraRest,
  createSessionRest,
  createTaskRest,
  deleteTaskRest,
  exportTasksRest,
  getIntegrationsRest,
  getJiraLinkRest,
  getProjectWiseHourRest,
  getTasksRest,
  loginRest,
  logoutRest,
  registerRest,
  sendJiraCodeRest,
  stopSessionRest,
  syncStatusRest,
  syncTasksRest,
} from "./restApi";

const graphqlApi: apiFunction = {
  login: loginRest,
  registerUser: registerRest,
  logout: logoutRest,
  createTask: createTaskRest,
  getTasks: getTasksRest,
  syncTasks: syncTasksRest,
  syncStatus: syncStatusRest,
  deleteTask: deleteTaskRest,
  createSession: createSessionRest,
  stopSession: stopSessionRest,
  authJira: authJiraRest,
  getJiraLink: getJiraLinkRest,
  sendJiraCode: sendJiraCodeRest,
  exportTasks: exportTasksRest,
  getIntegrations: getIntegrationsRest,
  getProjectWiseHour: getProjectWiseHourRest,
};

const restApi: apiFunction = {
  login: loginRest,
  registerUser: registerRest,
  logout: logoutRest,
  createTask: createTaskRest,
  getTasks: getTasksRest,
  exportTasks: exportTasksRest,
  syncTasks: syncTasksRest,
  syncStatus: syncStatusRest,
  deleteTask: deleteTaskRest,
  createSession: createSessionRest,
  stopSession: stopSessionRest,
  authJira: authJiraRest,
  getJiraLink: getJiraLinkRest,
  sendJiraCode: sendJiraCodeRest,
  getIntegrations: getIntegrationsRest,
  getProjectWiseHour: getProjectWiseHourRest,
};

export const userAPI: apiFunction =
  config?.apiService === "GRAPHQL" ? graphqlApi : restApi;

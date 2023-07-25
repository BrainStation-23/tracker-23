import { config } from "config";
import { apiFunction } from "utils/types";

import {
  addManualWorkLogRest,
  authJiraRest,
  createSessionRest,
  createTaskRest,
  deleteIntegrationRest,
  deleteSessionRest,
  deleteTaskRest,
  exportTasksRest,
  getAllProjectsRest,
  getIntegrationsRest,
  getJiraActiveSprintTasksRest,
  getJiraLinkRest,
  getJiraSprintsRest,
  getNotificationsRest,
  deleteProjectTasksRest,
  getProjectWiseHourRest,
  getIntegratedProjectStatusesRest,
  getSpentTimePerDayRest,
  getTasksRest,
  googleLoginRest,
  loginRest,
  logoutRest,
  markAllNotificationsSeenRest,
  markNotificationSeenRest,
  pinTaskRest,
  registerRest,
  selectJiraIntegrationRest,
  sendJiraCodeRest,
  stopSessionRest,
  syncStatusRest,
  syncTasksRest,
  updateSessionRest,
  updateTaskEstimationRest,
  updateTaskSTatusRest,
  importProjectRest,
  getWorkspaceListRest,
} from "./restApi";

const graphqlApi: apiFunction = {
  login: loginRest,
  googleLogin: googleLoginRest,
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
  deleteIntegration: deleteIntegrationRest,
  getProjectWiseHour: getProjectWiseHourRest,
  getSpentTimePerDay: getSpentTimePerDayRest,
  addManualWorkLog: addManualWorkLogRest,
  updateTaskSTatus: updateTaskSTatusRest,
  pinTask: pinTaskRest,
  selectJiraIntegration: selectJiraIntegrationRest,
  getIntegratedProjectStatuses: getIntegratedProjectStatusesRest,
  getNotifications: getNotificationsRest,
  deleteSession: deleteSessionRest,
  updateSession: updateSessionRest,
  markNotificationSeen: markNotificationSeenRest,
  markAllNotificationsSeen: markAllNotificationsSeenRest,
  updateTaskEstimation: updateTaskEstimationRest,
  getJiraSprints: getJiraSprintsRest,
  getJiraActiveSprintTasks: getJiraActiveSprintTasksRest,
  getAllProjects: getAllProjectsRest,
  importProject: importProjectRest,
  deleteProjectTasks: deleteProjectTasksRest,
  getWorkspaceList: getWorkspaceListRest,
};

const restApi: apiFunction = {
  login: loginRest,
  googleLogin: googleLoginRest,
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
  deleteIntegration: deleteIntegrationRest,
  getProjectWiseHour: getProjectWiseHourRest,
  getSpentTimePerDay: getSpentTimePerDayRest,
  addManualWorkLog: addManualWorkLogRest,
  updateTaskSTatus: updateTaskSTatusRest,
  pinTask: pinTaskRest,
  selectJiraIntegration: selectJiraIntegrationRest,
  getIntegratedProjectStatuses: getIntegratedProjectStatusesRest,
  getNotifications: getNotificationsRest,
  deleteSession: deleteSessionRest,
  updateSession: updateSessionRest,
  markNotificationSeen: markNotificationSeenRest,
  markAllNotificationsSeen: markAllNotificationsSeenRest,
  updateTaskEstimation: updateTaskEstimationRest,
  getJiraSprints: getJiraSprintsRest,
  getJiraActiveSprintTasks: getJiraActiveSprintTasksRest,
  getAllProjects: getAllProjectsRest,
  importProject: importProjectRest,
  deleteProjectTasks: deleteProjectTasksRest,
  getWorkspaceList: getWorkspaceListRest,
};

export const userAPI: apiFunction =
  config?.apiService === "GRAPHQL" ? graphqlApi : restApi;

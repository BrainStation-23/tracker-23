import { apiFunction } from "utils/types";

import {
  acceptWorkspaceInvitationRest,
  addManualWorkLogRest,
  authJiraRest,
  changeWorkspaceRest,
  createProjectRest,
  createSessionRest,
  createTaskRest,
  createWorkspaceRest,
  deleteIntegrationRest,
  deleteProjectTasksRest,
  deleteSessionRest,
  deleteTaskRest,
  deleteWorkspaceRest,
  exportTasksRest,
  forgotPasswordRest,
  getAllProjectsRest,
  getIntegratedProjectStatusesRest,
  getIntegrationsRest,
  getInvitedUserInfoRest,
  getJiraActiveSprintTasksRest,
  getJiraLinkRest,
  getJiraSprintsRest,
  getNotificationsRest,
  getProjectWiseHourRest,
  getSpentTimePerDayRest,
  getTasksRest,
  getTimeSheetReportRest,
  getWorkspaceInvitationListRest,
  getWorkspaceListRest,
  getWorkspaceMembersRest,
  getWorkspaceSettingsRest,
  googleLoginRest,
  importProjectRest,
  loginFromInviteRest,
  loginRest,
  logoutRest,
  markAllNotificationsClearedRest,
  markAllNotificationsSeenRest,
  markNotificationSeenRest,
  pinTaskRest,
  registerFromInviteRest,
  registerRest,
  rejectWorkspaceInvitationRest,
  resetPasswordRest,
  selectJiraIntegrationRest,
  sendJiraCodeRest,
  sendWorkspaceInvitationRest,
  stopSessionRest,
  syncAllTasksRest,
  syncProjectTasksRest,
  syncStatusRest,
  uninstallIntegrationRest,
  updateSessionRest,
  updateSyncTimeRest,
  updateTaskEstimationRest,
  updateTaskSTatusRest,
  updateTimeFormatRest,
  updateWorkspaceRest,
} from "./restApi";

const restApi: apiFunction = {
  login: loginRest,
  loginFromInvite: loginFromInviteRest,
  googleLogin: googleLoginRest,
  registerUser: registerRest,
  registerUserFromInvite: registerFromInviteRest,
  logout: logoutRest,
  createTask: createTaskRest,
  getTasks: getTasksRest,
  exportTasks: exportTasksRest,
  syncTasks: syncAllTasksRest,
  syncProjectTasks: syncProjectTasksRest,
  syncStatus: syncStatusRest,
  deleteTask: deleteTaskRest,
  createSession: createSessionRest,
  stopSession: stopSessionRest,
  authJira: authJiraRest,
  getJiraLink: getJiraLinkRest,
  sendJiraCode: sendJiraCodeRest,
  getIntegrations: getIntegrationsRest,
  uninstallIntegration: uninstallIntegrationRest,
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
  markAllNotificationsCleared: markAllNotificationsClearedRest,
  updateTaskEstimation: updateTaskEstimationRest,
  getJiraSprints: getJiraSprintsRest,
  getJiraActiveSprintTasks: getJiraActiveSprintTasksRest,
  getAllProjects: getAllProjectsRest,
  importProject: importProjectRest,
  createProject: createProjectRest,
  deleteProjectTasks: deleteProjectTasksRest,
  getWorkspaceList: getWorkspaceListRest,
  createWorkspace: createWorkspaceRest,
  changeWorkspace: changeWorkspaceRest,
  deleteWorkspace: deleteWorkspaceRest,
  updateWorkspace: updateWorkspaceRest,
  getWorkspaceInvitationList: getWorkspaceInvitationListRest,
  getWorkspaceMembers: getWorkspaceMembersRest,
  sendWorkspaceInvitation: sendWorkspaceInvitationRest,
  acceptWorkspaceInvitation: acceptWorkspaceInvitationRest,
  rejectWorkspaceInvitation: rejectWorkspaceInvitationRest,
  forgotPassword: forgotPasswordRest,
  resetPassword: resetPasswordRest,
  getWorkspaceSettings: getWorkspaceSettingsRest,
  updateSyncTime: updateSyncTimeRest,
  updateTimeFormat: updateTimeFormatRest,
  getTimeSheetReport: getTimeSheetReportRest,
  getInvitedUserInfo: getInvitedUserInfoRest,
};

export const userAPI: apiFunction = restApi;

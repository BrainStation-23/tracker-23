import { apiFunction } from "utils/types";

import {
  acceptWorkspaceInvitationRest,
  addManualWorkLogRest,
  authJiraRest,
  changeWorkspaceRest,
  createProjectRest,
  createReportPageRest,
  createReportRest,
  createSessionRest,
  createTaskRest,
  createWorkspaceRest,
  deleteIntegrationRest,
  deleteProjectTasksRest,
  deleteReportPageRest,
  deleteReportRest,
  deleteSessionRest,
  deleteTaskRest,
  deleteWorkspaceRest,
  exportSprintReportRest,
  exportTasksRest,
  exportTimeSheetReportRest,
  forgotPasswordRest,
  getAllProjectsRest,
  getAllReportProjectsRest,
  getAllUsersRest,
  getIntegratedProjectStatusesRest,
  getIntegrationsRest,
  getIntegrationTypesReportPageRest,
  getInvitedUserInfoRest,
  getJiraActiveSprintTasksRest,
  getJiraLinkRest,
  getJiraSprintsRest,
  getNotificationsRest,
  getOutlookLinkRest,
  getProjectWiseHourRest,
  getReportSprintsRest,
  getSpentTimePerDayRest,
  getSprintReportRest,
  getSprintUserReportRest,
  getSprintViewReportRest,
  getSprintViewTimelineReportRest,
  getTaskListReportRest,
  getTasksRest,
  getTimeSheetReportRest,
  getWorkspaceInvitationListRest,
  getWorkspaceListRest,
  getWorkspaceMembersRest,
  getWorkspaceSettingsRest,
  googleLoginRest,
  importCalendarRest,
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
  sendOTPRest,
  sendOutlookCodeRest,
  sendWorkspaceInvitationRest,
  stopSessionRest,
  syncAllTasksRest,
  syncProjectTasksRest,
  syncStatusRest,
  uninstallIntegrationRest,
  updateApprovalUserRest,
  updateMemberStatusRest,
  updateOnboardingUserRest,
  updateReportPageRest,
  updateReportRest,
  updateSessionRest,
  updateSyncTimeRest,
  updateTaskEstimationRest,
  updateTaskSTatusRest,
  updateTimeFormatRest,
  updateWorkspaceRest,
  userListByProjectRest,
} from "./restApi";

const restApi: apiFunction = {
  login: loginRest,
  loginFromInvite: loginFromInviteRest,
  googleLogin: googleLoginRest,
  registerUser: registerRest,
  sendOTP: sendOTPRest,
  registerUserFromInvite: registerFromInviteRest,
  logout: logoutRest,
  createTask: createTaskRest,
  getTasks: getTasksRest,
  getTaskListReport: getTaskListReportRest,
  exportTasks: exportTasksRest,
  exportSprintReport: exportSprintReportRest,
  syncTasks: syncAllTasksRest,
  syncProjectTasks: syncProjectTasksRest,
  syncStatus: syncStatusRest,
  deleteTask: deleteTaskRest,
  createSession: createSessionRest,
  stopSession: stopSessionRest,
  authJira: authJiraRest,
  getJiraLink: getJiraLinkRest,
  getOutlookLink: getOutlookLinkRest,
  sendJiraCode: sendJiraCodeRest,
  sendOutlookCode: sendOutlookCodeRest,
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
  getReportSprints: getReportSprintsRest,
  getJiraActiveSprintTasks: getJiraActiveSprintTasksRest,
  getAllProjects: getAllProjectsRest,
  getAllReportProjects: getAllReportProjectsRest,
  importProject: importProjectRest,
  importCalendar: importCalendarRest,
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
  updateMemberStatus: updateMemberStatusRest,
  forgotPassword: forgotPasswordRest,
  resetPassword: resetPasswordRest,
  getWorkspaceSettings: getWorkspaceSettingsRest,
  updateSyncTime: updateSyncTimeRest,
  updateTimeFormat: updateTimeFormatRest,
  getTimeSheetReport: getTimeSheetReportRest,
  exportTimeSheetReport: exportTimeSheetReportRest,
  getSprintUserReport: getSprintUserReportRest,
  getSprintReport: getSprintReportRest,
  getSprintViewReport: getSprintViewReportRest,
  getSprintViewTimelineReport: getSprintViewTimelineReportRest,
  getInvitedUserInfo: getInvitedUserInfoRest,
  getAllUsers: getAllUsersRest,
  updateApprovalUser: updateApprovalUserRest,
  updateOnboardingUser: updateOnboardingUserRest,
  userListByProject: userListByProjectRest,
  createReportPage: createReportPageRest,
  createReport: createReportRest,
  updateReport: updateReportRest,
  deleteReport: deleteReportRest,
  getIntegrationTypesReportPage: getIntegrationTypesReportPageRest,
  updateReportPage: updateReportPageRest,
  deleteReportPage: deleteReportPageRest,
};

export const userAPI: apiFunction = restApi;

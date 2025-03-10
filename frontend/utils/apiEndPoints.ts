export const apiEndPoints = {
  login: `/auth/login`,
  googleLogin: `/auth/google/google-redirect`,
  register: `/auth/register`,
  sendOtp: `/auth/register/send-otp`,
  forgotPassword: `/auth/forgot-password`,
  resetPassword: `/auth/resetPassword`,
  tasks: `/tasks`,
  export: `/export`,
  taskListReport: `/export/user-task-list`,
  exportSprintReport: `/export/sprint-report`,
  projects: `/projects`,
  syncprojects: `/projects/sync`,
  calendar: `/projects/outlook`,
  reportProjects: `/projects/report-page`,
  synAllTasks: `/tasks/syncAll`,
  syncProjectTasks: `/tasks/sync`,
  syncStatus: `/tasks/sync/status`,
  sessions: `/sessions`,
  deleteSession: `/sessions/delete-session/`,
  updateSession: `/sessions/update-session/`,
  jira: `/integrations/jira`,
  outlook: `/integrations/outlook`,
  azure_devops: `/integrations/azure-devops`,
  integrations: `/integrations`,
  notifications: `/notifications`,
  markNotificationSeen: `/notifications/seen/`,
  markAllNotificationsSeen: `/notifications/seen-all/`,
  markAllNotificationsCleared: `/notifications/clear-all/`,
  authJira: `/integrations/jira/authorization`,
  auth_azure_devops: `/integrations/azure-devops/authorization`,
  authOutlook: `/integrations/outlook/authorize`,
  spentTime: `/sessions/spent-time/time-range`,
  spentTimePerDay: `/sessions/spent-time/per-day`,
  addWorkLog: `/sessions/manual-timeEntry`,
  updateTaskStatus: `/tasks/update/status`,
  updateTaskEstimation: `/tasks/update/estimation`,
  projectWiseStatus: `/integrations/jira/projects`,
  jiraSprints: `/sprints/sprint-list`,
  reportSprints: `/sprints/report-page`,
  activeSprintTasks: `/sprints/active-sprintTasks`,
  workspaces: `workspaces`,
  invitation: `workspaces/invitation`,
  members: `workspaces/users`,
  changeWorkspace: `workspaces/change-workspace`,
  workspaceSettings: `users/settings`,
  timeSheetReport: "sessions/timeSheet/per-day",
  exportTimeSheetReport: "/export/time-sheet",
  sprintUserReport: "sessions/spent-time/sprint-user-report",
  sprintReport: "/sprints/sprint-view",
  scrumReport: "/tasks/task-by-week",
  sprintTimelineReport: "/sprints/new-sprint-view",
  invitedUserInfo: "workspaces/verify/invited-user/",
  invitedUserLogin: `/auth/invitedUser/login`,
  invitedUserRegister: `/auth/invitedUser/register`,
  allUsers: `/users/userList`,
  updateApprovalUser: `/users/userList/`,
  updateOnboardingUser: `/users/update/`,
  userListByProject: `/users/userListByProjectId`,
  reportPage: "/pages",
  reports: "/reports",
  getIntegrationTypesReportPage: "/integrations/report-page",
  exportSprintViewSheet: "export/sprint-view-sheet",
  exportScrumViewSheet: "export/scrum-view-sheet",
  exportTimeLineSheet: "export/time-line-sheet",
  allTaskReload: "tasks/reload",
};

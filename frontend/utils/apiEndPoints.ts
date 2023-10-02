export const apiEndPoints = {
  login: `/auth/login`,
  googleLogin: `/auth/google/google-redirect`,
  register: `/auth/register`,
  forgotPassword: `/auth/forgot-password`,
  resetPassword: `/auth/resetPassword`,
  tasks: `/tasks`,
  export: `/export`,
  projects: `/projects`,
  synAllTasks: `/tasks/syncAll`,
  syncProjectTasks: `/tasks/sync`,
  syncStatus: `/tasks/sync/status`,
  sessions: `/sessions`,
  deleteSession: `/sessions/delete-session/`,
  updateSession: `/sessions/update-session/`,
  jira: `/integrations/jira`,
  integrations: `/integrations`,
  notifications: `/notifications`,
  markNotificationSeen: `/notifications/seen/`,
  markAllNotificationsSeen: `/notifications/seen-all/`,
  authJira: `/integrations/jira/authorization`,
  spentTime: `/sessions/spent-time/time-range`,
  spentTimePerDay: `/sessions/spent-time/per-day`,
  addWorkLog: `/sessions/manual-timeEntry`,
  updateTaskStatus: `/tasks/update/status`,
  updateTaskEstimation: `/tasks/update/estimation`,
  projectWiseStatus: `/integrations/jira/projects`,
  jiraSprints: `/sprints/sprint-list`,
  activeSprintTasks: `/sprints/active-sprintTasks`,
  workspaces: `workspaces`,
  invitation: `workspaces/invitation`,
  members: `workspaces/users`,
  changeWorkspace: `workspaces/change-workspace`,
  workspaceSettings: `users/settings`,
};

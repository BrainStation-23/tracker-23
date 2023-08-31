export const apiEndPoints = {
  login: `/auth/login`,
  googleLogin: `/auth/google/google-redirect`,
  register: `/auth/register`,
  forgotPassword: `/auth/forgot-password`,
  resetPassword: `/auth/resetPassword`,
  tasks: `/tasks`,
  export: `/export`,
  allProjects: `/projects/list`,
  projectTasks: `/projects`,
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
  spentTime: `/tasks/spent-time/time-range`,
  spentTimePerDay: `/tasks/spent-time/per-day`,
  addWorkLog: `/sessions/manual-timeEntry`,
  updateTaskStatus: `/tasks/update/status`,
  updateTaskEstimation: `/tasks/update/estimation`,
  projectWiseStatus: `/integrations/jira/projects`,
  jiraSprints: `/sprints/sprint-list`,
  activeSprintTasks: `/sprints/active-sprintTasks`,
  workspaces: `workspaces`,
  invitation: `workspaces/invitation`,
  changeWorkspace: `workspaces/change-workspace`,
};

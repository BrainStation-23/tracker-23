export class GetUserIntegrationsByUserWorkspaceIdAndWorkspaceId {
  userWorkspaceId: number;
  workspaceId: number;
}

export enum ErrorMessage {
  INVALID_JIRA_REFRESH_TOKEN = 'Invalid Jira Refresh token!',
  INVALID_AZURE_DEV_REFRESH_TOKEN = 'Invalid Azure Dev Refresh token!',
  INVALID_OUTLOOK_REFRESH_TOKEN = 'Invalid Outlook Refresh token!',
}

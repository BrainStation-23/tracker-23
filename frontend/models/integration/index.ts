export type IntegrationDto = {
  id?: number;
  site?: string;
  siteId?: string;
  accessToken?: string;
  type: IntegrationType;
};

export type IntegrationType = "JIRA" | "TRELLO" | "OUTLOOK" | "TRACKER23";

export enum integrationName {
  JIRA = "Jira",
  TRELLO = "Trello",
  OUTLOOK = "Outlook",
  TRACKER23 = "Tracker 23",
}

export enum AuthorizationErrorMessage {
  INVALID_JIRA_REFRESH_TOKEN = "Invalid Jira Refresh token!",
  INVALID_OUTLOOK_REFRESH_TOKEN = "Invalid Outlook Refresh token!",
}

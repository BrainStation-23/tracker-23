export type Integration = {
  id?: number;
  site?: string;
  siteId?: string;
  type: IntegrationType;
  accessToken?: string;
};

export type IntegrationType = "JIRA" | "TRELLO" | "OUTLOOK" | "TRACKER23";

export enum integrationName {
  JIRA = "Jira",
  TRELLO = "Trello",
  OUTLOOK = "Outlook",
  TRACKER23 = "Tracker 23",
}

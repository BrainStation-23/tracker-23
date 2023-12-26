export type Integration = {
  id?: number;
  site?: string;
  siteId?: string;
  type: IntegrationType;
  accessToken?: string;
};

export type IntegrationType = "JIRA" | "TRELLO" | "OUTLOOK";

export enum integrationName {
  JIRA = "Jira",
  TRELLO = "Trello",
  OUTLOOK = "Outlook",
}

export type Integration = {
  id?: number;
  site?: string;
  siteId?: string;
  type: "JIRA" | "TRELLO";
  accessToken?: string;
};

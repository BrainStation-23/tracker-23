const { JIRA_CALLBACK_URL, JIRA_CLIENT_ID, JIRA_SECRET_KEY } = process.env;

export const jiraConfig = {
  callback: JIRA_CALLBACK_URL || '',
  clientId: JIRA_CLIENT_ID || '',
  client_secret: JIRA_SECRET_KEY || '',
};

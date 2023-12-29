const {
  OUTLOOK_CALLBACK_URL,
  OUTLOOK_CLIENTID,
  OUTLOOK_CLIENT_SECRET,
  OUTLOOK_SCOPE,
} = process.env;

export const outLookConfig = {
  callback:
    OUTLOOK_CALLBACK_URL ||
    'http://localhost:3001/integrations/outlook/callback/',
  clientId: OUTLOOK_CLIENTID || '872cd7ddadkasj-430c-bcc3-9ee4d568cdfb',
  client_secret:
    OUTLOOK_CLIENT_SECRET || 'mew8Q~EasjhdsajviPyv8d.QILqwYXQpQlmtYpnbXZ',
  scope:
    OUTLOOK_SCOPE ||
    'offline_access user.read Calendars.ReadWrite Calendars.Read',
};

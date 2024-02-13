const {
  OUTLOOK_CALLBACK_URL,
  OUTLOOK_CLIENTID,
  OUTLOOK_CLIENT_SECRET,
  OUTLOOK_SCOPE,
  OUTLOOK_WEBHOOK_URL,
  OUTLOOK_WEBHOOK_CHANGE_TYPE,
  OUTLOOK_CLIENT_STATE,
  OUTLOOK_WEBHOOK_REGISTER_ENDPOINT,
  OUTLOOK_GET_EVENT_BY_EVENTID_URL,
  OUTLOOK_AUTH_URL,
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

  webhookUrl: OUTLOOK_WEBHOOK_URL,
  outlookWebhookChangeType: OUTLOOK_WEBHOOK_CHANGE_TYPE || 'created',
  clientState: OUTLOOK_CLIENT_STATE || 'client-state',
  outlookWebhookRegisterEndPoint:
    OUTLOOK_WEBHOOK_REGISTER_ENDPOINT ||
    'https://example.com/v1.0/subscriptions',

  outlookGetEventByEventIdUrl:
    OUTLOOK_GET_EVENT_BY_EVENTID_URL ||
    'https://example.com/v1.0/me/calendar/events/',

  outlookAuthUrl: OUTLOOK_AUTH_URL || '',
};

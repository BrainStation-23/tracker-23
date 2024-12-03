const {
  AZURE_CALLBACK_URL,
  AZURE_DEV_CLIENT_SECRET,
  AZURE_DEV_GRANT_TYPE,
  AZURE_DEV_CLIENT_ASSERTION_TYPE,
  AZURE_DEV_BASE_URL,
} = process.env;

export const azureDevConfig = {
  client_assertion_type: AZURE_DEV_CLIENT_ASSERTION_TYPE || '',
  client_assertion: AZURE_DEV_CLIENT_SECRET || '',
  grant_type: AZURE_DEV_GRANT_TYPE || '',
  redirect_uri: AZURE_CALLBACK_URL || '',
  base_url: AZURE_DEV_BASE_URL || '',
};

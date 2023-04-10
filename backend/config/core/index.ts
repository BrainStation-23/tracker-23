const { API, ENV, HOST, REST_API_PREFIX, BASE_URL } = process.env;

export const coreConfig = {
  api: API || 'REST',
  env: ENV || 'DEVELOPMENT',
  host: HOST || 'localhost',
  restApiPrefix: REST_API_PREFIX || 'api',
  baseUrl: BASE_URL || 'http://localhost:3000',
};

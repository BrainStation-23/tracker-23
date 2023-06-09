const {
  API,
  ENV,
  HOST,
  REST_API_PREFIX,
  BASE_URL,
  PROMISE_RESOLVE_QUANTITY,
  SYNC_TASK_QUANTITY,
} = process.env;

export const coreConfig = {
  api: API || 'REST',
  env: ENV || 'DEVELOPMENT',
  host: HOST || 'localhost',
  restApiPrefix: REST_API_PREFIX || 'api',
  baseUrl: BASE_URL || 'http://localhost:3000',
  promiseQuantity: Number(PROMISE_RESOLVE_QUANTITY) || 10,
  syncTaskQuantity: Number(SYNC_TASK_QUANTITY) || 10,
};

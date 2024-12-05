const {
  API,
  ENV,
  HOST,
  REST_API_PREFIX,
  BASE_URL,
  PROMISE_RESOLVE_QUANTITY,
  SYNC_TASK_QUANTITY,
  INVITE_URL,
  GOOGLE_EMAIL_USER,
  NODEMAILER_HOST,
  NODEMAILER_PORT,
  NODEMAILER_SECURE,
  NODEMAILER_SERVICE,
  NODEMAILER_USER,
  NODEMAILER_PASS,
  ADMIN_EMAIL,
  HOST_URL,
  BACKDOOR_SECRET
} = process.env;

export const coreConfig = {
  api: API || 'REST',
  env: ENV || 'DEVELOPMENT',
  host: HOST || 'localhost',
  restApiPrefix: REST_API_PREFIX || 'api',
  baseUrl: BASE_URL || 'http://localhost:3000',
  promiseQuantity: Number(PROMISE_RESOLVE_QUANTITY) || 10,
  syncTaskQuantity: Number(SYNC_TASK_QUANTITY) || 10,
  ADMIN_URL: INVITE_URL || 'http://localhost:3001/inviteLink',
  admin_mail: ADMIN_EMAIL || 'admin@example.com',
  host_url: HOST_URL || 'http://localhost:3001',
  backdoor_secret: BACKDOOR_SECRET || "",
};

export const nodemailerConfig = {
  user: GOOGLE_EMAIL_USER,
  options: {
    host: NODEMAILER_HOST || 'smtp.example.com',
    port: Number(NODEMAILER_PORT) || 465,
    secure: Boolean(NODEMAILER_SECURE) || true,
    service: NODEMAILER_SERVICE || 'gmail',
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  },
};

const { AMQP_URL, RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_PASS } = process.env;

export const queueConfig = {
  amqp_url: AMQP_URL || 'localhost:1234',
  userName: RABBITMQ_DEFAULT_USER || 'admin',
  password: RABBITMQ_DEFAULT_PASS || 'password',
};

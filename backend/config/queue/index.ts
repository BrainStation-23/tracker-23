const { AMQP_URL } = process.env;

export const queueConfig = {
  amqp_url: AMQP_URL || 'amqp://localhost',
};

const redis = require('redis');
const logger = require('../utils/logger');

async function createRedisClient() {
  const client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6380'),
      tls: process.env.REDIS_TLS === 'true'
    },
    password: process.env.REDIS_PASSWORD,
    legacyMode: false
  });

  client.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  await client.connect();
  return client;
}

module.exports = {
  createRedisClient
};

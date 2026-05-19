const { Redis } = require('ioredis');
require('dotenv').config();
const redisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // MUST be null for BullMQ
};

if (process.env.REDIS_TLS === 'true') {
  redisOptions.tls = {};
}

const redis = new Redis(redisOptions);

redis.on('ready', () => console.log('✅ Redis ready'));
redis.on('error', (err) => console.error('Redis error', err));

module.exports = redis;

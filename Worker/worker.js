const { Queue } = require('bullmq');
const redis = require('./redis');

const pointsQueue = new Queue('points-queue', { connection: redis });

module.exports = pointsQueue;

const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String },
  targetId: { type: String },
  ip: { type: String },
  long: { type: String },
  latd: { type: String },
  deviceid: { type: String },
  status: { type: String, default: 'success' },
  message: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('user_activity_log', userActivityLogSchema);

const mongoose = require('mongoose');

const teacherActivityLogSchema = new mongoose.Schema({
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

module.exports = mongoose.model('teacher_activity_log', teacherActivityLogSchema);

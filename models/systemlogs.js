const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  userId: { type: String },
  action: { type: String, required: true },
  functionName: { type: String, required: true },
  error: { type: String },
  params: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: false
});

module.exports = mongoose.model('system_log', systemLogSchema);

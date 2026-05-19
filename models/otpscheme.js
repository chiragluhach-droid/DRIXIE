const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, required: true },
  time: { type: Date, default: Date.now },
  status: { type: Number, required: true, enum: [0, 1] }
}, {
  timestamps: true
});

module.exports = mongoose.model('otptable', otpSchema);

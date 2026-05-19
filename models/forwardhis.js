const mongoose = require('mongoose');

const forwardHistorySchema = new mongoose.Schema({
  queryid: { type: String, required: true },
  frtid: { type: String, required: true },
  frtn: { type: String },
  frtr: { type: String },
  frtd: { type: String },
  frts: { type: String },
  tid: { type: String, required: true },
  tnm: { type: String },
  trl: { type: String },
  tdsg: { type: String },
  tsch: { type: String },
  status: { type: String, required: true, enum: ['pending', 'resolved', 'forwardedandpending', 'inreview', 'draft', 'pending_teacher', 'pending_hod', 'pending_dean'], default: 'pending' },
  notes: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('forwardhistory', forwardHistorySchema);

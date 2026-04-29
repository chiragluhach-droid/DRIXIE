const mongoose = require('mongoose');

const queryDetailSchema = new mongoose.Schema({
  assignnow: { type: String, required: true },
  description: { type: String, required: true },
  queryno: { type: String, required: true },
  queryid: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  createdby: { type: String, required: true },
  status: { type: String, required: true, enum: ['pending', 'resolved', 'forwardedandpending', 'inreview', 'draft', 'pending_teacher', 'pending_hod', 'pending_dean'], default: 'pending_teacher' },
  catagoryid: { type: String, required: true },
  subcaragoryid: { type: String, default: '0' }
}, {
  timestamps: true
});

module.exports = mongoose.model('querydetail', queryDetailSchema);

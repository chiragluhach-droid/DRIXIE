const mongoose = require('mongoose');

const autoForwardingSchema = new mongoose.Schema({
  catid: { type: String, required: true },
  subcatid: { type: String },
  deptid: { type: String },
  auforwardingt: { type: String },
  assignteacher: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('autoforwarding', autoForwardingSchema);

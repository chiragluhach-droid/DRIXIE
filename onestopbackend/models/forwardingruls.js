const mongoose = require('mongoose');

const forwardingRulesSchema = new mongoose.Schema({
  fromrole: { type: String, required: true },
  torole: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('forwardingrules', forwardingRulesSchema);

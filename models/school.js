const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scanme: { type: String, required: true },
  categoryId: { type: String, required: true },
  isdeleted: { type: Boolean, required: true, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('school', schoolSchema);
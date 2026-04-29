const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdBy: { type: String, required: true },
  dept: { type: String },
  role: { type: String },
  name: { type: String, required: true },
  school: { type: String },
  queryid: { type: String, required: true },
  category: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('comment', commentSchema);
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filetype: { type: String, required: true },
  refno: { type: String },
  url: { type: String },
  bucket: { type: String },
  originalname: { type: String },
  etag: { type: String },
  size: { type: Number },
  uploadedBy: { type: String, required: true },
  isTeacher: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('attachment', attachmentSchema);
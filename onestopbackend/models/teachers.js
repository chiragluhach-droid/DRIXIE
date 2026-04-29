const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  tchid: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  tchnam: { type: String, required: true },
  tchmail: { type: String, required: true },
  tchrole: { type: String, required: true },
  tchdept: { type: String },
  techsch: { type: String },
  techcat: { type: String },
  techdesig: { type: String },
  sessiontoken: { type: String },
  deviceid: { type: String },
  isactive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('teachers', teacherSchema);

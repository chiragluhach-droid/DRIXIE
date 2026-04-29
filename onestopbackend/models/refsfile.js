const mongoose = require('mongoose');

const refSeFileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  refid: { type: String, required: true },
  queryid: { type: String, required: true },
  description: { type: String, required: true },
  addedby: { type: String, required: true },
  tname: { type: String },
  trole: { type: String },
  tdept: { type: String },
  tschl: { type: String },
  isdeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('refsefile', refSeFileSchema);
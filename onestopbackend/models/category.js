const mongoose = require('mongoose');

const queryCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  responsetime: { type: Number },
  createdby: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('querycategory', queryCategorySchema);
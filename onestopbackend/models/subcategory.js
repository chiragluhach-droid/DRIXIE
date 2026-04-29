const mongoose = require('mongoose');

const querySubcategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  responsetime: { type: String, required: true },
  categoryId: { type: String, required: true },
  isactive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('querysubcategory', querySubcategorySchema);


const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolId: { type: String },
  categoryId: { type: String, required: true },
  isdeleted: { type: Boolean, required: true, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('department', departmentSchema);

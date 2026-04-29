const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rolename: { type: String, required: true },
  categoryId: { type: String, required: true },
  level: { type: Number, required: true },
  isdeleted: { type: Boolean, required: true, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('role', roleSchema);

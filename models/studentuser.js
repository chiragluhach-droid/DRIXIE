const mongoose = require('mongoose');

const studentUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  stdid: { type: String, required: true, unique: true },
  sid: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  deviced: { type: String },
  sessiontoken: { type: String },
  lastlogin: { type: Date },
  department: { type: String },
  university: { type: String },
  school: { type: String, required: true },
  isactive: { type: Boolean, required: true, default: true },
  isdelete: { type: Boolean, required: true, default: false },
  sessionstartyear: { type: Number },
  endyear: { type: Number },
  course: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('studentuser', studentUserSchema);

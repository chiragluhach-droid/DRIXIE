const mongoose = require('mongoose');
const Student = require('./onestopbackend/models/studentuser');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://chiragchehak_db_user:871NseH12P6siv5x@almamate.acmmgve.mongodb.net/?appName=AlmaMate';

async function check() {
  await mongoose.connect(MONGO_URI);
  const students = await Student.find({});
  console.log("Students:", students);
  const findStuid = await Student.findOne({ stdid: 'STU001', isactive: true, isdelete: false });
  console.log("Find STU001:", findStuid);
  process.exit(0);
}
check();

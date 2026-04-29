const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./onestopbackend/models/studentuser');
const Category = require('./onestopbackend/models/category');
const SubCategory = require('./onestopbackend/models/subcategory');
const Teacher = require('./onestopbackend/models/teachers');
const AutoForwarding = require('./onestopbackend/models/autoforwarding');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://chiragchehak_db_user:871NseH12P6siv5x@almamate.acmmgve.mongodb.net/almamate?appName=AlmaMate';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    await Teacher.deleteMany({});
    await AutoForwarding.deleteMany({});
    
    console.log('Cleared existing data');

    const cat1 = await Category.create({ title: 'Academic Related Issues', description: 'Academic queries', createdby: 'system' });
    const cat2 = await Category.create({ title: 'Hostel', description: 'Hostel queries', createdby: 'system' });
    const cat3 = await Category.create({ title: 'Technical', description: 'IT and Technical issues', createdby: 'system' });
    const cat4 = await Category.create({ title: 'Financial', description: 'Fees and Account queries', createdby: 'system' });
    const cat5 = await Category.create({ title: 'Library', description: 'Library issues', createdby: 'system' });
    const cat6 = await Category.create({ title: 'Transport', description: 'Bus and Transport queries', createdby: 'system' });

    const subCats = await SubCategory.create([
      { title: 'Exams', description: 'Exam related queries', responsetime: '48', categoryId: cat1._id.toString(), isactive: true },
      { title: 'Room change', description: 'Room change request', responsetime: '72', categoryId: cat2._id.toString(), isactive: true },
      { title: 'Wifi issue', description: 'Cannot connect to Wifi', responsetime: '24', categoryId: cat3._id.toString(), isactive: true },
      { title: 'Fee payment failed', description: 'Payment deducted but not updated', responsetime: '48', categoryId: cat4._id.toString(), isactive: true },
      { title: 'Book not found', description: 'Book missing from shelf', responsetime: '48', categoryId: cat5._id.toString(), isactive: true },
      { title: 'Bus pass issue', description: 'Bus pass not generated', responsetime: '48', categoryId: cat6._id.toString(), isactive: true },
    ]);

    // Add dummy teacher
    const teacher = await Teacher.create({
      tchnam: 'Dummy Teacher',
      tchmail: 'chiragchehak@gmail.com',
      tchid: 'TCH001',
      tchdept: 'CS',
      techsch: 'Engineering',
      tchrole: 'faculty',
      isactive: true
    });

    // Add auto-forwarding rules
    await AutoForwarding.create([
      // Academic needs subcatid and deptid
      { catid: cat1._id.toString(), subcatid: subCats[0]._id.toString(), deptid: 'CS', auforwardingt: teacher.tchid, assignteacher: teacher.tchid },
      { catid: cat1._id.toString(), subcatid: subCats[0]._id.toString(), deptid: 'ME', auforwardingt: teacher.tchid, assignteacher: teacher.tchid },
      // Others only need catid but schema requires subcatid
      { catid: cat2._id.toString(), subcatid: subCats[1]._id.toString(), auforwardingt: teacher.tchid, assignteacher: teacher.tchid },
      { catid: cat3._id.toString(), subcatid: subCats[2]._id.toString(), auforwardingt: teacher.tchid, assignteacher: teacher.tchid },
      { catid: cat4._id.toString(), subcatid: subCats[3]._id.toString(), auforwardingt: teacher.tchid, assignteacher: teacher.tchid },
      { catid: cat5._id.toString(), subcatid: subCats[4]._id.toString(), auforwardingt: teacher.tchid, assignteacher: teacher.tchid },
      { catid: cat6._id.toString(), subcatid: subCats[5]._id.toString(), auforwardingt: teacher.tchid, assignteacher: teacher.tchid },
    ]);

    // Add dummy student
    await Student.create([
      {
        name: 'Dummy Student 1',
        email: 'chirag_luhach23@mru.ac.in',
        mobile: '1234567890',
        stdid: 'STU001',
        department: 'CS',
        university: 'MRU',
        school: 'Engineering',
        sessionstartyear: '2023',
        endyear: '2027',
        course: 'B.Tech',
      },
      {
        name: 'Dummy Student 2',
        email: 'dummy2@example.com',
        mobile: '0987654321',
        stdid: 'STU002',
        department: 'ME',
        university: 'MRU',
        school: 'Engineering',
        sessionstartyear: '2022',
        endyear: '2026',
        course: 'B.Tech',
      }
    ]);

    console.log('Seed data inserted successfully!');
    console.log('You can login with Student ID: STU001 and OTP: 1234');
    
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();

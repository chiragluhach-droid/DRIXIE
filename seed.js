const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./onestopbackend/models/studentuser');
const Category = require('./onestopbackend/models/category');
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
    await Teacher.deleteMany({});
    await AutoForwarding.deleteMany({});
    
    console.log('Cleared existing data');

    const cat1 = await Category.create({ title: 'Academic Related Issues', description: 'Academic queries', createdby: 'system' });
    const cat2 = await Category.create({ title: 'Hostel', description: 'Hostel queries', createdby: 'system' });
    const cat3 = await Category.create({ title: 'Technical', description: 'IT and Technical issues', createdby: 'system' });
    const cat4 = await Category.create({ title: 'Financial', description: 'Fees and Account queries', createdby: 'system' });
    const cat5 = await Category.create({ title: 'Library', description: 'Library issues', createdby: 'system' });
    const cat6 = await Category.create({ title: 'Transport', description: 'Bus and Transport queries', createdby: 'system' });

    // Add dummy teachers for each category
    const teacherAcademic = await Teacher.create({
      tchnam: 'Ms. Deepanshi Gupta',
      tchmail: 'chiragluhach@gmail.com',
      tchid: 'TCH_ACAD',
      tchdept: 'CS',
      techsch: 'Engineering',
      tchrole: 'faculty',
      isactive: true
    });

    const teacherHostel = await Teacher.create({
      tchnam: 'Mr. Hostel Warden',
      tchmail: 'warden@example.com',
      tchid: 'TCH_HOSTEL',
      tchdept: 'Hostel',
      techsch: 'Administration',
      tchrole: 'faculty',
      isactive: true
    });

    const teacherTech = await Teacher.create({
      tchnam: 'Mr. Tech Support',
      tchmail: 'techsupport@example.com',
      tchid: 'TCH_TECH',
      tchdept: 'IT',
      techsch: 'Administration',
      tchrole: 'faculty',
      isactive: true
    });

    const teacherFinance = await Teacher.create({
      tchnam: 'Ms. Finance Officer',
      tchmail: 'finance@example.com',
      tchid: 'TCH_FINANCE',
      tchdept: 'Accounts',
      techsch: 'Administration',
      tchrole: 'faculty',
      isactive: true
    });

    const teacherLibrary = await Teacher.create({
      tchnam: 'Mr. Librarian',
      tchmail: 'library@example.com',
      tchid: 'TCH_LIB',
      tchdept: 'Library',
      techsch: 'Administration',
      tchrole: 'faculty',
      isactive: true
    });

    const teacherTransport = await Teacher.create({
      tchnam: 'Mr. Transport Manager',
      tchmail: 'transport@example.com',
      tchid: 'TCH_TRANS',
      tchdept: 'Transport',
      techsch: 'Administration',
      tchrole: 'faculty',
      isactive: true
    });

    const hod = await Teacher.create({
      tchnam: 'Dr. Chandni Magoo',
      tchmail: 'luhachchirag72@gmail.com',
      tchid: 'HOD001',
      tchdept: 'CS',
      techsch: 'Engineering',
      tchrole: 'hod',
      isactive: true
    });

    const dean = await Teacher.create({
      tchnam: 'Dr. Deependra Kumar Jha',
      tchmail: 'luhachchirag@gmail.com',
      tchid: 'DEAN001',
      tchdept: 'All',
      techsch: 'Engineering',
      tchrole: 'dean',
      isactive: true
    });

    // Add auto-forwarding rules
    await AutoForwarding.create([
      // Academic
      { catid: cat1._id.toString(), deptid: 'CS', auforwardingt: teacherAcademic.tchid, assignteacher: teacherAcademic.tchid },
      { catid: cat1._id.toString(), deptid: 'ME', auforwardingt: teacherAcademic.tchid, assignteacher: teacherAcademic.tchid },
      // Hostel
      { catid: cat2._id.toString(), auforwardingt: teacherHostel.tchid, assignteacher: teacherHostel.tchid },
      // Technical
      { catid: cat3._id.toString(), auforwardingt: teacherTech.tchid, assignteacher: teacherTech.tchid },
      // Financial
      { catid: cat4._id.toString(), auforwardingt: teacherFinance.tchid, assignteacher: teacherFinance.tchid },
      // Library
      { catid: cat5._id.toString(), auforwardingt: teacherLibrary.tchid, assignteacher: teacherLibrary.tchid },
      // Transport
      { catid: cat6._id.toString(), auforwardingt: teacherTransport.tchid, assignteacher: teacherTransport.tchid },
    ]);

    // Add dummy student
    await Student.create([
      {
        name: 'Chirag Luhach',
        email: 'chiragchehak@gmail.com',
        sid: 'SID001',
        stdid: 'STU001',
        department: 'CS',
        university: 'MRU',
        school: 'Engineering',
        sessionstartyear: '2023',
        endyear: '2027',
        course: 'B.Tech',
        mobile: '1234567890'
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

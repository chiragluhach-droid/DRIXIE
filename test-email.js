require('dotenv').config();
const helper = require('./onestopbackend/helper/helper');
(async () => {
  console.log("Testing email with GMAIL:", process.env.GMAIL);
  const result = await helper.sendsinglemail("chiragchehak@gmail.com", "Test Subject", "Test Message");
  console.log("Email result:", result);
})();

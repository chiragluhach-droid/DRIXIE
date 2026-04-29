require('dotenv').config();
const helper = require('./onestopbackend/helper/helper');
(async () => {
  console.log("Testing Brevo email with GMAIL sender: chiragchehak@gmail.com");
  const result = await helper.sendsinglemail("chiragchehak@gmail.com", "Brevo Integration Test", "This is a test message sent via Brevo HTTP API.");
  console.log("Email result:", result);
})();

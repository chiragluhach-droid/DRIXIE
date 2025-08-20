const express = require('express');
const router = express.Router();
const studentcon = require('../controller/student/usercontroller');

router.post('/user/register',studentcon.userregistration);
router.post('/user/signin/otp',studentcon.userloginotprequest);
router.post('/user/otp/sign/submit',studentcon.userloginotpsubmit);

module.exports = router;

const express = require('express');
const router = express.Router();
const studentcon = require('../controller/student/usercontroller');
const catagorycon = require('../controller/catagorycon/catagorycontroller')
const middleware = require('../middleware/studentmiddleware');
const querycon = require('../controller/student/querycontroller')


router.post('/user/register',studentcon.userregistration);
router.post('/user/signin/otp',studentcon.userloginotprequest);
router.post('/user/otp/sign/submit',studentcon.userloginotpsubmit);
// fetch catagories along with sub catagory
router.post('/user/ctagory/fetch',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
router.post('/user/sub/ctagory/fetch',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
// query create
router.post('/user/query/create',middleware.jwtusercheck,middleware.userdatacheck,querycon.userquerycreatedeaft);
router.post('/user/query/fecthall',middleware.jwtusercheck,middleware.userdatacheck,querycon.fetchallquery);
router.post('/user/query/comments',middleware.jwtusercheck,middleware.userdatacheck,querycon.fetchparticularquerycomments);

// attachments 

router.post('/user/query/attachments',middleware.jwtusercheck,middleware.userdatacheck,querycon.fetchparticularquerycomments);
router.post('/user/upload/attachments',middleware.jwtusercheck,middleware.userdatacheck,querycon.fetchparticularquerycomments);
router.post('/user/delete/attachments',middleware.jwtusercheck,middleware.userdatacheck,querycon.fetchparticularquerycomments);


module.exports = router;

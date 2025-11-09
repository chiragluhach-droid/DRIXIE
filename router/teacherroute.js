const express = require('express');
const router = express.Router();
const assigncon = require('./../controller/forwardingcontroller/forwardingcontroller')
const catagorycon = require('../controller/catagorycon/catagorycontroller')
const middleware = require('../middleware/teachermiddleware')
const usercon = require('../controller/teacher/usercontroller')

router.post('/sign',usercon.userauthtoken);
// =========================================catcgory fetch update delete====================================
router.post('/ctagory/create',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
router.post('/ctagory/update',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
router.post('/ctagory/delete',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
router.post('/sub/ctagory/create',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
router.post('/sub/ctagory/update',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
router.post('/sub/ctagory/delete',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
// fetch
router.post('/ctagory/fetch',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
router.post('/sub/ctagory/fetch',middleware.jwtusercheck,middleware.userdatacheck,catagorycon.fetchallcatagorywithsub);
// =========================================catcgory fetch update delete end====================================



// =========================================auto forwarding rules create====================================

router.post('/autoforward/create',middleware.jwtusercheck,assigncon.autoforwardingrulecreate);
router.post('/autoforward/update',middleware.jwtusercheck,middleware.userdatacheck,assigncon.updateAutoforwardingrule);
router.post('/autoforward/delete',middleware.jwtusercheck,middleware.userdatacheck,assigncon.deleteAutoforwardingrule);
router.post('/autoforward/fetch',middleware.jwtusercheck,middleware.userdatacheck,assigncon.fetchassignrule);

// =========================================auto forwarding rules create end ====================================


// reacher query controller

module.exports = router;

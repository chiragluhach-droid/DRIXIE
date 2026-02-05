const helper = require('../helper/helper');
const responsecon = require('../helper/response');
const user = require('../models/studentuser');
const usermodel = require('../models/studentuser');

const secectkey = process.env.JWTKEY;
const jwt = require('jsonwebtoken');
class StudentMiddleware {
    async jwtusercheck(req, res, next) {
        try {
            if (
                req.headers.authorization &&
                req.headers.authorization.split(" ")[1]
            ) {
                let token = req.headers.authorization.split(" ")[1];
                let dataa = await helper.baldecryptt(token);
                jwt.verify(dataa, secectkey, (err, data) => {
                    if (!err) {
                        req.user = data;
                        next();
                    } else {
                        console.log(err)
                        return responsecon.failedresponse(res,"Please Login");
                    }
                });
            } else {
                //req.flash('error', "Login Failed pls try again");
                return responsecon.failedresponse(res,"Please login");
            }
        } catch (err) {
              console.log(err);
            return responsecon.failedresponse(res,"Please login");
        }
    }
    async userdatacheck(req,res,next){
        try{
            let userdetails = await usermodel.findOne({
                where: {
                    sid: req.user.id,
                    isactive: true,
                    isdelete: false
                },
                attributes: [
                    'sessiontoken',
                    'department',
                    'university',
                    'school',
                    'sid',
                    'stdid',
                    'mobile',
                    'email',
                    'name',
                ]
            });
            let token = req.user.aptoken;
            if (userdetails.sessiontoken == token) { //&& userdetails.role == "admin"
                req.user = userdetails;
                next();
            } else {
                //  console.log(userdetails);
                return res.status(400).json({ res: false, txn: "error", msg: "Invalid user details" });
            }
        }catch(err){
            console.log(err)
            return res.status(400).json({ res: false, txn: "error", msg: "Please login" });
        }
    }
    async usertokenchk(req, res) {
        try {
            let userdetails = await usermodel.findOne({
                where: {
                    sid: req.user.id,
                    isactive: true,
                    isdelete: false
                },
                attributes: [
                    'sessiontoken',
                ]
            });
            let token = req.user.aptoken;
            if (userdetails.sessiontoken == token) { //&& userdetails.role == "admin"
                return res.status(200).json({ res: true, msg: "User Validate" });
            } else {
                //  console.log(userdetails);
                return res.status(400).json({ res: false, msg: "Please login" });
            }
        } catch (err) {
            return res.status(400).json({ res: false, msg: "Please login" });
        }
    }
}
module.exports = new StudentMiddleware();
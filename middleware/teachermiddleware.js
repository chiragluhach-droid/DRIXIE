const usermodel = require('../models/teachers');

const jwt = require('jsonwebtoken')
const secectkey = process.env.JWTKEY;

class TeacherMiddleware{
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
                        return res.status(400).json({ res: false, txn: "error", msg: "Please login" });
                    }
                });
            } else {
                //req.flash('error', "Login Failed pls try again");
                return res.status(400).json({ res: false, txn: "error", msg: "Please login" });
            }
        } catch (err) {
              console.log(err);
            return res.status(400).json({ res: false, txn: "error", msg: "Please login" });
        }
    }
    async userdatacheck(req,res,next){
        try{
            let userdetails = await usermodel.findOne({
                where: {
                    tchid: req.user.id,
                    isactive: true,
                    deletedAt:null
                },
                attributes: [
                    'sessiontoken',
                    'tchnam',
                    'tchid',
                    'tchmail',
                    'tchrole',
                    'tchdept',
                    'techsch',
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
                    tchid: req.user.id,
                    isactive: true,
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
module.exports=new TeacherMiddleware();
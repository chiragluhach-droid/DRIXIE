const usermodel = require("../models/teachers");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { postRequest } = require("../network/networkapi");
const secectkey = process.env.JWTKEY;
const url = process.env.EOFFICEURL;

class TeacherMiddleware {
  async jwtusercheck(req, res, next) {
    try {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[1]
      ) {
        let token = req.headers.authorization.split(" ")[1];
        const response = await axios.post(
          `${url}/user/jwt/token/check`,
          { ji: "hj" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if(!response.data.data) return res
        .status(400)
        .json({ res: false, txn: "error", msg: "Please login" });
        
        req.user=response.data.data;
        next();
      } else {
        //req.flash('error', "Login Failed pls try again");
        return res
          .status(400)
          .json({ res: false, txn: "error", msg: "Please login" });
      }
    } catch (err) {
      console.log(err.message);
      return res
        .status(400)
        .json({ res: false, txn: "error", msg: "Please login" });
    }
  }
  async userdatacheck(req, res, next) {
    try {
      // call other apis to verify
      let userdetails = await usermodel.findOne({
          tchid: req.user.id,
          isactive: true,
          isdelete: false
      }).select('sessiontoken tchnam tchid tchmail tchrole tchdept techsch');
      let token = req.user.aptoken;
      if (userdetails.sessiontoken == token) {
        //&& userdetails.role == "admin"
        req.user = userdetails;
        next();
      } else {
        //  console.log(userdetails);
        return res
          .status(400)
          .json({ res: false, txn: "error", msg: "Invalid user details" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ res: false, txn: "error", msg: "Please login" });
    }
  }
  async usertokenchk(req, res) {
    try {
      let userdetails = await usermodel.findOne({
          tchid: req.user.id,
          isactive: true,
      }).select("sessiontoken");
      let token = req.user.aptoken;
      if (userdetails.sessiontoken == token) {
        //&& userdetails.role == "admin"
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
module.exports = new TeacherMiddleware();

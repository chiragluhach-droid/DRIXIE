const studentm = require("../../models/studentuser");
const querym = require("../../models/querydetail");
const responsecon = require("../../helper/response");
const helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");
const systemlogm = require("../../models/systemlogs");
const useractvtym = require("../../models/useractivitylog");
class Usercontroller {
  async userregistration(req, res) {
    const {
      name,
      mobile,
      emeail,
      stdid,
      department,
      university,
      school,
      sessionstartyear,
      endyear,
      course,
    } = req.body;
    try {
      // ceck existing

      const createu = await studentm.create({
        name,
        mobile,
        email: emeail,
        stdid,
        department,
        university,
        school,
        sessionstartyear,
        endyear,
        course,
      });
      if (!createu) return responsecon.failedresponse(res, "failed");
      const mail = await helper.sendsinglemail(
        emeail,
        "User Registration To One Stop Solution",
        `Dear ${name} you have been registered for One stop solution kindly login into our application to acess your query portal.Your student id will be your login id. For more details please visit our website manav rachna`
      );
      return responsecon.successresponse(res, "Created successfully");
    } catch (err) {
      return responsecon.failedresponse(res, "Invsdhsd");
    }
  }
  async userloginotprequest(req, res) {
    const { stdid, deviceid, ltd, lgntd } = req.body;
    console.log(req.body);
    if (!deviceid || !ltd || !lgntd)
      return responsecon.failedresponse(res, "Device info got null");
    if (!stdid) return responsecon.failedresponse(res, "Invalid user details");
    try {
      const checkuser = await studentm.findOne({
        where: { stdid: stdid, isactive: true, deletedAt: null },
        attributes: ["mobile", "email", "sid"],
      });
      if (!checkuser)
        return responsecon.failedresponse(res, "Invalid user details");
      const otpsend = await helper.sendingotp(checkuser.sid, "login_to_app");
      if (!otpsend)
        return responsecon.failedresponse(
          res,
          "Failed to generate otp please try again"
        );
      const mail = await helper.sendsinglemail(
        checkuser.email,
        "Otp for login into One Stop Solution",
        `Your One Time Passwrd for login to one stop solutions is ${otpsend}.Request from IP ${req.ip}`
      );
      if (!mail)
        return responsecon.failedresponse(
          res,
          "Otp send ing failed please try again"
        );
      await useractvtym.create({
        userId: checkuser.sid,
        action: "user_login_otp_req",
        target: "user_login",
        ip: req.ip,
        deviceid: deviceid,
        long: lgntd,
        latd: ltd,
      });
      return responsecon.successresponse(res, "Otp sent to registrar mail id");
    } catch (err) {
      await systemlogm.create({
        userId: stdid,
        action: "user_login_otp_req",
        functionName: "userloginotprequest",
        error: err.message,
        params: req.body,
        ip: req.ip,
        userAgent: `${deviceid}-${ltd}-${lgntd}`,
      });
      return responsecon.failedresponse(res, "Server is busy pleas etry again");
    }
  }
  async userloginotpsubmit(req, res) {
    const { stdid, otp, deviceid, ltd, lgntd } = req.body;
    if (!stdid || !otp)
      return responsecon.failedresponse(res, "Invalid user details");
    try {
      const checkuser = await studentm.findOne({
        where: { stdid: stdid, isactive: true, deletedAt: null },
        attributes: ["id", "mobile", "email", "sid"],
      });
      if (!checkuser)
        return responsecon.failedresponse(res, "Invalid user details");
      // check otp
      const checkotp = helper.validateotp(checkuser.sid,'login_to_app',otp);
      if(!checkotp) return responsecon.failedresponse(res,"Invalid otp or otp expired please try again");
      // generate token jwt
      const stoken = await helper.sessiontoken();
      await checkuser.update(
        {
          sessiontoken: stoken,
          lastlogin: new Date(),
        },
        {
          where: { id: checkuser.id },
        }
      );
      // device id update 
      const secrectkey = process.env.JWTKEY;
      // Generate JWT token
      const token = jwt.sign(
        { id: checkuser.sid, aptoken: stoken },
        secrectkey,
        { expiresIn: "30d" }
      );
      const enctoken = await helper.balencrypt(token);
      await useractvtym.create({
        userId: checkuser.sid,
        action: "user_login_otp_submit",
        target: "user_login",
        ip: req.ip,
        deviceid: deviceid,
        long: lgntd,
        latd: ltd,
      });
      return responsecon.successresponsewithdata(
        res,
        "user login in successfully",
        enctoken
      );
    } catch (err) {
      console.log(err);
      await systemlogm.create({
        userId: stdid,
        action: "user_login_otp_submit",
        functionName: "userloginotpsubmit",
        error: err.message,
        params: req.body,
        ip: req.ip,
        userAgent: `${deviceid}-${ltd}-${lgntd}`,
      });
      return responsecon.failedresponse(res, "Server is busy pleas etry again");
    }
  }
  async profilefetch(req, res) {
    try {
      return responsecon.successresponsewithdata(
        res,
        "Profile fetched successfully",
        {
          department: req.user.department,
          university: req.user.university,
          school: req.user.school,
          sid: req.user.sid,
          stdid: req.user.stdid,
          mobile: req.user.mobile,
          email: req.user.email,
          name: req.user.name,
        }
      );
    } catch (err) {
        return responsecon.failedresponse(res,"Server is busy please try again")
    }
  }
}
module.exports = new Usercontroller();

const teacherm = require("../../models/teachers");
const responsecon = require("../../helper/response");
const helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");

class Usercontroller {
  async userauthtoken(req, res) {
    const { teacherid } = req.body;
    if (!teacherid) return responsecon.failedresponse(res, "Invalid teacherid");
    try {
      const checkuser = await teacherm.findOne({ tchid: teacherid }).select("_id sessiontoken deviceid tchid");
      if (!checkuser) return responsecon.failedresponse(res, "Invalid teacher");
      
      const tokenn = await helper.sessiontoken();
      console.log(tokenn);
      
      checkuser.sessiontoken = tokenn;
      await checkuser.save();
      
      const secrectkey = process.env.JWTKEY;
      const token = jwt.sign(
        { id: checkuser.tchid, aptoken: tokenn },
        secrectkey,
        { expiresIn: "10h" }
      );
      const enctoken = await helper.balencrypt(token);
      return responsecon.successresponsewithdata(res, "", enctoken);
    } catch (err) {
      console.log(err)
      return responsecon.servererrorresponse(res);
    }
  }
}
module.exports = new Usercontroller();

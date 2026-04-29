const teacherm = require("../../models/teachers");
const forwardingm = require("../../models/autoforwarding");
const responsecon = require("../../helper/response");
const teacheractiviym = require("../../models/teacheractivitylog");
const { postRequest } = require("../../network/networkapi");
const mongoose = require('mongoose');

class ForwardingController {

  async autoforwardingrulecreate(req, res) {
    const { tecid, catid, subcatid, deptid, auttid } = req.body;

    if(!req.user) return responsecon.failedresponse(res, "Invalid User");
    if (!tecid || !catid || !subcatid) {
      return responsecon.failedresponse(res, "Invalid parameters");
    }

    try {
      const teacherIds = [tecid];
      if (auttid) teacherIds.push(auttid);

      const teachersRes = await postRequest("/teacher/details", { teachers: teacherIds });

      if (!teachersRes?.data || !Array.isArray(teachersRes.data) || teachersRes.data.length === 0) {
        return responsecon.failedresponse(res, "Invalid teacher details");
      }

      const mainTeacher = teachersRes.data.find((t) => t.userid == tecid);
      const autoTeacher = auttid ? teachersRes.data.find((t) => t.userid == auttid) : null;

      if (!mainTeacher) {
        return responsecon.failedresponse(res, "Invalid teacher id (assignteacher)");
      }

      if (auttid && !autoTeacher) {
        return responsecon.failedresponse(res, "Invalid auto-forward teacher id");
      }

      const existingRule = await forwardingm.findOne({
        catid, subcatid, deptid: deptid || null, assignteacher: tecid, auforwardingt: auttid || null
      });

      if (existingRule) {
        return responsecon.failedresponse(res, "Rule already exists");
      }

      const newRule = await forwardingm.create({
        catid, subcatid, deptid: deptid || null, assignteacher: tecid, auforwardingt: auttid || null
      });

      await teacheractiviym.create({
        userId: req.user.userid,
        action: "create_auto_forwarding_rules",
        target: "autoforwarding",
        targetId: newRule._id.toString(),
        status: "success",
        message: `${req.user.name} created a new auto-forwarding rule (ID: ${newRule._id})`,
      });

      return responsecon.successresponsewithdata(res, "Teacher assigned successfully");
    } catch (err) {
      console.error("Error in autoforwardingrulecreate:", err);
      return responsecon.servererrorresponse(res, err.message);
    }
  }

  async updateAutoforwardingrule(req, res) {
    const { id, tecid, auttid } = req.body;

    if (!id) return responsecon.failedresponse(res, "Invalid rule id");

    try {
      const rule = await forwardingm.findById(id);

      if (!rule) {
        return responsecon.failedresponse(res, "Rule not found");
      }

      if (tecid) {
        const teacher = await teacherm.findOne({ tchid: tecid, isactive: true }).select("_id");

        if (!teacher) {
          return responsecon.failedresponse(res, "Invalid teacher id");
        }
        rule.assignteacher = tecid;
      }

      if (auttid) {
        rule.auforwardingt = auttid;
      }

      await rule.save();
      await teacheractiviym.create({
          userId: req.user.tcid,
          action: "update_auto_forwarding_rules",
          target: "autoforwarding",
          targetId: id,
          status: "success",
          message: `${req.user.name} has updated assign rule with rule id ${id}`,
      });

      return responsecon.successresponse(res, "Rule updated successfully");
    } catch (err) {
      console.error("Error in updateAutoforwardingrule:", err);
      return responsecon.servererrorresponse(res);
    }
  }

  async deleteAutoforwardingrule(req, res) {
    const { id } = req.body;

    if (!id) return responsecon.failedresponse(res, "Invalid rule id");

    try {
      const deleted = await forwardingm.findByIdAndDelete(id);

      if (!deleted) {
        return responsecon.failedresponse(res, "Rule not found or already deleted");
      }
      
      await teacheractiviym.create({
          userId: req.user.tcid,
          action: "delete_auto_forwarding_rules",
          target: "autoforwarding",
          targetId: id,
          status: "success",
          message: `${req.user.name} has deleted assign rule with rule id ${id}`,
      });
      return responsecon.successresponse(res, "Rule deleted successfully");
    } catch (err) {
      console.error("Error in deleteAutoforwardingrule:", err);
      return responsecon.servererrorresponse(res);
    }
  }

  async fetchassignrule(req, res) {
    try {
      const fetchules = await forwardingm.find();
      return responsecon.successresponsewithdata(res, "Rules fetch successfully", fetchules);
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }
}
module.exports = new ForwardingController();

const teacherm = require("../../models/teachers");
const forwardingm = require("../../models/autoforwarding");
const responsecon = require("../../helper/response");
const teacheractiviym = require("../../models/teacheractivitylog");
const {  postRequest } = require("../../network/networkapi");
const sequelize = require("../../config/database");
class ForwardingController {

  async autoforwardingrulecreate(req, res) {
    const { tecid, catid, subcatid, deptid, auttid } = req.body;
    if(!req.user)return responsecon.failedresponse(res, "Invalid User");
    // --- Basic validation ---
    if (!tecid || !catid || !subcatid) {
      return responsecon.failedresponse(res, "Invalid parameters");
    }

    const transaction = await sequelize.transaction();

    try {
      // --- Step 1: Validate teacher IDs ---
      const teacherIds = [tecid];
      if (auttid) teacherIds.push(auttid);

      const teachersRes = await postRequest("/teacher/details", {
        teachers: teacherIds,
      });

      // Validate microservice response
      if (
        !teachersRes?.data ||
        !Array.isArray(teachersRes.data) ||
        teachersRes.data.length === 0
      ) {
        await transaction.rollback();
        return responsecon.failedresponse(res, "Invalid teacher details");
      }

      // Find the main teacher and optional auto-forward teacher
      const mainTeacher = teachersRes.data.find((t) => t.userid == tecid);
      const autoTeacher = auttid
        ? teachersRes.data.find((t) => t.userid == auttid)
        : null;

      if (!mainTeacher) {
        await transaction.rollback();
        return responsecon.failedresponse(
          res,
          "Invalid teacher id (assignteacher)"
        );
      }

      if (auttid && !autoTeacher) {
        await transaction.rollback();
        return responsecon.failedresponse(
          res,
          "Invalid auto-forward teacher id"
        );
      }

      // --- Step 2: Check if rule already exists ---
      const existingRule = await forwardingm.findOne({
        where: {
          catid,
          subcatid,
          deptid: deptid || null,
          assignteacher: tecid,
          auforwardingt: auttid || null,
        },
        attributes: ["id"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existingRule) {
        await transaction.rollback();
        return responsecon.failedresponse(res, "Rule already exists");
      }
      // --- Step 3: Create new rule ---
      const newRule = await forwardingm.create(
        {
          catid,
          subcatid,
          deptid: deptid || null,
          assignteacher: tecid,
          auforwardingt: auttid || null,
        },
        { transaction }
      );
      // --- Step 4: Record teacher activity ---
      await teacheractiviym.create({
        userId: req.user.userid,
        action: "create_auto_forwarding_rules",
        target: "autoforwarding",
        targetId: newRule.id,
        status: "success",
        message: `${req.user.name} with empid ${req.user.employeeId} created a new auto-forwarding rule (ID: ${newRule.id})`,
      });
      await transaction.commit();
      return responsecon.successresponsewithdata(res, "Teacher assigned successfully");
    } catch (err) {
      await transaction.rollback();
      console.error("Error in autoforwardingrulecreate:", err);
      return responsecon.servererrorresponse(res, err.message);
    }
  }

  async updateAutoforwardingrule(req, res) {
    const { id, tecid, auttid } = req.body;

    if (!id) {
      return responsecon.failedresponse(res, "Invalid rule id");
    }

    const transaction = await sequelize.transaction();
    try {
      const rule = await forwardingm.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!rule) {
        await transaction.rollback();
        return responsecon.failedresponse(res, "Rule not found");
      }

      // Validate new teacher if provided
      if (tecid) {
        const teacher = await teacherm.findOne({
          where: { tchid: tecid, isactive: true },
          attributes: ["id"],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!teacher) {
          await transaction.rollback();
          return responsecon.failedresponse(res, "Invalid teacher id");
        }

        rule.assignteacher = tecid;
      }

      if (auttid) {
        rule.auforwardingt = auttid;
      }

      await rule.save({ transaction });
      await teacheractiviym.create(
        {
          userId: req.user.tcid,
          action: "update_auto_forwarding_rules",
          target: "autoforwarding",
          targetId: id,
          status: "success",
          message: `${req.user.name} has updated  assign rule with rule id ${id}`,
        },
        { transaction }
      );
      await transaction.commit();

      return responsecon.successresponse(res, "Rule updated successfully");
    } catch (err) {
      await transaction.rollback();
      console.error("Error in updateAutoforwardingrule:", err);
      return responsecon.servererrorresponse(res);
    }
  }
  async deleteAutoforwardingrule(req, res) {
    const { id } = req.body;

    if (!id) {
      return responsecon.failedresponse(res, "Invalid rule id");
    }

    const transaction = await sequelize.transaction();
    try {
      const deleted = await forwardingm.update(
        { deletedAt: new Date() },
        {
          where: { id },
          transaction,
        }
      );

      if (!deleted) {
        await transaction.rollback();
        return responsecon.failedresponse(
          res,
          "Rule not found or already deleted"
        );
      }
      await teacheractiviym.create(
        {
          userId: req.user.tcid,
          action: "delete_auto_forwarding_rules",
          target: "autoforwarding",
          targetId: id,
          status: "success",
          message: `${req.user.name} has deleted  assign rule with rule id ${id}`,
        },
        { transaction }
      );
      await transaction.commit();
      return responsecon.successresponse(res, "Rule deleted successfully");
    } catch (err) {
      await transaction.rollback();
      console.error("Error in deleteAutoforwardingrule:", err);
      return responsecon.servererrorresponse(res);
    }
  }
  async fetchassignrule(req, res) {
    try {
      const fetchules = await forwardingm.findAll({
        where: { deletedAt: null },
      });
      return responsecon.successresponsewithdata(
        res,
        "Rules fetch successfully",
        fetchules
      );
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }
}
module.exports = new ForwardingController();

const teacherm = require("../../models/teachers");
const forwardingm = require("../../models/autoforwarding");
const responsecon = require("../../helper/response");
const teacheractiviym = require("../../models/teacheractivitylog");
const rolem = require('../../models/role')
class ForwardingController {
  async autoforwardingrulecreate(req, res) {
    const { tecid, catid, subcatid, deptid, auttid } = req.body;
    if (!tecid || !catid || !subcatid) {
      return responsecon.failedresponse(res, "Invalid parameter");
    }
    const transaction = await sequelize.transaction();
    try {
      // Validate teacher
      const teacher = await teacherm.findOne({
        where: { tchid: tecid, isactive: true },
        attributes: ["id", "tname"],
        transaction,
        lock: transaction.LOCK.UPDATE, // prevent race condition
      });

      if (!teacher) {
        await transaction.rollback();
        return responsecon.failedresponse(res, "Invalid teacher id");
      }

      // Check if rule already exists (strict match)
      const existing = await forwardingm.findOne({
        where: {
          catid,
          subcatid,
          assignteacher: tecid,
          deptid: deptid || null,
          auforwardingt: auttid || null,
        },
        attributes: ["id"],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existing) {
        await transaction.rollback();
        return responsecon.failedresponse(res, "Rule already exists");
      }

      // Insert new rule
      const createf = await forwardingm.create(
        {
          catid,
          subcatid,
          deptid: deptid || null,
          assignteacher: tecid,
          auforwardingt: auttid || null,
        },
        { transaction }
      );
      await teacheractiviym.create({
        userId: tecid,
        action: "create_auto_forwarding_rules",
        target: "autoforwarding",
        targetId: createf.id,
        status: "success",
        message: `${teacher.name} has create new assign rule with rule id ${createf.id}`,
      });
      await transaction.commit();
      return responsecon.successresponse(res, "Teacher assigned successfully");
    } catch (err) {
      await transaction.rollback();
      console.error("Error in autoforwardingrule:", err);
      return responsecon.servererrorresponse(res);
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
      return responsecon.successresponsewithdata(res,"Rules fetch successfully",fetchules)
    } catch (err) {
         return responsecon.servererrorresponse(res)
    }
  }
}
module.exports = new ForwardingController();

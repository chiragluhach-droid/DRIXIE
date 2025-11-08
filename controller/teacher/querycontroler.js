const querymodel = require("../../models/querydetail");
const responsecon = require("../../helper/response");
const helper = require("../../helper/helper");
const catagorym = require("../../models/category");
const subcatagorym = require("../../models/subcategory");
const teacherm = require("../../models/teachers");
const systemlogm = require("../../models/systemlogs");
const commentm = require("../../models/comment");
const autoforwardingm = require("../../models/autoforwarding");
const forwardm = require("../../models/forwardhis");
const attachmentm = require("../../models/attachment");
const jwt = require('jsonwebtoken')
class Querycontroller {

  async userquerycreatefinal(req, res) {
    const { descrip, catagoryid, subcaragoryid, attachmntid } = req.body;

    if (!descrip || !catagoryid) {
      return responsecon.failedresponse(res, "Invalid parameters");
    }

    const t = await sequelize.transaction();
    const afterCommitTasks = []; // 👈 collect background tasks here

    try {
      let datat = {
        description: descrip,
        createdby: req.user.sid,
        catagoryid: catagoryid,
        queryno:helper.compunumber(req.user.stdid,req.user,school)
      };

      // ✅ Subcategory validation
      if (subcaragoryid) {
        datat.subcaragoryid = subcaragoryid;
        const subcatagoryde = await subcatagorym.findOne({
          where: { id: subcaragoryid },
          attributes: ["name"],
        });
        if (!subcatagoryde) {
          await t.rollback();
          return responsecon.failedresponse(res, "Invalid subcategory");
        }
      }

      // ✅ Category validation
      const catagorycheck = await catagorym.findOne({
        where: { id: catagoryid },
        attributes: ["name"],
      });
      if (!catagorycheck) {
        await t.rollback();
        return responsecon.failedresponse(res, "Invalid category details");
      }

      // ✅ Check auto forwarding rules
      let checkr = null;
      if (catagorycheck.name === "Academic") {
        checkr = await autoforwardingm.findOne({
          where: {
            catid: catagoryid,
            subcatid: subcaragoryid,
            deptid: req.user.department,
            isdeleted: false,
          },
        });
      } else {
        checkr = await autoforwardingm.findOne({
          where: {
            catid: catagoryid,
            subcatid: subcaragoryid,
            isdeleted: false,
          },
        });
      }

      if (!checkr) {
        await t.rollback();
        return responsecon.failedresponse(
          res,
          "No one is assigned for this category"
        );
      }

      // ✅ Assign teacher
      const assignid = checkr.assignteacher || checkr.auforwardingt;
      if (!assignid) {
        await t.rollback();
        return responsecon.failedresponse(
          res,
          "No valid forwarding user found"
        );
      }
      datat.assignteacher = assignid;

      // ✅ Create query
      const querycreate = await querymodel.create(datat, { transaction: t });
      if (!querycreate) {
        await t.rollback();
        return responsecon.failedresponse(
          res,
          "Query creation failed, please try again"
        );
      }

      // ✅ Forwarding history

      await forwardm.create(
        {
          queryid: querycreate.queryid,
          frtid: checkr.auforwardingt || assignid,
          tid: assignid,
          notes: "Auto forwarded query",
        },
        { transaction: t }
      );

      // ✅ Handle attachment
      if (attachmntid) {
        await chkat.update(
          { refno: querycreate.queryid },
          {
            where: {
              id: attachmntid,
              uploadedBy: req.user.sid,
            },
            transaction: t,
          }
        );
      }

      // ✅ Teacher mails
      const techm = await teacherm.findAll({
        where: {
          tchid: [checkr.auforwardingt, assignid],
        },
        attributes: ["tchmail"],
        transaction: t,
      });

      if (techm && techm.length > 0) {
        for (const tch of techm) {
          if (tch.tchmail) {
            afterCommitTasks.push(
              helper.sendsinglemail(
                tch.tchmail,
                "New Query Assigned",
                `A query with ref no ${querycreate.queryid} has been assigned to you.`
              )
            );
          }
        }
      }

      // ✅ Student mail
      afterCommitTasks.push(
        helper.sendsinglemail(
          req.user.email,
          "Query created successfully",
          `Your query regarding the category has been registered with ref no ${querycreate.queryid}.`
        )
      );

      // ✅ Commit first
      await t.commit();

      // ✅ Respond immediately
      

      // ✅ Run mails in background
      Promise.allSettled(afterCommitTasks).catch((err) => {
        console.error("Mail sending error:", err);
      });
      return responsecon.successresponse(res, "Query created successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      return responsecon.failedresponse(
        res,
        "Please try again, server is busy"
      );
    }
  }

  // fetch query list
  async fetchallquery(req, res) {
    try {
      const allquery = await querymodel.findAll({
        where: { assignteacher: req.user.sid, isdeleted: false, deletedAt: null },
        attributes: [
          "queryid",
          "status",
          "assignnow",
          "catagoryid",
          "subcaragoryid",
        ],
        include: {
          model: catagorym,
          as: "cataginfo",
          attributes: ["title"],
          include: {
            model: subcatagorym,
            as: "subcatinfo",
            attributes: ["title"],
          },
        },
      });
      return responsecon.successresponsewithdata(
        res,
        "Data fetched successfully",
        allquery
      );
    } catch (err) {
      return responsecon.failedresponse(res, "Server is busy please try later");
    }
  }
  // fetch particular query
  async fetchparticularquerycomments(req, res) {
    const { queryid } = req.body;
    if (!queryid)
      return responsecon.failedresponse(res, "Invalid query deails");
    try {
      const fetchquery = await querymodel.findOne({
        where: { queryid: queryid },
        attributes: ["assignnow", "status", "catagoryid", "subcaragoryid"],
      });
      if (!fetchquery)
        return responsecon.failedresponse(res, "Invalid query id");
      // fetch for comments
      const comm = await commentm.findAll({
        where: { queryid: queryid, deletedAt: null },
        attributes: ["message", "createdBy"],
      });
      return responsecon.successresponsewithdata(res, "comment fetched ", comm);
    } catch (err) {
      return responsecon.servererrorresponse(res)
    }
  }
  // fetch comments on that query
  /// fetch msgs on that query
  // send msgs on that query
  // upload attachments
  async uploadattachments(req, res) {
    try {
      const file = req.file;
      const up = await attachmentm.create({
        filename: file.filename,
        url: req.file.path,
        isTeacher: true,
        uploadedBy: req.user.tchid,
        filetype: file.mimetype,
      });
      if (!up)
        return responsecon.failedresponse(res, "Attachment added failed");
      return responsecon.successresponse(res, "Attachment added successfully");
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }
  async fetchattachments(req, res) {
    try {
      const {atid,queryid}=req.body;

      const up = await attachmentm.findOne({
        where:{
          id:atid,
          refno:queryid,
          isDeleted:false
          },
        attributes:['filename','url','isTeacher','filetype']
      });
      if (!up)  return responsecon.failedresponse(res, "Attachment not found");
      const token = jwt.sign(
        {
          fileid: queryid,
          attachmentId: atid,
          exp: Math.floor(Date.now() / 1000) + 10 * 60, // expires in 5 minutes
        },
        process.env.ATTACHMENT_SECRET
      );

      const dataa = {
        previewUrl: `${process.env.PREVIEW_URL}/api/v1/preview/${token}`,
        type: checkattchment.originalName,
        name:checkattchment.filename
      };
      return responsecon.successresponsewithdata(res, "Attachment fetch successfully",dataa);
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }
  async view_url(req, res) {
    const { token } = req.params;
    if (!token) return responsecon.failedres(res, "No attachments found");
    try {
      const payload = jwt.verify(token, process.env.ATTACHMENT_SECRET);
      const { queryid, attachmentId } = payload;
      // Check in DB
      const file = await attachmentm.findOne({
        where: {
          id: attachmentId,
          refno:queryid,
          isDeleted:false
        },
        attributes: ['filename','url','isTeacher','filetype'],
      });

      if (!file) {
        return res
          .status(404)
          .json({ success: false, message: "Attachment not found" });
      }

      // Resolve path to the file on disk
      const filePath = path.join(__dirname, "../../uploads", file.filename);
      console.log("hvghghggh",filePath)
      if (!fs.existsSync(filePath)) {
        return res
          .status(404)
          .json({ success: false, message: "File not found on server uyu" });
      }

      // Dynamically detect content type using file extension
      const contentType = file.filetype || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.filename}"`
      );
      res.setHeader("X-Content-Type-Options", "nosniff"); // minor security layer

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (err) {
      console.log(err);
      return responsecon.servererrorresponse(res);
    }
  }
  // fetch track histry
  async forwardinghistry(req,res){
    const {quid}=req.body
    if(!quid) return responsecon.failedresponse(res,"Qury id is invalid")
    try{
        const queryfetc = await querymodel.findOne({
            where:{queryno:quid,createdby:req.user.sid},
            attributes:['queryid']
        });
        if(!queryfetc) return responsecon.failedresponse(res,"Query doe snot found");
        const his = await forwardm.findAll({
            where:{queryid:queryfetc.queryid,},
            attributes:['frtid','tid','status','message'],
            include:[
                {
                    model:teacherm,
                    as:'forwardteacherd',
                    attributes:['tchnam','tchrole']
                },
                {
                    model:teacherm,
                    as:'recieverteacherd',
                    attributes:['tchnam','tchrole']
                }
            ]
        });
        return responsecon.successresponsewithdata(res,"Tracking histry fetch successfully",his)
    }catch(err){
        return responsecon.servererrorresponse(res)
    }
  }
  // fetch assign query
  async fetchassignquery(req,res){
    
  }
}
const generateassign = async (catid, subid, stdid) => {
  // fr teacher
};
module.exports = new Querycontroller();

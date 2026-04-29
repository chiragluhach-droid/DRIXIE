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
const jwt = require("jsonwebtoken");
const { postRequest } = require("../../network/networkapi");
const mongoose = require('mongoose');

class Querycontroller {
  async userquerycreatefinal(req, res) {
    const { descrip, catagoryid, subcaragoryid, attachmntid } = req.body;

    if (!descrip || !catagoryid) {
      return responsecon.failedresponse(res, "Invalid parameters");
    }

    const afterCommitTasks = []; 

    try {
      let datat = {
        description: descrip,
        createdby: req.user.sid,
        catagoryid: catagoryid,
        queryno: helper.compunumber(req.user.stdid, req.user.school),
      };

      const catagorycheck = await catagorym.findById(catagoryid);
      if (!catagorycheck) {
        return responsecon.failedresponse(res, "Invalid category details");
      }

      let checkr = null;
      if (catagorycheck.title === "Academic Related Issues") {
        checkr = await autoforwardingm.findOne({
          catid: catagoryid,
          subcatid: subcaragoryid,
          deptid: req.user.department,
        });
      } else {
        checkr = await autoforwardingm.findOne({
          catid: catagoryid,
        });
      }

      if (!checkr) {
        return responsecon.failedresponse(res, "No one is assigned for this category");
      }

      const assignid = checkr.assignteacher || checkr.auforwardingt;
      if (!assignid) {
        return responsecon.failedresponse(res, "No valid forwarding user found");
      }
      datat.assignnow = assignid;

      const querycreate = await querymodel.create(datat);

      await forwardm.create({
        queryid: querycreate.queryid,
        frtid: checkr.auforwardingt || assignid,
        tid: assignid,
        notes: "Auto forwarded query",
      });

      if (attachmntid) {
        await attachmentm.updateOne(
          { _id: attachmntid, uploadedBy: req.user.sid },
          { $set: { refno: querycreate.queryid } }
        );
      }

      const techm = await teacherm.find({
        tchid: { $in: [checkr.auforwardingt, assignid].filter(Boolean) },
      }).select("tchmail");

      const teacherMsg = `
        <h3 style="color: #b71c1c; margin-top: 0;">A new request has been assigned to you.</h3>
        <p>A student has raised a new query that has been automatically routed to your department.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #ddd;">
          <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 130px;"><strong>Request ID:</strong></td><td style="padding: 10px; border: 1px solid #ddd;"><strong>${datat.queryno}</strong></td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Student:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${req.user.name || 'Student'} (${req.user.stdid})</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Category:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${catagorycheck.title}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Description:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${descrip}</td></tr>
        </table>
        <br/>
        <a href="https://drixie-backend.onrender.com/api/v1/query/approve/${querycreate.queryid}/hod/token" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Approve & Forward to HOD</a>
        <a href="http://127.0.0.1:3000" style="display: inline-block; padding: 12px 24px; background-color: #b71c1c; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Ticket Details</a>
      `;

      if (techm && techm.length > 0) {
        for (const tch of techm) {
          if (tch.tchmail) {
            afterCommitTasks.push(
              helper.sendsinglemail(tch.tchmail, `New Request Assigned: ${datat.queryno}`, teacherMsg)
            );
          }
        }
      }

      const studentMsg = `
        <h3 style="color: #1a73e8; margin-top: 0;">Your request has been successfully registered.</h3>
        <p>Dear ${req.user.name || 'Student'},</p>
        <p>Your request has been recorded and automatically routed to the appropriate faculty member. We will notify you once there is an update.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #ddd;">
          <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 130px;"><strong>Request ID:</strong></td><td style="padding: 10px; border: 1px solid #ddd;"><strong>${datat.queryno}</strong></td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Category:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${catagorycheck.title}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Description:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${descrip}</td></tr>
        </table>
        <br/>
        <a href="almamateapp://track_req" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Request Status</a>
      `;

      afterCommitTasks.push(
        helper.sendsinglemail(req.user.email, `Request Registered: ${datat.queryno}`, studentMsg)
      );

      Promise.allSettled(afterCommitTasks).catch(console.error);
      return responsecon.successresponse(res, "Query created successfully");
    } catch (err) {
      console.error(err);
      return responsecon.failedresponse(res, "Please try again, server is busy");
    }
  }

  async fetchallquery(req, res) {
    try {
      const { page = 1, limit = 10, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const where = { createdby: req.user.sid };
      if (startDate && endDate) {
        where.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const allquery = await querymodel.find(where)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(parseInt(limit))
        .populate('catagoryid')
        .populate('subcaragoryid');

      const count = await querymodel.countDocuments(where);
      const totalPages = Math.ceil(count / limit);

      return responsecon.successresponsewithdata(res, "Data fetched successfully", {
        totalRecords: count, totalPages, currentPage: parseInt(page), pageSize: parseInt(limit), data: allquery
      });
    } catch (err) {
      console.error(err);
      return responsecon.failedresponse(res, "Server is busy");
    }
  }

  async fetchparticularquerycomments(req, res) {
    const { queryid } = req.body;
    if (!queryid) return responsecon.failedresponse(res, "Invalid query deails");
    try {
      const fetchquery = await querymodel.findOne({ queryid: queryid, createdby: req.user.sid });
      if (!fetchquery) return responsecon.failedresponse(res, "Invalid query id");
      
      const comm = await commentm.find({ queryid: queryid }).select("message createdBy");
      return responsecon.successresponsewithdata(res, "comment fetched", comm);
    } catch (err) {
      console.error(err);
    }
  }

  async uploadattachmentsn(req, res) {
    try {
      const file = req.file;
      const up = await attachmentm.create({
        filename: file.filename,
        url: file.id.toString(),
        isTeacher: false,
        uploadedBy: req.user.sid,
        filetype: file.mimetype,
      });
      return responsecon.successresponse(res, "Attachment added successfully");
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }

  async uploadattachments(req, res) {
    const { queryid } = req.body;
    if (!queryid) return responsecon.failedresponse(res, 'Please pass he query id');
    
    try {
      const document = await querymodel.findOne({ queryid: queryid });
      if (!document) return responsecon.failedresponse(res, 'Invalid query Id');
      if (!req.file) return responsecon.failedresponse(res, 'No file uploaded');

      const attachments = await attachmentm.create({
        filename: req.file.filename,
        refno: queryid,
        url: req.file.id.toString(),
        isTeacher: false,
        uploadedBy: req.user.sid,
        filetype: req.file.mimetype,
        bucket: "uploads",
        originalname: req.file.originalname,
        size: req.file.size
      });

      return responsecon.successresponsewithdata(res, 'Attachments added successfully', {
        id: attachments._id,
        size: req.file.size,
        type: req.file.mimetype,
      });
    } catch (err) {
      console.log(err);
      return responsecon.servererrorresponse(res, err.message);
    }
  }

  async fetchattachments(req, res) {
    try {
      const { atid, queryid } = req.body;
      const up = await attachmentm.findOne({ _id: atid, refno: queryid, isDeleted: false });
      if (!up) return responsecon.failedresponse(res, "Attachment not found");

      const dataa = {
        previewUrl: `http://127.0.0.1:3000/api/v1/preview/${up._id}`,
        name: up.filename,
      };
      return responsecon.successresponsewithdata(res, "Attachment fetch successfully", dataa);
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }

  async view_url(req, res) {
    const { token } = req.params;
    try {
      const file = await attachmentm.findById(token);
      if (!file) return res.status(404).json({ success: false, message: "Attachment not found" });

      const conn = mongoose.connection;
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
      
      res.setHeader("Content-Type", file.filetype || "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
      
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(file.url));
      downloadStream.pipe(res);
    } catch (err) {
      console.log(err);
      return responsecon.servererrorresponse(res);
    }
  }

  async trackqueryhis(req, res) {
    const { quid } = req.body;
    if (!quid) return responsecon.failedresponse(res, "Qury id is invalid");
    try {
      const queryfetc = await querymodel.findOne({ queryid: quid, createdby: req.user.sid });
      if (!queryfetc) return responsecon.failedresponse(res, "Query doe snot found");
      
      const his = await forwardm.find({ queryid: queryfetc.queryid }).select("frtid tid status");
      
      const teachersid = [...new Set(his.flatMap(item => [item.frtid, item.tid]).filter(Boolean))];
      const teachers = await teacherm.find({ tchid: { $in: teachersid } }).select("tchnam tchid");
      
      return responsecon.successresponsewithdata(res, "Tracking histry fetch successfully", { records: his, teachers });
    } catch (err) {
      console.log(err);
      return responsecon.servererrorresponse(res);
    }
  }

  async approveQueryStage(req, res) {
    const { queryid, nextstage, token } = req.params;
    try {
      const query = await querymodel.findOne({ queryid: queryid });
      if (!query) return res.status(404).send("Query not found");
      
      let nextStatus = '';
      let nextTeacherRole = '';
      let teacherLabel = '';

      if (nextstage === 'hod') {
        nextStatus = 'pending_hod';
        nextTeacherRole = 'hod';
        teacherLabel = 'HOD';
      } else if (nextstage === 'dean') {
        nextStatus = 'pending_dean';
        nextTeacherRole = 'dean';
        teacherLabel = 'Dean';
      } else if (nextstage === 'resolved') {
        nextStatus = 'resolved';
      } else {
        return res.status(400).send("Invalid stage");
      }

      query.status = nextStatus;
      await query.save();

      let actor = 'Teacher';
      if (nextstage === 'dean') actor = 'HOD';
      if (nextstage === 'resolved') actor = 'Dean';
      
      await forwardm.create({
        queryid: query.queryid,
        frtid: actor,
        tid: nextTeacherRole || 'Student',
        notes: `Approved by ${actor}, forwarded to ${nextTeacherRole || 'Student'}`,
        status: nextStatus
      });

      if (nextstage === 'resolved') {
        const studentm = require("../../models/studentuser");
        const student = await studentm.findOne({ sid: query.createdby });
        if (student) {
          const studentMsg = `
            <h3 style="color: #2e7d32; margin-top: 0;">Issue Resolved!</h3>
            <p>Your request (ID: ${query.queryno}) has been fully approved by the Dean and marked as resolved.</p>
          `;
          helper.sendsinglemail(student.email, `Request Resolved: ${query.queryno}`, studentMsg);
        }
        return res.send("<h1 style='color: #2e7d32; text-align: center; margin-top: 50px;'>Successfully Approved & Resolved!</h1>");
      }

      const nextTeacher = await teacherm.findOne({ tchrole: nextTeacherRole });
      if (nextTeacher) {
        let actionBtn = '';
        if (nextstage === 'hod') {
          actionBtn = `<a href="https://drixie-backend.onrender.com/api/v1/query/approve/${query.queryid}/dean/token" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Approve & Forward to Dean</a>`;
        } else if (nextstage === 'dean') {
          actionBtn = `<a href="https://drixie-backend.onrender.com/api/v1/query/approve/${query.queryid}/resolved/token" style="display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Approve (Resolve Issue)</a>`;
        }

        const msg = `
          <h3 style="color: #b71c1c; margin-top: 0;">Request Escalated for Your Approval</h3>
          <p>A request (ID: ${query.queryno}) has been approved by the previous stage and requires your authorization.</p>
          <br/>
          ${actionBtn}
        `;
        helper.sendsinglemail(nextTeacher.tchmail, `Action Required: Request ${query.queryno}`, msg);
      }

      return res.send(`<h1 style='color: #2e7d32; text-align: center; margin-top: 50px;'>Successfully Approved & Forwarded to ${teacherLabel}!</h1>`);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server Error");
    }
  }
}
module.exports = new Querycontroller();

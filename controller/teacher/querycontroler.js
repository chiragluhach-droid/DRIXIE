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
const jwt = require('jsonwebtoken');
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
        queryno: helper.compunumber(req.user.stdid, req.user.school)
      };

      if (subcaragoryid) {
        datat.subcaragoryid = subcaragoryid;
        const subcatagoryde = await subcatagorym.findById(subcaragoryid).select("title");
        if (!subcatagoryde) {
          return responsecon.failedresponse(res, "Invalid subcategory");
        }
      }

      const catagorycheck = await catagorym.findById(catagoryid).select("title");
      if (!catagorycheck) {
        return responsecon.failedresponse(res, "Invalid category details");
      }

      let checkr = null;
      if (catagorycheck.title === "Academic") {
        checkr = await autoforwardingm.findOne({
          catid: catagoryid,
          subcatid: subcaragoryid,
          deptid: req.user.department,
          isdeleted: false,
        });
      } else {
        checkr = await autoforwardingm.findOne({
          catid: catagoryid,
          subcatid: subcaragoryid,
          isdeleted: false,
        });
      }

      if (!checkr) {
        return responsecon.failedresponse(res, "No one is assigned for this category");
      }

      const assignid = checkr.assignteacher || checkr.auforwardingt;
      if (!assignid) {
        return responsecon.failedresponse(res, "No valid forwarding user found");
      }
      datat.assignteacher = assignid;

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

      const techm = await teacherm.find({ tchid: { $in: [checkr.auforwardingt, assignid].filter(Boolean) } }).select("tchmail");

      if (techm && techm.length > 0) {
        for (const tch of techm) {
          if (tch.tchmail) {
            afterCommitTasks.push(
              helper.sendsinglemail(tch.tchmail, "New Query Assigned", `A query with ref no ${querycreate.queryid} has been assigned to you.`)
            );
          }
        }
      }

      afterCommitTasks.push(
        helper.sendsinglemail(req.user.email, "Query created successfully", `Your query regarding the category has been registered with ref no ${querycreate.queryid}.`)
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
      const allquery = await querymodel.find({ assignteacher: req.user.sid, isdeleted: false })
        .select("queryid status assignnow catagoryid subcaragoryid")
        .populate("catagoryid")
        .populate("subcaragoryid");
      return responsecon.successresponsewithdata(res, "Data fetched successfully", allquery);
    } catch (err) {
      return responsecon.failedresponse(res, "Server is busy please try later");
    }
  }

  async fetchparticularquerycomments(req, res) {
    const { queryid } = req.body;
    if (!queryid) return responsecon.failedresponse(res, "Invalid query deails");
    try {
      const fetchquery = await querymodel.findOne({ queryid: queryid }).select("assignnow status catagoryid subcaragoryid");
      if (!fetchquery) return responsecon.failedresponse(res, "Invalid query id");
      
      const comm = await commentm.find({ queryid: queryid }).select("message createdBy");
      return responsecon.successresponsewithdata(res, "comment fetched", comm);
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }

  async uploadattachments(req, res) {
    try {
      const file = req.file;
      const up = await attachmentm.create({
        filename: file.filename,
        url: file.id.toString(),
        isTeacher: true,
        uploadedBy: req.user.tchid,
        filetype: file.mimetype,
      });
      return responsecon.successresponse(res, "Attachment added successfully");
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }

  async fetchattachments(req, res) {
    try {
      const {atid,queryid}=req.body;
      const up = await attachmentm.findOne({ _id: atid, refno: queryid, isDeleted: false });
      if (!up) return responsecon.failedresponse(res, "Attachment not found");
      
      const dataa = {
        previewUrl: `http://127.0.0.1:3000/api/v1/preview/${up._id}`,
        name: up.filename
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

  async forwardinghistry(req,res){
    const {quid}=req.body
    if(!quid) return responsecon.failedresponse(res,"Qury id is invalid")
    try{
        const queryfetc = await querymodel.findOne({ queryno: quid, createdby: req.user.sid }).select('queryid');
        if(!queryfetc) return responsecon.failedresponse(res,"Query doe snot found");
        
        const his = await forwardm.find({ queryid: queryfetc.queryid })
          .select('frtid tid status message');
        
        return responsecon.successresponsewithdata(res,"Tracking histry fetch successfully",his)
    }catch(err){
        return responsecon.servererrorresponse(res)
    }
  }
  
  async fetchassignquery(req,res){
    
  }
}
module.exports = new Querycontroller();

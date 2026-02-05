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
const sequelize = require("../../config/database");
const { postRequest } = require("../../network/networkapi");
const {Op} = require('sequelize')
const otpg = require('otp-generator')
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const s3 = require('../../config/s3client');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
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
        queryno: helper.compunumber(req.user.stdid, req.user.school),
      };

      // ✅ Subcategory validation
      // if (subcaragoryid) {
      //   datat.subcaragoryid = subcaragoryid;
      //   const subcatagoryde = await subcatagorym.findOne({
      //     where: { id: subcaragoryid },
      //     attributes: ["title"],
      //   });
      //   if (!subcatagoryde) {
      //     await t.rollback();
      //     return responsecon.failedresponse(res, "Invalid subcategory");
      //   }
      // }

      // ✅ Category validation
      const catagorycheck = await catagorym.findOne({
        where: { id: catagoryid },
        attributes: ["title"],
      });
      if (!catagorycheck) {
        await t.rollback();
        return responsecon.failedresponse(res, "Invalid category details");
      }

      // ✅ Check auto forwarding rules
      let checkr = null;
      if (catagorycheck.name === "Academic Related Issues") {
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
            // subcatid: subcaragoryid,
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
      datat.assignnow = assignid;

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
          `Your query regarding the category has been registered with ref no ${datat.queryno} and estimated resolution time is ${datat.queryno}h.`
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
      const { page = 1, limit = 10, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const where = {
        createdby: req.user.sid,
        isdeleted: false,
        deletedAt: null,
      };

      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const { count, rows: allquery } = await querymodel.findAndCountAll({
        where,
        attributes: [
          "queryno",
          "queryid",
          "status",
          "assignnow",
          "catagoryid",
          "subcaragoryid",
          "createdAt",
        ],
        include: [
          {
            model: catagorym,
            as: "querycatagory",
            attributes: ["title"],
          },
          {
            model: subcatagorym,
            as: "querysubcatagory",
            attributes: ["title"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset,
        distinct: true,
        subQuery: false,
      });

      // --- 🧠 Step 1: Extract unique teacher IDs
      const teacherIds = [
        ...new Set(allquery.map((q) => q.assignnow).filter(Boolean)),
      ];

      let teacherMap = {};
      if (teacherIds.length > 0) {
        // --- 🧠 Step 2: Batch microservice call
        const teacherRes = await postRequest("/teacher/details", {
          teachers: teacherIds,
        });

        if (teacherRes?.data?.length) {
          // --- 🧠 Step 3: Create lookup map
          teacherMap = Object.fromEntries(
            teacherRes.data.map((t) => [t.userid, t])
          );
        }
      }

      // --- 🧠 Step 4: Merge teacher data
      const enrichedQueries = allquery.map((q) => ({
        ...q.toJSON(),
        assignTeacher: teacherMap[q.assignnow] || null,
      }));

      const totalPages = Math.ceil(count / limit);

      return responsecon.successresponsewithdata(
        res,
        "Data fetched successfully",
        {
          totalRecords: count,
          totalPages,
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          data: enrichedQueries,
        }
      );
    } catch (err) {
      console.error("Error in fetchallquery:", err);
      return responsecon.failedresponse(
        res,
        "Server is busy, please try later"
      );
    }
  }
  // fetch particular query
  async fetchparticularquerycomments(req, res) {
    const { queryid } = req.body;
    if (!queryid)
      return responsecon.failedresponse(res, "Invalid query deails");
    try {
      const fetchquery = await querymodel.findOne({
        where: { queryid: queryid, createdby: req.user.sid },
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
    } catch (err) {}
  }
  // fetch comments on that query
  /// fetch msgs on that query
  // send msgs on that query
  // upload attachments
  async uploadattachmentsn(req, res) {
    try {
      const file = req.file;

      const up = await attachmentm.create({
        filename: file.filename,
        url: req.file.path,
        isTeacher: false,
        uploadedBy: req.user.sid,
        filetype: file.mimetype,
      });
      if (!up)
        return responsecon.failedresponse(res, "Attachment added failed");
      return responsecon.successresponse(res, "Attachment added successfully");
    } catch (err) {
      return responsecon.servererrorresponse(res);
    }
  }
  async uploadattachments(req, res) {
    const { queryid } = req.body;

    if (!queryid) {
      return responsecon.failedresponse(res, 'Please pass he query id');
    }

    try {
      const document = await querymodel.findOne({
        where: {
          queryid: queryid,
          // assignedToId: req.user.userid,
          // deletedAt: null,
        },
      });

      if (!document) {
        return responsecon.failedresponse(res, 'Invalid query Id');
      }

      if (!req.file) {
        return responsecon.failedresponse(res, 'No file uploaded');
      }

      /* ===== filename ===== */
      const ext = path.extname(req.file.originalname);
      

      const otp = otpg.generate(4, { digits: true });
      const uniq = crypto.randomBytes(4).toString('hex');

      const s3Key = `attachments/${document.queryno}_${otp}_${uniq}${ext}`;

      /* ===== upload ===== */
      const result = await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      console.log('newresult', result);
      const attachments = await attachmentm.create({
        filename: s3Key,
        refno:queryid,
        url : result?.ChecksumCRC32 || '',
        isTeacher: false,
        uploadedBy: req.user.sid,
        filetype: req.file.mimetype,
        bucket: process.env.AWS_BUCKET_NAME,
        originalName: req.file.originalname,
        size: req.file.size,
        etag: result.ETag?.replace(/"/g, ''),
      });
      

      return responsecon.successresponsewithdata(res, 'Attachments added successfully', {
        id: attachments.id,
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

      const up = await attachmentm.findOne({
        where: {
          id: atid,
          refno: queryid,
          isDeleted: false,
        },
        attributes: ["isTeacher", "filetype","bucket","filename"],
      });
      if (!up) return responsecon.failedresponse(res, "Attachment not found");
       const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: up.bucket,
          Key: up.filename,
        }),
        { expiresIn: 15 * 60 } // 15 minutes
      );
     
      const dataa = {
        previewUrl: signedUrl,
        name: checkattchment.filename,
      };
      return responsecon.successresponsewithdata(
        res,
        "Attachment fetch successfully",
        dataa
      );
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
          refno: queryid,
          isDeleted: false,
        },
        attributes: ["filename", "url", "isTeacher", "filetype"],
      });

      if (!file) {
        return res
          .status(404)
          .json({ success: false, message: "Attachment not found" });
      }

      // Resolve path to the file on disk
      const filePath = path.join(__dirname, "../../uploads", file.filename);
      console.log("hvghghggh", filePath);
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
  async trackqueryhis(req, res) {
    const { quid } = req.body;
    if (!quid) return responsecon.failedresponse(res, "Qury id is invalid");
    try {
      const queryfetc = await querymodel.findOne({
        where: { queryid: quid, createdby: req.user.sid },
        attributes: ["queryid"],
      });
      if (!queryfetc) return responsecon.failedresponse(res, "Query doe snot found");
      const his = await forwardm.findAll({
        where: { queryid: queryfetc.queryid },
        attributes: ["frtid", "tid", "status"],
      });
      const teachersid = [
  ...new Set(
    his
      .flatMap(item => [item.frtid, item.tid])
      .filter(Boolean)
  )
];

console.log(teachersid)
      const teachers = await teacherm.findAll({
        where: {
    tchid: {
      [Op.in]: teachersid, // array of tchid values
    },
  },

  attributes: ["tchnam","tchid"],
});
     /// fetch attachments
     
      return responsecon.successresponsewithdata(
        res,
        "Tracking histry fetch successfully",
        {records:his,teachers}
      );
    } catch (err) {
      console.log(err)
      return responsecon.servererrorresponse(res);
    }
  }
}
const generateassign = async (catid, subid, stdid) => {
  // fr teacher
};
module.exports = new Querycontroller();

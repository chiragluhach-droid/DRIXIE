const { Worker } = require("bullmq");
const redis = require("./redis");
const {
  pointCredit,
  pointDebit,
} = require("../controller/Walletcontroller/pointscontroller");
const serverlogm = require('../models/systemlogs')
const quelog = require("../models/queue_log");
const worker = new Worker(
  "points-queue",
  async (job) => {
    const { userid, trnsid, casetype, fileid } = job.data;
    try {
      console.log(`🎯 Processing points for user ${userid} and file ${fileid}`);
      if (job.name === "credit-points") {
        // Call your service to credit points
        await pointCredit(userid, trnsid, casetype, fileid);
        console.log(`✅ Points credited for user ${userid}`);
      } else if (job.name === "debit-points") {
        // Perform some other operation
        await pointDebit(userid, trnsid, casetype, fileid);
        console.log(`⚡ Devbit operation done for user ${userid}`);
      } else {
        console.log(`⚠️ Unknown job type: ${job.name}`);
      }
      
      await quelog.updateOne(
        { jobid: job.id, purpose: job.name },
        { status: "completed" }
      );
    } catch (err) {
      await serverlogm.create({
        userId:userid,
        action:'queerror_redis',
        functionName:'worker',
        error:err.toString(),
        params:{userid, trnsid, casetype, fileid}
      })
      // Re-throw so BullMQ knows the job failed
      throw err;
    }
  },
  { connection: redis }
);

worker.on("completed", async (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  if (err) {
    console.error(`❌ Job ${job.id} failed: ${err}`);
    await quelog.updateOne({ jobid: job.id }, { status: "failed" });
    await quelog.updateOne({ jobid: job.id }, { $inc: { attempts: 1 } });
    console.error(err); // full error object
  } else {
    console.error("Unknown error occurred");
  }
});

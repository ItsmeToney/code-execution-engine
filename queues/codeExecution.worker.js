const { Worker } = require("bullmq");
const redis = require("../config/redis");

const executeCodeInWorker = require("../services/codeExecutor");

const worker = new Worker(
  "code-execution",
  async (job) => await executeCodeInWorker(job.data),
  { connection: redis, concurrency: 1 }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed.`);
});

worker.on("failed", (job, error) => {
  console.log(`❌ Failed to complete job ${job.id} : ${error.message}`);
});

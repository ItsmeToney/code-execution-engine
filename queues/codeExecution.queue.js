const { Queue, QueueEvents } = require("bullmq");
const redis = require("../config/redis");

const codeExecutionQueue = new Queue("code-execution", {
  connection: redis,
});
const codeExecutionEvents = new QueueEvents("code-execution", {
  connection: redis,
});

module.exports = { codeExecutionQueue, codeExecutionEvents };

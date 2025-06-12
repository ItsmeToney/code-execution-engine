const {
  codeExecutionQueue,
  codeExecutionEvents,
} = require("../queues/codeExecution.queue");

const submitCodeForExecution = async (req, res) => {
  try {
    const { userCode, language, testCases, parameters, returnType } = req.body;
    const job = await codeExecutionQueue.add("execute", {
      userCode,
      language,
      testCases,
      parameters,
      returnType,
    });

    const result = await job.waitUntilFinished(codeExecutionEvents);
    // console.log(result);

    return res.status(200).json({ result });
    // res.status(202).json({ message: "Job added to queue", jobId: job.id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add job to the queue.", error: err.message });
  }
};

module.exports = { submitCodeForExecution };

const router = require("express").Router();
const {
  submitCodeForExecution,
} = require("../controllers/codeExecutionController.js");

router.route("/").post(submitCodeForExecution);

module.exports = router;

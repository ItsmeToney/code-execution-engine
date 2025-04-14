const router = require("express").Router();
const { codeExecution } = require("../controllers/codeExecutionController.js");

router.route("/").post(codeExecution);

module.exports = router;

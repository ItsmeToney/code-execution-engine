const router = require("express").Router();
const {
  getAllQuestions,
  createQuestion,
  getQuestion,
  deleteQuestion,
} = require("../controllers/questionController.js");

router.route("/").get(getAllQuestions).post(createQuestion);
router.route("/:id").get(getQuestion).delete(deleteQuestion);
//need to do update()

module.exports = router;

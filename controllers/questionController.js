const Question = require("../model/questionModel");

const getAllQuestions = async (req, res) => {
  try {
    const query = Question.find();
    const fields = "title description language testCases functionDeclaration";
    const questions = await query.select(fields);
    // const questions = await Question.find();

    res
      .status(200)
      .json({ status: "success", results: questions.length, data: questions });
  } catch (err) {
    console.log(err);
    res.status(404).json({ status: "fail", message: "Can't fetch questions" });
  }
};

const getQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const query = Question.findById({ _id: questionId });
    const fields = "title description language testCases";
    const question = await query.select(fields);
    res.status(200).json({ status: "success", data: question });
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ status: "fail", message: "Failed to find question" });
  }
};
const createQuestion = async (req, res) => {};
const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    await Question.findById({ _id: questionId });
    res.status(200).json({ status: "success", data: question });
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ status: "fail", message: "Failed to delete question" });
  }
};

module.exports = {
  getAllQuestions,
  createQuestion,
  getQuestion,
  deleteQuestion,
};

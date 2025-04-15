const fs = require("fs");
require("dotenv").config({ path: "../../.env" });

const connectDb = require("../../config/connectDB.js");
connectDb();

const Question = require("../../model/questionModel.js");

const questions = JSON.parse(
  fs.readFileSync(`${__dirname}/sample_data.json`, "utf-8")
);
// console.log(questions);

const import_data = async () => {
  try {
    await Question.create(questions);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const delete_data = async () => {
  try {
    await Question.deleteMany();
  } catch (err) {
    console.log("Error in deleting data.", err);
  }
  process.exit();
};

if (process.argv[2] === "--import") import_data();
else if (process.argv[2] === "--delete") delete_data();

// console.log(process.argv);
// console.log(process.env.CONNECTION_STRING);

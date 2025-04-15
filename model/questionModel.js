const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema({
  name: String,
  type: String,
  isArray: { type: Boolean, default: false },
});

const testCaseSchema = new mongoose.Schema({
  input: { type: [mongoose.Schema.Types.Mixed], required: true },
  expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: {
    type: String,
    required: true,
    enum: ["c", "java", "python"],
  },

  parameters: {
    type: [parameterSchema],
    validate: {
      validator: function (val) {
        if (["c", "java"].includes(this.language)) {
          return Array.isArray(val) && val.length > 0;
        }
        return true;
      },
      message: "Parameters are required for C and Java.",
    },
  },

  returnType: {
    type: String,
    validate: {
      validator: function (val) {
        if (this.language === "c") {
          return typeof val === "string" && val.length > 0;
        }
        return true;
      },
      message: "Return type is required for C.",
    },
  },

  testCases: [testCaseSchema],
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy",
  },
});

module.exports = mongoose.model("Question", questionSchema);

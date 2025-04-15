const express = require("express");
require("dotenv").config();
const cors = require("cors");

const connectDB = require("./config/connectDB.js");
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 4000;

app.use("/api/submit", require("./routes/codeExecutionRoute.js"));
app.use("/api/questions", require("./routes/questionsRoute.js"));

app.listen(port, () => console.log(`Server is running on port ${port}`));

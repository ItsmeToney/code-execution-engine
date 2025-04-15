const express = require("express");
require("dotenv").config();
const connectDB = require("./config/connectDB.js");
connectDB();

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

app.use("/api/submit", require("./routes/codeExecutionRoute.js"));

app.listen(port, () => console.log(`Server is running on port ${port}`));

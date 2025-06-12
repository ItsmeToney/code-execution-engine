const express = require("express");
require("dotenv").config();
const cors = require("cors");

const os = require("os");
const cluster = require("cluster");

const numCpus = os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker: ${worker.process.pid} dies. Spawning a new process...`
    );
    cluster.fork();
  });
} else {
  const connectDB = require("./config/connectDB.js");
  connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());
  const port = process.env.PORT || 4000;

  app.use("/api/submit", require("./routes/codeExecutionRoute.js"));
  app.use("/api/questions", require("./routes/questionsRoute.js"));

  app.listen(port, () => console.log(`Server is running on port ${port}`));
}

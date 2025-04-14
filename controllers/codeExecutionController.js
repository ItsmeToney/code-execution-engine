const fs = require("fs");
const path = require("path");

const { spawn } = require("child_process");

const codeExecution = async (req, res) => {
  try {
    const { code, language, testCases } = req.body;
    console.log(testCases);

    const tempFolderPath = path.join(__dirname, "temp");

    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    let fileName,
      compiledFile,
      runCommand,
      cleanUpFiles = [];
    switch (language.toLowerCase()) {
      case "c":
        fileName = "temp.c";
        fs.writeFileSync(path.join(tempFolderPath, fileName), code);
        cleanUpFiles.push(
          path.join(tempFolderPath, fileName),
          path.join(tempFolderPath, "temp.exe")
        );
        const compileCommand = spawn("gcc", [
          path.join(tempFolderPath, fileName),
          "-o",
          path.join(tempFolderPath, "temp.exe"),
        ]);
        runCommand = [path.join(tempFolderPath, "temp.exe")];

        compileCommand.on("close", (code) => {
          if (code !== 0) {
            return res
              .status(500)
              .json({ status: "fail", message: "C:Compilation error." });
          } else {
            console.log("Compiled successfully");
            executeCode(runCommand[0], testCases, cleanUpFiles, res);
          }
        });

        break;
      // case "java":
      //   fileName = "temp.java";
      //   compiledFile = "temp.class";
      //   break;
      case "python":
        fileName = "temp.py";
        fs.writeFileSync(path.join(tempFolderPath, fileName), code);
        runCommand = ["python", [path.join(tempFolderPath, fileName)]];
        cleanUpFiles.push(path.join(tempFolderPath, fileName));
        executeCode(runCommand[0], testCases, cleanUpFiles, res, [
          runCommand[1],
        ]);
        break;
      default:
        throw new Error("Unsupported language.");
    }

    // fs.writeFileSync(path.join(tempFolderPath, fileName), code);

    //Executing code

    // let filePath = path.join(tempFolderPath, fileName);

    // filePath = filePath.replace("C:\\", "/mnt/c/").replaceAll("\\", "/");
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

function executeCode(command, testCases, cleanUpFiles, res, args = []) {
  let output = "";
  let errorOutput = "";
  const child = spawn(command, args || []);
  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  child.on("close", (code) => {
    cleanUpFiles.map((cleanFile) => {
      fs.unlinkSync(cleanFile);
    });
    // console.log("File removed successfully");

    if (code === 0) {
      let outputArr = output.split("\r\n").filter((out) => out.length > 0);
      console.log(outputArr);

      const result = testCases.map((testCase, index) => {
        return {
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          output: outputArr[index],
          status:
            testCase.expectedOutput.toString().trim() ===
            outputArr[index].toString().trim(),
        };
      });
      console.log(result);

      return res.status(200).json({ status: "success", result });
    } else {
      return res
        .status(500)
        .json({ status: "fail", message: `${errorOutput}` });
    }
  });
}

module.exports = { codeExecution };

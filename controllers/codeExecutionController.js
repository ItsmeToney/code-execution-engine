const fs = require("fs");
const path = require("path");

const {
  generateCWrapper,
} = require("../utils/wrapperGenerators/generateCWrapper");
const {
  generateJavaWrapper,
} = require("../utils/wrapperGenerators/generateJavaWrapper");
const {
  generatePythonWrapper,
} = require("../utils/wrapperGenerators/generatePythonWrapper");

const { spawn } = require("child_process");

const codeExecution = async (req, res) => {
  try {
    const { userCode, language, testCases, parameters, returnType } = req.body;
    console.log(req.body);
    console.log(testCases);

    const tempFolderPath = path.join(__dirname, "temp");

    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    //creating a complete code from solution function that we get from the user

    let code;

    let fileName,
      compileCommand,
      runCommand,
      cleanUpFiles = [];
    switch (language.toLowerCase()) {
      case "c":
        fileName = "temp.c";
        code = generateCWrapper(userCode, parameters, returnType, testCases);
        console.log(code);
        fs.writeFileSync(path.join(tempFolderPath, fileName), code);
        console.log("Code write to file");
        cleanUpFiles.push(
          path.join(tempFolderPath, fileName),
          path.join(tempFolderPath, "temp.exe")
        );
        compileCommand = spawn("gcc", [
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
      case "java":
        fileName = "Main.java";
        code = generateJavaWrapper(userCode, parameters, returnType, testCases);
        fs.writeFileSync(path.join(tempFolderPath, fileName), code);
        console.log("Code write to file");
        cleanUpFiles.push(
          path.join(tempFolderPath, fileName),
          path.join(tempFolderPath, "Main.class"),
          path.join(tempFolderPath, "Solution.class")
        );
        compileCommand = spawn("javac", [path.join(tempFolderPath, fileName)]);

        runCommand = ["java", "-cp", tempFolderPath, "Main"];

        compileCommand.on("close", (code) => {
          if (code !== 0) {
            return res
              .status(500)
              .json({ status: "fail", message: "Java:Compilation error." });
          } else {
            console.log("Compiled successfully");
            executeCode(
              runCommand[0],
              testCases,
              cleanUpFiles,
              res,
              runCommand.slice(1)
            );
          }
        });
        break;

      case "python":
        fileName = "temp.py";
        code = generatePythonWrapper(
          userCode,
          parameters,
          returnType,
          testCases
        );
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
    res.status(400).json({ status: "fail", message: err });
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
        let expOut;
        if (Array.isArray(testCase.expectedOutput)) {
          expOut = `[${testCase.expectedOutput.join(", ")}]`;
        } else {
          expOut = testCase.expectedOutput.toString();
        }
        console.log(expOut);

        return {
          input: testCase.input,
          // expectedOutput: testCase.expectedOutput.join(", "),
          expectedOutput: expOut,
          output: outputArr[index],
          status:
            expOut.toString().trim() === outputArr[index].toString().trim(),
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

//generating wrapper code for C language

// Generate wrapper code for Java language

//Generate wrapper code for python language

module.exports = { codeExecution };

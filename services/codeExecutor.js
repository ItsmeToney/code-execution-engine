// const fs = require("fs");
// const path = require("path");

// const {
//   generateCWrapper,
// } = require("../utils/wrapperGenerators/generateCWrapper");
// const {
//   generateJavaWrapper,
// } = require("../utils/wrapperGenerators/generateJavaWrapper");
// const {
//   generatePythonWrapper,
// } = require("../utils/wrapperGenerators/generatePythonWrapper");

// const { spawn } = require("child_process");

// const codeExecution = async ({
//   userCode,
//   language,
//   testCases,
//   parameters,
//   returnType,
// }) => {
//   try {
//     // console.log(testCases);

//     const tempFolderPath = path.join(__dirname, "temp", Date.now().toString());

//     if (!fs.existsSync(tempFolderPath)) {
//       await fs.promises.mkdir(tempFolderPath, { recursive: true });
//     }

//     //creating a complete code from solution function that we get from the user

//     let code;

//     let fileName,
//       compileCommand,
//       runCommand,
//       cleanUpFiles = [];
//     switch (language.toLowerCase()) {
//       case "c":
//         fileName = "temp.c";
//         code = generateCWrapper(userCode, parameters, returnType, testCases);
//         // console.log(code);
//         fs.promises.writeFile(path.join(tempFolderPath, fileName), code);
//         // console.log("Code write to file");
//         cleanUpFiles.push(
//           path.join(tempFolderPath, fileName),
//           path.join(tempFolderPath, "temp.exe")
//         );

//         await new Promise((resolve, reject) => {
//           compileCommand = spawn("gcc", [
//             path.join(tempFolderPath, fileName),
//             "-o",
//             path.join(tempFolderPath, "temp.exe"),
//           ]);
//           runCommand = [path.join(tempFolderPath, "temp.exe")];

//           compileCommand.on("close", (code) => {
//             if (code !== 0) {
//               return reject({
//                 status: "fail",
//                 message: "C:Compilation error.",
//               });
//             } else {
//               // console.log("Compiled successfully");
//               resolve();
//             }
//           });
//         });
//         return await executeCode(runCommand[0], testCases, tempFolderPath);

//         break;
//       case "java":
//         fileName = "Main.java";
//         code = generateJavaWrapper(userCode, parameters, returnType, testCases);
//         fs.writeFileSync(path.join(tempFolderPath, fileName), code);
//         // console.log("Code write to file");
//         cleanUpFiles.push(
//           path.join(tempFolderPath, fileName),
//           path.join(tempFolderPath, "Main.class"),
//           path.join(tempFolderPath, "Solution.class")
//         );

//         await new Promise((resolve, reject) => {
//           compileCommand = spawn("javac", [
//             path.join(tempFolderPath, fileName),
//           ]);
//           runCommand = ["java", "-cp", tempFolderPath, "Main"];

//           compileCommand.on("close", (code) => {
//             if (code !== 0) {
//               return reject({
//                 status: "fail",
//                 message: "Java:Compilation error.",
//               });
//             } else {
//               // console.log("Compiled successfully");
//               resolve();
//             }
//           });
//         });
//         return await executeCode(
//           runCommand[0],
//           testCases,
//           tempFolderPath,

//           runCommand.slice(1)
//         );
//         break;

//       case "python":
//         fileName = "temp.py";
//         code = generatePythonWrapper(
//           userCode,
//           parameters,
//           returnType,
//           testCases
//         );
//         fs.writeFileSync(path.join(tempFolderPath, fileName), code);
//         runCommand = ["python", [path.join(tempFolderPath, fileName)]];
//         cleanUpFiles.push(path.join(tempFolderPath, fileName));
//         return await executeCode(runCommand[0], testCases, tempFolderPath, [
//           runCommand[1],
//         ]);
//         break;
//       default:
//         throw new Error("Unsupported language.");
//     }
//   } catch (err) {
//     return { status: "fail", message: err };
//   }
// };

// function executeCode(command, testCases, tempFolderPath, args = []) {
//   return new Promise((resolve, reject) => {
//     let output = "";
//     let errorOutput = "";
//     const child = spawn(command, args || []);
//     child.stdout.on("data", (data) => {
//       output += data.toString();
//     });

//     child.stderr.on("data", (data) => {
//       errorOutput += data.toString();
//     });

//     child.on("exit", async (code, signal) => {
//       //removing temp folder and its contents
//       try {
//         await fs.promises.rm(tempFolderPath, { recursive: true, force: true });
//       } catch (err) {
//         console.error("Error removing temp folder:", err.message);
//       }

//       // console.log("signal", signal);
//       // console.log("code", code);
//       if (signal) {
//         return reject({
//           status: "fail",
//           message: `Runtime Error: Process terminated due to signal ${signal}`,
//           stderr: `${errorOutput}`,
//         });
//       }
//       if (code === 0) {
//         let outputArr = output.split("\r\n").filter((out) => out.length > 0);
//         // console.log(outputArr);

//         const result = testCases.map((testCase, index) => {
//           let expOut;
//           if (Array.isArray(testCase.expectedOutput)) {
//             expOut = `[${testCase.expectedOutput.join(", ")}]`;
//           } else {
//             expOut = testCase.expectedOutput.toString();
//           }
//           // console.log(expOut);

//           return {
//             input: testCase.input,
//             expectedOutput: expOut,
//             output: outputArr[index],
//             status:
//               expOut.toString().trim() === outputArr[index].toString().trim(),
//           };
//         });
//         // console.log(result);

//         return resolve({ status: "success", result });
//       } else {
//         return reject({ status: "fail", message: `Error: ${errorOutput}` });
//       }
//     });
//   });
// }

// module.exports = codeExecution;

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const {
  generateCWrapper,
} = require("../utils/wrapperGenerators/generateCWrapper");
const {
  generateJavaWrapper,
} = require("../utils/wrapperGenerators/generateJavaWrapper");
const {
  generatePythonWrapper,
} = require("../utils/wrapperGenerators/generatePythonWrapper");

const dockerConfig = {
  c: {
    image: "code-exec-c",
    command: 'sh -c "gcc temp.c -o temp && ./temp"',
  },
  java: {
    image: "code-exec-java",
    command: 'sh -c "javac Main.java && java -cp . Main"',
  },
  python: {
    image: "code-exec-python",
    command: "python temp.py",
  },
};

const runCodeInDocker = (language, tempFolderPath) => {
  return new Promise((resolve, reject) => {
    const config = dockerConfig[language.toLowerCase()];
    console.log(config);
    if (!config) {
      return reject(new Error("Unsupported language"));
    }

    // Sanitize path for Docker mount (handle Windows path separators if needed)
    const volumePath = tempFolderPath.replace(/\\/g, "/");

    const dockerCmd = `docker run --rm -v ${volumePath}:/code -w /code --memory="256m" --cpus="0.5" ${config.image} ${config.command}`;

    exec(dockerCmd, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        return reject({
          status: "fail",
          message: `Execution error: ${stderr || error.message}`,
        });
      }
      resolve(stdout);
    });
  });
};

const codeExecution = async ({
  userCode,
  language,
  testCases,
  parameters,
  returnType,
}) => {
  try {
    const tempFolderPath = path.join(__dirname, "temp", Date.now().toString());
    if (!fs.existsSync(tempFolderPath)) {
      await fs.promises.mkdir(tempFolderPath, { recursive: true });
    }

    let fileName, code;

    switch (language.toLowerCase()) {
      case "c":
        fileName = "temp.c";
        code = generateCWrapper(userCode, parameters, returnType, testCases);
        break;
      case "java":
        fileName = "Main.java";
        code = generateJavaWrapper(userCode, parameters, returnType, testCases);
        break;
      case "python":
        fileName = "temp.py";
        code = generatePythonWrapper(
          userCode,
          parameters,
          returnType,
          testCases
        );
        break;
      default:
        throw new Error("Unsupported language.");
    }

    await fs.promises.writeFile(path.join(tempFolderPath, fileName), code);

    const output = await runCodeInDocker(language, tempFolderPath);
    console.log(output);

    const outputArr = output.split(/\r?\n/).filter((line) => line.length > 0);

    const result = testCases.map((testCase, index) => {
      const expectedOutput = Array.isArray(testCase.expectedOutput)
        ? `[${testCase.expectedOutput.join(", ")}]`
        : testCase.expectedOutput.toString();

      return {
        input: testCase.input,
        expectedOutput,
        output: outputArr[index] || "",
        status:
          expectedOutput.toString().trim() ===
          (outputArr[index] || "").toString().trim(),
      };
    });

    // Cleanup
    await fs.promises.rm(tempFolderPath, { recursive: true, force: true });

    return { status: "success", result };
  } catch (err) {
    return { status: "fail", message: err.message || err };
  }
};

module.exports = codeExecution;

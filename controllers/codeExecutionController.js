const fs = require("fs");
const path = require("path");

const { spawn } = require("child_process");

const codeExecution = async (req, res) => {
  try {
    const { userCode, language, testCases, parameters, returnType } = req.body;
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

//generating wrapper code for C language

function generateCWrapper(userCode, parameters, returnType, testCases) {
  let fs; //format specifier

  switch (returnType) {
    case "int":
      fs = "%d";
      break;
    case "float":
      fs = "%f";
      break;
    case "char":
      fs = "%c";
      break;
    case "char*":
      fs = "%s";
      break;
    case "char[]":
      fs = "%s";
      break;
    default:
      throw new Error("Unsupported return type");
  }

  const inputInitialization = testCases.map((ts, tsi) => {
    // console.log(ts.input);
    const inputInitializationArray = parameters.map((p, i) => {
      if (p.isArray) {
        const arrayElements = ts.input[i]
          .map(
            (el) =>
              `${
                p.type === "char*"
                  ? `"${el}"`
                  : p.type === "char"
                  ? `'${el}'`
                  : el
              }`
          )
          .join();
        console.log(arrayElements);
        return `${p.type} ${p.name}${tsi}[]={${arrayElements}};\n`;
      } else {
        return `${p.type} ${p.name}${tsi}=${
          p.type == "char*"
            ? `"${ts.input[i]}"`
            : p.type == "char"
            ? `'${ts.input[i]}'`
            : ts.input[i]
        };\n`;
      }
    });
    // console.log(inputInitializationArray);

    return inputInitializationArray;
  });

  // console.log(inputInitialization);
  // console.log(inputInitialization.flat().join(" "));

  const testCalls = inputInitialization.map(
    (_, i) =>
      `printf("${fs}\\n",solution(${parameters.map(
        (p) => `${p.name}${i}`
      )}));\n`
  );

  // console.log(testCalls);
  // console.log(testCalls.join(" "));
  const wrapper = `
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

${userCode}

int main() {
${inputInitialization.flat().join(" ")}
${testCalls.join(" ")}
  return 0;
}`.trim();

  return wrapper;
}

// Generate wrapper code for Java language
function generateJavaWrapper(userCode, parameters, returnType, testCases) {
  const testCalls = testCases.map((ts) => {
    const args = parameters.map((p, i) => {
      if (p.isArray) {
        const arrayElements = ts.input[i]
          .map(
            (el) =>
              `${
                p.type === "String"
                  ? `"${el}"`
                  : p.type === "char"
                  ? `'${el}'`
                  : el
              }`
          )
          .join(",");
        console.log(arrayElements);
        return `new ${p.type}[]{${arrayElements}}\n`;
      } else {
        return `${
          p.type === "String"
            ? `"${ts.input[i]}"`
            : p.type === "char"
            ? `'${ts.input[i]}'`
            : ts.input[i]
        }\n`;
      }
    });
    console.log(args);
    // console.log(inputInitializationArray);

    return `System.out.println(new Solution().solution(${args}));`;
  });
  console.log(testCalls.join(" \n"));

  const wrapper = `
${userCode}

public class Main {
    public static void main(String[] args) {
        ${testCalls.join(" \n")}
    }
}`.trim();

  return wrapper;
}

module.exports = { codeExecution };

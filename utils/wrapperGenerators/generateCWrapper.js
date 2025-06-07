function generateCWrapper(userCode, parameters, returnType, testCases) {
  let fs; //format specifier

  switch (returnType) {
    case "int":
    case "bool":
      fs = "%d";
      break;
    case "float":
    case "double":
      fs = "%f";
      break;
    case "char":
      fs = "%c";
      break;
    case "char*":
    case "char[]":
      fs = "%s";
      break;
    case "int*":
    case "float*":
      fs = "%p";
      break;
    case "void":
      fs = null;
      break;
    default:
      throw new Error("Unsupported return type");
  }

  const inputInitialization = testCases.map((ts, tsi) => {
    // console.log(ts.input);
    return parameters.map((p, i) => {
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
  });

  // console.log(inputInitialization);
  // console.log(inputInitialization.flat().join(" "));

  const testCalls = inputInitialization.map((_, i) => {
    const args = parameters.map((p) => `${p.name}${i}`).join(", ");

    if (returnType === "void") {
      return `solution(${args});\n`;
    } else {
      return `printf("${fs}\\n",solution(${args}));\n`;
    }
  });

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

module.exports = { generateCWrapper };

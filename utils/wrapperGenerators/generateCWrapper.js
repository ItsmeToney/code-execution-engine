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

module.exports = { generateCWrapper };

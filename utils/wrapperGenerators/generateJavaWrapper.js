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
        // console.log(arrayElements);
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
    // console.log(args);
    // console.log(inputInitializationArray);

    return `System.out.println(new Solution().solution(${args}));`;
  });
  // console.log(testCalls.join(" \n"));

  const wrapper = `
  ${userCode}
  
  public class Main {
      public static void main(String[] args) {
          ${testCalls.join(" \n")}
      }
  }`.trim();

  return wrapper;
}

module.exports = { generateJavaWrapper };

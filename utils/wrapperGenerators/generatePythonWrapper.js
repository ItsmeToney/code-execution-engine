function generatePythonWrapper(userCode, parameters, returnType, testCases) {
  let wrapper = userCode.trim() + "\n\n";
  wrapper += 'if __name__ == "__main__":\n';

  testCases.forEach((testCase) => {
    const formattedInputs = testCase.input
      .map((inp) => {
        if (typeof inp === "string") return JSON.stringify(inp);
        if (Array.isArray(inp)) return JSON.stringify(inp);
        return inp;
      })
      .join(", ");

    wrapper += `    print(solution(${formattedInputs}))\n`;
  });

  return wrapper;
}

module.exports = { generatePythonWrapper };

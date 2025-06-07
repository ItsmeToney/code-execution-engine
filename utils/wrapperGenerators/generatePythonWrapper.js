function formatPythonValue(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return value;
}

function generatePythonWrapper(userCode, parameters, returnType, testCases) {
  let wrapper = userCode.trim() + "\n\n";
  wrapper += 'if __name__ == "__main__":\n';

  testCases.forEach((testCase) => {
    const formattedInputs = testCase.input
      .map((inp) => formatPythonValue(inp))
      .join(", ");

    wrapper += `    print(solution(${formattedInputs}))\n`;
  });

  return wrapper;
}

module.exports = { generatePythonWrapper };

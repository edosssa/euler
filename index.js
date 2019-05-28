const LexicalScope = require("./core/lexical-scope");
const InteropHost = require("./core/interop");

const scope = new LexicalScope();
scope
  .LoadLibs()
  .then(() => {
    //   const code = `
    //     scope.add("a", 3);
    //     scope.add("x", scope.get("mean")([1, 2, 3]));  //mean([1, 2, 3]);
    //     scope.get("print")(3);
    //  `;
    //   eval(code);
    //   console.log("Code execuction completed");
    //   console.log(scope.getAsObject());

    const pyCode = `
    x = 6 - 5
    euler.write("Hello to Eulerscript v%s!" %x)
`;

    const interopHost = new InteropHost();
    interopHost
      .run("py", pyCode, scope)
      .then(() => {
        console.log("Script completed!");
      })
      .catch(err => {
        console.error(
          "An error occurred while executing script: " + err.message
        );
      });
    // runCode(code, scope);
  })
  .catch("Unable to load native modules");

function runCode(code, scope) {}

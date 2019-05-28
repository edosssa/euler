const LexicalScope = require("./core/lexical-scope");
const InteropHost = require("./core/interop");

const scope = new LexicalScope();
scope
  .LoadLibs()
  .then(() => runCode())
  .catch("Unable to load native modules");

function runCode() {
  /* Tac on function to execute foreign scripts */
  const interopHost = new InteropHost();

  const py = async ([code]) => {
    interopHost
      .run("py", code, scope)
      .then(() => console.log("End!"))
      .catch(err => console.error("Error: " + err.message));
  };
  scope.add("py", py);

  const code = `
      scope.add("a", 3);
      scope.add("x", scope.get("mean")([1, 2, 3]));  //mean([1, 2, 3]);
      py\`
      x = 6 - 5
      euler.write("Hello to Eulerscript v%s!" %x)
      \`;
      scope.get("print")(3);
   `;

  eval(code);
  console.log("Code execuction completed");
  console.log(scope.getAsObject());
}

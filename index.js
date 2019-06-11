const LexicalScope = require("./core/lexical-scope");
const InteropHost = require("./core/interop");
const fs = require("fs");
const path = require("path");

const scope = new LexicalScope();
scope
  .LoadLibs()
  .then(() => runCode())
  .catch("Unable to load native modules");

async function runCode() {
  /* Tac on function to execute foreign scripts */
  const interopHost = new InteropHost();

  /* Python interop hook */
  const python = async ([code]) => {
    console.log("[py-interop]: starting execution of foreign script...");
    return interopHost
      .run("py", code, scope)
      .then(() => console.log("[py-interop]: forign script completed with an exit code of 0"))
      .catch(err => {
        /* re-throw the error so it can be caught by the evaluator */
        throw err
      });
  };
  const code = fs.readFileSync(path.join(__dirname, "script.el"), {encoding: 'utf-8'});
  const execPromise = eval(code);
  execPromise.then(() => {
     console.log("[script-evaluator]: script ran to completetion!");
  })
  .catch(err => console.log("An error occurred:", err.message));
}

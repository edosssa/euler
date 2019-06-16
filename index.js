const fs = require("fs");
const path = require("path");
const LexicalScope = require("./core/lexical-scope");
const InteropHost = require("./core/interop-host");

const scope = new LexicalScope();
scope
  .LoadLibs()
  .then(() => runCode())
  .catch("Unable to load native modules");

const interopHost = new InteropHost(scope);

async function runCode() {
  /* Python interop hook */
  const python = async ([code]) => {
    console.log("[py-interop]: starting execution of foreign script...");
    try {
      await interopHost.execute({ lang: "py", code });
      console.log("[py-interop]: forign script completed");
    } catch (err) {
      /* re-throw the error so it can be caught by the evaluator promise */
      throw err;
    }
  };
  
  const code = fs.readFileSync(path.join(__dirname, "script.js"), {
    encoding: "utf-8"
  });

  const execPromise = eval(code);
  execPromise
    .then(() => {
      console.log("[script-evaluator]: script ran to completion!");
    })
    .catch(err => console.log("[script-evaluator]: script failed to execute:", err.message));
}

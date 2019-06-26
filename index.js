const fs = require("fs");
const path = require("path");
const Scope = require("./core/scope");
const { loadStdLib } = require("./core/util");
const InteropHost = require("./core/interop-host");
const { transpile } = require("./core/transpiler");

const scope = new Scope();
/* Preload the scope with the standard library modules */
loadStdLib(scope)
  .then(() => runCode())
  .catch("Unable to load std library");

const interopHost = new InteropHost(scope);

async function runCode() {
  /* Python interop hook */
  const python = async ([code]) => {
    console.log("[py-interop]: Starting execution of python snippet...");
    try {
      await interopHost.execute({ lang: "py", code });
      console.log("[py-interop]: Python snippet completed");
    } catch (err) {
      /* re-throw the error so it can be caught by the evaluator promise */
      throw err;
    }
  };

  /* Load and transpile the code before running */
  try {
    const opts = { encoding: "utf-8" };
    console.log("[script-evaluator]: Transpiling script...")
    code = transpile(fs.readFileSync(path.join(__dirname, "script.js"), opts));
    console.log("[script-evaluator]: Script transpiled successfully! Running...")
    console.log("\n" + code);
  } catch (err) {
    /* Do something smarter here */
    console.log(err);
    return;
  }

  const execPromise = eval(code);
  execPromise
    .then(() => {
      console.log("[script-evaluator]: Script ran to completion!");
    })
    .catch(err =>
      console.log("[script-evaluator]: Script failed to execute:", err.message)
    );
}

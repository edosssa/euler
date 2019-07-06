const fs = require("fs");
const path = require("path");
const LexicalScope = require("./core/scope");
const InteropHost = require("./core/interop-host");
const { loadStdLib } = require("./core/util");
const transpile = require("./tools/transpile");
const { Logger, logLevels } = require("./core/logger");

const showTranspiled = true;

const logger = new Logger("scipt-evaluator");
const scope = new LexicalScope();
const interopHost = new InteropHost(scope);

loadStdLib(scope).then(() => runCode()).catch(err => logger.log(err.message));

async function runCode() {
  const fileOpts = { encoding: "utf-8" };
  let code = transpile(fs.readFileSync(path.join(__dirname, "script.js"), fileOpts));

  if (showTranspiled) console.log(code);

  /* inject some scope interop funcs */
  scope.set("fetch-scope-value", (key) => {
    const variable = scope.get(key);
    /* Check that it's a primitive first becuase only primitives are JSON serialization safe */
    return variable;
  })

  scope.set("set-scope-value", (key, value) => {
    const variable = scope.set(key, value);
    /* Check that it's a primitive first becuase only primitives are JSON serialization safe */
    return variable;
  })

  /* Python interop hook */
  const python = async ([code]) => {
    logger.log("starting execution of python script...");
    try {
      await interopHost.execute({ lang: "py", code });
      logger.log("python script completed");
    } catch (err) {
      /* log the message but re-throw the error so it can be caught by the evaluator */
      logger.log("python script failed to complete", logLevels.error);
      throw err;
    }
  };
 
  eval(code)
    .then(() => logger.log("script ran to completion!"))
    .catch(err => logger.log(`$script failed to execute: ${err.message}`, logLevels.error))
}

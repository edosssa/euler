const Scope = require("./scope");
const InteropHost = require("./interop-host");
const transpile = require("../tools/transpile");
const { logLevels } = require("./logger");

const showTranspiled = true;

class Runner {
  constructor(logger) {
    this.logger = logger;
  }

  injectInteropHooks(scope) {
    /* inject some scope scripting support hooks */
    /* Todo: Check that it's a primitive first; only primitives are JSON serialization safe */
    scope.set("fetch-scope-value", (key) => scope.get(key));
    scope.set("set-scope-value", (key, value) => scope.set(key, value));
  }

  run(code) {
    return new Promise(async (resolve, reject) => {
      /* Construct the scope object */
      const scope = new Scope();
      const interopHost = new InteropHost(scope);

      this.injectInteropHooks(scope);

      /* Transpile the code before running */
      try { code = transpile(code); }
      catch (err) { return reject(err); }

      if (showTranspiled) this.logger.log(code);

      /* Python interop hook */
      const python = async ([code]) => {
        this.logger.log("Starting execution of python script...");
        try {
          await interopHost.execute({ lang: "python", code });
          this.logger.log("Python script completed");
        } catch (err) {
          /* log the message but re-throw the error so it can be caught by the evaluator */
          this.logger.log("Python script failed to complete, one or more errors occurred", logLevels.error);
          throw err;
        }
      };

      eval(code)
        .then(() => {
          this.logger.log("Script ran to completion!");
          resolve();
        })
        .catch(err => {
          this.logger.log(`Script failed to execute: ${err.message}`, logLevels.error);
          reject(err);
        });
    })
  }
}

module.exports = Runner; 

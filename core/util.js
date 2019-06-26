const fs = require("fs");
const path = require("path");

function loadStdLib(scope) {
  return new Promise((resolve, reject) => {
    /* Load all modules in the 'lib' directory */
    fs.readdir(path.join(__dirname, "/lib"), (error, modules) => {
      if (error) reject(error);
      if (!modules) return;

      modules.forEach(module => {
        const modulePath = path.resolve(path.join(__dirname, "/lib"), module);
        const moduleExport = require(modulePath);

        if (typeof moduleExport === "object") {
          Object.keys(moduleExport).forEach(key => {
            scope.set(key, moduleExport[key]);
          });
        } else if (typeof moduleExport === "function") {
          scope.set(moduleExport.name, moduleExport);
        } else reject(new Error("Unexpected native lib export"));
      });

      resolve();
    });
  });
}

module.exports = { loadStdLib }

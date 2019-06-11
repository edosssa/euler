const fs = require("fs");
const path = require("path");

class LexicalScope {
  constructor() {
    this.internalScope = {};
  }

  LoadLibs() {
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
              this.add(key, moduleExport[key]);
            });
          } else if (typeof moduleExport === "function") {
            this.add(moduleExport.name, moduleExport);
          } else reject(new Error("Unexpected native lib export"));
        });

        resolve();
      });
    });
  }

  add(key, value) {
    if (!key) throw new Error("Value supplied to add cannot be undefined");
    this.internalScope[key] = value;
  }

  get(key) {
    if (this.hasKey(key)) return this.internalScope[key];
    else throw new Error("Key not found in scope");
  }

  remove(key) {
    if (this.hasKey(key)) delete this.internalScope[key];
    else throw new Error("Key not found in scope");
  }

  hasKey(key) {
    return Object.keys(this.internalScope).filter(k => k === key).length === 1;
  }

  purge() {
    for (value in this.internalScope) {
      /* Makes sure they are effectively garbage-collected */
      delete internalScope[value];
    }
    this.internalScope = Object.create(null);
  }

  getAsObject() {
    return this.internalScope;
  }
}

module.exports = LexicalScope;

function injectStdLib(scope) {
  /* Load all modules in the 'lib' directory */
  scope.set("length", (a) =>  a.length)
  scope.set("print", require("../lib/print").print);
  scope.set("table", require("../lib/table").table);
}

module.exports = injectStdLib;


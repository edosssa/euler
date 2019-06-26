const fs = require("fs");
const path = require("path");
const babel = require("babel-core");
/* Babel plugin that defines the transforms */
const eulerscript = require("../tools/babel/eulerscipt");

const fileName = path.join(__dirname, "../script.js");

function transpile(code) {
  if (!code) throw new Error("Code must be supplied");

  // use the eulerscript plugin to transform the source
  const out = babel.transform(code, {
    plugins: [eulerscript]
  });
  
  return out.code;
}

module.exports = {
  transpile
};

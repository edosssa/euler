const babel = require("babel-core");
/* Babel plugin that defines the transforms */
const eulerscript = require("./babel/eulerscipt");

function transpile(code) {
  // use the eulerscript plugin to transform the source
  const out = babel.transform(code, {
    plugins: [eulerscript]
  });
  
  return out.code;
}

module.exports = transpile;

const fs = require('fs');
const path = require("path");
const babel = require('babel-core');
const eulerscript = require('./eulerscipt');

const fileName = path.join(__dirname, "../../script.js");

fs.readFile(fileName, function(err, data) {
  if(err) throw err;

  // convert from a buffer to a string
  const src = data.toString();

  // use the eulerscript plugin to transform the source
  const out = babel.transform(src, {
    plugins: [eulerscript]
  });

  // print the generated code to screen
  console.log(out.code);
});
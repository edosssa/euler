const Table = require("cli-table");
const colors = require("colors");
const print = require("./print").print;

function generateTable() {
  const genTable = new Table({
    head: ["", "f", "m", "f * m"]
  });

  genTable.push(
    ["[10 - 20]", "5", "15", "75"],
    ["[10 - 20]", "5", "15", "75"],
    ["[10 - 20]", "5", "15", "75"]);

  print("\n" + genTable.toString());
}

module.exports = {
  table: generateTable
};

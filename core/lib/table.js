const Table = require("cli-table");
const colors = require("colors");

function generateTable() {
  const genTable = new Table({
    head: ["", colors.white("f"), colors.white("m"), colors.white("f * m")]
  });

  genTable.push(["[0 - 10]", "3", "5", "15"], ["[10 - 20]", "5", "15", "75"]);

  console.log(genTable.toString());
}

module.exports = {
  table: generateTable
};

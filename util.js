const fs = require("fs");

function findJavaHome() {
  return new Promise((resolve, reject) => {
    if (!process.env.Path) reject(new Error("Path not in env"));

    process.env.Path.split(";").forEach(p => {
      console.log(p);

      fs.readdir(p, (error, files) => {
        if (error) reject(error);
        if (files) {
          const match = files.filter(f => f.startsWith("j") ? console.log(f) : null);
          if (match.length > 0) console.log(`Match found in ${p}\\${match[0]}`);
          resolve(match);
        }
      });
    });
  });
}

module.exports = {
  findJavaHome
};

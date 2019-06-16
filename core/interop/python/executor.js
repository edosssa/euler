const path = require("path");
const os = require("os");
const fs = require("fs");
const util = require("util");
const { spawn } = require("child_process")

/* Don't create a new folder in temp everytime we run a script */
let cache = {
  lastBuildPath: null,
  code: null,
}

function execute(code) {
  return new Promise(async (resolve, reject) => {
    if (!code) {
      reject(new Error("Must pass some valid code to execute"));
      return;
    }
    
    if (cache.lastBuildPath) {
    /* verify that the dir is present on disk */

    }

    const scriptCode = require("./template")(code);
    const mkdtemp = util.promisify(fs.mkdtemp);
    const tmpScriptDir = await mkdtemp(path.join(os.tmpdir(), "py-interop-"));
    const scriptPath = path.join(tmpScriptDir, "script.py");

    const writeFile = util.promisify(fs.writeFile);
    await writeFile(scriptPath, scriptCode);

    /* Copy the euler library dependency to the build dir */
    const copyFile = util.promisify(fs.copyFile);
    await copyFile(
      path.join(__dirname, "/lib/euler.py"),
      path.join(tmpScriptDir, "euler.py")
    );

    /* Update the cache */
    cache.lastBuildPath = tmpScriptDir;
    cache.code = code;

    const pyProcess = spawn("python", [scriptPath]);
    resolve(pyProcess);
  });
}

module.exports = { executePython: execute }

      



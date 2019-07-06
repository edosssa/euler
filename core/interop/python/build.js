const path = require("path");
const os = require("os");
const fs = require("fs");
const util = require("util");
const { spawn } = require("child_process")

/* async wrappers */
const mkdtemp = util.promisify(fs.mkdtemp);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);

let cache = {
  buildDir: null,
  code: null,
}

function build(code) {
  return new Promise(async (resolve, reject) => {
    const buildDir = cache.buildDir || await mkdtemp(path.join(os.tmpdir(), "py-interop-"));

    const scriptPath = path.join(buildDir, "script.py");

    if (cache.code !== code) {

      /* Inflate the snippet */
      const scriptCode = require("./template")(code);
      await writeFile(scriptPath, scriptCode);

      /* Copy the euler library dependency to the build dir */
      await copyFile(
        path.join(__dirname, "/native/euler.py"),
        path.join(buildDir, "euler.py")
      );

      /* Update the cache */
      cache.buildDir = buildDir;
      cache.code = code;
    }

    const pyProcess = spawn("python", [scriptPath]);
    resolve(pyProcess);
  });
}

module.exports = build;





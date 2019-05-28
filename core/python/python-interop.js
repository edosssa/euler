const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");
const util = require("util");

module.exports = class PyInterop {
  constructor(scope) {
    this.scope = scope;
  }

  run(code) {
    return new Promise(async (resolve, reject) => {
      if (!code) {
        reject(new Error("Must pass some valid code to execute"));
        return;
      }
      if (!this.scope) {
        reject(new Error("Scope object not initialized"));
        return;
      }

      /* Python is indentation sensitive */
      const scriptCode = `
# Import wrapper modules to implement funtionality used in main
import euler
import sys

# Typical script entry point
def Main():
  ${code}

if __name__ == '__main__':
  Main()
      `;

      const mkdtemp = util.promisify(fs.mkdtemp);
      const tempDir = await mkdtemp(path.join(os.tmpdir(), "py-interop-"));
      const scriptPath = path.join(tempDir, "script.py");

      const writeFile = util.promisify(fs.writeFile);
      await writeFile(scriptPath, scriptCode);

      /* Copy modules the script is depenedent on */
      const copyFile = util.promisify(fs.copyFile);
      await copyFile(
        path.join(__dirname, "/lib/euler_interop.py"),
        path.join(tempDir, "euler_interop.py")
      );
      await copyFile(
        path.join(__dirname, "/lib/euler.py"),
        path.join(tempDir, "euler.py")
      );
      console.log(scriptPath);
      const child = spawn("python", [scriptPath]);

      const send = message => {
        const buffer = Buffer.from(JSON.stringify(message));
        const header = Buffer.alloc(4);

        header.writeUInt32LE(buffer.length, 0);

        var data = Buffer.concat([header, buffer]);
        child.stdin.write(data);
      };

      const read = async () => {
        let input = [];
        let chunk;
        while ((chunk = child.stdout.read())) {
          input.push(chunk);
        }
        input = Buffer.concat(input);

        /* Make sure we have enough bytes to parse a UInt32 */
        if (input.length < 4) return;

        console.log(input.byteLength + " bytes read");

        var msgLen = input.readUInt32LE(0);
        var dataLen = msgLen + 4;

        if (input.length >= dataLen) {
          var content = input.slice(4, dataLen);
          var request = JSON.parse(content.toString());
          console.log("[py]: ", request);
          var response = await this.handleRequest(request);
          send(response);
        }
      };

      child.stdout.on("readable", async () => await read());

      child.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
      });

      child.on("exit", code => {
        console.log(`Process exited with code ${code}`);
        if (code === 0) resolve();
        else reject("Script did not return 0");
      });

      child.on("error", () => {
        console.log("An error occurred while spawing the python shell");
      });
    });
  }

  handleRequest(request) {
    return new Promise(resolve => {
      if (request.cmd === "print") {
        this.scope.get("print")(request.args);
      }
      resolve({ response: "echo echo!" });
    });
  }
};

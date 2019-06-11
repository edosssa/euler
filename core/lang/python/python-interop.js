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

      const scriptCode = require("./template")(code);
      const mkdtemp = util.promisify(fs.mkdtemp);
      const tempDir = await mkdtemp(path.join(os.tmpdir(), "py-interop-"));
      const scriptPath = path.join(tempDir, "script.py");

      const writeFile = util.promisify(fs.writeFile);
      await writeFile(scriptPath, scriptCode);

      /* Copy script dependencies */
      const copyFile = util.promisify(fs.copyFile);
      await copyFile(
        path.join(__dirname, "/lib/euler_interop.py"),
        path.join(tempDir, "euler_interop.py")
      );
      await copyFile(
        path.join(__dirname, "/lib/euler.py"),
        path.join(tempDir, "euler.py")
      );

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

        /* Make sure we have enough bytes to parse an int */
        if (input.length < 4) return;

        const msgLen = input.readUInt32LE(0);
        const dataLen = msgLen + 4;

        if (input.length >= dataLen) {
          const content = input.slice(4, dataLen);
          const request = JSON.parse(content.toString());
          send(await this.handleRequest(request));
        }
      };

      child.stdout.on("readable", async () => await read());

      child.stderr.on("data", data => {
        // console.log(`[stderr]: ${data}`);
        this.lastError =
          this.lastError && typeof this.lastError === "string"
            ? this.lastError + "\n" + data
            : data;
      });

      child.on("exit", code => {
        if (code === 0) resolve();
        else {
          reject(new Error(this.lastError));
        }
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

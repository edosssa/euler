module.exports = class InteropHost {
  constructor(scope) {
    if (!scope) throw new Error("Scope object must be valid");
    this.scope = scope;
  }

  getBuilderPath(monikar) {
    switch (monikar) {
      case "python":
        return `./interop/python/build`;
      default:
        return "unknown";
    }
  }

  execute({ code, lang }) {
    return new Promise(async (resolve, reject) => {
      let build = undefined;

      try { build = require(this.getBuilderPath(lang)); }
      catch (error) { return reject(new Error(`${lang} is not supported for scripting`)); }

      const process = await build(code);

      process.stdout.on(
        "readable",
        async () => await this.readMessage(process)
      );

      process.stderr.on("data", data => {
        this.lastError =
          this.lastError && typeof this.lastError === "string"
            ? this.lastError + "\n" + data
            : data;
      });

      process.on("exit", code => {
        if (code === 0) resolve(code);
        else reject(new Error(this.lastError));
      });

      process.on("error", () => {
        reject(new Error("An error occurred while spawing the python shell"));
      });
    });
  }

  async readMessage(process) {
    let input = [];
    let chunk;

    while ((chunk = process.stdout.read())) input.push(chunk);

    input = Buffer.concat(input);

    /* Make sure we have enough bytes to parse an int */
    if (input.length < 4) return;

    const msgLen = input.readUInt32LE(0);
    const dataLen = msgLen + 4;

    if (input.length >= dataLen) {
      const content = input.slice(4, dataLen);
      const request = JSON.parse(content.toString());
      this.sendMessage(process, await this.handleRequest(request));
    }
  }

  sendMessage(process, message) {
    const buffer = Buffer.from(JSON.stringify(message));
    const header = Buffer.alloc(4);

    header.writeUInt32LE(buffer.length, 0);

    var data = Buffer.concat([header, buffer]);
    process.stdin.write(data);
  }

  handleRequest(request) {
    return new Promise((resolve, reject) => {
      try {
        const cmd = this.scope.get(request.cmd);
        const ret = cmd(...request.args);
        resolve({ result: ret });
      } catch (err) {
        resolve({ status: "error", message: err.message });
      }
    });
  }
};

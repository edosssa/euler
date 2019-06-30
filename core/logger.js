const chalk = require("chalk").default;

const logLevel = {
    info: Symbol("info-debug-level"),
    error: Symbol("error-debug-level")
}

class Logger {
    constructor(name) {
        this.component = name
    }

    log(message, level = logLevel.info) {
        const colorize = (function () {
            if (level === logLevel.info) { return chalk.green }
            else if (level === logLevel.error) { return chalk.red }
        })();
        console.log(`${colorize(`[${this.component}]`)} ${message}`);
    }
}

module.exports = { Logger, logLevels: logLevel }
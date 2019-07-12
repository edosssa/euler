const chalk = require("chalk").default;

const logLevel = {
    info: Symbol("info-debug-level"),
    error: Symbol("error-debug-level")
}

class Logger {
    constructor(name) {
        this.component = name
    }

    configureTap(cb) {
        this.logTap = cb;
    }

    log(message, level = logLevel.info) {
        const colorize = (function () {
            if (level === logLevel.info) { return chalk.green }
            else if (level === logLevel.error) { return chalk.red }
        })();
        const tap = this.logTap || console.log;
        tap(message);
    }
}
    
module.exports = { Logger, logLevels: logLevel }
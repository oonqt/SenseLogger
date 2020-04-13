const fs = require("fs");
const path = require("path");

// my stupid logger module

require("colors");

class Logger {
    constructor(logType, logPath, logRetentionCount) {
        this.logType = logType;
        this.path = logPath;
        this.logRetentionCount = logRetentionCount;
        this.timestamp = new Date();
        this.file = path.join(this.path, `SenseLogger-${this.timestamp.getTime() / 1000 | 0}.txt`);

        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
    }

    info(msg) {
        this.write(msg, "info");
    }

    error(msg) {
        this.write(msg, "error");
    }

    debug(msg) {
        this.write(msg, "debug");
    }

    write(message, level) {
        if (this.logType === "console") {
            switch (level) {
                case "info":
                    console.log("Info: ".green + message)
                    break;
                case "error":
                    console.error("Error: ".red + message);
                    break;
                case "debug":
                    console.debug("Debug: ".yellow + message);
            }
        } else if (this.logType === "file") {
            if (!fs.existsSync(path.join(this.path))) {
                fs.mkdirSync(path.join(this.path));
            }

            if (!fs.existsSync(this.file)) {
                fs.writeFileSync(this.file, `[${Date().toLocaleString()}] ${level}: ${message}\n`);
            } else {
                fs.appendFileSync(this.file, `[${Date().toLocaleString()}] ${level}: ${message}\n`);
            }

            let files = fs.readdirSync(this.path);

            if (files.length > this.logRetentionCount) {
                fs.unlinkSync(path.join(this.path, files[0]));
            }
        }
    }
}

module.exports = Logger;
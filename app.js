const SenseAPI = require("sense-energy-node");
const fs = require("fs");
const Logger = require("./logger");
const { email, password, checkIntervalSeconds, logFile } = require("./config");

const logger = new Logger(process.env.NODE_ENV === "development" ? "console" : "file", "logs", 10);

async function main() {
    try {
        const sense = await SenseAPI({ email, password, verbose: false });
        let processing = false;
        
        // replace log file on startup
        try {
            const oldLogPresent = await fs.existsSync(logFile);
            if (oldLogPresent) {
                await fs.unlinkSync(logFile);
                await fs.writeFileSync(logFile, "");
            }
        } catch (error) {
            logger.error(`Failed to replace log file: ${error}`);
            process.exit(1);
        }

        sense.events.on("data", async data => {
            if (data.payload.authorized === false) {
                logger.info("Not authorized... Attempting to refresh auth");

                try {
                    sense.getAuth();
                } catch (err) {
                    logger.error(`Failed to refresh auth: ${err}`);
                }
            } else if (data.type === "realtime_update" && data.payload && !processing) {        
                processing = true;
                
                const senseData = {};

                await sense.getMonitorInfo().then(info => {
                    senseData.monitor_info = info;
                });

                senseData.usage_info = data.payload;

                try {
                    await fs.appendFileSync(logFile, `[${Date().toLocaleString()}]: ${JSON.stringify(senseData)}\n`);
                } catch (err) {
                    logger.error(`Failed to write to log file: ${err}`);
                }

                sense.closeStream();

                processing = false;
            }
        });

        sense.events.on("close", data => {
            if (!data.wasClean) {
                logger.info(`Websocket unexpectedly closed. ${data.reason && `Reason: ${data.reason}`} Code: ${data.code}`);
            }

            setTimeout(() => {
                sense.openStream();
            }, checkIntervalSeconds * 1000)
        });

        sense.events.on("error", data => {
            logger.error(`Websocket error: ${data.message}`);
        });

        sense.openStream();        
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
}

main();
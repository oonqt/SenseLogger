module.exports = {
    email: "electronicmail@domain.topleveldomain",
    password: "password6cube",
    checkIntervalSeconds: 30,
    logFile: "C:\\Users\\LukeSucks\\SoDoesEBR\\sense_log.log" // filename is relative to project directory, this can also be a path to wherever
}

// If you want to run this as a service, I would recommend you use a package called "forever-service"

// 0) rename to config.js, fill in credentials
// 1) (sudo) npm i -g forever
// 2) (sudo) npm i -g forever-service
// 3) in the senselogger project directory, run (sudo) forever-service install sense-logger
// 4) Start the service like a regular systemd service (sudo) systemctl start sense-logger
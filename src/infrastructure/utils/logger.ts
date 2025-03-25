import winston from "winston";

// winston log for logging different format messages.

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`; // Format output
    })
  ),

  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Store errors
    new winston.transports.File({ filename: "logs/warn.log", level: "warn" }), // Store warnings
    new winston.transports.File({
      filename: "logs/debug.log",
      level: "debug",
    }), // Store info
    new winston.transports.File({ filename: "logs/info.log", level: "info" }), // Store info
    new winston.transports.File({ filename: "logs/combined.log" }), // Store all logs
  ],
});

export default logger;

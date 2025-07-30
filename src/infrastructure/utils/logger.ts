import winston from "winston";

// Helper function to safely stringify objects
const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
};

// Custom format for structured logging
const customFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    let formattedMessage = `[${timestamp}] ${level}: ${message}`;

    // Add metadata if it exists
    if (Object.keys(meta).length > 0) {
      formattedMessage += `\n${safeStringify(meta)}`;
    }

    return formattedMessage;
  }
);

// File format without colors for clean file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // Include stack traces
  customFormat
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize(),
  winston.format.errors({ stack: true }), // Include stack traces
  customFormat
);

// Winston logger configuration
const logger = winston.createLogger({
  level: "debug", // Set to debug to capture all levels
  format: fileFormat, // Default format for file transports
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: consoleFormat,
      level: "info", // Only show info and above in console
    }),

    // Error logs - only errors
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),

    // Warning logs - warnings and errors
    new winston.transports.File({
      filename: "logs/warn.log",
      level: "warn",
      format: fileFormat,
    }),

    // Info logs - info, warnings, and errors
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
      format: fileFormat,
    }),

    // Debug logs - all levels
    new winston.transports.File({
      filename: "logs/debug.log",
      level: "debug",
      format: fileFormat,
    }),

    // Combined logs - all levels with rotation
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Keep 5 rotated files
    }),
  ],
});

// Add error handling for the logger itself
logger.on("error", (error) => {
  console.error("Logger error:", error);
});

// Helper methods for better logging experience
const loggerWithHelpers = {
  ...logger,

  // Enhanced info logging
  info: (message: any, meta?: any) => {
    logger.info(message, meta || {});
  },

  // Enhanced debug logging
  debug: (message: any, meta?: any) => {
    logger.debug(message, meta || {});
  },

  // Enhanced warn logging
  warn: (message: any, meta?: any) => {
    logger.warn(message, meta || {});
  },

  // Enhanced error logging
  error: (message: any, meta?: any) => {
    logger.error(message, meta || {});
  },

  // Specialized method for function entry/exit
  trace: (functionName: any, phase: "ENTER" | "EXIT", meta?: any) => {
    logger.debug(`${functionName} - ${phase}`, meta || {});
  },

  // Specialized method for performance tracking
  perf: (operation: any, duration: number, meta?: any) => {
    logger.info(`PERF: ${operation} completed in ${duration}ms`, meta || {});
  },

  // Specialized method for database operations
  db: (operation: any, meta?: any) => {
    logger.debug(`DB: ${operation}`, meta || {});
  },

  // Specialized method for validation
  validation: (type: "SUCCESS" | "FAILED", field: string, meta?: any) => {
    const level = type === "SUCCESS" ? "debug" : "warn";
    logger[level](`VALIDATION ${type}: ${field}`, meta || {});
  },
};

export default loggerWithHelpers;

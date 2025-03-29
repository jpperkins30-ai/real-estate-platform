/**
 * Fixed logger implementation for compatibility
 */
import winston from 'winston';

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:ms'
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Define error logging function
const logError = (message: string, error?: Error): void => {
  logger.error(`${message}${error ? ': ' + error.message : ''}`);
  if (error?.stack) {
    logger.error(error.stack);
  }
};

// Define info logging function for consistency
const logInfo = (message: string, meta?: any): void => {
  logger.info(message);
};

// Define debug logging function for consistency
const logDebug = (message: string, meta?: any): void => {
  logger.debug(message);
};

// Define warn logging function for consistency
const logWarn = (message: string, meta?: any): void => {
  logger.warn(message);
};

// Define HTTP request logging format
const httpLogFormat = winston.format.printf(info => {
  const { timestamp, level, message, method, url, status, responseTime } = info;
  return `${timestamp} ${level}: ${method} ${url} ${status} ${responseTime}ms - ${message}`;
});

// Export logger and functions
export { logger, logError, logInfo, logDebug, logWarn, httpLogFormat };

// Also export as default for convenience
export default logger;

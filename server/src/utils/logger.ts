import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config';

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.logging.level);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'real-estate-platform' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    }),
  ],
});

// If we're not in production, log to the console as well
if (config.server.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Export a default logger instance
export default logger;

// Export helper functions
export const logError = (message: string, error: any, meta: any = {}) => {
  logger.error(message, {
    error: error instanceof Error ? { 
      message: error.message, 
      stack: error.stack 
    } : error,
    ...meta
  });
};

export const logInfo = (message: string, meta: any = {}) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta: any = {}) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta: any = {}) => {
  logger.debug(message, meta);
}; 
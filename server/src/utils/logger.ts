/**
 * Logger utility for application-wide logging
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config';

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.logging.level);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// HTTP logging format for expressWinston
export const httpLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Define transports
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),
  new winston.transports.File({ filename: path.join(logDir, 'all.log') }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
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
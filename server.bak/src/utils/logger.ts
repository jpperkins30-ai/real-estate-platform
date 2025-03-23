import winston from 'winston';
import { format } from 'winston';

// Create custom format
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
  })
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
  exitOnError: false
});

// Create a stream object for Morgan integration
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
}; 
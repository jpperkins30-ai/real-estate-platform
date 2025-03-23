import expressWinston from 'express-winston';
import winston from 'winston';
import { Request, Response } from 'express';
import logger, { httpLogFormat } from '../utils/logger';

// Custom tokenizer function to mask sensitive data
const maskSensitiveData = (req: Request): any => {
  const masked = { ...req.body };
  
  // Mask password fields
  if (masked.password) {
    masked.password = '********';
  }
  if (masked.newPassword) {
    masked.newPassword = '********';
  }
  if (masked.confirmPassword) {
    masked.confirmPassword = '********';
  }

  // Mask token fields
  if (masked.token) {
    masked.token = '********';
  }
  
  return masked;
};

// Request logging middleware
export const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  format: httpLogFormat,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,
  colorize: false,
  requestFilter: (req: Request, propName: string) => {
    if (propName === 'body') {
      return maskSensitiveData(req);
    }
    return req[propName as keyof Request];
  },
  // Skip logging for static assets and health checks
  ignoredRoutes: ['/public', '/assets', '/health', '/favicon.ico'],
  // Skip logging for successful static file requests
  skip: (req: Request, res: Response) => {
    return req.url.startsWith('/public/') && res.statusCode < 400;
  },
});

// Error logging middleware - logs errors with full stack traces
export const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  format: httpLogFormat,
  meta: true,
  msg: 'HTTP Error {{err.message}}',
  // Custom log level function based on response status code
  level: (req, res) => res.statusCode >= 500 ? 'error' : 'warn'
});

export default { requestLogger, errorLogger }; 
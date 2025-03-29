import expressWinston from 'express-winston';
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import logger, { logInfo, logError, logWarn } from '../utils/logger';

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

// Define an interface for our log metadata to fix TypeScript errors
interface LogMetadata {
  statusCode?: number;
  method?: string;
  url?: string;
  duration?: number;
  userAgent?: string;
  stack?: string;
  error?: string;
}

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.get('user-agent') || 'unknown';
    
    // Format: METHOD URL StatusCode Duration ms
    const message = `${method} ${url} ${statusCode} - ${duration}ms - ${userAgent}`;
    
    // Log based on status code
    if (statusCode >= 500) {
      // For server errors, create an Error object
      const err = new Error(`Server error: ${statusCode}`);
      logError(message, err);
    } else if (statusCode >= 400) {
      logWarn(message);
    } else {
      logInfo(message);
    }
  });
  
  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errorInfo = `Error processing request: ${req.method} ${req.originalUrl} - ${message}`;
  
  // Log the error with the correct signature
  logError(errorInfo, err);
  
  res.status(statusCode).json({
    status: 'error',
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default { requestLogger, errorLogger }; 
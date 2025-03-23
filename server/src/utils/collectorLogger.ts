import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Ensure log directories exist
const categories = ['collection', 'transformation', 'api', 'database', 'system'];
categories.forEach(category => {
  const logDir = path.join(process.cwd(), 'logs', category);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
});

class Logger {
  private loggers: Record<string, winston.Logger>;
  
  constructor() {
    this.loggers = {};
    
    // Create loggers for each category
    categories.forEach(category => {
      this.loggers[category] = this.createLogger(category);
    });
  }
  
  private createLogger(category: string): winston.Logger {
    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { category },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: path.join(process.cwd(), 'logs', category, 'error.log'), 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: path.join(process.cwd(), 'logs', category, 'combined.log')
        })
      ]
    });
  }
  
  info(category: string, message: string, meta?: any): void {
    if (!this.loggers[category]) {
      this.loggers['system'].warn(`Logger for category "${category}" not found, using system logger`);
      this.loggers['system'].info(message, meta);
      return;
    }
    this.loggers[category].info(message, meta);
  }
  
  error(category: string, message: string, error?: any): void {
    if (!this.loggers[category]) {
      this.loggers['system'].warn(`Logger for category "${category}" not found, using system logger`);
      this.loggers['system'].error(message, { error });
      return;
    }
    this.loggers[category].error(message, { error });
  }
  
  warn(category: string, message: string, meta?: any): void {
    if (!this.loggers[category]) {
      this.loggers['system'].warn(`Logger for category "${category}" not found, using system logger`);
      this.loggers['system'].warn(message, meta);
      return;
    }
    this.loggers[category].warn(message, meta);
  }
  
  debug(category: string, message: string, meta?: any): void {
    if (!this.loggers[category]) {
      this.loggers['system'].warn(`Logger for category "${category}" not found, using system logger`);
      this.loggers['system'].debug(message, meta);
      return;
    }
    this.loggers[category].debug(message, meta);
  }
}

export const logger = new Logger(); 
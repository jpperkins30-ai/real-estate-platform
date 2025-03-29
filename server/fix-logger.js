/**
 * Fix logger issue in the codebase
 * 
 * This script:
 * 1. Reads the logger.ts file
 * 2. Verifies the exports match what's being imported in index.ts
 * 3. Creates a simple wrapper for logger functions if needed
 */

const fs = require('fs');
const path = require('path');

// Define file paths
const loggerFile = path.join(__dirname, 'src', 'utils', 'logger.ts');
const indexFile = path.join(__dirname, 'src', 'index.ts');
const tempLoggerFile = path.join(__dirname, 'src', 'utils', 'temp-logger.ts');

console.log('Checking logger.ts implementation...');

// Read the logger file
fs.readFile(loggerFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading logger.ts file:', err);
    process.exit(1);
  }

  // Check if required exports exist
  const hasNamedExports = data.includes('export const logError');
  const hasDefaultExport = data.includes('export default logger');
  
  console.log('Logger file analysis:');
  console.log('- Named exports (logError, etc.):', hasNamedExports ? 'YES' : 'NO');
  console.log('- Default export (logger):', hasDefaultExport ? 'YES' : 'NO');
  
  if (hasNamedExports && hasDefaultExport) {
    console.log('Logger exports look correct. Let\'s check the import in index.ts');
    
    // Read index.ts to check import statement
    fs.readFile(indexFile, 'utf8', (err, indexContent) => {
      if (err) {
        console.error('Error reading index.ts file:', err);
        return;
      }
      
      // Check how logError is imported
      const importLine = indexContent.split('\n')
        .find(line => line.includes('import') && line.includes('logger') && line.includes('logError'));
      
      if (importLine) {
        console.log('Import line found:', importLine);
        
        // Create a wrapper logger module that ensures compatibility
        const wrapperContent = `/**
 * Logger wrapper to ensure compatibility
 * This is a temporary fix that wraps the original logger
 */

import originalLogger from './logger.original';

// Export the original logger as default
const logger = originalLogger;

// Explicitly define all exported functions to ensure they're available
export const logInfo = (message, meta) => {
  if (typeof originalLogger.info === 'function') {
    return originalLogger.info(message, meta);
  }
};

export const logError = (message, error) => {
  if (typeof originalLogger.error === 'function') {
    if (error instanceof Error) {
      return originalLogger.error(\`\${message}: \${error.message}\`, { stack: error.stack });
    } else {
      return originalLogger.error(message, error);
    }
  }
};

export const logWarn = (message, meta) => {
  if (typeof originalLogger.warn === 'function') {
    return originalLogger.warn(message, meta);
  }
};

export const logDebug = (message, meta) => {
  if (typeof originalLogger.debug === 'function') {
    return originalLogger.debug(message, meta);
  }
};

// Make sure all functions are attached to the default export as well
logger.logInfo = logInfo;
logger.logError = logError;
logger.logWarn = logWarn;
logger.logDebug = logDebug;

export default logger;
`;

        // Create a directory for original files if it doesn't exist
        const origDir = path.join(__dirname, 'src', 'utils', 'originals');
        if (!fs.existsSync(origDir)) {
          fs.mkdirSync(origDir, { recursive: true });
        }
        
        // Backup the original logger
        fs.copyFileSync(loggerFile, path.join(origDir, 'logger.original.ts'));
        console.log('Original logger backed up to', path.join(origDir, 'logger.original.ts'));
        
        // Create the wrapper module
        fs.writeFileSync(tempLoggerFile, wrapperContent, 'utf8');
        console.log('Temporary logger wrapper created at', tempLoggerFile);
        
        console.log('Next steps:');
        console.log('1. Rename the original logger.ts to logger.original.ts');
        console.log('   Run: mv src/utils/logger.ts src/utils/logger.original.ts');
        console.log('2. Rename the temporary logger to logger.ts');
        console.log('   Run: mv src/utils/temp-logger.ts src/utils/logger.ts');
        console.log('3. Run the server with our batch file');
        console.log('   Run: ./run-server.bat');
      } else {
        console.log('Could not find the import line for logger in index.ts');
      }
    });
  } else {
    console.log('Logger file might be missing required exports. Creating a fix...');
    
    // Create a fixed version of the logger that ensures all exports are correct
    const fixedLogger = `/**
 * Fixed logger utility that ensures all exports are available
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config';

// Create logs directory if it doesn't exist
const logDir = config.logging.directory || 'logs';
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
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return \`\${timestamp} \${level}: \${message}\`;
});

// HTTP logging format for expressWinston
export const httpLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: config.logging?.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:ms'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'real-estate-api' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'all.log')
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Export helper functions with proper typing
export const logInfo = (message: string, meta?: any): void => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: any): void => {
  if (error instanceof Error) {
    logger.error(\`\${message}: \${error.message}\`, { stack: error.stack });
  } else {
    logger.error(message, error);
  }
};

export const logWarn = (message: string, meta?: any): void => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any): void => {
  logger.debug(message, meta);
};

// Ensure these functions are also available on the logger object
logger.logInfo = logInfo;
logger.logError = logError;
logger.logWarn = logWarn;
logger.logDebug = logDebug;

export default logger;
`;

    // Backup the original logger
    const origDir = path.join(__dirname, 'src', 'utils', 'originals');
    if (!fs.existsSync(origDir)) {
      fs.mkdirSync(origDir, { recursive: true });
    }
    
    fs.copyFileSync(loggerFile, path.join(origDir, 'logger.original.ts'));
    console.log('Original logger backed up to', path.join(origDir, 'logger.original.ts'));
    
    // Write the fixed logger
    fs.writeFileSync(loggerFile, fixedLogger, 'utf8');
    console.log('Logger file has been updated with the fixed version.');
    console.log('You can now run the server with: ./run-server.bat');
  }
}); 
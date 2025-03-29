/**
 * Comprehensive fix for server startup issues
 * 
 * This script:
 * 1. Patches the index.ts file to modify how logError is used
 * 2. Creates a completely compatible logger implementation
 */

const fs = require('fs');
const path = require('path');

// Define file paths
const indexFile = path.join(__dirname, 'src', 'index.ts');
const loggerFile = path.join(__dirname, 'src', 'utils', 'logger.ts');
const backupDir = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('Creating backups of original files...');
// Create timestamps for backup files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const indexBackup = path.join(backupDir, `index.ts.${timestamp}.bak`);
const loggerBackup = path.join(backupDir, `logger.ts.${timestamp}.bak`);

// Backup files
fs.copyFileSync(indexFile, indexBackup);
fs.copyFileSync(loggerFile, loggerBackup);
console.log(`Index.ts backed up to: ${indexBackup}`);
console.log(`Logger.ts backed up to: ${loggerBackup}`);

// First, fix the logger implementation
console.log('\nFixing logger.ts implementation...');
const fixedLogger = `/**
 * Fixed logger implementation for compatibility
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create the winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:SSS'
    }),
    winston.format.errors({ stack: true }),
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

// Explicitly declare all required functions as named exports
export function logInfo(message, meta) {
  logger.info(message, meta);
}

export function logError(message, error) {
  if (error instanceof Error) {
    logger.error(\`\${message}: \${error.message}\`, { stack: error.stack });
  } else {
    logger.error(message, error);
  }
}

export function logWarn(message, meta) {
  logger.warn(message, meta);
}

export function logDebug(message, meta) {
  logger.debug(message, meta);
}

// Export HTTP format for Winston Express middleware if needed
export const httpLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Export the logger as default
export default logger;
`;

// Write the fixed logger
fs.writeFileSync(loggerFile, fixedLogger, 'utf8');
console.log('Logger implementation fixed.');

// Now, fix the index.ts file
console.log('\nReading index.ts file...');
const indexContent = fs.readFileSync(indexFile, 'utf8');

// Find the problematic logError call
console.log('Fixing index.ts imports and calls...');
let updatedIndexContent = indexContent;

// Replace the import statement to ensure proper imports
const oldImport = "import logger, { logInfo, logError, logDebug } from './utils/logger';";
const newImport = "import logger from './utils/logger';\nimport { logInfo, logError, logDebug } from './utils/logger';";
updatedIndexContent = updatedIndexContent.replace(oldImport, newImport);

// Fix the problematic call
const errorHandlerPattern = /\.catch\(\(error\)\s*=>\s*\{\s*logError\('MongoDB connection error:',\s*error\);/;
const fixedErrorHandler = `.catch((error) => {
    // Fixed error handling
    console.error('MongoDB connection error:', error);
    logger.error('MongoDB connection error:', error);
    process.exit(1);`;
    
updatedIndexContent = updatedIndexContent.replace(errorHandlerPattern, fixedErrorHandler);

// Write the updated index.ts file
fs.writeFileSync(indexFile, updatedIndexContent, 'utf8');
console.log('Index.ts file updated.');

// Create a batch file to start the server
console.log('\nCreating startup batch file...');
const batchContent = `@echo off
echo Starting server with patched files...

REM Set environment variables
set JWT_SECRET=patched-jwt-secret-for-development-only
set PORT=4000
set NODE_ENV=development
set MONGODB_URI=mongodb://localhost:27017/real-estate-platform

REM Display current settings
echo Environment variables:
echo - JWT_SECRET: [SET]
echo - PORT: %PORT%
echo - NODE_ENV: %NODE_ENV%
echo - MONGODB_URI: %MONGODB_URI%

REM Start the server
echo.
echo Starting server with ts-node...
npx ts-node -r tsconfig-paths/register --project tsconfig.json src/index.ts

pause
`;

fs.writeFileSync(path.join(__dirname, 'start-patched.bat'), batchContent, 'utf8');
console.log('Created start-patched.bat');

console.log('\nAll fixes have been applied!');
console.log('To start the server, run:');
console.log('  ./start-patched.bat');
console.log('\nThese fixes should resolve the logError function issue by:');
console.log('1. Creating a logger with proper function exports');
console.log('2. Fixing how these functions are imported in index.ts');
console.log('3. Replacing the problematic logError call with direct logger usage');
console.log('4. Setting the JWT_SECRET environment variable'); 
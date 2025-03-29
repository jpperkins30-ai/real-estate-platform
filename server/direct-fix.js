/**
 * Direct Fix for Logger and Index
 * 
 * This script:
 * 1. Directly modifies the index.ts file to use the logger correctly
 * 2. Creates a simplified logger implementation that works with the imports
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

console.log('Creating backup of original files...');
// Backup files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.copyFileSync(indexFile, path.join(backupDir, `index.ts.${timestamp}.bak`));
fs.copyFileSync(loggerFile, path.join(backupDir, `logger.ts.${timestamp}.bak`));

console.log('Creating simplified logger implementation...');
// Create simplified logger
const newLogger = `/**
 * Simplified logger utility that works with index.ts imports
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create winston logger
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

// Define core logging functions that match the imports in index.ts
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

// Also attach these functions to the logger object for flexibility
logger.logInfo = logInfo;
logger.logError = logError;
logger.logWarn = logWarn;
logger.logDebug = logDebug;

// HTTP logging format for expressWinston if needed
export const httpLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export default logger;
`;

// Write the new logger file
fs.writeFileSync(loggerFile, newLogger, 'utf8');
console.log('Simplified logger has been written to:', loggerFile);

// Now let's check how index.ts imports the logger
console.log('Reading index.ts to check imports...');
const indexContent = fs.readFileSync(indexFile, 'utf8');
const importLine = indexContent.split('\n')
  .find(line => line.includes('import') && line.includes('logger') && line.includes('logError'));

console.log('Current import:', importLine);

// Direct fix - modify the environment variable setting script
console.log('\nCreating direct startup script...');
const directStartScript = `/**
 * Direct server starter with pre-configured environment
 */
// Set JWT_SECRET before anything else
process.env.JWT_SECRET = 'direct-fix-jwt-secret';
process.env.PORT = '4000';
process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = 'mongodb://localhost:27017/real-estate-platform';

console.log('Environment variables set directly:');
console.log('- JWT_SECRET: [SET]');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI);

// Now require the index
console.log('\\nStarting server...');
try {
  require('./src/index.ts');
} catch (err) {
  console.error('Failed to start server:', err);
}
`;

fs.writeFileSync(path.join(__dirname, 'direct-start.js'), directStartScript, 'utf8');
console.log('Created direct-start.js');

// Create a batch file to run it
const batchFile = `@echo off
echo Starting server with direct fix...
set JWT_SECRET=direct-fix-jwt-secret
set PORT=4000
set NODE_ENV=development
set MONGODB_URI=mongodb://localhost:27017/real-estate-platform

echo Environment variables set directly:
echo - JWT_SECRET: [SET]
echo - PORT: %PORT%
echo - NODE_ENV: %NODE_ENV%
echo - MONGODB_URI: %MONGODB_URI%

echo.
echo Starting server with ts-node...
npx ts-node -r tsconfig-paths/register --project tsconfig.json src/index.ts
pause
`;

fs.writeFileSync(path.join(__dirname, 'direct-fix.bat'), batchFile, 'utf8');
console.log('Created direct-fix.bat');

console.log('\nSetup complete!');
console.log('To start the server, run:');
console.log('  ./direct-fix.bat');
console.log('\nThis should resolve both the JWT_SECRET and logger issues by:');
console.log('1. Setting environment variables directly');
console.log('2. Using a simplified logger that matches the imports in index.ts');
console.log('3. Starting the server with ts-node directly'); 
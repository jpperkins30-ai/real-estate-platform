/**
 * Fix TypeScript import/transpilation issues
 * 
 * This script:
 * 1. Fixes how logger functions are imported in index.ts
 * 2. Replaces problematic destructuring import with individual imports
 * 3. Replaces instances of logError function calls with logger.error
 */

const fs = require('fs');
const path = require('path');

// Define file paths
const indexFile = path.join(__dirname, 'src', 'index.ts');
const backupDir = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log('Creating backup of index.ts...');
// Create timestamp for backup file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const indexBackup = path.join(backupDir, `index.ts.${timestamp}.bak`);

// Backup the index file
fs.copyFileSync(indexFile, indexBackup);
console.log(`Index.ts backed up to: ${indexBackup}`);

// Read the index.ts file
console.log('\nReading index.ts file...');
const indexContent = fs.readFileSync(indexFile, 'utf8');

// Find the problematic import line
console.log('Fixing problematic imports...');
let updatedContent = indexContent;

// Replace the destructured import with a simple import of the logger object
const importPattern = /import\s+logger,\s*{\s*logInfo,\s*logError,\s*logDebug\s*}\s*from\s*'\.\/utils\/logger';/;
const newImport = "import logger from './utils/logger';";
updatedContent = updatedContent.replace(importPattern, newImport);

// Replace all logInfo, logError, and logDebug function calls with logger.info, logger.error, and logger.debug
console.log('Replacing function calls with direct logger methods...');

// Replace logInfo calls
updatedContent = updatedContent.replace(/logInfo\(/g, 'logger.info(');

// Replace logError calls
updatedContent = updatedContent.replace(/logError\(/g, 'logger.error(');

// Replace logDebug calls
updatedContent = updatedContent.replace(/logDebug\(/g, 'logger.debug(');

// Write the updated file
fs.writeFileSync(indexFile, updatedContent, 'utf8');
console.log('Successfully updated index.ts with fixed imports!');

// Create a startup batch file
console.log('\nCreating startup batch file...');
const batchContent = `@echo off
echo Starting server with fixed imports...

REM Set environment variables
set JWT_SECRET=fixed-jwt-secret-for-development-only
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

fs.writeFileSync(path.join(__dirname, 'start-fixed.bat'), batchContent, 'utf8');
console.log('Created start-fixed.bat');

console.log('\nFix applied!');
console.log('To start the server, run:');
console.log('  ./start-fixed.bat');
console.log('\nThis fix resolves the logError function issue by:');
console.log('1. Importing logger as a single object instead of destructuring imports');
console.log('2. Replacing function calls with direct logger method calls');
console.log('3. Setting the JWT_SECRET environment variable'); 
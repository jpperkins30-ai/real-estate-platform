/**
 * Simple server starter with JWT_SECRET environment variable
 * 
 * Usage: node simple-start.js
 */

require('dotenv').config();

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Display header
console.log(`${colors.cyan}=== Real Estate Platform Server ====${colors.reset}`);
console.log(`${colors.cyan}Starting server with environment variables${colors.reset}`);

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.log(`${colors.red}ERROR: JWT_SECRET is not set in .env file${colors.reset}`);
  console.log(`${colors.yellow}Setting a default JWT_SECRET for development${colors.reset}`);
  
  // Set JWT_SECRET manually - only for development purposes
  process.env.JWT_SECRET = 'real-estate-platform-secret-key-development-only-change-in-production';
} else {
  console.log(`${colors.green}JWT_SECRET is set properly${colors.reset}`);
}

// Display environment configuration
console.log(`\n${colors.cyan}Environment configuration:${colors.reset}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
console.log(`- MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'}`);
console.log(`- PORT: ${process.env.PORT || 4000}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Get path to ts-node script
const path = require('path');
const fs = require('fs');

console.log(`\n${colors.cyan}Starting server directly...${colors.reset}`);

// Import src/index.ts directly to avoid npm/npx
console.log('Loading server from src/index.ts...');

try {
  require('ts-node/register');
  require('./src/index.ts');
} catch (error) {
  console.error(`${colors.red}Error starting server:${colors.reset}`, error);
} 
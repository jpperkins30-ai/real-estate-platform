/**
 * Environment variables helper script
 * This script verifies that critical environment variables are set
 */

// Load environment variables from .env file
require('dotenv').config();

// Verify JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('\x1b[31mERROR: JWT_SECRET environment variable is not set!\x1b[0m');
  console.error('This is a security risk. Please set it in your .env file.');
  process.exit(1);
}

// Log successful environment loading
console.log('\x1b[32m✓ Environment variables loaded successfully\x1b[0m');
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'}`);
console.log(`PORT: ${process.env.PORT || 4000}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Success - server will continue to start
console.log('\x1b[32m✓ Server is ready to start\x1b[0m');

// This script doesn't need to do anything else since environment variables are now loaded 
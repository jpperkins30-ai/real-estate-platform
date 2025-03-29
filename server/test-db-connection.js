/**
 * Simple test script for database connection and logger
 */

// Load environment variables
require('dotenv').config({ path: './.env' });
console.log('Starting database connection test...');

// Set JWT secret for development if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'development-jwt-secret';
  console.log('Development JWT_SECRET has been set');
}

// Display environment variables for debugging
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT || '(using default)');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');

// Use ts-node with tsconfig-paths to properly handle path aliases
require('ts-node').register({
  transpileOnly: true,
  project: './tsconfig.json',
});

// Need to register tsconfig-paths after ts-node
require('tsconfig-paths').register({
  baseUrl: '.',
  paths: { '@/*': ['src/*'] }
});

// Import the database connection module
const { connectDB } = require('./src/config/database');

// Connect to the database
connectDB()
  .then(() => {
    console.log('Database connection test completed successfully!');
    console.log('Press Ctrl+C to exit');
  })
  .catch(err => {
    console.error('Database connection test failed:', err);
    process.exit(1);
  }); 
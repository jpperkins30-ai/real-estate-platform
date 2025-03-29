/**
 * Server Starter with Environment Variables
 * 
 * This script sets the required environment variables and starts the server.
 * It properly handles the JWT_SECRET variable even if it's not in the .env file.
 */

// First, load environment variables from .env file
require('dotenv').config();

// Check if JWT_SECRET is set, if not, set it
if (!process.env.JWT_SECRET) {
  console.log('\x1b[33m%s\x1b[0m', 'WARNING: JWT_SECRET not found in environment. Setting a development value.');
  process.env.JWT_SECRET = 'development-jwt-secret-do-not-use-in-production';
}

// Log the environment configuration
console.log('\nEnvironment configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- PORT:', process.env.PORT || '4000');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '[Set]' : '[Not Set]');
console.log('- JWT_SECRET:', '[Set]');

// Other env variables that might be needed
if (!process.env.PORT) {
  process.env.PORT = 4000;
}

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/real-estate-platform';
}

console.log('\nStarting server with proper environment variables...');

// Choose the appropriate method to start the server based on your needs
// Option 1: using ts-node (if TypeScript)
try {
  // First try ts-node for TypeScript
  console.log('Attempting to start with ts-node...');
  require('child_process').spawn(
    'npx', 
    ['ts-node', '--transpile-only', 'src/index.ts'], 
    { 
      stdio: 'inherit',
      env: process.env,
      shell: true
    }
  );
} catch (error) {
  // Fallback to node (if JavaScript)
  console.error('ts-node failed, falling back to node:', error.message);
  try {
    console.log('Attempting to start with node...');
    require('./src/index');
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
} 
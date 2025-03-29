/**
 * Clean server starter
 * 
 * This script:
 * 1. Sets necessary environment variables
 * 2. Starts the server directly without modifying files
 */

// Set required environment variables
process.env.JWT_SECRET = 'secure-jwt-secret-for-development-only';
process.env.PORT = process.env.PORT || '4000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Log the environment configuration
console.log('Environment variables set:');
console.log('- JWT_SECRET: [SET]');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI);

// Start the server directly with ts-node
const { spawn } = require('child_process');

console.log('\nStarting server...');

// Use ts-node to run the TypeScript code directly
const serverProcess = spawn('npx', [
  'ts-node',
  '-r', 'tsconfig-paths/register',
  '--project', 'tsconfig.json',
  'src/index.ts'
], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// Handle process events
serverProcess.on('close', (code) => {
  console.log(`\nServer process exited with code ${code}`);
});

// Forward SIGINT (Ctrl+C) to the child process
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT (Ctrl+C). Shutting down...');
  serverProcess.kill('SIGINT');
}); 
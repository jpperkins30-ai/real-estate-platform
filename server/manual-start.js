/**
 * Manual startup script with explicit environment variable setting
 * 
 * Usage: node manual-start.js
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Explicitly set JWT_SECRET if not already set
if (!process.env.JWT_SECRET) {
  console.log('Setting JWT_SECRET environment variable...');
  process.env.JWT_SECRET = 'real-estate-platform-secret-key-development-only-change-in-production';
}

// Log environment configuration
console.log('Environment configuration:');
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
console.log(`- MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'}`);
console.log(`- PORT: ${process.env.PORT || 4000}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Run ts-node directly with the index file
console.log('\nStarting server with ts-node...');
const tsNode = spawn('npx', ['ts-node', 'src/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Explicitly ensure JWT_SECRET is set in the environment
    JWT_SECRET: process.env.JWT_SECRET
  }
});

// Handle process events
tsNode.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  tsNode.kill();
  process.exit(0);
}); 
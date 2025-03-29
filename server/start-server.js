/**
 * Script to start the server with proper environment setup
 * 
 * Usage: node start-server.js
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check for .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env file not found');
  console.error('Please create a .env file in the server directory');
  process.exit(1);
}

// Verify JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in .env file');
  process.exit(1);
}

console.log('Environment configuration:');
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
console.log(`- MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'}`);
console.log(`- PORT: ${process.env.PORT || 4000}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Start server using npm run dev
console.log('\nStarting server with npm run dev...');
const npm = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Ensure JWT_SECRET is explicitly set in the environment
    JWT_SECRET: process.env.JWT_SECRET,
    // Explicitly ensure other important env vars
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform',
    PORT: process.env.PORT || '4000',
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

// Handle process events
npm.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  npm.kill();
  process.exit(0);
}); 
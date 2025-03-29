/**
 * Script to kill any process running on port 4000 and start the server
 * 
 * Usage: node kill-and-start.js
 */

require('dotenv').config();
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Check if .env file exists
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

// Kill processes on port 4000
console.log('\nChecking for processes on port 4000...');
const PORT = process.env.PORT || 4000;

try {
  let command;
  if (os.platform() === 'win32') {
    // Windows command to find and kill process on port 4000
    console.log('Detecting Windows platform, using netstat and taskkill...');
    
    // Find PID using the port
    const findPid = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf-8' });
    
    if (findPid && findPid.trim()) {
      console.log(`Found process using port ${PORT}. Attempting to kill...`);
      
      // Extract PID from netstat output
      // The format is typically: TCP    127.0.0.1:4000    0.0.0.0:0    LISTENING    1234
      const lines = findPid.split('\n');
      const pidSet = new Set();
      
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(Number(pid))) {
              pidSet.add(pid);
            }
          }
        }
      }
      
      // Kill each PID found
      for (const pid of pidSet) {
        try {
          console.log(`Killing process with PID ${pid}...`);
          execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf-8' });
          console.log(`Successfully killed process ${pid}`);
        } catch (killError) {
          console.log(`Failed to kill process ${pid}: ${killError.message}`);
        }
      }
    } else {
      console.log(`No process found using port ${PORT}`);
    }
  } else {
    // Unix-based command (Mac, Linux)
    console.log('Detecting Unix-based platform, using lsof and kill...');
    
    try {
      const findPid = execSync(`lsof -i :${PORT} -t`, { encoding: 'utf-8' }).trim();
      
      if (findPid) {
        console.log(`Found process using port ${PORT}. Attempting to kill...`);
        execSync(`kill -9 ${findPid}`, { encoding: 'utf-8' });
        console.log(`Successfully killed process ${findPid}`);
      } else {
        console.log(`No process found using port ${PORT}`);
      }
    } catch (error) {
      // If no process is found, lsof will exit with non-zero code
      console.log(`No process found using port ${PORT}`);
    }
  }
  
  console.log(`Port ${PORT} is now available.`);
} catch (error) {
  console.error(`Error checking/killing processes: ${error.message}`);
  // Continue anyway, as the port might still be available
}

// Start server using npm run dev
console.log('\nStarting server with npm run dev...');

// Explicitly set environment variables before running the server
process.env.JWT_SECRET = process.env.JWT_SECRET;
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
process.env.PORT = process.env.PORT || '4000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const npm = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: process.env
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
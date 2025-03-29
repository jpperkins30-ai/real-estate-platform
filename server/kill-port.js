/**
 * Script to kill any process running on port 4000
 * 
 * Usage: node kill-port.js [port]
 */

const { execSync } = require('child_process');
const os = require('os');

// Get port from command line argument or use default 4000
const PORT = process.argv[2] || 4000;

console.log(`Attempting to kill processes on port ${PORT}...`);

try {
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
} 
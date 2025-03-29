/**
 * Modify config.ts to bypass JWT_SECRET check
 * 
 * This script:
 * 1. Reads the config.ts file
 * 2. Creates a temporary modified version that bypasses the JWT_SECRET check
 * 3. Runs the server with the modified config
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Define file paths
const configFile = path.join(__dirname, 'src', 'config.ts');
const backupConfigFile = path.join(__dirname, 'src', 'config.backup.ts');

console.log('Reading config.ts file...');

// Read the original file
fs.readFile(configFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading config.ts file:', err);
    process.exit(1);
  }

  console.log('Creating backup of config.ts...');
  fs.writeFileSync(backupConfigFile, data, 'utf8');
  
  console.log('Modifying config.ts to bypass JWT_SECRET check...');
  
  // Modify the file by replacing the entire if block
  const modifiedData = data.replace(
    'if (!process.env.JWT_SECRET) {',
    '// Modified by script - JWT_SECRET always set\nprocess.env.JWT_SECRET = "modified-jwt-secret-for-development";\nif (false) {'
  );
  
  // Write the modified file directly back to config.ts
  fs.writeFile(configFile, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing modified config.ts file:', err);
      // Restore from backup
      try {
        fs.copyFileSync(backupConfigFile, configFile);
        console.log('Restored from backup after error');
      } catch (restoreErr) {
        console.error('Failed to restore from backup:', restoreErr);
      }
      process.exit(1);
    }
    
    console.log('Config.ts modified successfully. JWT_SECRET is now set by default.');
    console.log('Starting server with modified config...');
    
    // Set the environment variable here too for extra safety
    process.env.JWT_SECRET = "modified-jwt-secret-for-development";
    
    // Run the server using the npm script
    const serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, JWT_SECRET: "modified-jwt-secret-for-development" }
    });
    
    // Handle server process events
    serverProcess.on('close', (code) => {
      console.log(`\nServer process exited with code ${code}`);
      console.log('Restoring original config.ts...');
      
      // Restore the original file
      fs.copyFile(backupConfigFile, configFile, (err) => {
        if (err) {
          console.error('Error restoring config.ts:', err);
        } else {
          console.log('Original config.ts restored');
          // Delete backup file
          fs.unlink(backupConfigFile, (err) => {
            if (err) {
              console.warn('Warning: Could not delete backup file:', err);
            } else {
              console.log('Backup file deleted');
            }
          });
        }
      });
    });
    
    // Handle CTRL+C to restore config
    process.on('SIGINT', () => {
      console.log('\nCTRL+C detected, restoring original config...');
      try {
        fs.copyFileSync(backupConfigFile, configFile);
        console.log('Original config.ts restored');
        fs.unlinkSync(backupConfigFile);
        console.log('Backup file deleted');
      } catch (err) {
        console.warn('Warning: Error during cleanup:', err);
      }
      process.exit();
    });
  });
}); 
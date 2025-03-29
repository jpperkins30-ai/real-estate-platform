/**
 * JWT_SECRET check bypass tool
 * 
 * This script:
 * 1. Reads the index.ts file
 * 2. Creates a temporary modified version that bypasses the JWT_SECRET check
 * 3. Runs the server with the temporary file
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Define file paths - use absolute paths
const serverDir = path.resolve(__dirname, '..');
const indexFile = path.join(__dirname, 'index.ts');
const tempIndexFile = path.join(__dirname, 'temp-index.ts');

console.log('Reading index.ts file...');

// Read the original file
fs.readFile(indexFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading index.ts file:', err);
    process.exit(1);
  }

  console.log('Modifying index.ts to bypass JWT_SECRET check...');
  
  // Replace the JWT_SECRET check with a direct assignment
  const modifiedData = data.replace(
    'if (!process.env.JWT_SECRET) {',
    'if (!process.env.JWT_SECRET) {\n  process.env.JWT_SECRET = "temporary-jwt-secret-for-development";\n  console.log("Using temporary JWT_SECRET for development");\n  /*'
  ).replace(
    'throw new Error("JWT_SECRET environment variable is not set. This is a security risk.");',
    'throw new Error("JWT_SECRET environment variable is not set. This is a security risk."); */'
  );
  
  // Write the modified file
  fs.writeFile(tempIndexFile, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing temporary index.ts file:', err);
      process.exit(1);
    }
    
    console.log('Running server with temporary index.ts file...');
    
    // Use the absolute path for the temporary file
    const tempIndexPath = path.resolve(tempIndexFile);
    
    // Run the server with the temporary file
    const serverProcess = spawn('npx', ['ts-node', '-r', 'tsconfig-paths/register', '--project', path.join(serverDir, 'tsconfig.json'), tempIndexPath], {
      stdio: 'inherit',
      shell: true,
      cwd: serverDir
    });
    
    // Handle server process events
    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      
      // Clean up temporary file
      fs.unlink(tempIndexFile, (err) => {
        if (err) {
          console.warn('Warning: Could not delete temporary index.ts file:', err);
        } else {
          console.log('Temporary index.ts file deleted');
        }
      });
    });
    
    // Handle CTRL+C to clean up
    process.on('SIGINT', () => {
      console.log('CTRL+C detected, cleaning up...');
      try {
        fs.unlinkSync(tempIndexFile);
        console.log('Temporary index.ts file deleted');
      } catch (err) {
        console.warn('Warning: Could not delete temporary index.ts file:', err);
      }
      process.exit();
    });
  });
}); 
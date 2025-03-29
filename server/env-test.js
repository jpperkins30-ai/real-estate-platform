// env-test.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

console.log('Current working directory:', process.cwd());

// Try multiple possible .env file locations
const possiblePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env')
];

let envLoaded = false;

possiblePaths.forEach(envPath => {
  console.log(`Checking for .env file at: ${envPath}`);
  if (fileExists(envPath)) {
    console.log(`Found .env file at: ${envPath}`);
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.log(`Error loading .env file: ${result.error.message}`);
    } else {
      console.log('Successfully loaded .env file');
      envLoaded = true;
      
      // Print content of the .env file (excluding sensitive values)
      const envContent = fs.readFileSync(envPath, 'utf8');
      const sanitizedContent = envContent
        .split('\n')
        .map(line => {
          if (line.includes('SECRET') || line.includes('PASSWORD')) {
            const parts = line.split('=');
            if (parts.length > 1) {
              return `${parts[0]}=[VALUE HIDDEN]`;
            }
          }
          return line;
        })
        .join('\n');
      
      console.log('Content of .env file:');
      console.log(sanitizedContent);
    }
  }
});

if (!envLoaded) {
  console.log('No .env file was found and loaded');
  
  // Create a new .env file in the current directory
  console.log('Creating a new .env file in the current directory');
  const envContent = `
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/real-estate-platform

# Authentication
JWT_SECRET=default-jwt-secret-for-development-only
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=default-refresh-token-secret-for-development
REFRESH_TOKEN_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug
`;

  fs.writeFileSync(path.resolve(process.cwd(), '.env'), envContent);
  console.log('Created new .env file, trying to load it');
  
  const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  if (result.error) {
    console.log(`Error loading new .env file: ${result.error.message}`);
  } else {
    console.log('Successfully loaded new .env file');
    envLoaded = true;
  }
}

// Check if JWT_SECRET is set
console.log('\nEnvironment Variables Status:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
console.log('PORT:', process.env.PORT || '4000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✓' : 'Not set ✗');

// Set JWT_SECRET directly if it's not set
if (!process.env.JWT_SECRET) {
  console.log('\nSetting JWT_SECRET directly in process.env');
  process.env.JWT_SECRET = 'default-jwt-secret-set-programmatically';
  console.log('JWT_SECRET now set:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
} 
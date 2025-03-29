/**
 * Script to fix logError calls in auth.ts
 */
const fs = require('fs');
const path = require('path');

const authFilePath = path.join(__dirname, 'src/routes/auth.ts');

try {
  console.log(`Reading file: ${authFilePath}`);
  let content = fs.readFileSync(authFilePath, 'utf8');
  
  // Fix the logError calls with 3 arguments (message, error, meta)
  content = content.replace(
    /logError\(['"]([^'"]+)['"], (error), {([^}]+)}\)/g, 
    'logError(`$1 - {$3}`, $2)'
  );
  
  // Fix cases with unknown error type
  content = content.replace(
    /logError\(['"]([^'"]+)['"], (error)\)/g,
    'logError(\'$1\', $2 as Error)'
  );
  
  // Fix config.auth references
  content = content.replace(/config\.auth\.jwtSecret/g, 'process.env.JWT_SECRET || config.server.jwtSecret');
  content = content.replace(/config\.auth\.jwtExpiresIn/g, 'config.server.jwtExpiresIn');
  
  console.log('Writing updated content to file');
  fs.writeFileSync(authFilePath, content, 'utf8');
  console.log('File updated successfully');
} catch (error) {
  console.error('Error updating file:', error.message);
  process.exit(1);
} 
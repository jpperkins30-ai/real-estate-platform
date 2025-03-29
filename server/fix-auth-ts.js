/**
 * Comprehensive script to fix auth.ts issues
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
    'logError(`$1 - {$3}`, $2 as Error)'
  );
  
  // Fix cases with unknown error type
  content = content.replace(
    /logError\(['"]([^'"]+)['"], (error)\)/g,
    'logError(\'$1\', $2 as Error)'
  );
  
  // Fix the jwt.sign calls that use config.auth
  const jwtSignRegex = /jwt\.sign\(\s*([^,]+),\s*config\.auth\.jwtSecret,\s*{\s*expiresIn:\s*config\.auth\.jwtExpiresIn\s*}\s*\)/g;
  content = content.replace(
    jwtSignRegex,
    'jwt.sign($1, process.env.JWT_SECRET || \'\', { expiresIn: config.server.jwtExpiresIn || \'1h\' })'
  );
  
  // Similar fix for other jwt.sign calls
  content = content.replace(
    /jwt\.sign\(\s*([^,]+),\s*config\.auth\.jwtSecret/g,
    'jwt.sign($1, process.env.JWT_SECRET || \'\''
  );
  
  // Fix any remaining config.auth references
  content = content.replace(/config\.auth\.jwtSecret/g, '(process.env.JWT_SECRET || \'\')');
  content = content.replace(/config\.auth\.jwtExpiresIn/g, '(config.server.jwtExpiresIn || \'1h\')');
  
  console.log('Writing updated content to file');
  fs.writeFileSync(authFilePath, content, 'utf8');
  console.log('File updated successfully');
} catch (error) {
  console.error('Error updating file:', error.message);
  process.exit(1);
} 
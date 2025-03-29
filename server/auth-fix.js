/**
 * Comprehensive script to fix auth.ts issues
 */
const fs = require('fs');
const path = require('path');

// Path to auth.ts file
const authFilePath = path.join(__dirname, 'src/routes/auth.ts');

try {
  console.log(`Reading auth.ts from: ${authFilePath}`);
  let content = fs.readFileSync(authFilePath, 'utf8');
  
  // 1. Fix the logError calls
  content = content.replace(
    /logError\(['"]([^'"]+)['"], error(?:, [^)]+)?\)/g,
    'logError(\'$1\', error as Error)'
  );
  
  // 2. Add the import for SignOptions from jsonwebtoken
  if (!content.includes('import jwt, { SignOptions }')) {
    content = content.replace(
      /import jwt from ['"]jsonwebtoken['"];/,
      'import jwt, { SignOptions } from \'jsonwebtoken\';'
    );
  }
  
  // 3. Fix jwt.sign calls
  content = content.replace(
    /jwt\.sign\(\s*([^,]+),\s*[^,]+,\s*{\s*expiresIn:[^}]+}\s*\)/g,
    (match, payload) => {
      return `jwt.sign(
    ${payload},
    Buffer.from(process.env.JWT_SECRET || ''),
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as SignOptions
  )`;
    }
  );
  
  // 4. Fix references to user._id in jwt.sign payload
  content = content.replace(
    /jwt\.sign\(\s*{\s*id:\s*user\._id/g,
    'jwt.sign(\n    { id: user._id.toString()'
  );
  
  console.log('Writing updated content to file');
  fs.writeFileSync(authFilePath, content);
  console.log('Auth.ts updated successfully');
} catch (error) {
  console.error('Error processing file:', error);
  process.exit(1);
} 
/**
 * Script to fix logError calls across route files
 */
const fs = require('fs');
const path = require('path');

// Files to process
const filesToFix = [
  path.join(__dirname, 'src/routes/user.ts'),
  path.join(__dirname, 'src/routes/property.routes.ts'),
  path.join(__dirname, 'src/routes/auth.ts'),
  path.join(__dirname, 'src/routes/state.routes.ts'),
  path.join(__dirname, 'src/routes/county.routes.ts'),
  path.join(__dirname, 'src/routes/usmap.routes.ts')
];

// Function to process a file
const processFile = (filePath) => {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix logError with 3 arguments (message, error, metadata)
    content = content.replace(
      /logError\(['"]([^'"]+)['"], (error), {([^}]+)}\)/g,
      (match, message, errorVar, metadata) => {
        return `logError(\`${message} - metadata: {${metadata}}\`, ${errorVar} as Error)`;
      }
    );
    
    // Fix logError with unknown error type
    content = content.replace(
      /logError\(['"]([^'"]+)['"], (error)\)/g,
      'logError(\'$1\', $2 as Error)'
    );
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated logError calls in ${filePath}`);
    } else {
      console.log(`No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
};

// Process all files
console.log('Starting to fix logError calls in routes files...');
filesToFix.forEach(processFile);
console.log('Finished processing files.'); 
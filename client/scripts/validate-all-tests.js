#!/usr/bin/env node

/**
 * validate-all-tests.js
 * 
 * CI/CD script to validate that all test files follow the standardized structure
 */

const fs = require('fs');
const path = require('path');

// Path to tests directory
const TEST_DIR = path.join(process.cwd(), '..', 'src', '__tests__');

// Validation results
const results = {
  total: 0,
  valid: 0,
  errors: []
};

// Validation rules
function isInCorrectDirectory(filePath) {
  const dir = path.dirname(filePath);
  return dir === TEST_DIR;
}

function hasValidNaming(fileName) {
  return /^TC\d+_.+\.test\.(ts|tsx)$/.test(fileName);
}

function hasTestCaseDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8').split('\n')[0];
    return /\/\/ Test Case \d+:/.test(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return false;
  }
}

// Find all test files
function findTestFiles(dir) {
  const allFiles = [];
  
  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverse(filePath);
      } else if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
        allFiles.push(filePath);
      }
    });
  }
  
  traverse(dir);
  return allFiles;
}

// Main validation function
function validateTests() {
  console.log('Validating all test files...');
  
  let testFiles;
  try {
    testFiles = findTestFiles(TEST_DIR);
  } catch (error) {
    console.error(`Error finding test files: ${error.message}`);
    process.exit(1);
  }
  
  console.log(`Found ${testFiles.length} test files`);
  results.total = testFiles.length;
  
  // Process each file
  testFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    const errors = [];
    
    // Check if file is directly in the test directory
    if (!isInCorrectDirectory(filePath)) {
      errors.push(`File is in a subdirectory: ${filePath}`);
    }
    
    // Check if file follows naming convention
    if (!hasValidNaming(fileName)) {
      errors.push(`Does not follow TC{id}_ naming convention: ${fileName}`);
    }
    
    // Check if file has test case description
    if (!hasTestCaseDescription(filePath)) {
      errors.push(`Missing test case description comment: ${fileName}`);
    }
    
    if (errors.length === 0) {
      results.valid++;
    } else {
      results.errors.push({
        file: fileName,
        filePath: filePath.replace(process.cwd(), ''),
        issues: errors
      });
    }
  });
  
  // Report results
  console.log('\nValidation Results:');
  console.log(`Total tests: ${results.total}`);
  console.log(`Valid tests: ${results.valid}`);
  console.log(`Invalid tests: ${results.total - results.valid}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(error => {
      console.log(`\nFile: ${error.filePath}`);
      error.issues.forEach(issue => console.log(`- ${issue}`));
    });
    
    console.log('\nPlease fix the issues above to comply with test standards:');
    console.log('1. All test files should be directly in src/__tests__/ directory');
    console.log('2. Test files should be named with TC{id}_ prefix (e.g., TC101_Component.test.tsx)');
    console.log('3. First line should have a test case description comment: // Test Case {id}: Description');
    
    return false;
  }
  
  console.log('\n✅ All tests meet the standardized structure requirements');
  return true;
}

// Run the validation
const isValid = validateTests();
process.exit(isValid ? 0 : 1); 
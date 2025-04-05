#!/usr/bin/env node

/**
 * verify-test-structure.js
 * 
 * This script verifies that all test files follow the standardized structure:
 * - Located in the src/__tests__/ directory directly (not in subdirectories)
 * - Named with the TC{id}_ prefix
 * - First line contains the test case description comment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get staged test files
const getStagedFiles = () => {
  try {
    const result = execSync('git diff --cached --name-only --diff-filter=ACMR').toString();
    return result.split('\n').filter(file => file.trim() !== '');
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
};

// Filter for test files
const isTestFile = (file) => {
  return file.match(/\.test\.(ts|tsx)$/);
};

// Check if file is in a subdirectory of src/__tests__
const isInSubdirectory = (file) => {
  const normalized = file.replace(/\\/g, '/');
  return normalized.match(/src\/__tests__\/[^/]+\//);
};

// Check if file follows naming convention
const followsNamingConvention = (file) => {
  const basename = path.basename(file);
  return basename.match(/^TC\d+_.+\.test\.(ts|tsx)$/);
};

// Check if file has test case description
const hasTestCaseDescription = (file) => {
  try {
    const content = fs.readFileSync(file, 'utf8').split('\n')[0];
    return content.match(/\/\/ Test Case \d+:/);
  } catch (error) {
    console.error(`Error reading file ${file}:`, error.message);
    return false;
  }
};

// Main validation function
const validateTestFiles = () => {
  const stagedFiles = getStagedFiles();
  const testFiles = stagedFiles.filter(isTestFile);
  
  if (testFiles.length === 0) {
    console.log('No test files to validate');
    return { valid: true };
  }
  
  console.log(`Validating ${testFiles.length} test files...`);
  
  const errors = [];
  
  testFiles.forEach(file => {
    // Check for files in subdirectories of src/__tests__
    if (isInSubdirectory(file)) {
      errors.push(`❌ Test file is in a subdirectory: ${file}`);
    }
    
    // Check naming convention
    if (!followsNamingConvention(file)) {
      errors.push(`❌ Test file doesn't follow TC{id}_ naming convention: ${file}`);
    }
    
    // For files that exist (not deleted), check content
    if (fs.existsSync(file)) {
      if (!hasTestCaseDescription(file)) {
        errors.push(`❌ Test file missing test case description comment: ${file}`);
      }
    }
  });
  
  if (errors.length > 0) {
    console.error('Test file validation failed:');
    errors.forEach(error => console.error(`  ${error}`));
    console.error('\nPlease follow the test conventions from TESTING.md:');
    console.error('1. All test files should be directly in src/__tests__/ directory');
    console.error('2. Test files should be named with TC{id}_ prefix (e.g., TC101_Component.test.tsx)');
    console.error('3. First line should have a test case description comment: // Test Case {id}: Description');
    
    return { valid: false, errors };
  }
  
  console.log('✅ All test files follow the standardized conventions');
  return { valid: true };
};

// For command line execution
if (require.main === module) {
  const result = validateTestFiles();
  process.exit(result.valid ? 0 : 1);
}

module.exports = validateTestFiles; 
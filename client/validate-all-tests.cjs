#!/usr/bin/env node

/**
 * Test Validation Script
 * 
 * This script validates that all test files follow the project's standards:
 * - Use the flattened directory structure
 * - Have correct naming conventions
 * - Use proper import paths
 * - Contain necessary assertions
 * - Include valid test case IDs that exist in the test plan
 * 
 * Usage: node validate-all-tests.js [--ci]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  testDir: path.join(process.cwd(), 'src/_tests_'),
  srcDir: path.join(process.cwd(), 'src'),
  testPlanPath: path.join(process.cwd(), 'test-plan.json'),
  isCIMode: process.argv.includes('--ci')
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Load test plan
let testPlan = { testCases: [] };
if (fs.existsSync(config.testPlanPath)) {
  try {
    const testPlanContent = fs.readFileSync(config.testPlanPath, 'utf8');
    testPlan = JSON.parse(testPlanContent);
  } catch (error) {
    console.error(`${colors.red}Error loading test plan: ${error.message}${colors.reset}`);
  }
}

// Get valid test case IDs from test plan
const validTestCaseIds = new Set(testPlan.testCases.map(tc => tc.id));

// Validation rules
const validationRules = {
  filenamePattern: /^TC\d+_(components|services|hooks|context|utils|integration)_.*\.(test|spec)\.(ts|tsx)$/,
  importPathPattern: /from\s+['"]\.\.\/(?!\.\.\/)/,
  wrongImportPathPattern: /from\s+['"]\.\.\/(\.\.\/){3,}/,
  assertionPattern: /expect\s*\(/,
  mockPattern: /vi\.mock\s*\(['"]/,
  describePattern: /describe\s*\(['"]/,
  testCaseIdPattern: /it\s*\(\s*['"]TC\d+:/,
  testCaseIdExtractPattern: /TC\d+/g
};

// Main function
function main() {
  console.log(`${colors.cyan}Starting test validation...${colors.reset}`);
  
  // Check if test plan exists
  if (testPlan.testCases.length === 0) {
    console.warn(`${colors.yellow}Warning: No test cases found in test plan or test plan not found.${colors.reset}`);
  } else {
    console.log(`${colors.blue}Loaded ${testPlan.testCases.length} test cases from test plan.${colors.reset}`);
  }
  
  // Check if tests directory exists
  if (!fs.existsSync(config.testDir)) {
    console.error(`${colors.red}Error: Tests directory not found at ${config.testDir}${colors.reset}`);
    process.exit(1);
  }
  
  // Get all test files
  const testFiles = findTestFiles(config.testDir);
  
  if (testFiles.length === 0) {
    console.log(`${colors.yellow}No test files found in ${config.testDir}${colors.reset}`);
    process.exit(0);
  }
  
  console.log(`${colors.blue}Found ${testFiles.length} test files to validate${colors.reset}`);
  
  // Validate each test file
  let passCount = 0;
  let failCount = 0;
  const failures = [];
  
  testFiles.forEach(file => {
    const results = validateTestFile(file);
    
    if (results.valid) {
      passCount++;
      if (!config.isCIMode) {
        console.log(`${colors.green}✓ ${path.relative(process.cwd(), file)}${colors.reset}`);
      }
    } else {
      failCount++;
      failures.push({ file, issues: results.issues });
      
      if (!config.isCIMode) {
        console.log(`${colors.red}✗ ${path.relative(process.cwd(), file)}${colors.reset}`);
        results.issues.forEach(issue => {
          console.log(`  ${colors.yellow}- ${issue}${colors.reset}`);
        });
      }
    }
  });
  
  // Report summary
  console.log('\n');
  console.log(`${colors.cyan}Validation Summary:${colors.reset}`);
  console.log(`${colors.blue}Total Files: ${testFiles.length}${colors.reset}`);
  console.log(`${colors.green}Passing: ${passCount}${colors.reset}`);
  console.log(`${colors.red}Failing: ${failCount}${colors.reset}`);
  
  // Show failures in CI mode
  if (config.isCIMode && failures.length > 0) {
    console.log('\n');
    console.log(`${colors.red}Failed Files:${colors.reset}`);
    failures.forEach(({ file, issues }) => {
      console.log(`${colors.red}✗ ${path.relative(process.cwd(), file)}${colors.reset}`);
      issues.forEach(issue => {
        console.log(`  ${colors.yellow}- ${issue}${colors.reset}`);
      });
    });
  }
  
  // Exit with appropriate code
  if (failCount > 0) {
    console.log(`\n${colors.red}Validation failed! Please fix the issues.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}All tests passed validation!${colors.reset}`);
    process.exit(0);
  }
}

// Function to find all test files
function findTestFiles(directory) {
  const files = [];
  
  // Read directory contents
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  // Process each entry
  entries.forEach(entry => {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Skip setup and examples directories
      if (entry.name !== 'setup' && entry.name !== 'examples') {
        // Recursively process subdirectories
        const subFiles = findTestFiles(fullPath);
        files.push(...subFiles);
      }
    } else if (entry.isFile() && isTestFile(entry.name)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Function to check if a file is a test file
function isTestFile(filename) {
  return /\.(test|spec)\.(ts|tsx)$/.test(filename);
}

// Function to validate a test file
function validateTestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    const issues = [];
    
    // Check 1: Filename matches pattern
    if (!validationRules.filenamePattern.test(filename)) {
      issues.push(`Filename does not follow the convention: ${filename}. Should be like 'TC123_category_name.test.ts'`);
    }
    
    // Check 2: Content has proper import paths
    if (!validationRules.importPathPattern.test(content)) {
      issues.push('No proper import paths found (should use ../../src/)');
    }
    
    // Check 3: Content doesn't have wrong import paths
    if (validationRules.wrongImportPathPattern.test(content)) {
      issues.push('Found incorrect nested import paths (using too many ../)');
    }
    
    // Check 4: Has assertions
    if (!validationRules.assertionPattern.test(content)) {
      issues.push('No assertions found in test (expect() statements)');
    }
    
    // Check 5: Has describe block
    if (!validationRules.describePattern.test(content)) {
      issues.push('No describe block found in test');
    }
    
    // Check 6: Component tests should have mocks
    if (filename.startsWith('components_') && !validationRules.mockPattern.test(content)) {
      issues.push('Component test should mock dependencies');
    }

    // Check 7: Contains test case IDs
    if (!validationRules.testCaseIdPattern.test(content)) {
      issues.push('No test case IDs found in test descriptions (should use format: "TC123: test description")');
    } else {
      // Check 8: Test case IDs are valid
      const testCaseIds = content.match(validationRules.testCaseIdExtractPattern) || [];
      const invalidTestCaseIds = testCaseIds.filter(id => !validTestCaseIds.has(id));
      
      if (invalidTestCaseIds.length > 0) {
        issues.push(`Found invalid test case IDs: ${invalidTestCaseIds.join(', ')}. These IDs are not in the test plan.`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    return {
      valid: false,
      issues: [`Error reading file: ${error.message}`]
    };
  }
}

// Run script
main(); 
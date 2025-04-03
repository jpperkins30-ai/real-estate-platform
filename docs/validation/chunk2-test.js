const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const CLIENT_DIR = path.resolve(__dirname, '../../client');
const TEST_COMMAND = 'npm test -- --testPathPattern=';

// Test components and their expected files
const componentsToTest = {
  // Context tests
  'PanelSyncContext': 'src/__tests__/context/PanelSyncContext.test.tsx',
  'LayoutContext': 'src/__tests__/context/LayoutContext.test.tsx',
  
  // Service tests
  'PanelRegistry': 'src/__tests__/services/PanelRegistry.test.ts',
  
  // Hook tests
  'usePanelSync': 'src/__tests__/hooks/usePanelSync.test.tsx',
  'useEntityData': 'src/__tests__/hooks/useEntityData.test.tsx',
  'useLayoutContext': 'src/__tests__/hooks/useLayoutContext.test.tsx',
  
  // Integration tests
  'PanelCommunication': 'src/__tests__/integration/panelCommunication.test.tsx',
};

// Manual verification components
const manualChecks = [
  'Panel synchronization works across components in real application',
  'Entity data is correctly shared between panels',
  'Panel registry correctly loads dynamic components',
  'Layout persistence works correctly',
  'Panel configuration is saved and loaded correctly',
  'Performance is acceptable for event broadcasting',
  'UI correctly reflects entity selections across panels',
  'Error states are properly displayed'
];

console.log(chalk.bold('\n🧪 Panel Communication System Test Runner 🧪\n'));

// Run tests
console.log(chalk.blue.bold('Running automated tests...\n'));

const results = {
  passed: [],
  failed: [],
  skipped: [],
};

for (const [component, testFile] of Object.entries(componentsToTest)) {
  const fullPath = path.join(CLIENT_DIR, testFile);
  
  console.log(chalk.yellow(`Testing: ${component}`));
  
  // Check if the test file exists
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`  ❌ Test file not found: ${testFile}`));
    results.skipped.push(component);
    continue;
  }
  
  try {
    // Run the test
    execSync(`cd ${CLIENT_DIR} && ${TEST_COMMAND}"${testFile}"`, { stdio: 'inherit' });
    console.log(chalk.green(`  ✅ Tests passed for ${component}`));
    results.passed.push(component);
  } catch (error) {
    console.log(chalk.red(`  ❌ Tests failed for ${component}`));
    results.failed.push(component);
  }
}

// Print summary
console.log(chalk.bold('\n📊 Test Results Summary'));
console.log(chalk.green(`✅ Passed: ${results.passed.length} components`));
console.log(chalk.red(`❌ Failed: ${results.failed.length} components`));
console.log(chalk.yellow(`⚠️ Skipped: ${results.skipped.length} components`));

// Print manual verification checklist
console.log(chalk.bold('\n🔍 Manual Verification Checklist'));
manualChecks.forEach((check, index) => {
  console.log(chalk.blue(`${index + 1}. [ ] ${check}`));
});

// Save results to validation file
const validationResults = {
  timestamp: new Date().toISOString(),
  automated: {
    total: Object.keys(componentsToTest).length,
    passed: results.passed,
    failed: results.failed,
    skipped: results.skipped,
  },
  manualChecks,
};

const outputFile = path.join(__dirname, 'chunk2-validation-results.json');
fs.writeFileSync(outputFile, JSON.stringify(validationResults, null, 2));
console.log(chalk.bold(`\n📄 Results saved to: ${outputFile}`));

// Print validation completion instructions
console.log(chalk.bold.green('\n✅ Next steps:'));
console.log('1. Fix any failing tests');
console.log('2. Complete the manual verification checks');
console.log('3. Update the validation checklist in chunk2-validation-checklist.md');
console.log('4. Submit your validation report');

// Exit with appropriate code
if (results.failed.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
} 
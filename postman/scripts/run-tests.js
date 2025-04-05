const fs = require('fs');
const path = require('path');
const newman = require('newman');
const { generateTestData } = require('./generate-test-data');

// Configuration
const config = {
  collectionsDir: path.join(__dirname, '../collections'),
  environmentsDir: path.join(__dirname, '../environments'),
  reportsDir: path.join(__dirname, '../reports'),
  environmentFile: process.env.ENV_FILE || 'development.json',
  collections: [
    'auth.json',
    'layouts.json',
    'preferences.json',
    'health-check.json',
    'e2e-flow.json'
  ]
};

// Ensure reports directory exists
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
}

async function runTests() {
  try {
    console.log('Starting API test suite execution...');
    
    // Optionally generate test data first
    if (process.env.GENERATE_TEST_DATA === 'true') {
      await generateTestData();
    }
    
    // Load environment file
    const environmentFile = path.join(config.environmentsDir, config.environmentFile);
    
    // Run each collection in sequence
    for (const collectionFile of config.collections) {
      const collectionPath = path.join(config.collectionsDir, collectionFile);
      const collectionName = path.basename(collectionFile, '.json');
      const reportPath = path.join(config.reportsDir, `${collectionName}-report.html`);
      
      console.log(`Running collection: ${collectionName}`);
      
      // Run the collection
      await new Promise((resolve, reject) => {
        newman.run({
          collection: require(collectionPath),
          environment: require(environmentFile),
          reporters: ['cli', 'htmlextra'],
          reporter: {
            htmlextra: {
              export: reportPath,
              template: 'default',
              showOnlyFails: false,
              noSyntaxHighlighting: false,
              testPaging: true,
              browserTitle: `API Tests - ${collectionName}`,
              title: `Real Estate Platform API - ${collectionName} Tests`
            }
          }
        }, function (err, summary) {
          if (err) {
            console.error(`Error running collection ${collectionName}:`, err);
            reject(err);
            return;
          }
          
          console.log(`Collection ${collectionName} completed with status: ${summary.run.stats.failures ? 'FAILED' : 'PASSED'}`);
          console.log(`Run summary: ${summary.run.stats.iterations.total} iterations, ${summary.run.stats.requests.total} requests, ${summary.run.stats.assertions.total} assertions, ${summary.run.stats.assertions.failed} failures`);
          console.log(`Report saved to: ${reportPath}`);
          
          // If there were failures, exit with non-zero code in CI environments
          if (summary.run.failures.length > 0 && process.env.CI === 'true') {
            process.exitCode = 1;
          }
          
          resolve(summary);
        });
      });
    }
    
    console.log('All tests completed');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exitCode = 1;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 
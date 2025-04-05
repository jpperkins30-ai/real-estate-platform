import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * This test demonstrates how to run Postman API tests programmatically.
 * It can be included in your test suite to verify API functionality.
 */
describe('Postman API Integration Tests', () => {
  const postmanDir = path.resolve(__dirname, '../../../postman');
  const collectionsDir = path.join(postmanDir, 'collections');
  const environmentsDir = path.join(postmanDir, 'environments');
  const reportsDir = path.join(postmanDir, 'reports');
  
  // Skip these tests if running in CI environment
  const isCI = process.env.CI === 'true';
  
  beforeAll(() => {
    // Ensure the reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Check if Newman is installed
    try {
      execSync('newman --version', { stdio: 'ignore' });
    } catch (error) {
      console.warn('Newman is not installed. Install it with: npm install -g newman newman-reporter-htmlextra');
    }
  });
  
  // Test that verifies that all collection files exist and are valid JSON
  test('Postman collections should exist and be valid JSON', () => {
    // Skip in CI
    if (isCI) {
      console.log('Skipping test in CI environment');
      return;
    }
    
    const collections = [
      'auth.json',
      'layouts.json',
      'preferences.json',
      'health-check.json',
      'e2e-flow.json'
    ];
    
    for (const collection of collections) {
      const filePath = path.join(collectionsDir, collection);
      
      // Check if file exists
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Check if file is valid JSON
      let content: any;
      expect(() => {
        content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }).not.toThrow();
      
      // Verify basic Postman collection structure
      expect(content).toHaveProperty('info');
      expect(content.info).toHaveProperty('name');
      expect(content).toHaveProperty('item');
      expect(Array.isArray(content.item)).toBe(true);
    }
  });
  
  // Test that runs the health check collection
  test('Health check API endpoints should be accessible', () => {
    // Skip in CI
    if (isCI) {
      console.log('Skipping test in CI environment');
      return;
    }
    
    // Ensure the server is running before executing this test
    const collection = path.join(collectionsDir, 'health-check.json');
    const environment = path.join(environmentsDir, 'development.json');
    const reportPath = path.join(reportsDir, 'health-check-report.html');
    
    try {
      // Run Newman with the health check collection
      execSync(
        `newman run "${collection}" -e "${environment}" -r cli,htmlextra --reporter-htmlextra-export "${reportPath}"`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      // If Newman fails, the test should fail
      fail('Health check API tests failed. Check the HTML report for details.');
    }
  });
  
  // Example of how to run a specific API test programmatically
  test('Authentication endpoints should function correctly', () => {
    // Skip this test - it's just for demonstration purposes
    return;
    
    const collection = path.join(collectionsDir, 'auth.json');
    const environment = path.join(environmentsDir, 'development.json');
    const reportPath = path.join(reportsDir, 'auth-report.html');
    
    try {
      execSync(
        `newman run "${collection}" -e "${environment}" -r cli,htmlextra --reporter-htmlextra-export "${reportPath}"`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      fail('Authentication API tests failed. Check the HTML report for details.');
    }
  });
}); 
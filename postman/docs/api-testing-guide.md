# API Testing Guide for Multi-Frame Layout Component System

## Overview

This guide provides information on how to execute API tests for the Multi-Frame Layout Component System using Postman and Newman. The tests cover authentication, layout management, user preferences, and end-to-end workflows.

## Setup Requirements

1. Node.js (v14+)
2. Postman Desktop App (for test development)
3. Newman (for CLI test execution)
4. Newman HTML Reporter (for test reports)

## Installation

```bash
# Install required packages
npm install -g newman newman-reporter-htmlextra

# Clone the repository
git clone [repository-url]
cd [repository-directory]
```

## Test Collections

The test suite consists of the following collections:

1. **Authentication** - Tests for user authentication endpoints
2. **Layouts** - Tests for layout configuration management
3. **User Preferences** - Tests for user preferences API
4. **Health Check** - Tests for API health and status endpoints
5. **End-to-End Flow** - Integration tests for complete user workflows

## Test Environments

The following environments are configured:

1. **Development** - For local development testing
2. **Testing** - For CI/CD pipeline testing
3. **Production** - For production verification tests (restricted use)

## Running Tests

### Using Postman Desktop App

1. Import the collections from the `postman/collections` directory
2. Import the environments from the `postman/environments` directory
3. Select the appropriate environment
4. Run the collections manually or using the Collection Runner

### Using NPM Scripts

```bash
# Run API tests with default settings (development environment)
npm run test:api

# Run API tests with development environment
npm run test:api:dev

# Run API tests with testing environment
npm run test:api:testing

# Run API tests and generate test data
npm run test:api:data

# Start both server and client
npm run start:all

# Start server, client and run all tests (unit + API)
npm run start:test:all
```

### Using the PowerShell Script Directly

```powershell
# Run API tests with default settings
.\run.ps1 -RunApiTests

# Run API tests with a specific environment
.\run.ps1 -RunApiTests -ApiEnvironment testing

# Run API tests and generate test data
.\run.ps1 -RunApiTests -GenerateApiTestData

# Run API tests with a custom report directory
.\run.ps1 -RunApiTests -ApiReportDir ".\custom-reports"

# Start server and run API tests
.\run.ps1 -StartServer -RunApiTests

# Get help on all available options
.\run.ps1 -Help
```

## Test Reports

HTML reports are generated in the `postman/reports` directory after test execution. These reports include:

- Summary of test execution
- Request/response details
- Test assertions and results
- Timing information

## Test Data Management

The test suite includes a data generator script that creates test data required for API testing. This script can be run separately or as part of the test execution process.

```bash
# Generate test data using the script
npm run test:api:data

# Or directly with the PowerShell script
.\run.ps1 -RunApiTests -GenerateApiTestData
```

## CI/CD Integration

The test suite is designed to be integrated with CI/CD pipelines. The GitHub Actions workflow in `.github/workflows/api-tests.yml` provides automation for:

- Environment setup
- Test data generation
- API test execution
- Test report generation

## Extending the Test Suite

### Adding New Tests

1. Create a new test file in the appropriate collection using Postman
2. Add assertions for each request
3. Ensure proper test cleanup after execution
4. Export the collection to the `postman/collections` directory
5. If you've created a new collection, add it to the collections array in the `run.ps1` script

### Creating New Collections

1. Create a new collection in Postman Desktop App
2. Add requests and test scripts
3. Export the collection to the `postman/collections` directory
4. Add the collection filename to the `$collections` array in the `run.ps1` script

## Best Practices

1. Each request should have at least one test assertion
2. Use environment variables for dynamic values
3. Include proper test cleanup to leave the system in a known state
4. Add descriptive names and documentation for tests
5. Use pre-request scripts for test setup when needed
6. Ensure tests are idempotent (can be run multiple times)

## Troubleshooting

### Common Issues

1. **Authentication Failures** - Check that the environment variables for authentication are correctly set
2. **Missing Test Data** - Run tests with the `-GenerateApiTestData` flag
3. **Network Errors** - Verify that the API server is running and accessible
4. **Schema Validation Errors** - Ensure that request and response formats match the API schema

### Getting Help

For assistance with the API test suite, contact the QA team or refer to the internal documentation. 
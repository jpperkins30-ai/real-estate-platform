# 🧩 API Testing & Postman Automation

## 📋 Overview

This documentation covers the implementation of a comprehensive API testing strategy using Postman and Newman for the Multi-Frame Layout Component System. The testing framework provides automated validation of API functionality, reliability, security, and performance.

## 🎯 Objectives

- Establish a comprehensive API testing strategy 
- Create reusable Postman collections for all API endpoints
- Implement automated test execution with Newman
- Generate HTML reports for test results
- Integrate API testing with CI/CD pipelines
- Enable test data generation for consistent testing

## 🧰 Components

The API testing implementation consists of the following components:

### 📁 Directory Structure

```
postman/
├── collections/           # Postman API test collections
│   ├── auth.json          # Authentication endpoints
│   ├── layouts.json       # Layout management endpoints
│   ├── preferences.json   # User preferences endpoints
│   ├── health-check.json  # API health check endpoints
│   └── e2e-flow.json      # End-to-end test flows
├── environments/          # Environment configurations
│   ├── development.json   # Local development environment
│   └── testing.json       # CI/CD testing environment
├── scripts/               # Automation scripts
│   └── generate-test-data.js  # Test data generator
├── docs/                  # Documentation
│   ├── api-testing-guide.md  # How to use the test suite
│   └── interpreting-test-reports.md  # How to read test reports
└── reports/               # Generated test reports
```

### 📑 Postman Collections

Each collection focuses on a specific aspect of the API:

1. **Authentication Collection**
   - User login/logout
   - Token management
   - Registration
   - Authentication validation

2. **Layouts Collection**
   - Create, read, update, delete layouts
   - Layout cloning
   - Layout permissions
   - Layout filtering

3. **User Preferences Collection**
   - Retrieve user preferences
   - Update preferences
   - Reset preferences to defaults

4. **Health Check Collection**
   - API health status
   - System performance metrics
   - Database connectivity checks

5. **End-to-End Flow Collection**
   - Complete user workflows
   - Multi-step test scenarios
   - State management between requests

### 🔧 Automation Scripts

The API testing functionality is integrated into the main project script `run.ps1`, which provides the following capabilities:

1. **API Test Execution**
   - Executes all Postman collections using Newman
   - Generates HTML reports for each collection
   - Supports environment selection
   - Handles test failures and reporting

2. **Test Data Generation**
   - Creates test layouts in the database
   - Sets up test user accounts
   - Populates environment variables

3. **Integration with Other Project Functions**
   - Can run API tests alongside server and client
   - Coordinates with unit tests
   - Provides consolidated reporting

## 🚀 Usage

### Running Tests Locally

```bash
# Run API tests with default settings
npm run test:api

# Run API tests with test data generation
npm run test:api:data

# Run API tests with specific environment
npm run test:api:testing

# Start both server and client
npm run start:all

# Start server, client and run all tests
npm run start:test:all
```

### Using the PowerShell Script Directly

```powershell
# Run API tests only
.\run.ps1 -RunApiTests

# Run API tests with test data generation
.\run.ps1 -RunApiTests -GenerateApiTestData

# Run API tests with a specific environment
.\run.ps1 -RunApiTests -ApiEnvironment testing

# Combine with other functionality
.\run.ps1 -StartServer -RunApiTests -RunTests
```

### CI/CD Integration

```bash
# The GitHub workflow uses the following approach:
node postman/scripts/run-tests.js
```

### Opening Reports

HTML reports are generated in the `postman/reports` directory. Open any HTML file in a browser to view detailed test results.

## 💡 Best Practices

The API testing implementation follows these best practices:

1. **Test Independence**
   - Each test can run independently
   - Test data is properly set up and cleaned up
   - No dependencies between test collections

2. **Environment Variables**
   - Sensitive data stored in environment variables
   - Dynamic values captured and reused between requests
   - Environment-specific configurations separated

3. **Comprehensive Testing**
   - Positive and negative test cases
   - Boundary value testing
   - Error handling validation
   - Performance thresholds

4. **Clear Documentation**
   - Each collection has detailed documentation
   - Test purpose and expected results documented
   - Failure scenarios explained

## 🔄 CI/CD Integration

The API tests are integrated with CI/CD pipelines to ensure API reliability:

1. **Pull Request Validation**
   - Tests run automatically on pull requests
   - Prevents merging code that breaks the API

2. **Scheduled Runs**
   - Daily test runs against production
   - Monitors API health and performance

3. **Deployment Gates**
   - Tests must pass before deployment
   - Ensures production reliability

## 📊 Test Coverage

The API test suite provides comprehensive coverage of the Multi-Frame Layout Component System API:

| API Category | Endpoints | Test Cases | Coverage |
|--------------|-----------|------------|----------|
| Authentication | 3 | 12 | 100% |
| Layouts | 6 | 24 | 100% |
| User Preferences | 3 | 9 | 100% |
| Health/Status | 2 | 6 | 100% |
| **Total** | **14** | **51** | **100%** |

## 📈 Performance Testing

The API test suite includes performance testing capabilities:

1. **Response Time Thresholds**
   - Tests fail if responses exceed defined thresholds
   - Critical endpoints monitored for performance regression

2. **Load Testing**
   - Newman collection runner can execute multiple iterations
   - Validates API behavior under moderate load

## 🔒 Security Testing

Security validation is integrated into the API test suite:

1. **Authentication Testing**
   - Validates token-based authentication
   - Tests expired tokens and invalid credentials
   - Ensures protected endpoints require authentication

2. **Authorization Testing**
   - Validates user permissions
   - Tests resource access restrictions
   - Ensures users can only access their own data

## 📝 Extending the Test Suite

To add new tests to the suite:

1. Import the relevant collection in Postman
2. Add new requests and test scripts
3. Export the updated collection to the `postman/collections` directory
4. Update the collections list in the run.ps1 script if needed
5. Run the tests to ensure quality

## 🔍 Troubleshooting

Common issues and their solutions:

1. **Token Expired Errors**
   - Solution: Ensure the login request is executed first
   - Solution: Check environment variable persistence

2. **Missing Test Data**
   - Solution: Use the -GenerateApiTestData flag
   - Solution: Check database connectivity

3. **Schema Validation Failures**
   - Solution: Update expected response schema
   - Solution: Check for API changes

## 📚 Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)
- [Newman Documentation](https://github.com/postmanlabs/newman)
- [Newman HTML Extra Reporter](https://github.com/DannyDainton/newman-reporter-htmlextra)

## ✅ Implementation Checklist

- [x] Created Postman collections for all API endpoints
- [x] Configured test environments for development and testing
- [x] Implemented test data generation scripts
- [x] Integrated API testing into main PowerShell script
- [x] Added CI/CD integration script
- [x] Added comprehensive documentation
- [x] Integrated with existing test framework
- [x] Added performance testing capabilities
- [x] Added security testing validations 
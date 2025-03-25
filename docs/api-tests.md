# API Testing Documentation

This document outlines the testing strategy and test cases for the Real Estate Platform API endpoints.

## Testing Tools

- **Postman**: Primary tool for manual API testing and collection management
- **Jest**: JavaScript testing framework for automated tests
- **Supertest**: HTTP assertion library for endpoint testing
- **MongoDB Memory Server**: For integration tests with isolated database

## Environment Setup

1. Configure test environment in `.env.test` file
2. Run `npm run test:setup` to prepare the test database
3. Run tests with `npm test` or `npm run test:api`

## Authentication Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| Valid Login | Attempt login with valid credentials | 200 OK with token |
| Invalid Login | Attempt login with incorrect password | 401 Unauthorized |
| Token Validation | Use valid token to access protected route | 200 OK with data |
| Expired Token | Use expired token to access protected route | 401 Unauthorized |
| Admin Access | Access admin-only route with admin token | 200 OK with data |
| User Access Restriction | Access admin-only route with user token | 403 Forbidden |

## Inventory Module Tests

### USMap Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| Get US Map | Retrieve the US map data | 200 OK with map data |
| Get US Map Statistics | Retrieve statistics for the entire US | 200 OK with statistics |
| Update US Map | Update US map metadata | 200 OK with updated data |

### State Endpoints Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| List States | Get all states | 200 OK with array of states |
| Get State | Get state by ID | 200 OK with state data |
| Create State | Create a new state with valid data | 201 Created with new state ID |
| Create State Invalid | Create state with missing required fields | 400 Bad Request |
| Update State | Update an existing state | 200 OK with updated state |
| Delete State | Delete a state | 200 OK with success message |
| Delete State with Counties | Delete state that has counties | 409 Conflict |
| Get State Counties | Get counties for a state | 200 OK with array of counties |
| Get State Properties | Get properties for a state | 200 OK with array of properties |
| Get State Statistics | Get statistics for a state | 200 OK with statistics object |
| Upload State GeoJSON | Upload valid GeoJSON for a state | 200 OK with success message |
| Upload Invalid GeoJSON | Upload invalid GeoJSON format | 400 Bad Request |

### County Endpoints Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| List Counties | Get all counties | 200 OK with array of counties |
| List Counties by State | Get counties filtered by state ID | 200 OK with filtered counties |
| Get County | Get county by ID | 200 OK with county data |
| Create County | Create a new county with valid data | 201 Created with new county ID |
| Create County Invalid | Create county with missing required fields | 400 Bad Request |
| Update County | Update an existing county | 200 OK with updated county |
| Delete County | Delete a county | 200 OK with success message |
| Delete County with Properties | Delete county that has properties | 409 Conflict |
| Get County Properties | Get properties for a county | 200 OK with array of properties |
| Get County Statistics | Get statistics for a county | 200 OK with statistics object |
| Upload County GeoJSON | Upload valid GeoJSON for a county | 200 OK with success message |
| Upload County Search Config | Upload search configuration | 200 OK with updated county |

### Property Endpoints Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| List Properties | Get all properties | 200 OK with array of properties |
| List Properties Pagination | Get paginated properties | 200 OK with paginated results |
| List Properties by County | Get properties filtered by county ID | 200 OK with filtered properties |
| List Properties by State | Get properties filtered by state ID | 200 OK with filtered properties |
| Get Property | Get property by ID | 200 OK with property data |
| Get Property Not Found | Get non-existent property | 404 Not Found |
| Create Property | Create a new property with valid data | 201 Created with new property ID |
| Create Property Invalid | Create property with missing required fields | 400 Bad Request |
| Update Property | Update an existing property | 200 OK with updated property |
| Delete Property | Delete a property | 200 OK with success message |
| Search Properties | Search properties by query | 200 OK with search results |
| Filter Properties | Filter properties by various criteria | 200 OK with filtered results |

### Controller Endpoints Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| List Controllers | Get all controllers | 200 OK with array of controllers |
| Get Controller | Get controller by ID | 200 OK with controller data |
| Create Controller | Create a new controller with valid data | 201 Created with new controller ID |
| Create Controller Invalid | Create controller with invalid data | 400 Bad Request |
| Update Controller | Update an existing controller | 200 OK with updated controller |
| Delete Controller | Delete a controller | 200 OK with success message |
| Attach Controller | Attach controller to inventory object | 200 OK with success message |
| Detach Controller | Detach controller from inventory object | 200 OK with success message |
| Execute Controller | Execute controller on inventory object | 200 OK with execution results |
| Get Controller Execution History | Get execution history for controller | 200 OK with history array |
| Validate Controller Configuration | Validate configuration for controller | 200 OK if valid, 400 if invalid |

### Export Endpoints Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| Export State CSV | Export state data to CSV | 200 OK with CSV file |
| Export State Excel | Export state data to Excel | 200 OK with Excel file |
| Export County CSV | Export county data to CSV | 200 OK with CSV file |
| Export County Excel | Export county data to Excel | 200 OK with Excel file |
| Export Properties CSV | Export property data to CSV | 200 OK with CSV file |
| Export Properties Excel | Export property data to Excel | 200 OK with Excel file |
| Export State Properties CSV | Export all properties in state to CSV | 200 OK with CSV file |
| Export County Properties Excel | Export all properties in county to Excel | 200 OK with Excel file |
| Export Invalid Format | Request export with invalid format | 400 Bad Request |
| Export with Invalid ID | Export with non-existent object ID | 404 Not Found |

## User Management Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| List Users | Get all users (admin only) | 200 OK with array of users |
| Get User | Get user by ID | 200 OK with user data |
| Get User Profile | Get current user profile | 200 OK with user profile |
| Create User | Create a new user with valid data | 201 Created with new user ID |
| Create User Duplicate | Create user with existing email | 409 Conflict |
| Update User | Update an existing user | 200 OK with updated user |
| Delete User | Delete a user | 200 OK with success message |
| Change Password | Change user password | 200 OK with success message |
| Request Password Reset | Request password reset token | 200 OK with success message |
| Reset Password | Reset password with valid token | 200 OK with success message |
| Reset Password Invalid Token | Reset with invalid token | 400 Bad Request |

## Integration Test Scenarios

### End-to-End Inventory Management

1. Create a state
2. Upload GeoJSON for the state
3. Get state details to verify
4. Create a county in the state
5. Upload GeoJSON for the county
6. Get county details to verify
7. Create a property in the county
8. Verify property hierarchy (county and state IDs)
9. Export properties to CSV
10. Update property details
11. Delete property, county, and state in sequence

### Controller Workflow

1. Create a controller
2. Attach controller to a state
3. Configure controller settings
4. Execute controller
5. Verify execution results
6. Get execution history
7. Detach controller
8. Delete controller

### User Workflow

1. Register new user
2. Login to get auth token
3. Access user profile
4. Update user details
5. Change password
6. Logout
7. Login with new password
8. Delete user account

## Performance Tests

| Test Case | Description | Expected Metrics |
|-----------|-------------|------------------|
| List 1000 Properties | Get large set of properties | Response time < 500ms |
| Concurrent API Calls | 100 simultaneous API requests | All successful, response time < 1s |
| Export Large Dataset | Export 10,000 properties to Excel | Response time < 5s |
| GeoJSON Processing | Upload large GeoJSON file | Processing time < 10s |
| Controller Execution | Execute complex controller | Execution time < 30s |

## Security Tests

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| SQL Injection | Attempt SQL injection in query params | 400 Bad Request, no DB error |
| XSS Attack | Submit JavaScript in text fields | Escaped output, no script execution |
| CSRF Protection | Verify CSRF token requirements | 403 Forbidden without token |
| Rate Limiting | Exceed API rate limits | 429 Too Many Requests |
| Auth Headers | Send auth data in URL instead of header | 401 Unauthorized |

## Automated Testing

Test automation scripts are located in the `server/tests/api` directory:

- `auth.test.js`: Authentication tests
- `inventory.test.js`: Inventory module tests
- `controllers.test.js`: Controller tests
- `export.test.js`: Export functionality tests
- `users.test.js`: User management tests

Run with:

```bash
npm run test:api
```

## Continuous Integration

API tests are automatically run in the CI pipeline on:

1. Pull requests to the main branch
2. Scheduled nightly builds
3. Manual trigger via GitHub Actions

## Test Data Management

- Test fixtures are in `server/tests/fixtures`
- Reset test database with `npm run test:reset-db`
- Generate test data with `npm run test:generate-data` 
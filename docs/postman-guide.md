# Postman Guide

## Getting Started with Postman

### Installation and Setup
1. Download Postman from [postman.com](https://www.postman.com/downloads/)
2. Import the Real Estate Platform collection:
   ```
   File > Import > Link
   URL: https://api.real-estate-platform.com/postman/collection.json
   ```

### Environment Setup
```json
{
  "dev": {
    "BASE_URL": "http://localhost:3000/api",
    "AUTH_TOKEN": "",
    "REFRESH_TOKEN": ""
  },
  "staging": {
    "BASE_URL": "https://staging-api.real-estate-platform.com",
    "AUTH_TOKEN": "",
    "REFRESH_TOKEN": ""
  }
}
```

## Collection Overview

### Authentication Requests
```javascript
// Login Request
POST {{BASE_URL}}/auth/login
{
    "email": "{{USER_EMAIL}}",
    "password": "{{USER_PASSWORD}}"
}

// Register Request
POST {{BASE_URL}}/auth/register
{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
}
```

### Property Management Requests
```javascript
// Create Property
POST {{BASE_URL}}/properties
{
    "title": "Modern Apartment",
    "price": 250000,
    "location": {
        "address": "123 Main St",
        "city": "New York",
        "coordinates": [40.7128, -74.0060]
    }
}

// Search Properties
GET {{BASE_URL}}/properties/search?query=modern&minPrice=200000&maxPrice=300000
```

## Pre-request Scripts

### Authentication Token Refresh
```javascript
if (!pm.environment.get('AUTH_TOKEN')) {
    const loginRequest = {
        url: pm.environment.get('BASE_URL') + '/auth/login',
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: pm.environment.get('USER_EMAIL'),
                password: pm.environment.get('USER_PASSWORD')
            })
        }
    };

    pm.sendRequest(loginRequest, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            const { token } = res.json();
            pm.environment.set('AUTH_TOKEN', token);
        }
    });
}
```

## Test Scripts

### Response Validation
```javascript
// Status Code Test
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

// Schema Validation
pm.test("Response matches schema", () => {
    const schema = {
        type: 'object',
        required: ['id', 'title', 'price'],
        properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            price: { type: 'number' }
        }
    };
    
    pm.expect(pm.response.json()).to.match(schema);
});
```

## Common Issues and Solutions

### Authentication Issues
1. **Token Expired**
   - Error: `401 Unauthorized`
   - Solution: Use the refresh token endpoint or re-login
   ```javascript
   POST {{BASE_URL}}/auth/refresh
   {
       "refreshToken": "{{REFRESH_TOKEN}}"
   }
   ```

2. **Invalid Credentials**
   - Error: `403 Forbidden`
   - Solution: Verify environment variables for credentials

### Request Issues
1. **Rate Limiting**
   - Error: `429 Too Many Requests`
   - Solution: Implement request throttling in pre-request scripts
   ```javascript
   const lastRequest = pm.variables.get('lastRequest');
   const now = Date.now();
   if (lastRequest && now - lastRequest < 1000) {
       setTimeout(() => {}, 1000);
   }
   pm.variables.set('lastRequest', now);
   ```

## Best Practices

### Organization
1. Use folders to group related requests
2. Name requests clearly and consistently
3. Use environment variables for configurable values
4. Document request parameters and expected responses

### Testing
1. Write tests for all responses
2. Validate response schemas
3. Check response times
4. Verify error handling

### Security
1. Never commit sensitive data to version control
2. Use environment variables for credentials
3. Regularly rotate API keys
4. Use SSL certificate verification

## Automated Testing

### Newman CLI Integration
```bash
# Install Newman
npm install -g newman

# Run collection
newman run Real_Estate_Platform.postman_collection.json -e environment.json

# Generate HTML report
newman run Real_Estate_Platform.postman_collection.json -e environment.json -r htmlextra
```

### CI/CD Integration
```yaml
# GitHub Actions Example
name: API Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: newman run ./postman/Real_Estate_Platform.postman_collection.json -e ./postman/environment.json
``` 
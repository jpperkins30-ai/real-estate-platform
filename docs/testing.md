# Testing Guide

## Overview

This guide covers testing practices and procedures for the Real Estate Platform. We use Jest as our primary testing framework along with Supertest for API testing.

## Test Structure

```
tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
├── integration/
│   ├── auth/
│   ├── properties/
│   └── search/
└── e2e/
    └── api/
```

## Setting Up Tests

### Installation

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
```

## Unit Testing

### Models

```typescript
// User model test example
describe('User Model', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should hash password before saving', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123'
    });

    await user.save();
    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
  });

  it('should validate email format', async () => {
    const user = new User({
      email: 'invalid-email',
      password: 'password123'
    });

    await expect(user.save()).rejects.toThrow();
  });
});
```

### Services

```typescript
// Property service test example
describe('PropertyService', () => {
  const mockProperty = {
    title: 'Test Property',
    price: 250000
  };

  it('should create property', async () => {
    const property = await PropertyService.create(mockProperty);
    expect(property.title).toBe(mockProperty.title);
    expect(property.price).toBe(mockProperty.price);
  });

  it('should validate property data', async () => {
    const invalidProperty = { title: '' };
    await expect(
      PropertyService.create(invalidProperty)
    ).rejects.toThrow('Validation error');
  });
});
```

## Integration Testing

### API Endpoints

```typescript
// Property API test example
describe('Property API', () => {
  let token: string;

  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = response.body.token;
  });

  it('should create property', async () => {
    const response = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Property',
        price: 300000
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('title', 'New Property');
  });

  it('should get property list', async () => {
    const response = await request(app)
      .get('/api/properties')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Database Integration

```typescript
// Database integration test example
describe('Database Integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI!);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it('should perform atomic operations', async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const property = await Property.create([{
        title: 'Test Property',
        price: 200000
      }], { session });

      await User.updateOne(
        { _id: 'user_id' },
        { $push: { properties: property[0]._id } },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });
});
```

## End-to-End Testing

### Setup

```typescript
// e2e/setup.ts
import { setup as setupDevServer } from './dev-server';

export default async () => {
  const server = await setupDevServer();
  process.env.TEST_SERVER_URL = server.url;
};
```

### API Flow Tests

```typescript
// e2e/api/property-flow.test.ts
describe('Property Management Flow', () => {
  it('should handle complete property lifecycle', async () => {
    // 1. Login
    const authResponse = await request(app)
      .post('/api/auth/login')
      .send(userCredentials);
    
    const token = authResponse.body.token;

    // 2. Create Property
    const createResponse = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send(propertyData);
    
    const propertyId = createResponse.body.data._id;

    // 3. Update Property
    await request(app)
      .put(`/api/properties/${propertyId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    // 4. Search Property
    const searchResponse = await request(app)
      .get('/api/search')
      .query({ price_min: 200000 });

    // 5. Delete Property
    await request(app)
      .delete(`/api/properties/${propertyId}`)
      .set('Authorization', `Bearer ${token}`);
  });
});
```

## Test Coverage

### Running Coverage Reports

```bash
npm run test:coverage
```

### Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Test Independence**
   - Each test should be independent
   - Clean up after tests
   - Don't rely on test order

3. **Mock External Services**
   - Use Jest mock functions
   - Create mock implementations
   - Avoid external API calls

4. **Database Testing**
   - Use separate test database
   - Clean database between tests
   - Use transactions when possible

5. **API Testing**
   - Test both success and error cases
   - Validate response formats
   - Check status codes and headers

6. **Security Testing**
   - Test authentication
   - Verify authorization
   - Validate input sanitization

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
``` 
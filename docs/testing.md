# Testing Guide

> **Note**: This document provides a general overview of testing practices. For details on our standardized testing approach, refer to [TEST-GUIDE.md](../client/TEST-GUIDE.md) and [TESTING.md](../client/TESTING.md).

## Standardized Testing Approach

The Real Estate Platform has implemented a standardized testing methodology that all developers must follow. Key elements of this approach include:

1. **Test Case ID Tracking**: All tests include unique identifiers (e.g., "TC101") that link to the test plan
2. **Flattened Test Structure**: Tests are organized in a flat directory structure with consistent naming
3. **Automated Validation**: Pre-commit hooks, pre-test validation, and CI/CD integration ensure tests follow standards
4. **Comprehensive Test Plan**: All test cases are documented in [test-plan.json](../client/test-plan.json)

Before writing any tests, please review:
- [TEST-GUIDE.md](../client/TEST-GUIDE.md) - Quick reference guide for the testing process
- [TESTING.md](../client/TESTING.md) - Comprehensive testing documentation and standards
- [test-plan.json](../client/test-plan.json) - Machine-readable test case catalog

Our testing system includes multiple enforcement layers to ensure standards are followed throughout the development process.

## Overview

Testing is a critical part of our development process to ensure the reliability and quality of the Real Estate Platform. This guide outlines the general approach to testing, while the detailed test cases and execution procedures are documented in the [Test Plan](./test-plan.md).

## Testing Types

The platform uses several types of tests:

1. **Unit Tests**: Testing individual components and functions
2. **Integration Tests**: Testing interactions between components
3. **End-to-End Tests**: Testing complete user workflows
4. **Accessibility Tests**: Ensuring the platform is accessible to all users

## Test Structure

Tests are organized in the `__tests__` directory, which mirrors the structure of the source code:

```
client/src/__tests__/
├── components_*       # Component tests with flattened structure using underscores
├── hooks_*            # Custom React hook tests with flattened structure
├── integration_*      # Integration tests with flattened structure
├── services_*         # Service layer tests with flattened structure
└── setup/            # Test setup utilities
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run a specific test file
npm test -- src/__tests__/hooks_useAdvancedLayout.test.tsx

# Run tests without watching
npm test -- --no-watch
```

## Writing Tests

### Best Practices

1. Follow the AAA pattern (Arrange, Act, Assert)
2. Keep tests isolated and independent
3. Test behavior, not implementation details
4. Use descriptive test names
5. Mock external dependencies

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../components/Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    // Arrange
    const handleClick = vi.fn();
    
    // Act
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Test Coverage

We aim for the following coverage targets:
- 80% overall code coverage
- 90% coverage for core functionality
- 100% coverage for critical components

## Continuous Integration

Tests are automatically run as part of our CI/CD pipeline:

1. All tests must pass before a pull request can be merged
2. Coverage reports are generated and reviewed
3. Test performance is monitored

## Further Reading

For detailed information about all test cases, procedures, and requirements, refer to the [Comprehensive Test Plan](./test-plan.md).

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

## Component Testing

### Overview

Component testing verifies that UI components render correctly and behave as expected. We use React Testing Library along with Vitest for component testing.

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '../components/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('triggers onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    screen.getByText('Click Me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Multiframe Component Testing

The application includes a system of multiframe components that require special testing approaches. These components (like `MultiFrameContainer`, `LayoutSelector`, and various layouts) have complex interactions that need careful testing.

#### Special Considerations

1. **Mock Child Components**: Multiframe components should be tested with mock implementations of their children to isolate behavior
2. **Prevent Infinite Renders**: Some components may trigger infinite re-render loops in tests; use the `_isTestingMode` flag for `MultiFrameContainer`
3. **Test Layout Transitions**: Verify that layout changes work correctly
4. **Test Panel Configurations**: Ensure panels receive and display the correct content

#### Testing MultiFrameContainer

```typescript
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MultiFrameContainer } from '../components/multiframe/MultiFrameContainer';

// Mock child components
vi.mock('../components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ currentLayout }) => (
    <div data-testid="mock-layout-selector">Layout: {currentLayout}</div>
  )
}));

vi.mock('../components/multiframe/layouts/SinglePanelLayout', () => ({
  SinglePanelLayout: () => <div data-testid="mock-single-panel-layout">Single Panel Layout</div>
}));

describe('MultiFrameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default layout', () => {
    render(
      <MultiFrameContainer 
        initialLayout="single" 
        _isTestingMode={true} // Important to prevent infinite re-renders
      />
    );
    
    expect(screen.getByTestId('mock-layout-selector')).toBeInTheDocument();
    expect(screen.getByTestId('mock-single-panel-layout')).toBeInTheDocument();
  });
});
```

### Detailed Guides

For more detailed information on testing specific components, please refer to:

- [Testing Guide with Multiframe Instructions](../src/__tests__/README.md)
- [Component Architecture Documentation](./architecture/components.md)

### Testing Stateful Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Counter from '../components/Counter';

describe('Counter Component', () => {
  it('increments count when button is clicked', () => {
    render(<Counter initialCount={0} />);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Increment'));
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
``` 
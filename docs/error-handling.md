# Error Handling Guide

## Overview

This guide describes the error handling patterns used throughout the Real Estate Platform. We follow a consistent approach to error handling to ensure reliability and maintainability.

## Error Types

### Application Errors

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}
```

### Common Error Classes

```typescript
class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string) {
    super(401, 'AUTHENTICATION_ERROR', message);
  }
}

class AuthorizationError extends AppError {
  constructor(message: string) {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific error details"
    }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| AUTHENTICATION_ERROR | 401 | Invalid credentials |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Error Handling Middleware

```typescript
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Log unexpected errors
  console.error(err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

## Validation Error Handling

### Request Validation

```typescript
import { validationResult } from 'express-validator';

const validateRequest = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', {
      errors: errors.array()
    });
  }
};
```

### Database Validation

```typescript
try {
  await property.save();
} catch (error) {
  if (error.name === 'ValidationError') {
    throw new ValidationError('Invalid property data', error.errors);
  }
  throw error;
}
```

## Async Error Handling

### Using Express Async Handler

```typescript
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.get('/properties', asyncHandler(async (req, res) => {
  // Handler implementation
}));
```

## Error Logging

### Winston Logger Configuration

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console()
  ]
});
```

### Error Logging Example

```typescript
try {
  // Operation that might fail
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

## Best Practices

1. **Always Use Custom Error Classes**
   - Extend `AppError` for new error types
   - Include relevant error details

2. **Consistent Error Responses**
   - Use standard error format
   - Include appropriate HTTP status codes

3. **Validation**
   - Validate input data before processing
   - Use express-validator for request validation
   - Include detailed validation errors

4. **Async Error Handling**
   - Use asyncHandler wrapper
   - Properly chain Promise catches

5. **Logging**
   - Log all unexpected errors
   - Include relevant context
   - Use appropriate log levels

6. **Security**
   - Don't expose sensitive information in errors
   - Sanitize error messages
   - Use appropriate status codes

## Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/properties')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error.code', 'VALIDATION_ERROR');
  });

  it('should handle not found errors', async () => {
    const response = await request(app)
      .get('/api/properties/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error.code', 'NOT_FOUND');
  });
});
```

# Error Handling Standardization

This document outlines the standardized error handling system implemented across the Real Estate Platform, ensuring a consistent approach to errors in both frontend and backend components.

## Goals

1. Provide a consistent error handling pattern across the application
2. Improve user experience when errors occur
3. Facilitate easier debugging and error tracking
4. Ensure errors don't crash the entire application
5. Standardize error formats between frontend and backend

## Backend Error Format

All API errors now follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { /* optional additional details */ },
  "stack": "Error stack trace (development only)"
}
```

Example error codes:
- `AUTH_NO_TOKEN` - No authentication token provided
- `AUTH_INVALID_TOKEN` - Invalid or expired token
- `AUTH_INSUFFICIENT_PERMISSIONS` - User doesn't have required permissions
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `SERVER_ERROR` - Internal server error

## Frontend Error Handling Components

### 1. Error Service (`errorService.ts`)

Core utility that handles error standardization, logging, and formatting:

- `createAppError()` - Creates a standardized error object from any error type
- `logError()` - Logs errors to console and (optionally) external services
- `getUserFriendlyMessage()` - Gets user-friendly messages from error codes
- `isErrorType()` - Checks if an error is of a specific type

### 2. Error Boundary (`ErrorBoundary.tsx`)

React component that catches JavaScript errors in its child component tree:

- Prevents the entire app from crashing when component errors occur
- Displays a fallback UI when an error is encountered
- Logs errors to the error service
- Provides a way to recover from errors (retry button)

Usage:
```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 3. Error Display (`ErrorDisplay.tsx`)

Reusable component for displaying error messages:

- Converts technical errors to user-friendly messages
- Provides options to retry operations or dismiss errors
- Can show detailed error information (configurable)
- Supports different severity levels and visual styles

Usage:
```jsx
<ErrorDisplay 
  error={error} 
  onClose={clearError}
  onRetry={retryOperation} 
  showDetails={true}
/>
```

### 4. Error Hook (`useErrorHandler.ts`)

Custom React hook for handling errors in functional components:

- Manages error state and loading state
- Provides utilities to handle and clear errors
- Offers wrappers for async functions to automatically handle errors
- Simplifies try/catch patterns in async operations

Usage:
```jsx
const { error, loading, executeAsync } = useErrorHandler();

const fetchData = () => {
  executeAsync(async () => {
    const data = await api.get('/some-endpoint');
    // Process data...
  });
};
```

## API Service Integration

The API service (`api.ts`) has been updated to:

- Log all errors through the error service
- Handle 401/403 errors by redirecting to login
- Support token refresh flows
- Provide typed methods that integrate with the error handling system

## Implementation Examples

See `ErrorHandlingExample.tsx` for practical usage examples of different error handling approaches.

## Best Practices

1. **Always use Error Boundaries** around major components to prevent complete app crashes
2. **Use the `useErrorHandler` hook** for functional components with async operations
3. **Display user-friendly error messages** with the `ErrorDisplay` component
4. **Log all errors** to facilitate debugging and monitoring
5. **Handle specific error types** differently when appropriate
6. **Provide retry mechanisms** when operations can be retried

## Error Logging

While the current implementation logs errors to the console, a production environment should:

1. Configure an external error monitoring service (like Sentry, LogRocket, or New Relic)
2. Update the `sendToErrorLoggingService()` function in `errorService.ts`
3. Add context information to logged errors (user ID, session info, etc.)

## Future Enhancements

1. Implement automatic retry logic for network errors
2. Add correlation IDs to track errors across frontend and backend
3. Add support for offline mode error handling
4. Implement analytics to track error frequency and patterns 
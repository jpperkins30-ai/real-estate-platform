# Server Authentication

> **Note**: This document is part of the Real Estate Platform's security documentation. For a complete overview of security measures and best practices, see the [main security guide](../../docs/SECURITY.md).

# Role Authorization for Real Estate Platform

This documentation explains the role-based authorization implementation for the Real Estate Platform API.

## Overview

The platform uses middleware-based role authorization to restrict access to specific routes based on user roles. The implementation is in `server/src/middleware/roleAuth.ts`.

## Features

- Role-based access control for API routes
- Extensible permission-based authorization
- Token verification with proper error handling
- Support for multiple roles per endpoint

## Implementation

### Role Authorization Middleware

The main authorization middleware checks if the user has one of the specified roles:

```typescript
// From roleAuth.ts
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip role check if no roles specified
    if (roles.length === 0) {
      return next();
    }

    // Get user from request (set by auth middleware)
    const user = req.user;

    // Check if user exists and has role
    if (!user) {
      return res.status(401).json({ 
        message: 'Unauthorized: Authentication required',
        success: false
      });
    }

    // Check if user role is in allowed roles
    if (roles.length && !roles.includes(user.role || '')) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        success: false,
        requiredRoles: roles
      });
    }

    // User has required role, proceed
    next();
  };
};
```

### Permission-Based Authorization

For more granular control, we also have permission-based authorization:

```typescript
export const authorizePermission = (permissions: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // ... similar to role authorization but checks user permissions
  };
};
```

## Usage

### Route Protection

To protect a route with role authorization:

```typescript
import { authorize } from '../middleware/roleAuth';

// Only admin and analyst roles can access this route
router.get('/api/export/properties/csv', authorize(['admin', 'analyst']), 
  (req, res) => {
    // Route handler
  }
);
```

### Multiple Roles

You can specify multiple roles for a route:

```typescript
// Define roles that can access export functionality
const EXPORT_ROLES = ['admin', 'analyst', 'dataManager'];

router.get('/api/export/counties/csv', authorize(EXPORT_ROLES), 
  (req, res) => {
    // Route handler
  }
);
```

### Skip Authorization

You can skip authorization by passing an empty array:

```typescript
// Public route, no authorization needed
router.get('/api/public-data', authorize([]), 
  (req, res) => {
    // Public route handler
  }
);
```

## Testing

You can test the authorization middleware using the test script:

```powershell
# From project root
.\test-auth.ps1
```

This will:
1. Start a test server with authorization middleware
2. Test different authorization scenarios
3. Show the results for each test case

## Security Considerations

1. Always use HTTPS in production
2. Ensure JWT tokens are properly verified
3. Consider token expiration and refresh strategies
4. Implement proper error handling for authorization failures
5. Audit logging for authorization attempts 
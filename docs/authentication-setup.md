# Authentication Setup

> **Note**: This document is part of the Real Estate Platform's security documentation. For a complete overview of security measures and best practices, see the [main security guide](./SECURITY.md).

## Required Packages

### Core Authentication Packages
```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "express-session": "^1.17.3",
    "connect-mongo": "^5.1.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "winston": "^3.11.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/express-session": "^1.17.10",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

## Environment Configuration

### Required Environment Variables
```env
# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your_secure_refresh_token_secret
JWT_REFRESH_EXPIRATION=7d

# Session
SESSION_SECRET=your_secure_session_secret
MONGODB_URI=mongodb://localhost:27017/your_database
MONGODB_TEST_URI=mongodb://localhost:27017/your_test_database

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_WINDOW=60
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-production-domain.com

# Security
NODE_ENV=development
COOKIE_SECRET=your_secure_cookie_secret
```

## TypeScript Configuration

### Type Definitions
```typescript
// types/auth.ts
export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'user';
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ITokenPayload {
  id: string;
  email: string;
  role: string;
}
```

### Authentication Middleware Types
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { IAuthRequest } from '../types/auth';

export type AuthMiddleware = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type RoleMiddleware = (roles: string[]) => AuthMiddleware;
```

## Database Schema

### User Model
```typescript
// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/auth';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'user'],
    default: 'user'
  },
  resetToken: String,
  resetTokenExpires: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ resetToken: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Password validation method
userSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
```

## Authentication Utilities

### Token Generation
```typescript
// utils/auth.ts
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../types/auth';

export const generateTokens = (payload: ITokenPayload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): ITokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as ITokenPayload;
};
```

### Validation Rules
```typescript
// middleware/validation.ts
import { body } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail()
];
```

## Testing Setup

### Authentication Test Utilities
```typescript
// tests/utils/auth.ts
import { User } from '../../models/User';
import { generateTokens } from '../../utils/auth';

export const createTestUser = async (overrides = {}) => {
  const user = await User.create({
    email: 'test@example.com',
    password: 'TestPassword123!',
    role: 'user',
    ...overrides
  });

  const { accessToken, refreshToken } = generateTokens({
    id: user._id.toString(),
    email: user.email,
    role: user.role
  });

  return { user, accessToken, refreshToken };
};

export const clearTestUsers = async () => {
  await User.deleteMany({});
};
```

### Authentication Tests
```typescript
// tests/auth.test.ts
import request from 'supertest';
import { app } from '../app';
import { createTestUser, clearTestUsers } from './utils/auth';

describe('Authentication', () => {
  beforeEach(async () => {
    await clearTestUsers();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'NewPassword123!'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
    });

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          msg: expect.stringContaining('Password must be at least 8 characters')
        })
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const { user } = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });
});
```

## Security Considerations

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common passwords
- No personal information

### Token Security
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Tokens are signed with secure secrets
- Tokens include user ID, email, and role
- Tokens are transmitted over HTTPS only

### Rate Limiting
- Global rate limit: 100 requests per 15 minutes
- Authentication routes: 5 requests per hour
- IP-based rate limiting
- Custom error messages for rate limit exceeded

### Session Security
- Secure session configuration
- HTTP-only cookies
- SameSite strict policy
- Session expiration after 24 hours
- MongoDB session store with TTL

### CORS Configuration
- Whitelisted origins
- Limited HTTP methods
- Specific allowed headers
- Credentials support
- Preflight caching

## Deployment Checklist

### Pre-deployment
1. Update all dependencies
2. Run security audit
3. Check environment variables
4. Verify SSL certificates
5. Test rate limiting
6. Validate CORS settings
7. Check logging configuration
8. Review error handling
9. Test password reset flow
10. Verify session management

### Post-deployment
1. Monitor authentication logs
2. Check error rates
3. Verify rate limiting
4. Test session persistence
5. Validate token generation
6. Check password reset emails
7. Monitor failed login attempts
8. Verify CORS functionality
9. Test refresh token flow
10. Validate security headers 
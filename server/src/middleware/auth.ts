// @ts-nocheck
// src/middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/auth';
import { JwtPayload } from 'jsonwebtoken';
import { UserJwtPayload } from '../types/auth';
import { TypedRequestHandler } from '../types/express';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../types/inventory';
import config from '../config';
import { logError } from '../utils/logger';

interface AuthRequest extends Request {
  user?: UserDocument;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // For development, bypass auth if needed
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      req.user = { id: 'dev-user', role: 'admin' };
      return next();
    }

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    logError('Auth middleware error', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
};

// Middleware to check user role permissions
export function authorize(roles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip role check if no roles are required
    if (roles.length === 0) {
      return next();
    }

    // Check if authenticated (user object should exist from authenticateToken)
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user role is in the allowed roles
    const userRole = req.user.role || 'user'; // Default to 'user' if role is undefined
    if (roles.indexOf(userRole) === -1) {
      return res.status(403).json({ 
        message: 'Forbidden - Insufficient permissions',
        code: 'AUTH_INSUFFICIENT_PERMISSIONS' 
      });
    }

    next();
  };
}

// Combined middleware for authentication and role-based authorization
export function authenticate(roles: string[] = []): RequestHandler[] {
  return [auth, authorize(roles)];
}

/**
 * Middleware to check user roles
 */
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication found'
      });
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: 'Permission denied'
    });
  };
}; 
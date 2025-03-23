// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
        [key: string]: any;
      };
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
  
  // Attach the user information to the request
  req.user = payload;
  next();
}

// Middleware to check user role permissions
export function authorize(roles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip role check if no roles are required
    if (roles.length === 0) {
      return next();
    }

    // Check if authenticated (user object should exist from authenticateToken)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user role is in the allowed roles
    const userRole = req.user.role || 'user'; // Default to 'user' if role is undefined
    if (roles.indexOf(userRole) === -1) {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
}

// Combined middleware for authentication and role-based authorization
export function authenticate(roles: string[] = []) {
  return [authenticateToken, authorize(roles)];
}
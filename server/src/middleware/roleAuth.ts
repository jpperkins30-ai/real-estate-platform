import { Request, Response, NextFunction } from 'express';

// Enhanced user type with optional permissions
interface EnhancedUser {
  id: string;
  role?: string;
  permissions?: string[];
}

/**
 * Middleware to authorize based on user role
 * @param roles Array of roles allowed to access the route
 * @returns Express middleware function
 */
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

/**
 * Middleware to authorize based on specific permissions
 * @param permissions Array of permissions required to access the route
 * @returns Express middleware function
 */
export const authorizePermission = (permissions: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip permission check if no permissions specified
    if (permissions.length === 0) {
      return next();
    }

    const user = req.user as EnhancedUser | undefined;

    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        message: 'Unauthorized: Authentication required',
        success: false
      });
    }

    // Check if user has any of the required permissions
    const userPermissions = user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        success: false,
        requiredPermissions: permissions
      });
    }

    // User has required permissions, proceed
    next();
  };
};

import { Request, Response, NextFunction } from 'express';
import { logAuthEvent } from '../utils/appLogger';

interface ActivityLogOptions {
  actionType: string;
  resourceType: string;
  includeBody?: boolean;
  includeParams?: boolean;
  includeQuery?: boolean;
  sensitiveFields?: string[];
}

/**
 * Middleware to log authenticated user activities
 * 
 * @param options Configuration options for activity logging
 * @returns Express middleware function
 */
export const logUserActivity = (options: ActivityLogOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only log if user is authenticated
    if (!req.user?.id) {
      return next();
    }

    const userId = req.user.id;
    const { actionType, resourceType, includeBody, includeParams, includeQuery, sensitiveFields = [] } = options;
    
    // Build metadata for the log
    const meta: Record<string, any> = {
      method: req.method,
      path: req.path,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // Include request parameters if specified
    if (includeParams && Object.keys(req.params).length > 0) {
      meta.params = { ...req.params };
    }

    // Include query parameters if specified
    if (includeQuery && Object.keys(req.query).length > 0) {
      meta.query = { ...req.query };
    }

    // Include request body if specified (with sensitive data masked)
    if (includeBody && req.body && Object.keys(req.body).length > 0) {
      // Clone the body to avoid mutating the original
      const body = { ...req.body };
      
      // Mask sensitive fields
      for (const field of sensitiveFields) {
        if (body[field]) {
          body[field] = '********';
        }
      }
      
      meta.body = body;
    }

    // Log the user activity
    logAuthEvent(
      `${actionType}:${resourceType}`,
      userId,
      true,
      meta
    );

    next();
  };
};

/**
 * Create pre-configured middleware for common activities
 */
export const activityLogger = {
  /**
   * Log user viewing a resource
   */
  viewResource: (resourceType: string) => logUserActivity({
    actionType: 'view',
    resourceType,
    includeParams: true,
    includeQuery: true
  }),

  /**
   * Log user creating a resource
   */
  createResource: (resourceType: string, sensitiveFields: string[] = []) => logUserActivity({
    actionType: 'create',
    resourceType,
    includeBody: true,
    sensitiveFields
  }),

  /**
   * Log user updating a resource
   */
  updateResource: (resourceType: string, sensitiveFields: string[] = []) => logUserActivity({
    actionType: 'update',
    resourceType,
    includeParams: true,
    includeBody: true,
    sensitiveFields
  }),

  /**
   * Log user deleting a resource
   */
  deleteResource: (resourceType: string) => logUserActivity({
    actionType: 'delete',
    resourceType,
    includeParams: true
  }),

  /**
   * Log admin actions
   */
  adminAction: (resourceType: string, actionType: string) => logUserActivity({
    actionType,
    resourceType,
    includeParams: true,
    includeQuery: true,
    includeBody: true,
    sensitiveFields: ['password', 'token', 'refreshToken', 'accessToken']
  })
};

export default activityLogger; 
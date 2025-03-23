import { Request, Response, NextFunction, RequestHandler } from 'express';

type RouteHandlerFunction = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => Promise<void> | void;

/**
 * Custom wrapper for Express route handlers to fix TypeScript return type issues
 * This ensures the function is typed correctly for Express
 */
export const routeHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => any
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = handler(req, res, next);
      
      // Handle promises properly
      if (result instanceof Promise) {
        result.catch((err) => next(err));
      }
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Handler for async routes that returns void
 */
export const asyncRouteHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next))
      .catch(next);
  };
};

export default routeHandler; 
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async function to properly handle exceptions in Express routes
 * This addresses the TypeScript error with Express route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler; 
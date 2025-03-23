import { Request, Response } from 'express';

// Define a user payload for authenticated requests
export interface UserPayload {
  id: string;
  email?: string;
  role: string;
}

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Helper type for typed request handlers with body
export type TypedRequestHandler<T = any> = (
  req: Request<any, any, T>,
  res: Response
) => Promise<void> | void;

// Helper type for request with user authentication
export type AuthenticatedRequest = Request & { user: UserPayload }; 
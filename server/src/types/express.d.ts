import { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        role?: string;
      };
    }
  }
}

// Extend the normal Express RequestHandler to improve typings with route handlers
export interface TypedRequestHandler<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Record<string, string | string[]>
> extends RequestHandler {
  (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ): void | Promise<void> | Response<ResBody> | Promise<Response<ResBody>>;
} 
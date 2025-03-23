// Type definitions for express-async-handler
// Project: https://github.com/Abazhenov/express-async-handler
// Definitions by: Cursor AI

import { RequestHandler, Request, Response, NextFunction } from 'express';

declare module 'express-async-handler' {
  type AsyncRequestHandler<T = any> = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<T>;

  function expressAsyncHandler<T = any>(
    handler: AsyncRequestHandler<T>
  ): RequestHandler;

  export = expressAsyncHandler;
} 
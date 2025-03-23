import 'express';

declare module 'express' {
  // Extend the RequestHandler interface to allow for any return type
  interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }
}

// This extension allows us to add a user property to the Request object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

// This is needed to make the file a module
export {}; 
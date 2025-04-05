import { Request, Response, NextFunction, Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../swagger/config';

export const setupSwagger = (app: Application) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Swagger documentation initialized at /api-docs');
};

// Middleware to include requestId in each request for better tracking
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.locals.requestId = requestId;
  next();
}; 
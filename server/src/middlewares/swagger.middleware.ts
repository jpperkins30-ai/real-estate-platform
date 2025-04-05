import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../swagger/config';

/**
 * Setup Swagger middleware for Express application
 * @param app Express application
 */
export const setupSwagger = (app: any) => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Real Estate Platform API Documentation',
    swaggerOptions: {
      persistAuthorization: true
    }
  }));

  // Serve swagger.json
  app.get('/swagger.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at /api-docs');
};

/**
 * Middleware to validate API key for Swagger docs (optional)
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  const expectedApiKey = process.env.SWAGGER_API_KEY;

  if (!expectedApiKey || apiKey === expectedApiKey) {
    return next();
  }

  res.status(401).json({ message: 'Unauthorized access to API documentation' });
}; 
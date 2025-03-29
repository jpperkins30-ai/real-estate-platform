// server/src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('../utils/logger');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API',
      version: '1.0.0',
      description: 'API documentation for Real Estate Platform',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-url.com' 
          : 'http://localhost:4000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
  },
  // Make sure this path correctly points to your route files
  apis: ['./src/routes/*.js', './src/routes/*.ts', './src/models/*.js', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  // Serve Swagger spec as JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Setup Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  logger.info('Swagger documentation initialized');
};

module.exports = { setupSwagger, swaggerSpec }; 
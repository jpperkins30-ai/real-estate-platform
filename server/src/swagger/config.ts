import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API',
      version,
      description: 'API documentation for the Real Estate Platform',
      contact: {
        name: 'Development Team',
        email: 'dev@example.com'
      },
      license: {
        name: 'Private',
        url: 'https://example.com'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            },
            statusCode: {
              type: 'integer'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/routes/*.ts',
    './src/models/*.ts',
    './src/controllers/*.ts',
    './src/swagger/definitions/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(options); 
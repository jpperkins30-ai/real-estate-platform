// src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import config from './config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API',
      version: '1.0.0',
      description: 'API for real estate property management, data collection, and transformation',
      contact: {
        name: 'API Support',
        email: 'support@realestate-platform.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Property: {
          type: 'object',
          required: ['title', 'propertyType', 'price', 'address', 'city', 'country'],
          properties: {
            _id: {
              type: 'string',
              description: 'Automatically generated MongoDB ID'
            },
            title: {
              type: 'string',
              description: 'Property title'
            },
            description: {
              type: 'string',
              description: 'Detailed property description'
            },
            propertyType: {
              type: 'string',
              enum: ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'],
              description: 'Type of property'
            },
            status: {
              type: 'string',
              enum: ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED'],
              description: 'Current status of the property'
            },
            price: {
              type: 'number',
              description: 'Property price'
            },
            area: {
              type: 'number',
              description: 'Property area in square meters'
            },
            bedrooms: {
              type: 'number',
              description: 'Number of bedrooms'
            },
            bathrooms: {
              type: 'number',
              description: 'Number of bathrooms'
            },
            address: {
              type: 'string',
              description: 'Street address'
            },
            city: {
              type: 'string',
              description: 'City'
            },
            state: {
              type: 'string',
              description: 'State or province'
            },
            zipCode: {
              type: 'string',
              description: 'Postal or ZIP code'
            },
            country: {
              type: 'string',
              description: 'Country'
            },
            latitude: {
              type: 'number',
              description: 'Latitude coordinate'
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Property features and amenities'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'URLs to property images'
            },
            agent: {
              type: 'string',
              description: 'Reference to the agent user ID'
            },
            sourceId: {
              type: 'string',
              description: 'Reference to the data source if imported'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            },
            soldDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date when property was sold (if status is SOLD)'
            }
          }
        },
        DataSource: {
          type: 'object',
          required: ['name', 'collectorType', 'config'],
          properties: {
            _id: {
              type: 'string',
              description: 'Automatically generated MongoDB ID'
            },
            name: {
              type: 'string',
              description: 'Data source name'
            },
            description: {
              type: 'string',
              description: 'Data source description'
            },
            collectorType: {
              type: 'string',
              description: 'Type of collector to use (e.g., API, RSS, SCRAPER)'
            },
            active: {
              type: 'boolean',
              description: 'Whether this data source is active'
            },
            config: {
              type: 'object',
              description: 'Configuration for the data source collector'
            },
            schedule: {
              type: 'string',
              description: 'Cron schedule for automatic collection'
            },
            lastCollection: {
              type: 'string',
              format: 'date-time',
              description: 'Last successful collection timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Collection: {
          type: 'object',
          required: ['sourceId', 'data', 'status'],
          properties: {
            _id: {
              type: 'string',
              description: 'Automatically generated MongoDB ID'
            },
            sourceId: {
              type: 'string',
              description: 'Reference to the data source'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Collection timestamp'
            },
            duration: {
              type: 'number',
              description: 'Collection duration in milliseconds'
            },
            itemCount: {
              type: 'number',
              description: 'Number of items collected'
            },
            status: {
              type: 'string',
              enum: ['SUCCESS', 'PARTIAL', 'FAILED'],
              description: 'Collection status'
            },
            error: {
              type: 'string',
              description: 'Error message if collection failed'
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Raw data collected'
            },
            processed: {
              type: 'boolean',
              description: 'Whether this collection has been processed'
            },
            processedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the collection was processed'
            },
            processedItemCount: {
              type: 'number',
              description: 'Number of items successfully processed'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const specs = swaggerJSDoc(options); 
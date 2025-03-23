import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API',
      version: '1.0.0',
      description: 'API documentation for the Real Estate Platform',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Property: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated id of the property',
            },
            parcelId: {
              type: 'string',
              description: 'The parcel ID of the property',
            },
            taxAccountNumber: {
              type: 'string',
              description: 'The tax account number',
            },
            ownerName: {
              type: 'string',
              description: 'The name of the property owner',
            },
            propertyAddress: {
              type: 'string',
              description: 'The address of the property',
            },
            city: {
              type: 'string',
              description: 'The city where the property is located',
            },
            state: {
              type: 'string',
              description: 'The state where the property is located',
            },
            county: {
              type: 'string',
              description: 'The county where the property is located',
            },
            zipCode: {
              type: 'string',
              description: 'The zip code of the property',
            },
            propertyType: {
              type: 'string',
              description: 'The type of property',
            },
            propertyDetails: {
              type: 'object',
              description: 'Additional property details',
            },
            taxInfo: {
              type: 'object',
              description: 'Tax information for the property',
            },
            saleInfo: {
              type: 'object',
              description: 'Sales information for the property',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata for the property',
            },
          },
        },
        DataSource: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated id of the data source',
            },
            name: {
              type: 'string',
              description: 'The name of the data source',
            },
            type: {
              type: 'string',
              enum: ['county-website', 'state-records', 'tax-database', 'api', 'pdf'],
              description: 'The type of the data source',
            },
            url: {
              type: 'string',
              description: 'The URL of the data source',
            },
            region: {
              type: 'object',
              properties: {
                state: {
                  type: 'string',
                  description: 'The state of the region',
                },
                county: {
                  type: 'string',
                  description: 'The county of the region',
                },
              },
            },
            collectorType: {
              type: 'string',
              description: 'The collector type to use for this data source',
            },
            schedule: {
              type: 'object',
              properties: {
                frequency: {
                  type: 'string',
                  enum: ['hourly', 'daily', 'weekly', 'monthly', 'manual'],
                  description: 'The frequency of collection',
                },
                dayOfWeek: {
                  type: 'integer',
                  description: 'The day of the week (0-6) for weekly collections',
                },
                dayOfMonth: {
                  type: 'integer',
                  description: 'The day of the month (1-31) for monthly collections',
                },
              },
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata for the data source',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'error'],
              description: 'The status of the data source',
            },
          },
        },
        Collection: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated id of the collection',
            },
            sourceId: {
              type: 'string',
              description: 'The ID of the data source',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'The timestamp of the collection',
            },
            status: {
              type: 'string',
              enum: ['success', 'partial', 'error'],
              description: 'The status of the collection',
            },
            stats: {
              type: 'object',
              description: 'Collection statistics',
            },
            errorLog: {
              type: 'array',
              description: 'Log of errors encountered during collection',
            },
            properties: {
              type: 'array',
              description: 'IDs of properties collected',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi }; 
// src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import config from './config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API',
      version: '1.0.0',
      description: 'API documentation for Real Estate Platform',
      contact: {
        name: 'API Support',
        email: 'support@realestate-platform.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Property: {
          type: 'object',
          required: ['parcelId', 'taxAccountNumber', 'type', 'parentId', 'countyId', 'stateId', 'ownerName', 'propertyAddress', 'metadata'],
          properties: {
            _id: {
              type: 'string',
              description: 'Automatically generated MongoDB ID'
            },
            parcelId: {
              type: 'string',
              description: 'Unique parcel identifier'
            },
            taxAccountNumber: {
              type: 'string',
              description: 'Tax account number'
            },
            type: {
              type: 'string',
              enum: ['property'],
              description: 'Object type'
            },
            parentId: {
              type: 'string',
              description: 'Reference to the parent county object ID'
            },
            countyId: {
              type: 'string',
              description: 'Reference to the county object ID'
            },
            stateId: {
              type: 'string',
              description: 'Reference to the state object ID'
            },
            ownerName: {
              type: 'string',
              description: 'Property owner name'
            },
            propertyAddress: {
              type: 'string',
              description: 'Property street address'
            },
            city: {
              type: 'string',
              description: 'City'
            },
            zipCode: {
              type: 'string',
              description: 'Postal or ZIP code'
            },
            geometry: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point', 'Polygon'],
                  description: 'GeoJSON geometry type'
                },
                coordinates: {
                  type: 'array',
                  description: 'GeoJSON coordinates'
                }
              }
            },
            metadata: {
              type: 'object',
              required: ['propertyType', 'taxStatus'],
              properties: {
                propertyType: {
                  type: 'string',
                  description: 'Type of property'
                },
                yearBuilt: {
                  type: 'number',
                  description: 'Year the property was built'
                },
                landArea: {
                  type: 'number',
                  description: 'Land area size'
                },
                landAreaUnit: {
                  type: 'string',
                  description: 'Unit of land area measurement (e.g., sqft, acres)'
                },
                buildingArea: {
                  type: 'number',
                  description: 'Building area size'
                },
                buildingAreaUnit: {
                  type: 'string',
                  description: 'Unit of building area measurement (e.g., sqft)'
                },
                taxStatus: {
                  type: 'string',
                  enum: ['Paid', 'Delinquent', 'Unknown'],
                  description: 'Property tax payment status'
                },
                assessedValue: {
                  type: 'number',
                  description: 'Property assessed value for tax purposes'
                },
                marketValue: {
                  type: 'number',
                  description: 'Estimated market value'
                },
                taxDue: {
                  type: 'number',
                  description: 'Amount of taxes due'
                },
                saleType: {
                  type: 'string',
                  enum: ['Tax Lien', 'Deed', 'Conventional', 'Other'],
                  description: 'Type of property sale'
                },
                saleAmount: {
                  type: 'number',
                  description: 'Amount of last sale'
                },
                saleDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date of last sale'
                },
                lastUpdated: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Last data update timestamp'
                },
                dataSource: {
                  type: 'string',
                  description: 'Source of the property data'
                },
                lookupMethod: {
                  type: 'string',
                  enum: ['account_number', 'parcel_id'],
                  description: 'Method used to look up property data'
                },
                rawData: {
                  type: 'object',
                  description: 'Raw data collected from source'
                }
              }
            },
            controllers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ControllerReference'
              },
              description: 'Controllers attached to this property'
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
        ControllerReference: {
          type: 'object',
          required: ['controllerId', 'controllerType', 'enabled'],
          properties: {
            controllerId: {
              type: 'string',
              description: 'Reference to the controller ID'
            },
            controllerType: {
              type: 'string',
              enum: ['Tax Sale', 'Map', 'Property', 'Demographics'],
              description: 'Type of controller'
            },
            enabled: {
              type: 'boolean',
              description: 'Whether the controller is enabled'
            },
            lastRun: {
              type: 'string',
              format: 'date-time',
              description: 'Last run timestamp'
            },
            nextScheduledRun: {
              type: 'string',
              format: 'date-time',
              description: 'Next scheduled run timestamp'
            },
            configuration: {
              type: 'object',
              description: 'Controller configuration'
            }
          }
        },
        Controller: {
          type: 'object',
          required: ['name', 'controllerType'],
          properties: {
            _id: {
              type: 'string',
              description: 'Automatically generated MongoDB ID'
            },
            name: {
              type: 'string',
              description: 'Controller name'
            },
            type: {
              type: 'string',
              enum: ['controller'],
              description: 'Object type'
            },
            controllerType: {
              type: 'string',
              enum: ['Tax Sale', 'Map', 'Property', 'Demographics'],
              description: 'Type of controller'
            },
            description: {
              type: 'string',
              description: 'Controller description'
            },
            configTemplate: {
              type: 'object',
              properties: {
                requiredFields: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Required configuration fields'
                },
                optionalFields: {
                  type: 'object',
                  description: 'Optional configuration fields with default values'
                }
              }
            },
            attachedTo: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  objectId: {
                    type: 'string',
                    description: 'ID of attached object'
                  },
                  objectType: {
                    type: 'string',
                    enum: ['us_map', 'state', 'county', 'property'],
                    description: 'Type of attached object'
                  }
                }
              },
              description: 'Objects this controller is attached to'
            },
            implementation: {
              type: 'object',
              properties: {
                collectorType: {
                  type: 'string',
                  description: 'Type of data collector to use'
                },
                supportedSourceTypes: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Supported source data types'
                },
                additionalConfig: {
                  type: 'object',
                  description: 'Additional implementation configuration'
                }
              }
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
        County: {
          type: 'object',
          required: ['name', 'stateId', 'type', 'parentId'],
          properties: {
            _id: {
              type: 'string',
              description: 'Automatically generated MongoDB ID'
            },
            name: {
              type: 'string',
              description: 'County name'
            },
            stateId: {
              type: 'string',
              description: 'Reference to the state ID'
            },
            type: {
              type: 'string',
              enum: ['county'],
              description: 'Object type'
            },
            parentId: {
              type: 'string',
              description: 'Reference to the parent state ID'
            },
            fips: {
              type: 'string',
              description: 'FIPS code'
            },
            population: {
              type: 'number',
              description: 'County population'
            },
            area: {
              type: 'number',
              description: 'County area in square miles'
            },
            geometry: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Polygon', 'MultiPolygon'],
                  description: 'GeoJSON geometry type'
                },
                coordinates: {
                  type: 'array',
                  description: 'GeoJSON coordinates'
                }
              }
            },
            metadata: {
              type: 'object',
              properties: {
                totalProperties: {
                  type: 'number',
                  description: 'Total number of properties in the county'
                },
                statistics: {
                  type: 'object',
                  properties: {
                    totalTaxLiens: {
                      type: 'number',
                      description: 'Total number of tax liens'
                    },
                    totalValue: {
                      type: 'number',
                      description: 'Total property value'
                    },
                    averagePropertyValue: {
                      type: 'number',
                      description: 'Average property value'
                    },
                    totalPropertiesWithLiens: {
                      type: 'number',
                      description: 'Total number of properties with tax liens'
                    },
                    lastUpdated: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Last update timestamp'
                    }
                  }
                },
                searchConfig: {
                  type: 'object',
                  properties: {
                    searchUrl: {
                      type: 'string',
                      description: 'URL for property searches'
                    },
                    lookupMethod: {
                      type: 'string',
                      enum: ['account_number', 'parcel_id'],
                      description: 'Method used for property lookups'
                    },
                    selectors: {
                      type: 'object',
                      description: 'CSS selectors for data extraction'
                    },
                    lienUrl: {
                      type: 'string',
                      description: 'URL for tax lien searches'
                    }
                  }
                }
              }
            },
            controllers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ControllerReference'
              },
              description: 'Controllers attached to this county'
            },
            dataLastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Last data update timestamp'
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
        State: {
          type: 'object',
          required: ['name', 'abbreviation', 'type'],
          properties: {
            _id: {
              type: 'string',
              description: 'Automatically generated MongoDB ID'
            },
            name: {
              type: 'string',
              description: 'State name'
            },
            abbreviation: {
              type: 'string',
              description: 'State abbreviation'
            },
            type: {
              type: 'string',
              enum: ['state'],
              description: 'Object type'
            },
            parentId: {
              type: 'string',
              description: 'Reference to the parent US map ID'
            },
            region: {
              type: 'string',
              description: 'Geographic region'
            },
            geometry: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Polygon', 'MultiPolygon'],
                  description: 'GeoJSON geometry type'
                },
                coordinates: {
                  type: 'array',
                  description: 'GeoJSON coordinates'
                }
              }
            },
            metadata: {
              type: 'object',
              properties: {
                totalCounties: {
                  type: 'number',
                  description: 'Total number of counties in the state'
                },
                totalProperties: {
                  type: 'number',
                  description: 'Total number of properties in the state'
                },
                statistics: {
                  type: 'object',
                  properties: {
                    totalTaxLiens: {
                      type: 'number',
                      description: 'Total number of tax liens'
                    },
                    totalValue: {
                      type: 'number',
                      description: 'Total property value'
                    },
                    averagePropertyValue: {
                      type: 'number',
                      description: 'Average property value'
                    },
                    totalPropertiesWithLiens: {
                      type: 'number',
                      description: 'Total number of properties with tax liens'
                    },
                    lastUpdated: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Last update timestamp'
                    }
                  }
                }
              }
            },
            controllers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ControllerReference'
              },
              description: 'Controllers attached to this state'
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

export default swaggerJSDoc(options); 
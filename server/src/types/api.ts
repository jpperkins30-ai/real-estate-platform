import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Property filter query params
export interface PropertyFilterQuery {
  state?: string;
  county?: string;
  propertyType?: string;
  taxStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  minDate?: Date;
  maxDate?: Date;
  [key: string]: any;
}

// Extend Express Request for property filters
export interface PropertyFilterRequest extends Request {
  query: PropertyFilterQuery;
}

// County filter query params
export interface CountyFilterQuery {
  state?: string;
  [key: string]: any;
}

// Extend Express Request for county filters
export interface CountyFilterRequest extends Request {
  query: CountyFilterQuery;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Export filter interface
export interface ExportFilter {
  stateId?: string;
  countyId?: string;
  propertyType?: string;
  taxStatus?: string;
  minValue?: number;
  maxValue?: number;
  updatedAfter?: Date;
  [key: string]: any;
}

// Export request interface
export interface ExportRequest extends Request {
  body: ExportFilter;
}

// Export format type
export type ExportFormat = 'csv' | 'excel' | 'json';

// Export data type
export type ExportDataType = 'properties' | 'counties' | 'states';

// Export response interface
export interface ExportResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  filename?: string;
  contentType?: string;
}

// Export options interface
export interface ExportOptions {
  format: ExportFormat;
  dataType: ExportDataType;
  filters?: ExportFilter;
  fields?: string[];
  filename?: string;
}

// Export service interface
export interface IExportService {
  exportToCSV(dataType: ExportDataType, filters?: ExportFilter): Promise<string>;
  exportToExcel(dataType: ExportDataType, filters?: ExportFilter): Promise<Buffer>;
  exportToJSON(dataType: ExportDataType, filters?: ExportFilter): Promise<any>;
  exportPropertiesToCsv(fields: string[], filters?: ExportFilter): Promise<string>;
  exportPropertiesToExcel(fields: string[], filters?: ExportFilter): Promise<Buffer>;
  exportCountiesToCsv(fields: string[], filters?: ExportFilter): Promise<string>;
  exportCountiesToExcel(fields: string[], filters?: ExportFilter): Promise<Buffer>;
}

// Export route handler interface
export interface ExportRouteHandler {
  (req: ExportRequest, res: Response): Promise<void>;
}

// Export route configuration interface
export interface ExportRouteConfig {
  path: string;
  method: 'get' | 'post';
  handler: ExportRouteHandler;
  swagger: {
    summary: string;
    description: string;
    tags: string[];
    parameters?: any[];
    requestBody?: any;
    responses: any;
  };
}

// Export routes configuration
export const exportRoutes: ExportRouteConfig[] = [
  {
    path: '/properties/csv',
    method: 'get',
    handler: async (req: ExportRequest, res: Response) => {
      // Implementation will be in the routes file
    },
    swagger: {
      summary: 'Export properties to CSV format',
      description: 'Download property data in CSV format with optional filtering',
      tags: ['Export'],
      parameters: [
        {
          in: 'query',
          name: 'state',
          schema: { type: 'string' },
          description: 'Filter by state ID'
        },
        {
          in: 'query',
          name: 'county',
          schema: { type: 'string' },
          description: 'Filter by county ID'
        },
        {
          in: 'query',
          name: 'propertyType',
          schema: { type: 'string' },
          description: 'Filter by property type'
        },
        {
          in: 'query',
          name: 'taxStatus',
          schema: { type: 'string' },
          description: 'Filter by tax status'
        },
        {
          in: 'query',
          name: 'minValue',
          schema: { type: 'number' },
          description: 'Minimum market value filter'
        },
        {
          in: 'query',
          name: 'maxValue',
          schema: { type: 'number' },
          description: 'Maximum market value filter'
        }
      ],
      responses: {
        '200': {
          description: 'CSV file download',
          content: {
            'text/csv': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        '400': {
          description: 'Invalid filter parameters'
        },
        '404': {
          description: 'No properties found with the provided filters'
        },
        '500': {
          description: 'Server error'
        }
      }
    }
  }
  // Additional route configurations can be added here
]; 
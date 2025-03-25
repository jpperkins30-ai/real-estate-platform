# API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

All API endpoints except public search require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Common Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Error details"
}
```

## Rate Limiting

No rate limiting is currently implemented in the base application. Implement custom middleware if needed.

## Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | User logout |

### States
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/states` | List all states |
| GET | `/states/:id` | Get state details |
| POST | `/states` | Create new state |
| PUT | `/states/:id` | Update state |
| DELETE | `/states/:id` | Delete state |
| GET | `/states/:id/counties` | List counties in state |
| GET | `/states/:id/statistics` | Get state statistics |
| GET | `/states/:id/controllers` | List controllers attached to state |
| POST | `/states/:id/controllers` | Attach controller to state |
| POST | `/states/:id/recalculate` | Recalculate state statistics |

### Counties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/counties` | List all counties |
| GET | `/counties/:id` | Get county details |
| POST | `/counties` | Create new county |
| PUT | `/counties/:id` | Update county |
| DELETE | `/counties/:id` | Delete county |
| GET | `/counties/:id/properties` | List properties in county |
| GET | `/counties/:id/statistics` | Get county statistics |
| PUT | `/counties/:id/searchConfig` | Update county search configuration |
| POST | `/counties/:id/controllers` | Attach controller to county |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/properties` | List properties with pagination |
| GET | `/properties/:id` | Get property details |
| POST | `/properties` | Create property |
| PUT | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |
| GET | `/properties/search` | Search properties with filters |
| GET | `/properties/fuzzy-search` | Search properties using fuzzy matching |
| GET | `/properties/states/:stateId` | Get properties by state ID |
| GET | `/properties/counties/:countyId` | Get properties by county ID |
| GET | `/properties/stats/county` | Get property statistics by county |

### Controllers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/controllers` | List all controllers |
| GET | `/controllers/:id` | Get controller details |
| POST | `/controllers` | Create new controller |
| PUT | `/controllers/:id` | Update controller |
| DELETE | `/controllers/:id` | Delete controller |
| PUT | `/controllers/:id/enable` | Enable controller |
| PUT | `/controllers/:id/disable` | Disable controller |
| POST | `/controllers/:id/execute` | Execute controller |
| POST | `/controllers/:id/validate` | Validate controller |
| POST | `/controllers/:id/test` | Test controller with sample data |
| POST | `/controllers/:id/docs` | Generate API docs for controller |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/properties/csv` | Export properties to CSV |
| GET | `/export/properties/excel` | Export properties to Excel |
| POST | `/export/counties/direct-csv` | Export counties to CSV directly |
| POST | `/export/:dataType/csv` | Export data to CSV (properties, counties, states) |
| POST | `/export/:dataType/excel` | Export data to Excel (properties, counties, states) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users (admin only) |
| GET | `/users/:id` | Get user profile |
| PUT | `/users/:id` | Update user profile |
| DELETE | `/users/:id` | Delete user (admin or self) |

### Logs (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs/stats` | Get log statistics |
| GET | `/logs/search` | Search logs with filters |
| GET | `/logs/files` | List available log files |
| GET | `/logs/download/:filename` | Download a log file |

## Common Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filtering
- State: `state=Maryland`
- County: `county=St. Mary's`
- Property Type: `propertyType=Residential`

## Response Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## API Documentation

For interactive API documentation, visit:
```
http://localhost:5000/api-docs
```

This provides Swagger UI documentation for all available endpoints.

## State API Endpoints (Detail)

### Get All States
```
GET /api/states
```

Query parameters:
- `includeGeometry`: Boolean to include geometry data (default: false)

Response:
```json
{
  "states": [
    {
      "_id": "60a1b2c3d4e5f6g7h8i9j0",
      "name": "Maryland",
      "abbreviation": "MD",
      "metadata": {
        "totalCounties": 24,
        "totalProperties": 1250,
        "statistics": {
          "totalTaxLiens": 45,
          "totalValue": 12500000,
          "averagePropertyValue": 275000,
          "lastUpdated": "2023-07-01T12:00:00Z"
        }
      },
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-07-01T12:00:00Z"
    }
  ]
}
```

### Get State Counties
```
GET /api/states/:id/counties
```

Query parameters:
- `includeGeometry`: Boolean to include county geometry data (default: false)

Response:
```json
{
  "counties": [
    {
      "_id": "60a1b2c3d4e5f6g7h8i9j1",
      "name": "Montgomery County",
      "stateId": "60a1b2c3d4e5f6g7h8i9j0",
      "metadata": {
        "totalProperties": 450,
        "statistics": {
          "totalTaxLiens": 15,
          "totalValue": 5000000,
          "averagePropertyValue": 350000
        }
      },
      "createdAt": "2023-01-15T00:00:00Z",
      "updatedAt": "2023-07-01T12:00:00Z"
    }
  ],
  "total": 24
}
```

## Controller API Endpoints (Detail)

### Execute Controller
```
POST /api/controllers/:id/execute
```

Request body:
```json
{
  "parameters": {
    "startDate": "2023-07-01",
    "endDate": "2023-07-31",
    "targetId": "60a1b2c3d4e5f6g7h8i9j0", 
    "options": {
      "maxItems": 100,
      "includeInactive": false
    }
  }
}
```

Response:
```json
{
  "executionId": "exec_12345",
  "status": "completed",
  "startTime": "2023-07-15T10:00:00Z",
  "endTime": "2023-07-15T10:01:23Z",
  "results": {
    "processed": 100,
    "created": 75,
    "updated": 15,
    "errors": 10,
    "errorDetails": [
      {
        "item": "property_123",
        "message": "Missing required field"
      }
    ]
  }
}
```

## Export API Endpoints (Detail)

### Export Properties to Excel
```
GET /api/export/properties/excel
```

Query parameters:
- `stateId`: Filter by state ID
- `countyId`: Filter by county ID
- `propertyType`: Filter by property type
- `minValue`: Minimum property value
- `maxValue`: Maximum property value

Response: Excel file download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

### Export Data by Type
```
POST /api/export/:dataType/csv
```

Path parameters:
- `dataType`: Type of data to export (properties, counties, states)

Request body:
```json
{
  "stateId": "60a1b2c3d4e5f6g7h8i9j0",
  "countyId": "60a1b2c3d4e5f6g7h8i9j1",
  "propertyType": "Residential",
  "taxStatus": "Lien",
  "updatedAfter": "2023-01-01T00:00:00Z"
}
```

Response: CSV file download (text/csv)

## Search API Endpoints (Detail)

### Property Search
```
GET /api/properties/search
```

Query parameters:
- `stateId`: Filter by state ID
- `countyId`: Filter by county ID
- `status`: Filter by property status
- `minValue`: Minimum property value
- `maxValue`: Maximum property value
- `propertyType`: Filter by property type
- `minBedrooms`: Minimum number of bedrooms
- `maxBedrooms`: Maximum number of bedrooms
- `minBathrooms`: Minimum number of bathrooms
- `maxBathrooms`: Maximum number of bathrooms
- `zipCode`: Filter by ZIP code
- `city`: Filter by city
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Field to sort by (default: 'updatedAt')
- `sortOrder`: Sort order ('asc' or 'desc', default: 'desc')

Response:
```json
{
  "properties": [
    {
      "_id": "60a1b2c3d4e5f6g7h8i9j2",
      "parcelId": "12345",
      "address": "123 Main St",
      "city": "Rockville",
      "state": "MD",
      "zipCode": "20850",
      "value": 450000,
      "taxStatus": "Current",
      "createdAt": "2023-02-15T00:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  ],
  "total": 450,
  "page": 1,
  "limit": 20
}
```

## Log API Endpoints (Detail)

### Get Log Statistics
```
GET /api/logs/stats
```

Query parameters:
- `days`: Number of days to analyze (default: 7)
- `level`: Filter by log level (error, warn, info, http, debug)
- `collection`: Filter by database collection
- `userId`: Filter by user ID
- `message`: Search in message text
- `startDate`: Filter logs after this date (YYYY-MM-DD)
- `endDate`: Filter logs before this date (YYYY-MM-DD)

Response:
```json
{
  "totalEntries": 1245,
  "entriesByLevel": {
    "error": 23,
    "warn": 56,
    "info": 789,
    "http": 345,
    "debug": 32
  },
  "dailyCounts": [
    { "date": "2023-07-01", "count": 234 },
    { "date": "2023-07-02", "count": 198 }
  ],
  "topErrors": [
    { "message": "Database connection failed", "count": 12 },
    { "message": "Authentication failed", "count": 8 }
  ],
  "collections": {
    "users": 345,
    "properties": 567,
    "transactions": 123
  }
}
```

### Search Logs
```
GET /api/logs/search
```

Query parameters:
- `level`: Filter by log level
- `date`: Filter by date (YYYY-MM-DD)
- `userId`: Filter by user ID
- `message`: Search in message text
- `limit`: Maximum number of results (default: 100)

Response:
```json
{
  "results": [
    {
      "timestamp": "2023-07-01T12:34:56.789Z",
      "level": "error",
      "message": "Database connection failed",
      "meta": {
        "userId": "60a1b2c3d4e5f6g7h8i9j0",
        "error": "ConnectionRefused",
        "service": "property-service"
      }
    }
  ],
  "total": 23,
  "page": 1,
  "limit": 100
}
```

### List Log Files
```
GET /api/logs/files
```

Response:
```json
{
  "files": [
    {
      "name": "application-2023-07-01.log",
      "size": 1234567,
      "created": "2023-07-01T00:00:01.123Z",
      "modified": "2023-07-01T23:59:59.456Z"
    },
    {
      "name": "error-2023-07-01.log",
      "size": 23456,
      "created": "2023-07-01T00:00:01.234Z",
      "modified": "2023-07-01T23:59:59.567Z"
    }
  ]
}
```

### Download Log File
```
GET /api/logs/download/:filename
```

Response: The file will be downloaded with appropriate Content-Type and Content-Disposition headers.

Note: This endpoint includes security measures to prevent path traversal attacks and ensure only valid log files can be downloaded. 
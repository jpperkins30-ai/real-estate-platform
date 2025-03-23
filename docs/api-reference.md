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

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/properties` | List properties |
| GET | `/properties/:id` | Get property details |
| POST | `/properties` | Create property |
| PUT | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |
| GET | `/properties/stats/county` | Get property statistics by county |

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
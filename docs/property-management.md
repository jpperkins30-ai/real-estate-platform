# Property Management API Documentation

## Overview
The Property Management API provides endpoints for creating, reading, updating, and deleting property listings. It includes comprehensive validation and supports rich property details.

## Authentication
All endpoints require authentication using JWT token:
```
Authorization: Bearer <your_token>
```

## Endpoints

### List All Properties
```
GET /api/properties
```

#### Query Parameters
| Parameter | Type   | Description                | Default | Range    |
|-----------|--------|----------------------------|---------|----------|
| page      | number | Page number               | 1       | ≥ 1      |
| limit     | number | Items per page            | 10      | 1-100    |
| sortBy    | string | Field to sort by          | createdAt| Any property field |
| sortOrder | string | Sort direction (asc/desc) | desc    | asc/desc |

#### Response
```json
{
  "properties": [
    {
      "_id": "property_id",
      "address": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "county": "Suffolk",
      "zipCode": "02108",
      "propertyType": "Single Family",
      "price": 500000,
      "saleType": "Conventional",
      "lotSize": 5000,
      "yearBuilt": 1990,
      "bedrooms": 3,
      "bathrooms": 2.5,
      "parkingSpaces": 2,
      "description": "Beautiful single family home...",
      "features": ["Garage", "Pool"],
      "status": "Available",
      "taxAssessment": 450000,
      "taxYear": 2023,
      "zoning": "Residential",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Example Request
```bash
curl -X GET 'http://your-api/api/properties?page=1&limit=10' \
  -H 'Authorization: Bearer your_token'
```

### Get Property Details
```
GET /api/properties/:id
```

#### Response
```json
{
  "property": {
    "_id": "property_id",
    "address": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "county": "Suffolk",
    "zipCode": "02108",
    "propertyType": "Single Family",
    "price": 500000,
    "saleType": "Conventional",
    "lotSize": 5000,
    "yearBuilt": 1990,
    "bedrooms": 3,
    "bathrooms": 2.5,
    "parkingSpaces": 2,
    "description": "Beautiful single family home...",
    "features": ["Garage", "Pool"],
    "status": "Available",
    "taxAssessment": 450000,
    "taxYear": 2023,
    "zoning": "Residential",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Example Request
```bash
curl -X GET 'http://your-api/api/properties/property_id' \
  -H 'Authorization: Bearer your_token'
```

### Create Property
```
POST /api/properties
```

#### Request Body
```json
{
  "address": "123 Main St",
  "city": "Boston",
  "state": "MA",
  "county": "Suffolk",
  "zipCode": "02108",
  "propertyType": "Single Family",
  "price": 500000,
  "saleType": "Conventional",
  "lotSize": 5000,
  "yearBuilt": 1990,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "parkingSpaces": 2,
  "description": "Beautiful single family home...",
  "features": ["Garage", "Pool"],
  "status": "Available",
  "taxAssessment": 450000,
  "taxYear": 2023,
  "zoning": "Residential"
}
```

#### Validation Rules
See [Property Validation Rules](#validation-rules) section below.

#### Response
```json
{
  "property": {
    "_id": "new_property_id",
    // ... all property fields
  }
}
```

#### Example Request
```bash
curl -X POST 'http://your-api/api/properties' \
  -H 'Authorization: Bearer your_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "address": "123 Main St",
    "city": "Boston",
    // ... other fields
  }'
```

### Update Property
```
PUT /api/properties/:id
```

#### Request Body
Same as Create Property, all fields optional

#### Response
```json
{
  "property": {
    "_id": "property_id",
    // ... updated property fields
  }
}
```

#### Example Request
```bash
curl -X PUT 'http://your-api/api/properties/property_id' \
  -H 'Authorization: Bearer your_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "price": 550000,
    "status": "Under Contract"
  }'
```

### Delete Property
```
DELETE /api/properties/:id
```

#### Response
```json
{
  "message": "Property successfully deleted"
}
```

#### Example Request
```bash
curl -X DELETE 'http://your-api/api/properties/property_id' \
  -H 'Authorization: Bearer your_token'
```

## Validation Rules

### Required Fields
- `address`: String, 5-200 characters
- `city`: String, 2-100 characters, letters/spaces/hyphens only
- `state`: 2-letter uppercase code
- `county`: String, 2-100 characters, letters/spaces/hyphens only
- `zipCode`: Format: 12345 or 12345-6789
- `propertyType`: One of predefined types
- `price`: Number between 0 and 1,000,000,000, max 2 decimal places
- `saleType`: One of predefined types

### Optional Fields
- `lotSize`: Positive number, max 2 decimal places
- `yearBuilt`: Integer between 1800 and current year
- `bedrooms`: Integer between 0 and 100
- `bathrooms`: Number between 0 and 100, increments of 0.5
- `parkingSpaces`: Integer between 0 and 100
- `description`: String, max 2000 characters
- `features`: Array of strings, each max 100 characters
- `status`: One of predefined statuses
- `taxAssessment`: Positive number, max 2 decimal places
- `taxYear`: Integer between 2000 and current year
- `zoning`: String, max 50 characters

### Property Types
- Single Family
- Multi Family
- Condo
- Townhouse
- Land
- Commercial
- Industrial
- Agricultural

### Sale Types
- Tax Lien
- Deed
- Conventional

### Status Options
- Available
- Under Contract
- Sold
- Off Market

## Error Responses

### 400 Bad Request
Returned when validation fails.

```json
{
  "errors": [
    {
      "msg": "Address is required",
      "param": "address",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
Returned when authentication fails.

```json
{
  "error": "Unauthorized access"
}
```

### 404 Not Found
Returned when property is not found.

```json
{
  "error": "Property not found"
}
```

### 500 Internal Server Error
Returned when an unexpected error occurs.

```json
{
  "error": "Internal server error"
}
```

## Best Practices

### Creating Properties
1. Validate all inputs before submission
2. Include all required fields
3. Format numbers correctly (e.g., prices with 2 decimal places)
4. Use proper case for state codes (uppercase)
5. Normalize addresses for consistency

### Updating Properties
1. Only send fields that need to be updated
2. Verify property exists before update
3. Handle status changes appropriately
4. Update related fields together (e.g., price and status)

### Querying Properties
1. Use pagination for large result sets
2. Cache frequently accessed properties
3. Use appropriate indexes for common queries
4. Implement proper error handling

### Performance Considerations
1. Limit request sizes
2. Use appropriate page sizes
3. Index frequently queried fields
4. Cache static property data
5. Optimize image storage and delivery

## Rate Limiting
- Maximum 100 requests per minute per IP
- Maximum 1000 requests per day per user
- Special limits for bulk operations

## Webhooks
The API supports webhooks for the following events:
- Property created
- Property updated
- Property deleted
- Status changed
- Price changed

### Webhook Format
```json
{
  "event": "property.updated",
  "propertyId": "property_id",
  "changes": {
    "price": {
      "old": 500000,
      "new": 550000
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
``` 
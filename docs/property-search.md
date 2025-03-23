# Property Search API Documentation

## Overview
The Property Search API provides a flexible way to search and filter properties in the real estate platform. It supports various filters, sorting options, and pagination.

## Endpoint
```
GET /api/properties/search
```

## Authentication
- Bearer token authentication is required
- Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Query Parameters

### Location Filters
| Parameter | Type   | Description                          | Example        |
|-----------|--------|--------------------------------------|----------------|
| city      | string | Filter by city name                  | ?city=Boston  |
| state     | string | Filter by 2-letter state code        | ?state=MA     |
| county    | string | Filter by county name                | ?county=Essex |
| zipCode   | string | Filter by ZIP code (5 or 9 digits)   | ?zipCode=02108|

### Price Filters
| Parameter | Type   | Description                          | Example        |
|-----------|--------|--------------------------------------|----------------|
| minPrice  | number | Minimum property price               | ?minPrice=100000|
| maxPrice  | number | Maximum property price               | ?maxPrice=500000|

### Property Characteristics
| Parameter    | Type   | Description                       | Example           |
|--------------|--------|-----------------------------------|-------------------|
| propertyType | string | Type of property                  | ?propertyType=Single+Family|
| saleType     | string | Type of sale                      | ?saleType=Conventional|
| status       | string | Property status                   | ?status=Available|
| minBedrooms  | number | Minimum number of bedrooms        | ?minBedrooms=2   |
| maxBedrooms  | number | Maximum number of bedrooms        | ?maxBedrooms=4   |
| minBathrooms | number | Minimum number of bathrooms       | ?minBathrooms=1.5|
| maxBathrooms | number | Maximum number of bathrooms       | ?maxBathrooms=3  |
| minLotSize   | number | Minimum lot size                  | ?minLotSize=1000 |
| maxLotSize   | number | Maximum lot size                  | ?maxLotSize=5000 |
| minYearBuilt | number | Minimum year built               | ?minYearBuilt=1990|
| maxYearBuilt | number | Maximum year built               | ?maxYearBuilt=2023|
| features     | array  | Required property features        | ?features[]=Pool&features[]=Garage|

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

### Pagination
| Parameter | Type   | Description                          | Default | Range    |
|-----------|--------|--------------------------------------|---------|----------|
| page      | number | Page number                          | 1       | ≥ 1      |
| limit     | number | Items per page                       | 10      | 1-100    |

### Sorting
| Parameter  | Type   | Description                          | Default    |
|------------|--------|--------------------------------------|------------|
| sortBy     | string | Field to sort by                     | createdAt |
| sortOrder  | string | Sort direction (asc/desc)            | desc      |

#### Available Sort Fields
- price
- createdAt
- updatedAt
- yearBuilt
- lotSize
- bedrooms
- bathrooms

## Response Format

```typescript
{
  properties: [
    {
      _id: string;
      address: string;
      city: string;
      state: string;
      county: string;
      zipCode: string;
      propertyType: string;
      price: number;
      saleType: string;
      lotSize?: number;
      yearBuilt?: number;
      bedrooms?: number;
      bathrooms?: number;
      parkingSpaces?: number;
      description?: string;
      features?: string[];
      status: string;
      taxAssessment?: number;
      taxYear?: number;
      zoning?: string;
      createdAt: string;
      updatedAt: string;
    }
  ],
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

## Example Requests

### Basic Search
```bash
curl -X GET 'http://your-api/api/properties/search' \
  -H 'Authorization: Bearer your_token'
```

### Search with Multiple Filters
```bash
curl -X GET 'http://your-api/api/properties/search?minPrice=200000&maxPrice=500000&state=MA&propertyType=Single+Family&minBedrooms=2&maxBathrooms=3&sortBy=price&sortOrder=asc' \
  -H 'Authorization: Bearer your_token'
```

### Search with Features
```bash
curl -X GET 'http://your-api/api/properties/search?features[]=Pool&features[]=Garage&minPrice=300000' \
  -H 'Authorization: Bearer your_token'
```

### Paginated Search
```bash
curl -X GET 'http://your-api/api/properties/search?page=2&limit=20&sortBy=createdAt&sortOrder=desc' \
  -H 'Authorization: Bearer your_token'
```

## Error Responses

### 400 Bad Request
Returned when query parameters are invalid.

```json
{
  "errors": [
    {
      "msg": "Invalid property type",
      "param": "propertyType",
      "location": "query"
    }
  ]
}
```

### 401 Unauthorized
Returned when authentication token is missing or invalid.

```json
{
  "error": "Unauthorized access"
}
```

### 500 Internal Server Error
Returned when an unexpected error occurs.

```json
{
  "error": "Internal server error"
}
```

## Validation Rules

### Numeric Fields
- Prices must be positive numbers with maximum 2 decimal places
- Lot size must be a positive number with maximum 2 decimal places
- Bedrooms must be between 0 and 100
- Bathrooms must be between 0 and 100, in increments of 0.5
- Year built must be between 1800 and current year

### String Fields
- State must be a 2-letter uppercase code
- ZIP code must match format: 12345 or 12345-6789
- City and county names can only contain letters, spaces, and hyphens

### Arrays
- Features must be an array of strings
- Each feature string must be non-empty and maximum 100 characters

## Rate Limiting
- Maximum 100 requests per minute per IP address
- Rate limit headers are included in the response:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Best Practices
1. Always use pagination to limit response size
2. Include only necessary filters to improve query performance
3. Use appropriate indexes for frequently queried fields
4. Cache responses when possible
5. Handle rate limiting appropriately in your client application 
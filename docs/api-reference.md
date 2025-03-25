# API Reference

## Overview

This document provides a reference for all API endpoints in the Real Estate Platform. The API follows RESTful principles and uses JSON for request and response bodies, with the exception of file download endpoints which return the appropriate content types.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.example.com/api
```

## Authentication

Most API endpoints require authentication. Include an Authorization header with a valid JWT token:

```
Authorization: Bearer <token>
```

## Common Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Inventory Endpoints

### State Management

#### List States

```
GET /states
```

**Query Parameters**

- `region`: Filter by region (e.g., "Northeast", "South")
- `limit`: Maximum number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response**

```json
{
  "total": 50,
  "offset": 0,
  "limit": 20,
  "states": [
    {
      "_id": "state-id",
      "name": "State Name",
      "abbreviation": "ST",
      "metadata": {
        "regionalInfo": {
          "region": "Region Name",
          "subregion": "Subregion Name"
        },
        "totalCounties": 50,
        "totalProperties": 1000
      }
    }
  ]
}
```

#### Get State Details

```
GET /states/:stateId
```

**Response**

```json
{
  "_id": "state-id",
  "name": "State Name",
  "abbreviation": "ST",
  "type": "state",
  "parentId": "usmap-id",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [...]
  },
  "metadata": {
    "regionalInfo": {
      "region": "Region Name",
      "subregion": "Subregion Name"
    },
    "totalCounties": 50,
    "totalProperties": 1000,
    "statistics": {
      "totalTaxLiens": 250,
      "totalValue": 150000000
    }
  }
}
```

### County Management

#### List Counties

```
GET /counties
```

**Query Parameters**

- `stateId`: Filter by state ID
- `limit`: Maximum number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response**

```json
{
  "total": 100,
  "offset": 0,
  "limit": 20,
  "counties": [
    {
      "_id": "county-id",
      "name": "County Name",
      "stateId": "state-id",
      "metadata": {
        "totalProperties": 500
      }
    }
  ]
}
```

#### Get County Details

```
GET /counties/:countyId
```

**Response**

```json
{
  "_id": "county-id",
  "name": "County Name",
  "type": "county",
  "stateId": "state-id",
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [...]
  },
  "metadata": {
    "totalProperties": 500,
    "statistics": {
      "totalTaxLiens": 120,
      "totalValue": 75000000
    },
    "searchConfig": {
      "lookupMethod": "web",
      "searchUrl": "https://example.com/search",
      "lienUrl": "https://example.com/liens"
    }
  }
}
```

### Property Management

#### List Properties

```
GET /properties
```

**Query Parameters**

- `stateId`: Filter by state ID
- `countyId`: Filter by county ID
- `propertyType`: Filter by property type
- `taxStatus`: Filter by tax status
- `minValue`: Filter by minimum market value
- `maxValue`: Filter by maximum market value
- `limit`: Maximum number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response**

```json
{
  "total": 500,
  "offset": 0,
  "limit": 20,
  "properties": [
    {
      "_id": "property-id",
      "parcelId": "123456",
      "ownerName": "Property Owner",
      "propertyAddress": "123 Main St",
      "city": "Cityville",
      "stateId": "state-id",
      "countyId": "county-id",
      "metadata": {
        "propertyType": "Residential",
        "marketValue": 300000
      }
    }
  ]
}
```

#### Get Property Details

```
GET /properties/:propertyId
```

**Response**

```json
{
  "_id": "property-id",
  "parcelId": "123456",
  "taxAccountNumber": "TAX-123-456",
  "ownerName": "Property Owner",
  "propertyAddress": "123 Main St",
  "city": "Cityville",
  "stateId": "state-id",
  "countyId": "county-id",
  "zipCode": "12345",
  "location": {
    "coordinates": {
      "latitude": 38.9072,
      "longitude": -77.0369
    },
    "address": {
      "street": "123 Main St",
      "city": "Cityville",
      "state": "ST",
      "county": "County Name",
      "zipCode": "12345"
    }
  },
  "metadata": {
    "propertyType": "Residential",
    "taxStatus": "Current",
    "assessedValue": 250000,
    "marketValue": 300000,
    "taxDue": 3500,
    "saleType": "Tax Sale",
    "saleAmount": 175000,
    "saleDate": "2023-06-15",
    "lastUpdated": "2023-10-01"
  }
}
```

## Export Endpoints

### Export Properties

#### Export Properties to CSV

```
POST /export/properties/enhanced/csv
```

**Request Body**

```json
{
  "stateId": "state-id",        // Optional: Filter by state
  "countyId": "county-id",      // Optional: Filter by county
  "propertyType": "Residential", // Optional: Filter by property type
  "taxStatus": "Current",       // Optional: Filter by tax status
  "minValue": 100000,           // Optional: Minimum market value
  "maxValue": 500000            // Optional: Maximum market value
}
```

**Response**

A CSV file containing the property data with the following headers:

- ID
- Parcel ID
- Tax Account Number
- Owner Name
- Property Address
- City
- State
- County
- ZIP Code
- Property Type
- Tax Status
- Assessed Value
- Market Value
- Tax Due
- Sale Type
- Sale Amount
- Sale Date
- Last Updated
- Name
- Status
- Condition
- Tax Lien Amount
- Tax Lien Status
- Year Built
- Square Feet
- Bedrooms
- Bathrooms
- Latitude
- Longitude
- Created At
- Updated At

#### Export Properties to Excel

```
POST /export/properties/enhanced/excel
```

**Request Body**

```json
{
  "stateId": "state-id",        // Optional: Filter by state
  "countyId": "county-id",      // Optional: Filter by county
  "propertyType": "Residential", // Optional: Filter by property type
  "taxStatus": "Current",       // Optional: Filter by tax status
  "minValue": 100000,           // Optional: Minimum market value
  "maxValue": 500000            // Optional: Maximum market value
}
```

**Response**

An Excel file (XLSX format) containing the property data with the same fields as the CSV export, with additional formatting:

- Number formatting for monetary values
- Date formatting for date fields
- Bold headers with background color
- Auto-sized columns for better readability

### Export Counties

#### Export Counties to CSV

```
POST /export/counties/enhanced/csv
```

**Request Body**

```json
{
  "stateId": "state-id",       // Optional: Filter by state
  "name": "County"             // Optional: Filter by county name (partial match)
}
```

**Response**

A CSV file containing the county data with the following headers:

- ID
- County Name
- State
- State Abbreviation
- Total Properties
- Total Tax Liens
- Total Value
- Lookup Method
- Search URL
- Lien URL
- Average Property Value
- Search Enabled
- Last Run
- Created At
- Updated At

#### Export Counties to Excel

```
POST /export/counties/enhanced/excel
```

**Request Body**

```json
{
  "stateId": "state-id",       // Optional: Filter by state
  "name": "County"             // Optional: Filter by county name (partial match)
}
```

**Response**

An Excel file (XLSX format) containing the county data with the same fields as the CSV export, with additional formatting:

- Number formatting for numeric values
- Date formatting for date fields
- Bold headers with background color
- Auto-sized columns for better readability

### Legacy Export Endpoints

#### Export Properties (Legacy)

```
GET /export/properties/csv
```

**Query Parameters**
- Various filter parameters (see properties list endpoint)

**Response**
A CSV file with property data.

```
GET /export/properties/excel
```

**Query Parameters**
- Various filter parameters (see properties list endpoint)

**Response**
An Excel file with property data.

## Response Headers

For all export endpoints, the following response headers are set:

**CSV Export**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=export_YYYY-MM-DD.csv
```

**Excel Export**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=export_YYYY-MM-DD.xlsx
```

## Error Responses

### Example Error Response

```json
{
  "message": "Error message describing the issue",
  "status": 400,
  "details": {
    "field": "Specific error for this field"
  }
}
```

### Common Export Errors

- `No properties found matching the specified filters` - The export request matched zero records
- `Failed to export data to CSV/Excel` - An error occurred during the export process 
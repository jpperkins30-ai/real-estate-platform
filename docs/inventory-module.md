# Inventory Module Documentation

## Overview

The Inventory Module provides a comprehensive solution for managing property inventory data in a hierarchical structure, following a State → County → Property relationship. This documentation covers the module's architecture, API endpoints, and usage guidelines.

## Architecture

The Inventory Module is built with a clean, layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
├─────────────┬─────────────────────────┬───────────────────┬─┘
│ Components  │ React Query             │ Context API       │
├─────────────┼─────────────────────────┼───────────────────┤
│ StatesView  │ useStates()             │ InventoryContext  │
│ CountiesView│ useState()              │                   │
│ PropertiesV.│ useCounties()           │                   │
│ PropertyDet.│ useCounty()             │                   │
│             │ useProperties()         │                   │
│             │ useProperty()           │                   │
└─────────────┴─────────────────────────┴───────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                             │
├─────────────────────────────────────────────────────────────┤
│ GET /api/states                                             │
│ GET /api/states/:stateId                                    │
│ GET /api/states/:stateId/counties                           │
│ GET /api/counties/:countyId                                 │
│ GET /api/counties/:countyId/properties                      │
│ GET /api/properties/:propertyId                             │
│                                                             │
│ POST /api/states                                            │
│ PUT /api/states/:stateId                                    │
│ DELETE /api/states/:stateId                                 │
│                                                             │
│ POST /api/counties                                          │
│ PUT /api/counties/:countyId                                 │
│ DELETE /api/counties/:countyId                              │
│                                                             │
│ POST /api/properties                                        │
│ PUT /api/properties/:propertyId                             │
│ DELETE /api/properties/:propertyId                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│ Models                │ Database                            │
├─────────────────────────────────────────────────────────────┤
│ State                 │ MongoDB / PostgreSQL                │
│ County                │                                     │
│ Property              │                                     │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### State

```typescript
interface State {
  id: string;
  name: string;
  abbreviation: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}
```

### County

```typescript
interface County {
  id: string;
  name: string;
  stateId: string;
  fips?: string;
  population?: number;
  area?: number;
  dataLastUpdated?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Property

```typescript
interface Property {
  id: string;
  countyId: string;
  parcelId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  propertyType: string;
  zoning?: string;
  lotSize?: number;
  buildingSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  taxAssessedValue?: number;
  taxYear?: number;
  status: 'active' | 'inactive' | 'pending';
  tags?: string[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
```

## API Endpoints

### States

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/states | Get all states |
| GET | /api/states/:stateId | Get a specific state by ID |
| POST | /api/states | Create a new state |
| PUT | /api/states/:stateId | Update a state |
| DELETE | /api/states/:stateId | Delete a state |

#### Sample Response (GET /api/states)

```json
[
  {
    "id": "ca",
    "name": "California",
    "abbreviation": "CA",
    "region": "West",
    "createdAt": "2023-01-15T12:00:00Z",
    "updatedAt": "2023-01-15T12:00:00Z"
  },
  {
    "id": "tx",
    "name": "Texas",
    "abbreviation": "TX",
    "region": "South",
    "createdAt": "2023-01-15T12:00:00Z",
    "updatedAt": "2023-01-15T12:00:00Z"
  }
]
```

### Counties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/states/:stateId/counties | Get all counties for a state |
| GET | /api/counties/:countyId | Get a specific county by ID |
| POST | /api/counties | Create a new county |
| PUT | /api/counties/:countyId | Update a county |
| DELETE | /api/counties/:countyId | Delete a county |

#### Sample Response (GET /api/states/ca/counties)

```json
[
  {
    "id": "ca-orange",
    "name": "Orange County",
    "stateId": "ca",
    "fips": "06059",
    "population": 3175692,
    "area": 948,
    "dataLastUpdated": "2023-06-01T00:00:00Z",
    "createdAt": "2023-01-15T12:00:00Z",
    "updatedAt": "2023-06-01T00:00:00Z"
  },
  {
    "id": "ca-losangeles",
    "name": "Los Angeles County",
    "stateId": "ca",
    "fips": "06037",
    "population": 10014009,
    "area": 4751,
    "dataLastUpdated": "2023-06-01T00:00:00Z",
    "createdAt": "2023-01-15T12:00:00Z",
    "updatedAt": "2023-06-01T00:00:00Z"
  }
]
```

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/counties/:countyId/properties | Get properties for a county (with pagination and filtering) |
| GET | /api/properties/:propertyId | Get a specific property by ID |
| POST | /api/properties | Create a new property |
| PUT | /api/properties/:propertyId | Update a property |
| DELETE | /api/properties/:propertyId | Delete a property |

#### Query Parameters for GET /api/counties/:countyId/properties

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| propertyType | string | Filter by property type |
| minBedrooms | number | Filter by minimum number of bedrooms |
| maxBedrooms | number | Filter by maximum number of bedrooms |
| minBathrooms | number | Filter by minimum number of bathrooms |
| maxBathrooms | number | Filter by maximum number of bathrooms |
| minPrice | number | Filter by minimum price |
| maxPrice | number | Filter by maximum price |
| minYearBuilt | number | Filter by minimum year built |
| maxYearBuilt | number | Filter by maximum year built |
| minLotSize | number | Filter by minimum lot size |
| maxLotSize | number | Filter by maximum lot size |
| status | string | Filter by status (active, inactive, pending) |

#### Sample Response (GET /api/counties/ca-orange/properties)

```json
{
  "data": [
    {
      "id": "ca-orange-prop1",
      "countyId": "ca-orange",
      "parcelId": "123-456-789",
      "address": {
        "street": "123 Main St",
        "city": "Irvine",
        "state": "CA",
        "zip": "92602"
      },
      "location": {
        "lat": 33.6846,
        "lng": -117.8265
      },
      "propertyType": "Single Family",
      "zoning": "Residential",
      "lotSize": 7500,
      "buildingSize": 2500,
      "bedrooms": 4,
      "bathrooms": 3,
      "yearBuilt": 2005,
      "lastSaleDate": "2020-06-15",
      "lastSalePrice": 950000,
      "taxAssessedValue": 900000,
      "taxYear": 2022,
      "status": "active",
      "tags": ["pool", "garage", "updated"],
      "images": [
        "https://example.com/properties/ca-orange-prop1/image1.jpg",
        "https://example.com/properties/ca-orange-prop1/image2.jpg"
      ],
      "createdAt": "2023-01-15T12:00:00Z",
      "updatedAt": "2023-06-01T00:00:00Z"
    }
  ],
  "total": 245,
  "page": 1,
  "limit": 20,
  "totalPages": 13
}
```

## Frontend Components

### StatesView
Displays a grid of all available states with basic information.

### CountiesView
Displays counties within a selected state with population and area information.

### PropertiesView
Displays properties within a selected county with filtering capabilities:
- Property type (Single Family, Multi-Family, etc.)
- Bedrooms and bathrooms
- Price range
- Property status

### PropertyDetail
Displays detailed information about a specific property including:
- Property images
- Property specifications (bedrooms, bathrooms, sq. footage)
- Financial information (sale price, tax assessed value)
- Location with map view

## React Query Integration

The module uses React Query for efficient data fetching, caching, and state management:

```typescript
// Example usage of React Query hooks
const { data: states, isLoading, error } = useStates();

// Dependent queries
const { data: counties } = useCounties(stateId);

// With parameters
const { data: properties } = useProperties(
  countyId, 
  { propertyType: 'Single Family', minBedrooms: 3 },
  1, // page
  20 // limit
);
```

### Query Keys

| Query | Key | Dependencies |
|-------|-----|--------------|
| useStates | ['states'] | none |
| useState | ['state', stateId] | stateId |
| useCounties | ['counties', stateId] | stateId |
| useCounty | ['county', countyId] | countyId |
| useProperties | ['properties', countyId, filters, page, limit] | countyId, filters, page, limit |
| useProperty | ['property', propertyId] | propertyId |

## Pagination Implementation

The `useProperties` hook supports pagination with the following features:
- Page-based navigation
- Configurable items per page
- Total count of available items
- Efficient data loading with `keepPreviousData: true`

## Error Handling

The frontend components implement consistent error handling:
1. Loading states with spinners
2. Error messages for API failures
3. Empty state handling for no results

## Performance Considerations

- React Query provides caching to minimize redundant API calls
- Pagination reduces initial load time and memory usage
- The hierarchical structure (State → County → Property) enables efficient data loading

## Changelog

### Version 1.0.0 - 2023-07-15
- Initial implementation of the Inventory Module
- Added State, County, and Property components
- Implemented React Query for data fetching
- Added filtering and pagination for Properties

### Version 1.1.0 - 2023-08-01
- Added map view for Property locations
- Improved filtering options for Properties
- Added bulk import/export functionality
- Enhanced error handling and loading states

### Version 1.2.0 - 2023-09-15
- Added property image management
- Implemented advanced search across all properties
- Added data visualization for property statistics
- Improved accessibility and mobile responsiveness

## Future Enhancements

1. **Advanced Filtering**: Implement more sophisticated filtering options with saved filters
2. **Batch Operations**: Support for batch editing and deleting properties
3. **Data Export**: Enable exporting property data to CSV/Excel formats
4. **Image Gallery**: Enhanced property image management with multi-upload
5. **Historical Data**: Track property value and tax history over time

## API Versioning

This module follows semantic versioning for its API:
- Major version changes (1.0.0 → 2.0.0) indicate breaking changes
- Minor version changes (1.0.0 → 1.1.0) indicate new features without breaking changes
- Patch version changes (1.0.0 → 1.0.1) indicate bug fixes

API endpoints are versioned in the URL structure: `/api/v1/states`, `/api/v2/states`, etc.

# Map and Geographic Data Integration

## Map Component Integration

The inventory module now integrates with the map component through a comprehensive set of utilities and services:

### GeoJSON Processing 

The platform includes a robust GeoJSON processing utility (`geoJsonProcessor.ts`) that handles:

- Loading and validating GeoJSON data
- Ensuring coordinate arrays are properly structured
- Processing features and feature collections
- Creating and maintaining the GeoJSON directory structure

```typescript
import { 
  processGeoJSON, 
  loadGeoJSONFromFile, 
  saveGeoJSONToFile 
} from '../utils/geoJsonProcessor';

// Loading and processing GeoJSON data
const statesData = await loadGeoJSONFromFile('data/geojson/states.json');
const processedData = processGeoJSON(statesData);
```

### Inventory-Map Data Flow

The inventory module connects to the map component through the following data flow:

1. Geographic entities (states, counties) are loaded from GeoJSON files
2. Entities are processed and stored in the database with proper IDs and references
3. The map component retrieves these entities for visualization
4. User interactions with the map can trigger queries to the inventory module
5. Changes in the inventory are reflected on the map through real-time updates

## Controller Implementation

### Controller Structure

The inventory module includes controllers that manage the interaction between the UI components and the data layer:

```typescript
// Controller definition in models/geo-schemas.ts
export const controllerSchema = new mongoose.Schema({
  controllerId: { type: String, required: true },
  controllerType: { type: String, required: true },
  enabled: { type: Boolean, required: true, default: true },
  lastRun: { type: Date },
  nextScheduledRun: { type: Date },
  configuration: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });
```

### Controller Types

The system supports several controller types:

1. **Map Controller**: Manages map visualization and user interactions
2. **Property Controller**: Handles property data collection and updates
3. **Tax Sale Controller**: Manages tax sale information
4. **Demographics Controller**: Processes demographic data for regions

### Controller Implementation

Controllers are implemented as services that:

1. Operate on specific entity types (states, counties, properties)
2. Schedule and execute data collection tasks
3. Process and validate incoming data
4. Update entity metadata and statistics
5. Trigger notifications based on configured rules

## Geographic Data Structure

### Entity Hierarchy

The inventory module organizes geographic entities in a hierarchical structure:

```
USMap
  └── States
       └── Counties
            └── Properties
```

Each entity type has:
- Reference to its parent entity
- Proper ID generation rules
- Metadata for statistics and configuration
- GeoJSON geometry for visualization

### County ID Generation

Counties are assigned IDs using a standardized format combining the state abbreviation and county name:

```typescript
const customId = `${stateAbbr.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`;
```

This ID format ensures:
- Consistency across the application
- Human-readable identifiers
- Uniqueness within the system
- Easy state association

### Data Validation

The inventory module includes comprehensive validation for geographic entities:

1. **Structure Validation**: Ensures all required fields are present
2. **Geometry Validation**: Verifies GeoJSON geometry is valid
3. **Reference Validation**: Confirms parent-child relationships are valid
4. **ID Validation**: Ensures IDs follow the required format

## Data Export and Reporting

The inventory module provides data export capabilities for states and counties:

```typescript
// Export counties to CSV
const csvData = await exportService.exportCountiesToCsv(counties);

// Export counties to Excel
const excelBuffer = await exportService.exportCountiesToExcel(counties);
```

Export features include:
- CSV and Excel format support
- Filtering by various criteria
- Including detailed metadata
- Formatted reports with statistics

## Inventory Module API

The inventory module exposes the following API endpoints:

### State Endpoints

- `GET /api/states`: Retrieve all states
- `GET /api/states/:id`: Get state by ID
- `POST /api/states`: Create a new state
- `PUT /api/states/:id`: Update a state
- `DELETE /api/states/:id`: Delete a state

### County Endpoints

- `GET /api/counties`: Retrieve all counties
- `GET /api/counties/:id`: Get county by ID
- `POST /api/counties`: Create a new county
- `PUT /api/counties/:id`: Update a county
- `DELETE /api/counties/:id`: Delete a county
- `GET /api/states/:stateId/counties`: Get all counties in a state

### GeoJSON Endpoints

- `GET /api/geojson/states`: Get GeoJSON for all states
- `GET /api/geojson/states/:id`: Get GeoJSON for a specific state
- `GET /api/geojson/counties`: Get GeoJSON for all counties
- `GET /api/geojson/counties/:id`: Get GeoJSON for a specific county 
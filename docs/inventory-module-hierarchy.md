# Inventory Module Hierarchy: State → County → Property

## Architecture Overview

The Inventory Module implements a hierarchical relationship between States, Counties, and Properties, with a Controller Wizard to manage data collection across these entities.

```
┌─────────────────────────────────────────────────────────┐
│                  Inventory Module                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   States    │───▶│  Counties   │───▶│ Properties  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│         ▲                 ▲                 ▲           │
│         │                 │                 │           │
│         └─────────────────┼─────────────────┘           │
│                           │                             │
│                  ┌─────────────────┐                    │
│                  │  Controllers    │                    │
│                  └─────────────────┘                    │
│                           │                             │
│                  ┌─────────────────┐                    │
│                  │  Data Sources   │                    │
│                  └─────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### 1. Data Models

- **US Map**: Root object containing all states
- **State**: Contains multiple counties
- **County**: Contains multiple properties
- **Property**: Leaf object with detailed property information
- **Controller**: Manages data collection for the hierarchy
- **Data Source**: Provides data for the controllers

### 2. Relational Structure

Each object in the hierarchy has the following relationships:

- **Parent-Child**: Objects reference their parent and maintain a list of children
- **Controller Attachment**: Controllers can be attached to objects at any level
- **Collection Source**: Data sources are linked to controllers for data collection

## Controller Wizard Implementation

The Controller Wizard guides users through creating and configuring controllers to manage data collection for the inventory hierarchy. It follows a step-by-step process:

1. **Select Controller Type**
2. **Basic Information** (name, description)
3. **Region Selection** (state, county)
4. **Data Source Configuration**
5. **Schedule Configuration**
6. **Notification & Validation Settings**
7. **Review & Create**

### Technical Implementation

- **Frontend**: React-based wizard with Material UI components
- **Backend**: Express/Node.js RESTful API endpoints
- **Database**: MongoDB with Mongoose schemas for hierarchical data

## API Design

### Controller-Related Endpoints

- `GET /api/controller-types`: Get available controller types
- `GET /api/collector-types`: Get available collector implementations
- `GET /api/controllers`: List all controllers
- `POST /api/controllers`: Create a new controller
- `GET /api/controllers/:id`: Get a specific controller
- `PUT /api/controllers/:id`: Update a controller
- `DELETE /api/controllers/:id`: Delete a controller
- `POST /api/controllers/:id/validate`: Validate a controller
- `POST /api/controllers/:id/execute`: Execute a controller
- `POST /api/controllers/:id/attach`: Attach a controller to objects
- `DELETE /api/controllers/:id/detach`: Detach a controller from objects

### Inventory Hierarchy Endpoints

- `GET /api/states`: Get all states
- `GET /api/states/:id`: Get a specific state
- `GET /api/states/:id/counties`: Get counties within a state
- `GET /api/counties/:id`: Get a specific county
- `GET /api/counties/:id/properties`: Get properties within a county
- `GET /api/properties/:id`: Get a specific property

## Controller Validation Process

The Controller Wizard implements a comprehensive validation process to ensure the reliability and usability of created controllers:

### 1. Configuration Validation

Controllers undergo an initial validation to verify that their configuration is consistent and compatible with the selected data sources and target objects.

```
POST /api/controllers/:id/validate
```

This endpoint verifies:
- Configuration completeness and consistency
- Permissions for accessing the required resources
- Data source connection validity
- Compatibility with attached objects

### 2. Test Collection

A sample collection is performed to verify that the controller can properly collect data from the specified sources:

```
POST /api/controllers/:id/test
```

This endpoint:
- Executes a limited test run against real or sample data
- Validates the data format and structure
- Checks for common errors in the collection process
- Ensures all required data points are collected

### 3. API Documentation Generation

Automatic API documentation is generated to help consumers understand how to interact with the controller:

```
POST /api/controllers/:id/docs
```

This endpoint generates:
- OpenAPI-compatible documentation
- Endpoint descriptions and parameters
- Request and response schemas
- Example requests and responses

The validation results are presented to the user in a summary view before finalizing the controller creation, allowing them to identify and address any issues before deployment.

## Changelog

### Version 1.0.0

- Initial implementation of State → County → Property hierarchy
- Controller Wizard implementation
- Backend API endpoints for controllers and hierarchy management

## Future Enhancements

1. **Batch Operations**: Support for applying controllers to multiple objects at once
2. **Dashboard Metrics**: Visual representation of the hierarchy with statistics
3. **Advanced Scheduling**: More granular control over controller execution schedules
4. **Data Validation Rules**: Customizable validation rules for different data types
5. **API Versioning**: Support for multiple API versions as the system evolves

## Property Search Implementation

The inventory module implements a robust property search system that combines exact matching with fuzzy search for optimal user experience:

### Search Approach

The property search follows a hybrid approach:

1. **Direct Search**: First attempts to find an exact match using the appropriate identifier (parcel ID or tax account number) based on the county's configuration
2. **Fuzzy Search Fallback**: If no exact match is found, the system falls back to fuzzy matching to handle typos, format differences, and partial data

### Technical Implementation

#### Frontend

The `PropertySearchBox` component provides a user interface for searching properties:

```
<PropertySearchBox countyId={county.id} onSearchComplete={handlePropertyFound} />
```

This component:
- Validates search input
- Calls the property search service
- Handles loading states and error messages
- Navigates to the property details page upon success (or calls a callback function)

#### Backend

The backend implements two key endpoints:

1. **Exact Search**:
   ```
   GET /api/properties/search?countyId={id}&parcelId={id}
   GET /api/properties/search?countyId={id}&taxAccountNumber={number}
   ```

2. **Fuzzy Search**:
   ```
   POST /api/properties/fuzzy-search
   ```
   With request body:
   ```json
   {
     "query": "property identifier",
     "countyId": "county-id",
     "lookupMethod": "parcel_id|account_number",
     "threshold": 0.8
   }
   ```

The fuzzy search uses the Jaccard similarity coefficient to find the best matches, with configurable threshold values.

### County Configuration

Each county can be configured with a preferred lookup method:
- `parcel_id`: Use parcel identifier as the primary search field
- `account_number`: Use tax account number as the primary search field

This configuration allows the system to adapt to different county data formats and standards. 
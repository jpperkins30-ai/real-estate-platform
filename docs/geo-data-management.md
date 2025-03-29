# Geographic Data Management

This document provides comprehensive information about how geographic data is managed in the Real Estate Platform.

## Overview

The Real Estate Platform uses GeoJSON data to represent geographic boundaries for states, counties, and other entities. This data is used for:

1. Visualization on maps
2. Spatial queries and filtering
3. Organizing real estate inventory by location

## Data Structure

### Geographic Hierarchy

The platform follows a hierarchical structure for geographic data:

```
USMap
  └── States
       └── Counties
            └── Properties
```

Each level in the hierarchy is represented by a MongoDB document with:
- Metadata about the entity
- GeoJSON geometry defining its boundaries
- References to parent and child entities

### GeoJSON Format

We use the GeoJSON format standard for representing geographic features. Our system primarily uses:

- `MultiPolygon` for states and counties
- `Point` for individual properties

Example county GeoJSON structure:
```json
{
  "type": "Feature",
  "properties": {
    "NAME": "Montgomery",
    "STATE": "MD"
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [-77.2, 39.0],
          [-77.0, 39.0],
          [-77.0, 39.2],
          [-77.2, 39.2],
          [-77.2, 39.0]
        ]
      ]
    ]
  }
}
```

## GeoJSON Processing Utility

### Overview

The `geoJsonProcessor.ts` utility provides comprehensive tools for working with GeoJSON data, including:

- Directory management
- File validation and processing
- Coordinate validation and normalization
- Sample data generation
- Geometry simplification

### Key Functions

#### Directory Management

```typescript
// Ensure required directories exist
await ensureGeoDataDirectories();

// Check if required GeoJSON files exist
const missingFiles = await checkGeoJSONFiles();
```

#### Processing GeoJSON Data

```typescript
// Process a GeoJSON collection or feature
const processedData = processGeoJSON(rawGeoJSON);

// Load and process GeoJSON from a file
const geoData = await loadGeoJSONFromFile('data/geojson/states.json');
```

#### Sample Data Generation

```typescript
// Create sample GeoJSON files if they don't exist
await createSampleGeoJSONFiles();
```

#### Geometry Handling

```typescript
// Simplify complex geometry for performance
const simplifiedGeometry = simplifyGeometry(originalGeometry, 0.01);

// Create a GeoJSON feature with basic properties
const feature = createGeoJSONFeature('California', 'CA', coordinates);
```

## Geographic Data Initialization

### Process Overview

The geographic data initialization process:

1. Checks for existing GeoJSON data directories and files
2. Creates missing directories and placeholder files if needed
3. Loads GeoJSON data for states and counties
4. Processes and validates the GeoJSON data
5. Creates or updates database records for states and counties

### Running the Initialization

The initialization can be triggered in several ways:

1. **Automatic initialization during server startup** (if `INIT_GEO_DATA=true`):
   ```typescript
   // In index.ts
   if (process.env.INIT_GEO_DATA === 'true') {
     await initializeGeographicData();
   }
   ```

2. **Manual initialization via script**:
   ```bash
   # From server directory
   npx ts-node -r tsconfig-paths/register src/scripts/initGeoData.ts
   ```

3. **Testing initialization**:
   ```bash
   # From server directory
   node src/scripts/testGeoData.js
   ```

## County ID Generation

Counties are assigned a unique ID based on their state abbreviation and name:

```typescript
const customId = `${stateAbbr.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`;
```

### Example IDs:
- "Los Angeles" county in California: `ca-los-angeles`
- "New York" county in New York: `ny-new-york`
- "Miami-Dade" county in Florida: `fl-miami-dade`

### Fixing Missing County IDs

The `fixCountyIds.js` script can be used to retroactively add IDs to counties that were created before the ID generation system was implemented:

```bash
# From server directory
node src/scripts/fixCountyIds.js
```

## GeoJSON Data Requirements

### Coordinate Structure

For MultiPolygon geometries, coordinates must be structured as:
- Level 1: Array of polygons
- Level 2: Array of rings (first is outer, rest are holes)
- Level 3: Array of points forming the ring
- Level 4: Individual coordinate values [longitude, latitude]

Example:
```javascript
coordinates: [  // Level 1: Array of polygons
  [             // Level 2: Array of rings (first is outer)
    [           // Level 3: Array of points
      [-77.2, 39.0],  // Level 4: Point coordinates [lon, lat]
      [-77.0, 39.0],
      [-77.0, 39.2],
      [-77.2, 39.2],
      [-77.2, 39.0]   // First and last points must be identical to close the ring
    ]
  ]
]
```

### Validation Requirements

1. Coordinates must be valid numbers
2. MultiPolygon coordinates must have at least one polygon
3. Each polygon must have at least one ring
4. Each ring must have at least four points
5. First and last points in each ring must be identical (closed loop)

## Troubleshooting

### Common GeoJSON Issues

1. **Empty coordinates array**:
   ```
   Error: MultiPolygon coordinates must have at least 1 element
   ```
   
   Solution: Ensure GeoJSON files have properly structured coordinate arrays with at least one polygon.

2. **Invalid coordinate values**:
   ```
   Error: Invalid coordinate value: NaN
   ```
   
   Solution: Check that all coordinate values are valid numbers.

3. **Missing properties**:
   ```
   Error: County requires a name and state property
   ```
   
   Solution: Ensure GeoJSON features include necessary properties (NAME, STATE).

### Fixing GeoJSON Data

If you encounter issues with GeoJSON data:

1. Verify your GeoJSON files with a validator tool
2. Ensure coordinate arrays follow the required nesting structure
3. Use simplified coordinates for testing
4. Run the `fixCountyIds.js` script to address ID-related issues

## Future Improvements

1. **Performance Optimization**:
   - Implement coordinate simplification for large polygons
   - Add caching for frequently accessed geographic data

2. **Enhanced Validation**:
   - Add topology validation to ensure valid polygon structures
   - Implement boundary overlap detection

3. **Extended Capabilities**:
   - Support for additional GeoJSON types
   - Implement spatial queries for property searches 
# Server Scripts

This directory contains utility scripts for server initialization and maintenance.

## US Map Initialization

The `initUSMap.ts` script is responsible for initializing the US Map document in the database, which serves as the root geographic entity for the real estate platform.

### How it works

1. The script checks if a US Map document already exists in the database
2. If no US Map document is found, it creates a new one with default values
3. The script handles both standalone execution and being imported in the main application

### Usage

#### Automatic initialization during server startup

The US Map initialization happens automatically when the server starts. The `index.ts` file imports and calls the `initUSMap` function:

```typescript
// server/src/index.ts
import initUSMap from './scripts/initUSMap';

// During server startup
connectDB()
  .then(async () => {
    // Initialize USMap
    try {
      await initUSMap();
      logger.info('US Map initialization complete');
    } catch (error) {
      logger.error('Error initializing US Map:', error);
      // Continue server startup even if US Map initialization fails
    }
    
    // Rest of server initialization...
  });
```

#### Manual initialization

You can also run the script manually:

```bash
# From the server directory
npx ts-node -r tsconfig-paths/register src/scripts/initUSMap.ts
```

### Testing US Map Initialization

To verify that the US Map initialization is working correctly, you can run the `testUSMap.js` script:

```bash
# From the server directory
node src/scripts/testUSMap.js
```

This script:
1. Connects to the database
2. Runs the initUSMap function
3. Verifies that the US Map document exists
4. Outputs information about the US Map

### CommonJS Version

For compatibility with JavaScript files, a CommonJS version of the script is provided in `initUSMap.cjs`. This version can be required directly in JavaScript files:

```javascript
const { initUSMap } = require('./initUSMap.cjs');
```

## Geo Data Initialization

The `initGeoData.ts` script initializes geographic data (states, counties) in the database.

### How it works

1. Checks if GeoJSON files exist in the data/geojson directory
2. Creates necessary directories if they don't exist
3. Initializes geographic data from GeoJSON files

### Resilience to Missing Files

The geographic data initialization has been made resilient to missing files:

1. If the states.json file is missing, a minimal default dataset will be used
2. If county files are missing, the system will log warnings but continue with available data
3. If any error occurs during initialization, it will be logged but won't prevent the server from starting

This ensures that the system can function even with partial geographic data.

### County ID Generation

All counties are automatically assigned a unique ID based on their state abbreviation and name, formatted as:
```
{state-abbreviation-lowercase}-{county-name-lowercase-with-spaces-replaced-by-hyphens}
```

For example, "Los Angeles" county in California would get the ID: `ca-los-angeles`.

### Fixing Missing County IDs

If you encounter County validation errors due to missing IDs, you can run the `fixCountyIds.js` script:

```bash
# From the server directory
node src/scripts/fixCountyIds.js
```

This script will find all counties without IDs and assign them based on their state abbreviation and name.

### Usage

To run the geo data initialization:

```bash
# From the server directory
npx ts-node -r tsconfig-paths/register src/scripts/initGeoData.ts
```

You can also enable auto-initialization during server startup by setting the `INIT_GEO_DATA` environment variable to `true`.

### Testing Geographic Data Initialization

To verify that the geographic data initialization is working correctly, you can run the `testGeoData.js` script:

```bash
# From the server directory
node src/scripts/testGeoData.js
```

This script:
1. Connects to the database
2. Runs the initializeGeographicData function
3. Verifies that states and counties are created
4. Outputs information about the created geographic data

## JWT Secret Bypass Tool

The `bypass-jwt-check.js` script is a development utility that creates a temporary modified version of the index.ts file that bypasses the JWT_SECRET environment variable check.

### Usage

```bash
# From the server directory
node src/bypass-jwt-check.js
```

This is useful for development environments where you don't want to set a permanent JWT_SECRET.

## GeoJSON Data and Coordinate Format

### GeoJSON Files Format
The project uses GeoJSON files for geographic data. The files must follow the GeoJSON specification, and our system includes several improvements to handle different coordinate formats:

- Coordinates are processed using our `GeoJSONUtils.ensureNumberCoordinates` function that recursively ensures all coordinate values are proper numbers
- The MongoDB schemas use `Schema.Types.Mixed` for coordinates with validation to ensure more flexible handling
- Supported geometry types include: 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', and 'MultiPolygon'

### Loading and Processing GeoJSON Files
When loading GeoJSON files, we apply several processing steps:

1. Parse the JSON file contents
2. Process using `GeoJSONUtils.processGeoJSON` to ensure all coordinates are properly formatted as numbers
3. Extract the necessary properties and prepare for database storage

Example GeoJSON county format:
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

### Troubleshooting GeoJSON Issues
If you encounter errors related to GeoJSON coordinates, try these steps:

1. Verify your GeoJSON files contain valid coordinate arrays (use simple coordinates when testing)
2. Use the `testCoordinateProcessing.js` script to verify your GeoJSON files can be properly processed
3. For existing records with coordinate issues, run the `fixCountyGeometries.js` script to repair them

When adding new geographic data, always ensure your coordinates are properly nested arrays of numbers. For MultiPolygon geometries, this means four levels of nesting: polygon → rings → coordinate pairs → coordinate values.

## Handling State ID Issues

If you encounter issues with missing state IDs, you can use the `createSpecificStates.js` script to create states with explicitly defined IDs:

```bash
# Run from the server directory
node src/scripts/createSpecificStates.js
```

This script:
1. Creates states with explicit IDs based on their abbreviation (lowercase)
2. Updates existing states that are missing IDs
3. Currently handles Florida, California, Texas, New York, and Maryland
4. Can be extended to handle additional states

### Implementation Details

The script provides three main functions:
- `createFloridaState`: Specifically for handling Florida (which has had ID issues)
- `createState`: Generic function for creating any state with proper ID
- `createRequiredStates`: Main function that creates all required states

Each state is created with:
- An explicit ID (abbreviation in lowercase)
- Basic geometry data
- Empty statistics
- Proper reference to the US Map parent

## County ID Generation

Counties are assigned unique IDs based on their state abbreviation and county name: `${stateAbbr.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`. This ID format ensures consistent reference to counties across the application.

## County ID Schema Changes

The County model schema has been updated to use a `customId` field instead of relying on MongoDB's `_id` field:

```typescript
// County schema updates
const CountySchema = new Schema<ICounty>({
  // Add a custom ID field
  customId: {
    type: String,
    unique: true,
    required: true
  },
  // ... other fields
});

// Add a virtual for 'id' that returns customId
CountySchema.virtual('id').get(function() {
  return this.customId;
});
```

This change addresses validation issues with county creation by:
1. Using a string-based identifier in the `customId` field
2. Setting up a virtual getter for backwards compatibility
3. Allowing MongoDB to generate its own internal `_id` field

### County Migration Scripts

Two migration scripts are available to handle the transition:

1. `migrateCountyIds.js` - Adds `customId` to existing counties that don't have it
   ```bash
   node src/scripts/migrateCountyIds.js
   ```

2. `resetAndMigrateCountyIds.js` - Resets all county `customId` fields and reassigns them correctly
   ```bash
   node src/scripts/resetAndMigrateCountyIds.js
   ```

The scripts automatically resolve state associations by:
- Using existing `stateId` if available
- Extracting state information from county names
- Mapping counties to states using a predefined table

### County ID Format

County IDs follow the format: `${stateAbbr.toLowerCase()}-${slugify(countyName.toLowerCase())}`

Examples:
- `tx-harris` for Harris County, TX
- `ca-los-angeles` for Los Angeles County, CA
- `ny-new-york` for New York County, NY

## Comprehensive Schema Improvements

To address the various issues with geographic data handling, we've implemented a series of comprehensive improvements:

### Shared Schema Definitions

We've created a shared schema file (`geo-schemas.ts`) with standardized definitions for:
- Geometry with proper coordinate validation
- Metadata structures for different entity types
- Statistics and controller schemas
- Helper functions for processing coordinates

This ensures consistent validation and structure across all geographic models.

### Improved ID Handling

1. **States**: Use a string-based `id` field that is explicitly set to the lowercase state abbreviation (e.g., `ca`, `tx`, `fl`).
2. **Counties**: Use a `customId` field with the format `${stateAbbr.toLowerCase()}-${slugify(countyName.toLowerCase())}`.

This approach:
- Makes IDs human-readable and predictable
- Avoids ObjectId casting issues
- Maintains backward compatibility through virtual getters
- Improves lookup performance

### Coordinate Processing

We've enhanced coordinate handling with:
- Better validation for GeoJSON geometries
- Automatic conversion of string coordinates to numbers
- Default minimal valid geometries for empty coordinate arrays
- Consistent coordinate nesting depth

### Model Relationships

We've improved the way models reference each other:
- Counties now store both `stateId` (for MongoDB relationships) and `stateAbbreviation` (for quick reference)
- Better parent-child relationships with explicit cross-references
- Compound indexes for more efficient lookups

### Migration Scripts

The following scripts handle data migration for existing databases:

1. `migrateCountyIds.js` - Adds `customId` to existing counties without modifying existing IDs
2. `resetAndMigrateCountyIds.js` - Completely resets and rebuilds county IDs
3. `createSpecificStates.js` - Creates states with proper IDs

### Troubleshooting Geographic Data Issues

If you encounter geographic data errors:

1. **Schema validation errors**: Run the appropriate migration script
2. **Empty coordinates errors**: Check that your GeoJSON files have valid coordinates or use our default minimal geometries
3. **ID-related errors**: Make sure states have `id` field and counties have `customId` field properly set
4. **State-county relationship errors**: Verify that county's `stateId` points to a valid state 
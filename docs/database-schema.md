# Database Schema

## Overview

The Real Estate Platform uses MongoDB as its primary database. The schema is designed around a hierarchical structure for the inventory system with States, Counties, and Properties forming a three-tier relationship.

## Collections

### USMap

The USMap collection contains a single document representing the United States map, which serves as the top-level container for all geographic data.

```javascript
{
  _id: ObjectId,           // MongoDB ID
  name: String,            // "US Map"
  type: String,            // "us_map"
  geometry: {              // GeoJSON representation of US boundaries
    type: String,          // "MultiPolygon"
    coordinates: Array     // Nested array of coordinates
  },
  metadata: {
    totalStates: Number,      // Total number of states
    totalCounties: Number,    // Total number of counties
    totalProperties: Number,  // Total number of properties
    statistics: {
      totalTaxLiens: Number,   // Total tax liens across all properties
      totalValue: Number       // Total value of all properties
    }
  },
  createdAt: Date,         // Document creation timestamp
  updatedAt: Date          // Document last update timestamp
}
```

### State

The State collection contains documents representing US states, each linked to the USMap as its parent.

```javascript
{
  _id: ObjectId,           // MongoDB ID
  name: String,            // State name (e.g., "Maryland")
  abbreviation: String,    // State abbreviation (e.g., "MD")
  type: String,            // "state"
  parentId: ObjectId,      // Reference to USMap document
  geometry: {              // GeoJSON representation of state boundaries
    type: String,          // "MultiPolygon"
    coordinates: Array     // Nested array of coordinates
  },
  metadata: {
    regionalInfo: {
      region: String,      // Geographic region (e.g., "Northeast")
      subregion: String    // Geographic subregion (e.g., "Mid-Atlantic")
    },
    totalCounties: Number,    // Number of counties in this state
    totalProperties: Number,  // Number of properties in this state
    statistics: {
      totalTaxLiens: Number,  // Total tax liens in this state
      totalValue: Number,     // Total property value in this state
      averagePropertyValue: Number, // Average property value
      lastUpdated: Date       // Last statistics update timestamp
    }
  },
  createdAt: Date,         // Document creation timestamp
  updatedAt: Date          // Document last update timestamp
}
```

### County

The County collection contains documents representing counties, each linked to a parent State.

```javascript
{
  _id: ObjectId,           // MongoDB ID
  name: String,            // County name (e.g., "Montgomery")
  type: String,            // "county"
  stateId: ObjectId,       // Reference to parent State document
  geometry: {              // GeoJSON representation of county boundaries
    type: String,          // "MultiPolygon"
    coordinates: Array     // Nested array of coordinates
  },
  metadata: {
    totalProperties: Number,  // Number of properties in this county
    statistics: {
      totalTaxLiens: Number,  // Total tax liens in this county
      totalValue: Number,     // Total property value in this county
      averagePropertyValue: Number, // Average property value
      totalPropertiesWithLiens: Number, // Properties with tax liens
      lastUpdated: Date       // Last statistics update timestamp
    },
    searchConfig: {
      lookupMethod: String,   // Method used for property lookup (e.g., "web", "api")
      searchUrl: String,      // URL for property searches
      lienUrl: String,        // URL for tax lien information
      enabled: Boolean,       // Whether search is enabled for this county
      lastRun: Date,          // Last search run timestamp
      nextScheduledRun: Date, // Next scheduled search timestamp
      selectors: {            // CSS selectors for web scraping
        ownerName: String,    // Selector for owner name field
        propertyAddress: String, // Selector for property address field
        marketValue: String,  // Selector for market value field
        taxStatus: String     // Selector for tax status field
      }
    }
  },
  createdAt: Date,         // Document creation timestamp
  updatedAt: Date          // Document last update timestamp
}
```

### Property

The Property collection contains documents representing individual properties, each linked to a parent County and State.

```javascript
{
  _id: ObjectId,              // MongoDB ID
  parcelId: String,           // Unique parcel identifier
  taxAccountNumber: String,   // Tax account number
  ownerName: String,          // Property owner name
  propertyAddress: String,    // Street address
  city: String,               // City
  stateId: ObjectId,          // Reference to State document
  countyId: ObjectId,         // Reference to County document
  zipCode: String,            // ZIP code
  location: {
    coordinates: {
      latitude: Number,       // Latitude coordinate
      longitude: Number       // Longitude coordinate
    },
    address: {
      street: String,         // Street address
      city: String,           // City
      state: String,          // State abbreviation
      county: String,         // County name
      zipCode: String         // ZIP code
    }
  },
  features: {
    type: String,             // Property type (e.g., "Residential", "Commercial")
    condition: String,        // Property condition
    yearBuilt: Number,        // Year property was built
    squareFeet: Number,       // Square footage
    lotSize: Number,          // Lot size
    bedrooms: Number,         // Number of bedrooms
    bathrooms: Number         // Number of bathrooms
  },
  taxStatus: {
    assessedValue: Number,    // Assessed value for tax purposes
    marketValue: Number,      // Market value
    taxRate: Number,          // Tax rate
    annualTaxAmount: Number,  // Annual tax amount
    taxLienAmount: Number,    // Tax lien amount (if any)
    taxLienStatus: String     // Status of tax lien (e.g., "Active", "Paid")
  },
  metadata: {
    propertyType: String,     // Property type
    taxStatus: String,        // Tax status
    assessedValue: Number,    // Assessed value
    marketValue: Number,      // Market value
    taxDue: Number,           // Tax due
    saleType: String,         // Type of sale
    saleAmount: Number,       // Sale amount
    saleDate: Date,           // Date of sale
    lastUpdated: Date         // Last update timestamp
  },
  status: String,             // Property status (e.g., "Active", "Sold")
  images: [{
    url: String,              // Image URL
    caption: String,          // Image caption
    isPrimary: Boolean        // Whether this is the primary image
  }],
  documents: [{
    type: String,             // Document type
    url: String,              // Document URL
    name: String,             // Document name
    uploadDate: Date          // Upload date
  }],
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document last update timestamp
}
```

## Relationships

The inventory system follows a hierarchical relationship model:

1. USMap (1) → States (Many)
2. State (1) → Counties (Many)
3. County (1) → Properties (Many)

These relationships are established through reference fields:
- States have a `parentId` field referencing the USMap
- Counties have a `stateId` field referencing their parent State
- Properties have both `stateId` and `countyId` fields referencing their parent State and County

## Export Schema Considerations

### Export Service Integration

The Export Service interacts with these data models to generate CSV and Excel exports. Key schema considerations for export operations include:

1. **Field Mapping**: 
   - The export service maps database fields to export columns
   - Properties like `_id` are converted to string format
   - Nested fields are flattened (e.g., `metadata.propertyType` becomes `propertyType`)
   - References to other documents are resolved (e.g., `stateId` is resolved to state name)

2. **Data Transformation**:
   - Date fields are formatted as strings
   - Numeric fields may be formatted with appropriate precision
   - Empty or null values are replaced with empty strings or default values

3. **Filter Queries**:
   - Export filters map to MongoDB query conditions
   - Range filters (e.g., `minValue`, `maxValue`) translate to `$gte` and `$lte` operators
   - Text fields may use case-insensitive partial matching with `$regex`

## Schema Evolution

The schema is designed to be adaptable to changing requirements. Some considerations for schema evolution:

1. **Backward Compatibility**:
   - New fields can be added without breaking existing functionality
   - Field renaming or removal should be handled carefully with migration scripts
   - Export services may need updates when schema changes occur

2. **Performance Optimization**:
   - Indexes are created on frequently queried fields
   - Denormalization is used for frequently accessed related data
   - Export operations use projection to fetch only required fields

3. **Data Validation**:
   - Mongoose schema validation ensures data integrity
   - Custom validators enforce business rules
   - Export services include additional validation for data conversion

## MongoDB Indexes

The following indexes are created to optimize query performance:

```javascript
// State indexes
db.states.createIndex({ abbreviation: 1 }, { unique: true });
db.states.createIndex({ name: 1 }, { unique: true });
db.states.createIndex({ parentId: 1 });

// County indexes
db.counties.createIndex({ name: 1, stateId: 1 }, { unique: true });
db.counties.createIndex({ stateId: 1 });

// Property indexes
db.properties.createIndex({ parcelId: 1, countyId: 1 }, { unique: true });
db.properties.createIndex({ stateId: 1 });
db.properties.createIndex({ countyId: 1 });
db.properties.createIndex({ "metadata.propertyType": 1 });
db.properties.createIndex({ "metadata.taxStatus": 1 });
db.properties.createIndex({ "metadata.marketValue": 1 });
db.properties.createIndex({ "location.coordinates": "2dsphere" });
``` 
# Database Schema

## Overview

The Real Estate Platform uses MongoDB as its primary database. Below are the main collections and their schemas.

## Collections

### USMap Collection

```typescript
interface USMap {
  _id: ObjectId;
  name: string;
  type: 'us_map';
  createdAt: Date;
  updatedAt: Date;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  metadata: {
    totalStates: number;
    totalCounties: number;
    totalProperties: number;
    lastUpdated: Date;
  };
}
```

### States Collection

```typescript
interface State {
  _id: ObjectId;
  name: string;
  abbreviation: string;
  type: 'state';
  parentId: ObjectId; // Reference to US Map Object
  createdAt: Date;
  updatedAt: Date;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  metadata: {
    totalCounties: number;
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
      totalPropertiesWithLiens: number;
      lastUpdated: Date;
    };
  };
  controllers: ControllerReference[];
}
```

### Counties Collection

```typescript
interface County {
  _id: ObjectId;
  name: string;
  type: 'county';
  parentId: ObjectId; // Reference to State Object
  stateId: ObjectId; // Direct reference to state for quicker lookups
  createdAt: Date;
  updatedAt: Date;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
    };
    searchConfig?: {
      lookupMethod: 'account_number' | 'parcel_id';
      searchUrl: string;
      lienUrl?: string;
      selectors: {
        ownerName: string;
        propertyAddress: string;
        marketValue: string;
        taxStatus: string;
        [key: string]: string;
      }
    }
  };
  controllers: ControllerReference[];
}
```

### Properties Collection

```typescript
interface Property {
  _id: ObjectId;
  parcelId: string;
  taxAccountNumber: string;
  type: 'property';
  parentId: ObjectId; // Reference to County Object
  countyId: ObjectId; // Direct reference to county
  stateId: ObjectId; // Direct reference to state
  createdAt: Date;
  updatedAt: Date;
  ownerName: string;
  propertyAddress: string;
  city?: string;
  zipCode?: string;
  status: 'Available' | 'Under Contract' | 'Sold' | 'Off Market';
  features: {
    type: string;
    condition: string;
    yearBuilt?: number;
    squareFeet?: number;
    lotSize?: number;
    bedrooms?: number;
    bathrooms?: number;
  };
  taxStatus: {
    assessedValue: number;
    marketValue: number;
    taxRate: number;
    annualTaxAmount: number;
    taxLienAmount: number;
    taxLienStatus: 'None' | 'Active' | 'Paid';
    lastUpdated: Date;
  };
  geometry?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  metadata: {
    lastAssessmentDate?: Date;
    lastSoldDate?: Date;
    lastSoldPrice?: number;
    zoning?: string;
    history: {
      date: Date;
      event: string;
      details: string;
    }[];
  };
  controllers: ControllerReference[];
}
```

### Controllers Collection

```typescript
interface Controller {
  _id: ObjectId;
  name: string;
  type: 'controller';
  controllerType: 'Tax Sale' | 'Map' | 'Property' | 'Demographics';
  description: string;
  configTemplate: {
    requiredFields: string[];
    optionalFields: Record<string, any>;
  };
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
  attachedTo: {
    objectId: ObjectId;
    objectType: 'us_map' | 'state' | 'county' | 'property';
  }[];
}
```

### ControllerReference Schema

```typescript
interface ControllerReference {
  controllerId: ObjectId;
  controllerType: string;
  enabled: boolean;
  lastRun?: Date;
  nextScheduledRun?: Date;
  configuration: Record<string, any>;
}
```

### Users Collection

```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string; // Hashed
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### Sessions Collection

```typescript
interface Session {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Search History Collection

```typescript
interface SearchHistory {
  _id: ObjectId;
  userId: ObjectId;
  query: string;
  filters: Record<string, any>;
  results: number;
  timestamp: Date;
}
```

## Indexes

### USMap Collection
```javascript
{
  type: 1
}
```

### States Collection
```javascript
{
  name: 1,
  abbreviation: 1,
  parentId: 1,
  type: 1
}
```

### Counties Collection
```javascript
{
  name: 1,
  stateId: 1,
  parentId: 1,
  type: 1
}
```

### Properties Collection
```javascript
{
  "parcelId": 1,
  "taxAccountNumber": 1,
  "stateId": 1,
  "countyId": 1,
  "parentId": 1,
  "type": 1,
  "propertyAddress": 1,
  "ownerName": 1,
  "status": 1,
  "geometry": "2dsphere"
}
```

### Controllers Collection
```javascript
{
  "controllerType": 1,
  "name": 1
}
```

### Users Collection
```javascript
{
  email: 1          // Unique index
}
```

### Sessions Collection
```javascript
{
  userId: 1,
  expiresAt: 1 // TTL index
}
```

## Relationships

1. **Hierarchical Structure**
   - USMap → States → Counties → Properties (parent-child)
   - Each level references its parent and may reference its grandparent for query optimization

2. **Controllers → Inventory Objects**
   - Controllers are attached to inventory objects (USMap, State, County, Property)
   - Inventory objects store controller references for execution

3. **Properties → Users**
   - Properties can be associated with users via API-level logic
   - No direct database relationship in the current schema

4. **Search History → Users**
   - One-to-many relationship
   - SearchHistory document contains user reference

5. **Sessions → Users**
   - One-to-many relationship
   - Session document contains user reference

## Data Validation

### State Validation
```javascript
{
  name: {
    type: String,
    required: true
  },
  abbreviation: {
    type: String,
    required: true,
    length: 2
  },
  type: {
    type: String,
    enum: ['state'],
    required: true
  },
  parentId: {
    type: ObjectId,
    required: true
  }
}
```

### County Validation
```javascript
{
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['county'],
    required: true
  },
  parentId: {
    type: ObjectId,
    required: true
  },
  stateId: {
    type: ObjectId,
    required: true
  }
}
```

### Property Validation
```javascript
{
  parcelId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['property'],
    required: true
  },
  parentId: {
    type: ObjectId,
    required: true
  },
  countyId: {
    type: ObjectId,
    required: true
  },
  stateId: {
    type: ObjectId,
    required: true
  },
  propertyAddress: {
    type: String,
    required: true
  }
}
```

### Controller Validation
```javascript
{
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['controller'],
    required: true
  },
  controllerType: {
    type: String,
    enum: ['Tax Sale', 'Map', 'Property', 'Demographics'],
    required: true
  },
  description: {
    type: String,
    required: true
  }
}
```

### User Validation
```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}
```

## Backup and Recovery

- Daily automated backups using MongoDB Atlas
- Point-in-time recovery with oplog
- Manual backups using Git
- Developer can create backup branches with timestamp
- See `GIT-SETUP.md` for backup procedures and scripts

## Performance Considerations

1. **Hierarchical Indexes**
   - Optimized for parent-child traversal (USMap → States → Counties → Properties)
   - Direct references to ancestors for faster queries

2. **Compound Indexes**
   - Created for common query patterns (state + county)
   - Optimized for property lookups by address and owner

3. **Query Optimization**
   - Field projection to return only necessary fields
   - Pagination to limit result set size

4. **Geospatial Indexes**
   - 2dsphere index for location-based searches
   - Optimized for proximity queries

5. **TTL Indexes**
   - Automatic cleanup of expired sessions
   - Automatic cleanup of password reset tokens 
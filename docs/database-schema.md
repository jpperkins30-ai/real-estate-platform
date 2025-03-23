# Database Schema

## Overview

The Real Estate Platform uses MongoDB as its primary database. Below are the main collections and their schemas.

## Collections

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

### Properties Collection

```typescript
interface Property {
  _id: ObjectId;
  propertyAddress: string;
  city?: string;
  state: string;
  county: string;
  zipCode?: string;
  propertyType: string;
  parcelId?: string;
  ownerName?: string;
  taxAccountNumber?: string;
  legalDescription?: string;
  saleInfo?: {
    saleDate?: Date;
    saleAmount?: number;
    saleType?: 'Tax Lien' | 'Deed' | 'Conventional';
  };
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

### Users Collection
```javascript
{
  email: 1          // Unique index
}
```

### Properties Collection
```javascript
{
  "state": 1,
  "county": 1,
  "propertyAddress": 1,
  "ownerName": 1,
  "parcelId": 1
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

1. **Properties → Users**
   - Properties can be associated with users via API-level logic
   - No direct database relationship in the current schema

2. **Search History → Users**
   - One-to-many relationship
   - SearchHistory document contains user reference

3. **Sessions → Users**
   - One-to-many relationship
   - Session document contains user reference

## Data Validation

### Property Validation
```javascript
{
  propertyAddress: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  county: {
    type: String,
    required: true
  },
  propertyType: {
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

- Manual backups using Git
- Developer can create backup branches with timestamp
- See `GIT-SETUP.md` for backup procedures and scripts

## Performance Considerations

1. **Compound Indexes**
   - Created for common query patterns (state + county)
   - Optimized for property lookups by address and owner

2. **Query Optimization**
   - Field projection to return only necessary fields
   - Pagination to limit result set size

3. **Geospatial Indexes**
   - 2dsphere index for location-based searches
   - Optimized for proximity queries

4. **TTL Indexes**
   - Automatic cleanup of expired sessions
   - Automatic cleanup of password reset tokens 
# Filter Types

This document outlines the TypeScript type definitions used throughout the filter system.

## Overview

The filter system uses TypeScript to provide type safety and better developer experience. The types defined here serve as the foundation for the filter system's components, enforcing consistent data structures and enabling IDE autocompletion.

## Core Types

### FilterSet

The base interface for filter collections:

```typescript
interface FilterSet {
  /**
   * Optional version number for conflict resolution
   */
  version?: number;
  
  /**
   * Dynamic filter properties
   */
  [key: string]: any;
}
```

### FilterPreset

Represents a saved filter configuration:

```typescript
interface FilterPreset {
  /**
   * Unique identifier for the preset
   */
  id: string;
  
  /**
   * User-friendly name for the preset
   */
  name: string;
  
  /**
   * Filter configuration
   */
  filters: FilterSet;
  
  /**
   * Creation timestamp
   */
  createdAt: string;
  
  /**
   * Optional description
   */
  description?: string;
}
```

### FilterConfig

Configuration options for filters:

```typescript
interface FilterConfig {
  /**
   * Default filter values
   */
  defaults?: FilterSet;
  
  /**
   * Storage configuration
   */
  storage?: {
    key?: string;
    useSessionStorage?: boolean;
  };
  
  /**
   * Version handling strategy
   */
  versioning?: {
    enabled: boolean;
    initialVersion?: number;
    conflictResolution?: 'latest-wins' | 'merge' | 'manual';
  };
}
```

## Storage Types

### StorageFormat

The format used to store data with versioning:

```typescript
interface StorageFormat<T> {
  /**
   * Format version
   */
  version: number | string;
  
  /**
   * Last update timestamp
   */
  updatedAt: string;
  
  /**
   * The actual data
   */
  data: T;
}
```

### FilterStorageError

Error type for storage operations:

```typescript
class FilterStorageError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = 'FilterStorageError';
  }
}
```

## Extended Types

### PropertyFilters

Example of an application-specific filter type:

```typescript
interface PropertyFilters extends FilterSet {
  priceRange?: [number, number];
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  amenities?: string[];
  yearBuilt?: [number, number];
  squareFeet?: [number, number];
}
```

### MetadataTypes

Types for tracking metadata:

```typescript
interface FilterMetadata {
  version: number;
  updatedAt: string;
  source?: string;
  hasConflicts?: boolean;
}

interface PanelStateMetadata {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  version: number;
}
```

## Utility Types

Various utility types that support the filter system:

```typescript
type FilterUpdateFunction<T extends FilterSet> = (prevFilters: T) => T;

type FilterApplyFunction<T extends FilterSet> = (
  filters: Partial<T> | FilterUpdateFunction<T>
) => void;

type FilterChangeHandler<T extends FilterSet> = (
  newFilters: T, 
  metadata?: FilterMetadata
) => void;
```

## Usage

These types can be imported and used throughout the application:

```typescript
import { FilterSet, PropertyFilters } from '../types/filter.types';

// Using the base interface
const defaultFilters: FilterSet = {
  version: 1,
  category: 'all'
};

// Using an extended interface
const propertyFilters: PropertyFilters = {
  version: 1,
  priceRange: [100000, 500000],
  bedrooms: 3,
  propertyType: ['house', 'condo']
};
```

## Related Components

- [Filter Context](../context/FilterContext.md)
- [useFilter Hook](../hooks/useFilter.md)
- [Filter Service](../services/filterService.md) 
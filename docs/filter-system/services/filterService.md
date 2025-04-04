# Filter Service

The Filter Service provides utility functions for managing filter data, including storage operations and filter manipulations.

## Overview

This service handles the low-level operations related to filter management, such as saving and retrieving filters from browser storage, merging filter objects, and managing filter presets.

## Implementation

```typescript
import { FilterSet, FilterPreset, StorageFormat } from '../types/filter.types';

export const filterService = {
  // Storage operations
  getStoredFilters(): FilterSet | null {
    // Implementation
  },
  
  setStoredFilters(filters: FilterSet): void {
    // Implementation
  },
  
  // Preset management
  getFilterPresets(): FilterPreset[] {
    // Implementation
  },
  
  saveFilterPreset(preset: FilterPreset): string {
    // Implementation
  },
  
  deleteFilterPreset(presetId: string): boolean {
    // Implementation
  },
  
  // Filter operations
  mergeFilters(baseFilters: FilterSet, newFilters: Partial<FilterSet>): FilterSet {
    // Implementation
  },
  
  // Storage utilities
  clearStorage(): void {
    // Implementation
  },
  
  // Configuration
  configure(options: FilterServiceOptions): void {
    // Implementation
  }
};
```

## Key Features

### Storage Operations

The service provides methods to save and retrieve filter data from browser storage:

```typescript
// Get active filters from storage
const filters = filterService.getStoredFilters();

// Update stored filters
filterService.setStoredFilters({
  priceRange: [100000, 500000],
  bedrooms: 3,
  propertyType: ['house', 'condo']
});
```

### Filter Preset Management

Filter presets can be saved, retrieved, and deleted:

```typescript
// Save current filters as a preset
const presetId = filterService.saveFilterPreset({
  id: 'preset1',
  name: 'My Favorite Search',
  filters: { ... },
  createdAt: new Date().toISOString()
});

// Get all saved presets
const presets = filterService.getFilterPresets();

// Delete a preset
filterService.deleteFilterPreset('preset1');
```

### Storage Format

All data is stored in a versioned format:

```typescript
{
  version: 1,
  updatedAt: "2023-04-04T12:34:56.789Z",
  data: {
    // The actual filter data
    priceRange: [100000, 500000],
    propertyType: ["house", "condo"]
  }
}
```

### Storage Keys

The service uses standardized storage keys:

- `activeFilters` - Current filter state
- `filterPresets` - Saved filter presets
- Custom prefixed keys for specific applications

### Error Handling

The service includes comprehensive error handling:

- Storage failures with graceful fallbacks
- Data validation to prevent invalid states
- Type checking for improved reliability

## Configuration

The service can be configured with custom options:

```typescript
filterService.configure({
  storagePrefix: 'myApp_',
  primaryStorage: 'localStorage',
  fallbackStorage: 'sessionStorage',
  enableFallback: true,
  storageVersion: 'v2'
});
```

## Related Components

- [Filter Types](../types/filter.types.md)
- [Panel State Service](./panelStateService.md)
- [useFilter Hook](../hooks/useFilter.md) 
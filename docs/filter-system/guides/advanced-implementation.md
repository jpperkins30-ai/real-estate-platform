# Advanced Filter System Implementation

This guide covers advanced usage scenarios and implementation details for the filter system.

## Custom Filter Types

### Defining Custom Filter Types

Extend the filter types to include your application-specific filter types:

```typescript
// types/filter.types.ts
import { FilterSet, FilterConfig } from '../path-to-original-types';

// Extend with your custom filter types
export interface PropertyFilters extends FilterSet {
  priceRange?: [number, number];
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  amenities?: string[];
  yearBuilt?: [number, number];
  squareFeet?: [number, number];
}

// Custom filter configuration
export interface PropertyFilterConfig extends FilterConfig {
  enabledFilters: (keyof PropertyFilters)[];
  defaultValues: Partial<PropertyFilters>;
  displayOrder: (keyof PropertyFilters)[];
}
```

### Using Custom Filter Types

```typescript
import { useFilter } from '../hooks/useFilter';
import { PropertyFilters } from '../types/filter.types';

function PropertyFilterComponent() {
  const { activeFilters, applyFilters } = useFilter<PropertyFilters>();
  
  // Now TypeScript knows about your custom filter types
  const handlePriceRangeChange = (min: number, max: number) => {
    applyFilters({ priceRange: [min, max] });
  };
  
  return (
    <div>
      <PriceRangeSlider 
        value={activeFilters.priceRange || [0, 1000000]}
        onChange={handlePriceRangeChange}
      />
      {/* Other filter inputs */}
    </div>
  );
}
```

## Advanced Filter Context Configuration

For applications with complex filtering needs, you can configure the `FilterContextProvider` with custom options:

```tsx
<FilterContextProvider
  initialFilters={{
    priceRange: [200000, 500000],
    propertyType: ['Condo', 'Single Family']
  }}
  storageKey="property-app-filters"
  storageOptions={{
    useSessionStorage: true,
    persistFilterHistory: true,
    historySize: 10
  }}
  versionStrategy={{
    conflictResolution: 'latest-wins',
    autoVersion: true,
    syncIntervalMs: 5000
  }}
>
  <App />
</FilterContextProvider>
```

## Handling Filter Conflicts

When working with multiple panels that can modify the same filters, conflicts may arise. Implement a conflict resolution strategy:

```typescript
import { useFilter } from '../hooks/useFilter';
import { usePanelSync } from '../hooks/usePanelSync';
import { resolveConflicts } from '../utils/filterConflictResolver';

function ConflictAwarePanel({ panelId }) {
  const { activeFilters, applyFilters, getFilterMetadata } = useFilter();
  const { broadcast, subscribe } = usePanelSync();
  
  // Handle incoming filter changes with conflict resolution
  useEffect(() => {
    const unsubscribe = subscribe(event => {
      if (event.type === 'filter' && event.source !== panelId) {
        const localFilters = activeFilters;
        const localMeta = getFilterMetadata(); // Includes version info
        const remoteFilters = event.payload.filters;
        const remoteMeta = event.payload.metadata;
        
        // Resolve any conflicts between local and remote filters
        const { resolvedFilters, hasConflicts } = resolveConflicts(
          localFilters, remoteFilters, localMeta, remoteMeta
        );
        
        // Apply the resolved filters
        applyFilters(resolvedFilters);
        
        // Optionally notify user about conflicts
        if (hasConflicts) {
          notifyUser('Filter conflicts were automatically resolved');
        }
      }
    });
    
    return () => unsubscribe();
  }, [panelId, activeFilters, getFilterMetadata, subscribe, applyFilters]);
  
  // Rest of your component...
}
```

## Optimizing Filter Performance

For large datasets or complex filtering operations:

```typescript
import { useFilter } from '../hooks/useFilter';
import { useMemo, useCallback } from 'react';

function OptimizedFilterComponent({ data }) {
  const { activeFilters } = useFilter();
  
  // Memoize the filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Your filtering logic here
      return true; // Replace with actual conditions
    });
  }, [data, activeFilters]); // Only recalculate when data or filters change
  
  // Memoize filter change handlers
  const handleFilterChange = useCallback((filterKey, value) => {
    applyFilters({ [filterKey]: value });
  }, [applyFilters]);
  
  return (
    <div>
      {/* Your component UI */}
    </div>
  );
}
```

## Filter Persistence Strategies

### Using Different Storage Options

```typescript
import { filterService } from '../services/filterService';

// Configure storage preferences
filterService.configure({
  primaryStorage: 'localStorage', // 'localStorage' | 'sessionStorage' | 'memory'
  fallbackStorage: 'sessionStorage',
  enableFallback: true,
  storageKeyPrefix: 'my-app-filters-',
  enableCompression: true, // For large filter objects
  expirationTime: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
});

// Manage storage directly
const clearAllFilters = () => {
  filterService.clearStorage();
};

const exportFilters = () => {
  const allFilters = filterService.getAllFilterPresets();
  const jsonString = JSON.stringify(allFilters);
  
  // Create download link
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "filter-presets.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
```

### Custom Persistence Layer

For applications requiring backend storage of filters:

```typescript
// services/remoteFilterService.ts
import { FilterSet, FilterPreset } from '../types/filter.types';
import { api } from './api';

export const remoteFilterService = {
  async saveFilterPreset(preset: FilterPreset): Promise<string> {
    const response = await api.post('/filters/presets', preset);
    return response.data.id;
  },
  
  async getFilterPresets(): Promise<FilterPreset[]> {
    const response = await api.get('/filters/presets');
    return response.data;
  },
  
  async deleteFilterPreset(id: string): Promise<boolean> {
    await api.delete(`/filters/presets/${id}`);
    return true;
  },
  
  async syncFilters(filters: FilterSet): Promise<void> {
    await api.post('/filters/sync', { filters });
  }
};

// Using remote filter service with local filters
const syncWithServer = async () => {
  try {
    await remoteFilterService.syncFilters(activeFilters);
  } catch (error) {
    console.error('Failed to sync filters with server', error);
  }
};
```

## Advanced Filter System Integration

### Integration with Redux

If your application uses Redux for state management:

```typescript
// store/filterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterSet } from '../types/filter.types';

const filterSlice = createSlice({
  name: 'filters',
  initialState: {
    active: {} as FilterSet,
    presets: [] as FilterPreset[],
    metadata: {
      version: 1,
      lastUpdated: new Date().toISOString()
    }
  },
  reducers: {
    setFilters(state, action: PayloadAction<FilterSet>) {
      state.active = action.payload;
      state.metadata.version++;
      state.metadata.lastUpdated = new Date().toISOString();
    },
    // Additional reducers...
  }
});

// In your component
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../store/filterSlice';

function ReduxFilterComponent() {
  const dispatch = useDispatch();
  const activeFilters = useSelector(state => state.filters.active);
  
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters({
      ...activeFilters,
      ...newFilters
    }));
  };
  
  // Component implementation...
}
```

## Next Steps

For more information on the filter system, check out:

- [Basic Implementation](./basic-implementation.md)
- [Custom Filter Components](./custom-filter-components.md)
- [Filter System Architecture](../architecture.md)
- [Filter Testing Guide](../testing.md) 
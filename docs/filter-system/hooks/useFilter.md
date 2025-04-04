# useFilter Hook

The `useFilter` hook is the primary way to interact with the filter system in your components.

## Overview

This hook provides access to the current filter state and methods to manipulate filters, wrapping the functionality provided by the FilterContext.

## Implementation

```tsx
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';
import { FilterSet } from '../types/filter.types';

export function useFilter<T extends FilterSet = FilterSet>() {
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context as FilterContextValue<T>;
}
```

## Returns

The hook returns an object with the following properties and methods:

| Property/Method | Type | Description |
|----------------|------|-------------|
| `activeFilters` | `T` | The current active filters |
| `applyFilters` | `(filters: Partial<T>) => void` | Apply new filters, merging with existing ones |
| `resetFilters` | `() => void` | Reset filters to default state |
| `saveFilterPreset` | `(name: string) => string` | Save current filters as a preset |
| `loadFilterPreset` | `(presetId: string) => void` | Load a saved preset |
| `getFilterPresets` | `() => FilterPreset[]` | Get all saved filter presets |
| `getFilterMetadata` | `() => FilterMetadata` | Get metadata about current filters (version, etc.) |

## Usage

```tsx
import { useFilter } from '../hooks/useFilter';
import { PropertyFilters } from '../types/filter.types';

function PropertyList() {
  // Type the hook for better TypeScript support
  const { activeFilters, applyFilters, resetFilters } = useFilter<PropertyFilters>();
  
  // Apply a price range filter
  const handlePriceChange = (min: number, max: number) => {
    applyFilters({ priceRange: [min, max] });
  };
  
  // Reset all filters
  const handleReset = () => {
    resetFilters();
  };
  
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
}
```

## Generic Type Support

The hook supports generic types to enable type-safe filter operations in TypeScript:

```tsx
// Define custom filter types
interface MyCustomFilters extends FilterSet {
  category?: string[];
  dateRange?: [Date, Date];
  priceRange?: [number, number];
}

// Use with type parameter
const { activeFilters } = useFilter<MyCustomFilters>();

// Now TypeScript knows the shape of your filters
if (activeFilters.category) {
  // TypeScript knows this is string[]
}
```

## Related Components

- [Filter Context](../context/FilterContext.md)
- [Filter Types](../types/filter.types.md)
- [usePanelState Hook](./usePanelState.md) 
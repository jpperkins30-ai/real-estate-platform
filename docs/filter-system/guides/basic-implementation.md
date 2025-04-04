# Basic Filter System Implementation Guide

This guide walks through the essential steps to implement the filter system in your application components.

## 1. Setup Filter Context

First, ensure the `FilterContextProvider` is available at the top level of your application hierarchy.

```tsx
// In your App.tsx or container component
import { FilterContextProvider } from '../context/FilterContext';

function App() {
  return (
    <FilterContextProvider>
      <YourAppContent />
    </FilterContextProvider>
  );
}
```

## 2. Basic Filter Usage

To use filters in a component:

```tsx
import React from 'react';
import { useFilter } from '../hooks/useFilter';

function PropertyList() {
  // Access the filter context
  const { activeFilters, applyFilters, resetFilters } = useFilter();
  
  // Example of using filters to filter data
  const filteredProperties = properties.filter(property => {
    // Apply price filter if it exists
    if (activeFilters.price) {
      const [min, max] = activeFilters.price;
      if (property.price < min || property.price > max) {
        return false;
      }
    }
    
    // Apply location filter if it exists
    if (activeFilters.location && activeFilters.location !== property.location) {
      return false;
    }
    
    return true;
  });
  
  // Example of updating filters
  const handlePriceChange = (range) => {
    applyFilters({ price: range });
  };
  
  // Example of resetting filters
  const handleResetFilters = () => {
    resetFilters();
  };
  
  return (
    <div>
      {/* Your component UI */}
    </div>
  );
}
```

## 3. Filter Panel Integration

To add a filter panel:

```tsx
import React from 'react';
import { FilterPanel } from '../components/multiframe/filters/FilterPanel';

function YourPanelLayout() {
  return (
    <div className="panel-layout">
      <FilterPanel 
        panelId="filter-panel-1"
        title="Property Filters"
      />
      {/* Other panels */}
    </div>
  );
}
```

## 4. Synchronizing Filters Between Panels

For multi-panel applications that need synchronized filters:

```tsx
import React, { useEffect } from 'react';
import { useFilter } from '../hooks/useFilter';
import { usePanelSync } from '../hooks/usePanelSync';

function SynchronizedPanel({ panelId }) {
  const { activeFilters, applyFilters } = useFilter();
  const { broadcast, subscribe } = usePanelSync();
  
  // Subscribe to filter events from other panels
  useEffect(() => {
    const unsubscribe = subscribe(event => {
      if (event.type === 'filter' && event.source !== panelId) {
        // Apply the filters from another panel
        applyFilters(event.payload.filters);
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [panelId, subscribe, applyFilters]);
  
  // Broadcast filter changes to other panels
  const handleFilterChange = (newFilters) => {
    // Update local filters
    applyFilters(newFilters);
    
    // Broadcast to other panels
    broadcast({
      type: 'filter',
      source: panelId,
      payload: { filters: newFilters }
    });
  };
  
  return (
    <div>
      {/* Your panel content */}
    </div>
  );
}
```

## 5. Persisting Filter State

The filter system automatically handles persistence. To customize storage behavior:

```tsx
import { filterService } from '../services/filterService';

// Save a specific filter preset
const saveCurrentFilters = () => {
  const preset = {
    name: 'My Favorite Filters',
    filters: activeFilters
  };
  
  filterService.saveFilterPreset(preset);
};

// Load a saved preset
const loadSavedPreset = (presetId) => {
  const preset = filterService.getFilterPreset(presetId);
  if (preset) {
    applyFilters(preset.filters);
  }
};
```

## Next Steps

For more advanced usage, check out:

- [Advanced Filter Implementation](./advanced-implementation.md)
- [Custom Filter Components](./custom-filter-components.md)
- [Filter System Architecture](../architecture.md)
- [Best Practices](../best-practices.md) 
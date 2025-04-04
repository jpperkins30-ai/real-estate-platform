# Using Filters in Components

This guide demonstrates how to effectively use the Filter System in your components for filtering data and maintaining synchronized filter state across panels.

## Contents

1. [Basic Filter Usage](#basic-filter-usage)
2. [Creating Custom Filter Panels](#creating-custom-filter-panels)
3. [Using Filtered Data](#using-filtered-data)
4. [Filter Synchronization](#filter-synchronization)
5. [Working with Saved Filters](#working-with-saved-filters)
6. [Troubleshooting](#troubleshooting)

## Basic Filter Usage

The simplest way to use filters is through the `useFilter` hook:

```tsx
import React from 'react';
import { useFilter } from '../../hooks/useFilter';

const PropertyList: React.FC = () => {
  const { activeFilters } = useFilter();
  
  // Log active filters whenever they change
  React.useEffect(() => {
    console.log('Active filters:', activeFilters);
  }, [activeFilters]);
  
  return (
    <div>
      <h2>Property List</h2>
      {/* Component implementation */}
    </div>
  );
};
```

## Creating Custom Filter Panels

You can create custom filter UI components that update the global filter state:

```tsx
import React, { useState } from 'react';
import { useFilter } from '../../hooks/useFilter';
import { PropertyFilter } from '../../types/filter.types';

const PropertyFilterPanel: React.FC = () => {
  const { activeFilters, applyFilters } = useFilter();
  const [localFilters, setLocalFilters] = useState<PropertyFilter>(
    activeFilters.property || {}
  );
  
  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalFilters({
      ...localFilters,
      propertyType: e.target.value
    });
  };
  
  const handleApplyFilters = () => {
    applyFilters({
      ...activeFilters,
      property: localFilters
    });
  };
  
  return (
    <div className="filter-panel">
      <div className="filter-section">
        <label>
          Property Type:
          <select 
            value={localFilters.propertyType || ''} 
            onChange={handlePropertyTypeChange}
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </label>
        
        {/* More filter controls */}
        
        <button onClick={handleApplyFilters}>Apply Filters</button>
      </div>
    </div>
  );
};
```

## Using Filtered Data

To apply filters to a dataset, use the `useFilteredData` hook:

```tsx
import React from 'react';
import { useFilteredData } from '../../hooks/useFilter';
import { PropertyCard } from '../cards/PropertyCard';

// Sample data
const properties = [
  { id: 1, propertyType: 'residential', price: 350000, city: 'Austin' },
  { id: 2, propertyType: 'commercial', price: 1200000, city: 'Dallas' },
  // More properties...
];

const PropertyGrid: React.FC = () => {
  // useFilteredData automatically applies active filters from context
  const { filteredData } = useFilteredData(properties);
  
  return (
    <div className="property-grid">
      {filteredData.length === 0 ? (
        <p>No properties match your filters.</p>
      ) : (
        filteredData.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))
      )}
    </div>
  );
};
```

### Using Custom Filters

You can also specify custom filters instead of using the global context filters:

```tsx
// Custom filters specific to this component
const customFilters = {
  property: {
    price: [300000, 600000] as [number, number]
  }
};

// Apply custom filters
const { filteredData } = useFilteredData(properties, customFilters);
```

## Filter Synchronization

To synchronize filters between panels, integrate with the Panel Sync system:

```tsx
import React, { useEffect } from 'react';
import { useFilter } from '../../hooks/useFilter';
import { usePanelSync } from '../../hooks/usePanelSync';

const SynchronizedFilterPanel: React.FC<{ panelId: string }> = ({ panelId }) => {
  const { activeFilters, applyFilters } = useFilter();
  const { broadcast, subscribe } = usePanelSync();
  
  // Subscribe to filter events from other panels
  useEffect(() => {
    const unsubscribe = subscribe(event => {
      // Only process events from other panels
      if (event.source !== panelId && event.type === 'filter') {
        // Apply filters from the event
        const newFilters = event.payload?.filters;
        if (newFilters) {
          applyFilters(newFilters);
        }
      }
    });
    
    // Clean up subscription
    return unsubscribe;
  }, [panelId, subscribe, applyFilters]);
  
  // Broadcast filter changes when applied
  const handleApplyFilters = (filters) => {
    applyFilters(filters);
    broadcast('filter', { filters }, panelId);
  };
  
  // Component implementation...
};
```

## Working with Saved Filters

The Filter System supports saving and loading filter presets:

```tsx
import React from 'react';
import { useFilter } from '../../hooks/useFilter';

const SavedFiltersPanel: React.FC = () => {
  const { 
    activeFilters, 
    savedFilters, 
    saveFilter, 
    loadFilter, 
    deleteFilter 
  } = useFilter();
  
  const [filterName, setFilterName] = useState('');
  
  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveFilter({
        name: filterName,
        filters: activeFilters
      });
      setFilterName('');
    }
  };
  
  return (
    <div className="saved-filters-panel">
      <h3>Save Current Filter</h3>
      <div className="save-filter-form">
        <input 
          type="text" 
          value={filterName} 
          onChange={e => setFilterName(e.target.value)}
          placeholder="Filter name"
        />
        <button onClick={handleSaveFilter}>Save</button>
      </div>
      
      <h3>Saved Filters</h3>
      <ul className="saved-filter-list">
        {savedFilters.map(filter => (
          <li key={filter.id} className="saved-filter-item">
            <span>{filter.name}</span>
            <div className="saved-filter-actions">
              <button onClick={() => loadFilter(filter.id)}>Apply</button>
              <button onClick={() => deleteFilter(filter.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## Using Panel State for Local Persistence

Combine filter functionality with panel state for enhanced persistence:

```tsx
import React, { useState, useEffect } from 'react';
import { useFilter } from '../../hooks/useFilter';
import { usePanelState } from '../../hooks/usePanelState';
import { FilterSet } from '../../types/filter.types';

const PersistentFilterPanel: React.FC<{ panelId: string }> = ({ panelId }) => {
  const { activeFilters, applyFilters } = useFilter();
  
  // Use panel state for local persistence
  const { state, updateState } = usePanelState({
    panelId,
    initialState: { filters: {} },
    contentType: 'filter'
  });
  
  // Local filter state
  const [localFilters, setLocalFilters] = useState<FilterSet>(
    state.filters || activeFilters
  );
  
  // Sync with panel state when active filters change
  useEffect(() => {
    if (!state.filters) {
      setLocalFilters(activeFilters);
    }
  }, [activeFilters, state.filters]);
  
  const handleApplyFilters = () => {
    applyFilters(localFilters);
    updateState({ filters: localFilters });
  };
  
  // Component implementation...
};
```

## Troubleshooting

### Common Issues

#### Filters not applying

- Ensure you're calling `applyFilters` and not just updating local state
- Check that your component is within a `FilterContextProvider`
- Verify filter property names match the expected format

#### Filters not persisting

- Confirm localStorage is available in your environment
- Check for console errors related to storage operations
- Verify you're using the correct storage keys

#### Synchronization issues

- Ensure panel ID is correctly passed to broadcast operations
- Check that event type matches what subscribers are looking for
- Verify the event payload structure is correct

#### Version conflicts

- Make sure you're using the version-aware filter functions
- Implement conflict resolution using `resolveFilterConflicts`
- Log version information during problematic operations

## Related Documentation

- [Filter System Architecture](../filter-system/architecture.md)
- [Filter System API Reference](../api/filter-system.md)
- [Panel State Management](../panel-system/state-management.md) 
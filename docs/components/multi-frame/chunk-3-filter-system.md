# Multi-Frame Filter System

## Overview

The Filter System is a critical component of the Real Estate Platform's multi-frame architecture. It provides a centralized mechanism for applying and managing filters across different panels, ensuring a consistent and synchronized user experience. The system includes:

- A shared context for global filter state management
- Persistence mechanisms for both filters and panel states
- Components for user interaction with filters
- Communication between panels for coordinated filtering

The filter system builds upon the panel communication infrastructure (established in Chunk 2) and provides a foundation for layout persistence (planned for Chunk 4).

## Filter System Architecture

```
┌────────────────────────────────────────────────────────┐
│ FilterContextProvider                                  │
│                                                        │
│  ┌─────────────────┐          ┌────────────────────┐   │
│  │                 │          │                    │   │
│  │  activeFilters  │◄─────────┤  applyFilters()   │   │
│  │                 │          │                    │   │
│  └─────────────────┘          └────────────────────┘   │
│           │                                            │
│           │                                            │
│           ▼                                            │
│  ┌────────────────────────────────────────────────┐   │
│  │                                                │   │
│  │               Panel Components                 │   │
│  │                                                │   │
│  │  ┌─────────────┐      ┌───────────────────┐   │   │
│  │  │             │      │                   │   │   │
│  │  │ FilterPanel │      │ Data Panels       │   │   │
│  │  │             │      │ (Map, Property,   │   │   │
│  │  └─────────────┘      │  County, etc.)    │   │   │
│  │        │              │                   │   │   │
│  │        │              └───────────────────┘   │   │
│  │        │                      ▲               │   │
│  │        │                      │               │   │
│  │        └──────────────────────┘               │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Filter Context Implementation

The FilterContext provides a centralized store for filter state management across the application. It uses React's Context API to make filter functionality available to all components in the application.

Key features:
- Global filter state management
- Persistence of filter state between sessions
- Filter presets for saving and reusing common filters
- Simple API for applying and clearing filters

### FilterContext and Provider

```typescript
// FilterContext.tsx
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { FilterSet, FilterConfig } from '../types/filter.types';
import { loadFiltersFromStorage, saveFiltersToStorage, loadFilterPresetsFromStorage, saveFilterPresetsToStorage } from '../services/filterService';

interface FilterContextType {
  activeFilters: FilterSet;
  savedFilters: FilterConfig[];
  applyFilters: (filters: FilterSet) => void;
  clearFilters: () => void;
  saveFilter: (config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteFilter: (id: string) => void;
  loadFilter: (id: string) => void;
}

// Default context value to avoid null checks
const defaultContextValue: FilterContextType = {
  activeFilters: {},
  savedFilters: [],
  applyFilters: () => {},
  clearFilters: () => {},
  saveFilter: () => {},
  deleteFilter: () => {},
  loadFilter: () => {}
};

export const FilterContext = createContext<FilterContextType>(defaultContextValue);

export const FilterContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State with persistence
  const [activeFilters, setActiveFilters] = useState<FilterSet>(() => {
    const storedFilters = loadFiltersFromStorage();
    return storedFilters || {};
  });
  
  // ... implementation details ...
  
  // Context value
  const contextValue = {
    activeFilters,
    savedFilters,
    applyFilters,
    clearFilters,
    saveFilter,
    deleteFilter,
    loadFilter
  };
  
  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
```

### useFilter Hook

The useFilter hook provides a convenient way to access the FilterContext from any component:

```typescript
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export function useFilter() {
  const context = useContext(FilterContext);
  
  // Safety check - though we have a default context value now
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context;
}
```

## Filter Type Definitions

The filter system is built around a structured type system that defines the shape of filters:

```typescript
// Geographic filters - location-based filtering
export interface GeographicFilter {
  state?: string;
  county?: string;
  city?: string;
  zipCode?: string;
  [key: string]: any;
}

// Property filters - property characteristics filtering
export interface PropertyFilter {
  propertyType?: string | string[];
  priceRange?: [number, number];
  bedrooms?: string | number;
  bathrooms?: string | number;
  squareFeet?: [number, number];
  zoning?: string;
  saleType?: string;
  [key: string]: any;
}

// FilterSet - combines all filter types
export interface FilterSet {
  property?: PropertyFilter;
  geographic?: GeographicFilter;
  [key: string]: any;
}

// Configuration for saving filter presets
export interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: FilterSet;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## Panel State Persistence

The filter system includes a robust state persistence mechanism that allows panels to save and retrieve their state between sessions. This is critical for maintaining the user's context when navigating through the application.

### Panel State Service

```typescript
import { PanelContentType } from '../types/layout.types';

export interface PanelState {
  id: string;
  contentType: PanelContentType;
  state: any;
  lastUpdated: string;
}

/**
 * Save panel state
 */
export function savePanelState(panelId: string, contentType: PanelContentType, state: any): PanelState {
  const panelState: PanelState = {
    id: panelId,
    contentType,
    state,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to session storage for persistence
  const storedStates = sessionStorage.getItem('panelStates');
  let states: Record<string, PanelState> = {};
  
  if (storedStates) {
    try {
      states = JSON.parse(storedStates);
    } catch (error) {
      console.error('Error parsing stored panel states:', error);
    }
  }
  
  states[panelId] = panelState;
  sessionStorage.setItem('panelStates', JSON.stringify(states));
  
  return panelState;
}

// ... loadPanelState and deletePanelState functions ...
```

### usePanelState Hook

The usePanelState hook provides a React hook interface for accessing and updating the panel state:

```typescript
export function usePanelState<T extends Record<string, any>>(
  panelId: string, 
  contentType: PanelContentType, 
  initialState: T = {} as T
): [T, (newState: Partial<T> | ((prevState: T) => T)) => void, () => void] {
  // Load saved state or use initial state with error handling
  const loadInitialState = (): T => {
    try {
      const savedState = loadPanelState(panelId);
      
      if (savedState && savedState.contentType === contentType) {
        return savedState.state as T;
      }
    } catch (error) {
      console.error(`Error loading panel state for ${panelId}:`, error);
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<T>(loadInitialState);
  
  // ... update and reset state implementation ...
  
  // Return state, update function, and reset function
  return [state, updateState, resetState];
}
```

## Filter Service Implementation

The filter service provides utilities for working with filters, including persistence to localStorage, applying filters to data, and managing filter presets.

```typescript
// Storage keys
const STORAGE_KEY_ACTIVE_FILTERS = 'activeFilters';
const STORAGE_KEY_FILTER_PRESETS = 'filterPresets';

/**
 * Apply filters to data with improved type safety and error handling
 */
export function applyFiltersToData<T extends Record<string, any>>(data: T[], filters: FilterSet): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  try {
    return data.filter(item => {
      // Apply property filters
      if (filters.property && Object.keys(filters.property).length > 0) {
        if (!isItemMatchingPropertyFilters(item, filters.property)) {
          return false;
        }
      }
      
      // Apply geographic filters
      if (filters.geographic && Object.keys(filters.geographic).length > 0) {
        if (!isItemMatchingGeographicFilters(item, filters.geographic)) {
          return false;
        }
      }
      
      // Item passed all filters
      return true;
    });
  } catch (error) {
    console.error('Error applying filters to data:', error);
    return data; // Return original data on error
  }
}

// ... persistence functions ...

/**
 * Save filters to local storage with error handling
 */
export function saveFiltersToStorage(filters: FilterSet): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to storage:', error);
  }
}

/**
 * Load filters from local storage with error handling
 */
export function loadFiltersFromStorage(): FilterSet | null {
  try {
    const storedFilters = localStorage.getItem(STORAGE_KEY_ACTIVE_FILTERS);
    
    if (storedFilters) {
      return JSON.parse(storedFilters) as FilterSet;
    }
  } catch (error) {
    console.error('Error loading filters from storage:', error);
  }
  
  return null;
}
```

## FilterPanel Component

The FilterPanel component provides a user interface for interacting with filters. It includes:

- Filter controls for different filter types
- Apply and clear buttons
- Integration with the FilterContext for global filter management
- Broadcasting filter events to other panels

```typescript
export const FilterPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [filters, setFilters] = useState<FilterSet>({
    property: {},
    geographic: {}
  });
  
  // Hooks
  const { broadcast } = usePanelSync();
  const { applyFilters, clearFilters } = useFilter();
  
  // Initialize with any existing filters
  useEffect(() => {
    if (initialState.filters) {
      setFilters(initialState.filters);
    }
  }, [initialState.filters]);
  
  // ... filter handling methods ...
  
  // Apply filters
  const handleApplyFilters = () => {
    // Apply filters to the global filter context
    applyFilters(filters);
    
    // Broadcast filter changes to other panels
    broadcast({
      type: 'filter',
      payload: { filters },
      source: panelId
    });
    
    // Notify parent component
    if (onStateChange) {
      onStateChange({ filters });
    }
    
    // Trigger action
    if (onAction) {
      onAction({
        type: 'filter',
        payload: { filters }
      });
    }
  };
  
  // Clear filters
  const handleClearFilters = () => {
    // Clear the filters
    setFilters({
      property: {},
      geographic: {}
    });
    
    // Clear global filters
    clearFilters();
    
    // Broadcast filter cleared to other panels
    broadcast({
      type: 'filterCleared',
      payload: {},
      source: panelId
    });
    
    // ... notify parent and trigger action ...
  };
  
  return (
    <div className="filter-panel">
      {/* Geographic filters section */}
      <div className="filter-section">
        <h3 className="filter-section-title">Geographic Filters</h3>
        
        {/* State filter */}
        <div className="filter-group">
          <label className="filter-label">State</label>
          <select
            className="filter-select"
            value={filters.geographic?.state || ''}
            onChange={(e) => handleGeographicFilterChange({ state: e.target.value })}
          >
            <option value="">All States</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="NY">New York</option>
            <option value="FL">Florida</option>
            <option value="MD">Maryland</option>
          </select>
        </div>
        
        {/* County filter */}
        <div className="filter-group">
          <label className="filter-label">County</label>
          <select
            className="filter-select"
            value={filters.geographic?.county || ''}
            onChange={(e) => handleGeographicFilterChange({ county: e.target.value })}
            disabled={!filters.geographic?.state}
          >
            <option value="">All Counties</option>
            
            {/* Dynamic county options based on state */}
          </select>
        </div>
      </div>
      
      {/* Property filters section */}
      <div className="filter-section">
        <h3 className="filter-section-title">Property Filters</h3>
        
        {/* Property type filter */}
        <div className="filter-group">
          <label className="filter-label">Property Type</label>
          <select
            className="filter-select"
            value={filters.property?.propertyType as string || ''}
            onChange={(e) => handlePropertyFilterChange({ propertyType: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Land">Land</option>
          </select>
        </div>
        
        {/* Additional filters... */}
      </div>
      
      {/* Filter actions */}
      <div className="filter-actions">
        <button className="apply-button" onClick={handleApplyFilters}>
          Apply Filters
        </button>
        <button className="clear-button" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};
```

## County Panel Filter Integration

The CountyPanel component demonstrates how data panels integrate with the filter system:

```typescript
export const CountyPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // Use panel state hook for persistence
  const [state, setState, resetState] = usePanelState(panelId, 'county', initialState);
  
  // Local state for UI
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePropertyType, setActivePropertyType] = useState<string | null>(null);
  
  // Get county data from state
  const county: CountyData | null = state.countyData || null;
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  
  // Subscribe to state selection events
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        if (event.type === 'select' && event.payload?.entityType === 'county') {
          // Load county data
          loadCountyData(event.payload.entityId, event.payload.properties?.state);
        } else if (event.type === 'filter' && event.payload?.filters?.property?.propertyType) {
          // Update active property type
          setActivePropertyType(event.payload.filters.property.propertyType);
        } else if (event.type === 'filterCleared') {
          // Clear active property type
          setActivePropertyType(null);
        } else if (event.type === 'reset') {
          // Reset panel state
          handleReset();
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Handle property type selection
  const handlePropertyTypeSelect = (propertyType: string) => {
    // Update active property type
    setActivePropertyType(propertyType === activePropertyType ? null : propertyType);
    
    // Broadcast selection to other panels
    broadcast({
      type: 'filter',
      payload: {
        filters: {
          property: {
            propertyType: propertyType === activePropertyType ? null : propertyType
          },
          geographic: {
            county: county?.name,
            state: county?.state
          }
        }
      },
      source: panelId
    });
    
    // ... notify parent and trigger action ...
  };
  
  // ... render functions ...
};
```

## Filter Propagation Between Panels

The filter system uses panel sync events to propagate filter changes between panels:

1. A user interacts with a filter control in the FilterPanel
2. The FilterPanel broadcasts a 'filter' event with the updated filters
3. Other panels subscribe to these events and update their display accordingly
4. When a filter is cleared, a 'filterCleared' event is broadcasted

### Filter Broadcast Example

```typescript
broadcast({
  type: 'filter',
  payload: { 
    filters: {
      property: {
        propertyType: 'Residential'
      },
      geographic: {
        state: 'CA',
        county: 'Los Angeles'
      }
    }
  },
  source: panelId
});
```

### Filter Event Subscription

```typescript
useEffect(() => {
  const unsubscribe = subscribe((event) => {
    if (event.source !== panelId) {
      if (event.type === 'filter') {
        // Handle filter event
        const filters = event.payload.filters;
        // Update component based on filters
      } else if (event.type === 'filterCleared') {
        // Handle filter cleared event
        // Reset component state
      }
    }
  });
  
  return unsubscribe;
}, []);
```

## Example Usage of Filters

Using filters in a component:

```typescript
// Using filters in a component
import { useFilter } from '../../../hooks/useFilter';

function PropertyList() {
  const { activeFilters } = useFilter();
  const [properties, setProperties] = useState([]);
  
  useEffect(() => {
    // Fetch properties based on active filters
    fetchProperties(activeFilters).then(data => {
      setProperties(data);
    });
  }, [activeFilters]);
  
  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

## Example of Panel State Persistence

Using panel state in a component:

```typescript
// Using panel state in a component
import { usePanelState } from '../../../hooks/usePanelState';

function MyPanel({ panelId }) {
  const [state, setState, resetState] = usePanelState(panelId, 'custom', {
    selectedItem: null,
    viewMode: 'list'
  });
  
  const handleItemSelect = (item) => {
    setState({
      ...state,
      selectedItem: item
    });
    // State is automatically persisted
  };
  
  const handleReset = () => {
    resetState();
    // State is reset to initial values and removed from storage
  };
  
  return (
    <div>
      <select 
        value={state.viewMode}
        onChange={(e) => setState({ ...state, viewMode: e.target.value })}
      >
        <option value="list">List View</option>
        <option value="grid">Grid View</option>
      </select>
      
      {/* Panel content */}
    </div>
  );
}
```

## FilterPanel UI

The FilterPanel provides an intuitive user interface for creating and applying filters:

![FilterPanel Screenshot](https://example.com/filter-panel.png)

## Completion Status

- [x] Filter types definition complete
- [x] FilterContext implementation complete
- [x] Filter service implementation complete
- [x] Panel state service implementation complete
- [x] usePanelState hook implementation complete
- [x] FilterPanel component implementation complete
- [x] CountyPanel filter integration complete
- [x] Tests passing
- [x] Documentation updated
- [ ] Pull request created

## Next Steps

The filter system provides a foundation for the next development chunks:

1. **Layout Persistence (Chunk 4)** - Building on the panel state persistence to save and restore entire layout configurations
2. **Controller Integration (Chunk 5)** - Adding more advanced filtering capabilities and integration with backend data controllers 
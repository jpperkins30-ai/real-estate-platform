# Filter System API Reference

This document provides comprehensive API documentation for the Filter System, including context providers, hooks, and service functions.

## Contents

1. [Context Providers](#context-providers)
2. [Hooks](#hooks)
3. [Services](#services)
4. [Types](#types)

## Context Providers

### FilterContextProvider

Provides global filter state management throughout the application.

```tsx
import { FilterContextProvider } from '../context/FilterContext';

// Usage
<FilterContextProvider>
  {children}
</FilterContextProvider>
```

**Props:**
- `children`: React nodes to be wrapped by the provider

**Context Value:**
- `activeFilters`: Current active filter set
- `savedFilters`: Array of saved filter configurations
- `applyFilters`: Function to replace current filters
- `clearFilters`: Function to clear all active filters
- `saveFilter`: Function to save current filters as a preset
- `deleteFilter`: Function to remove a saved filter preset
- `loadFilter`: Function to apply a saved filter preset
- `mergeFilters`: Function to combine filters with existing ones

## Hooks

### useFilter

Hook for accessing the filter context.

```tsx
import { useFilter } from '../hooks/useFilter';

// Usage
const { 
  activeFilters, 
  applyFilters, 
  clearFilters,
  mergeFilters
} = useFilter();
```

**Returns:**
- Same values as FilterContext (see above)

**Notes:**
- Must be used within a FilterContextProvider
- Throws an error if used outside the provider

### useFilteredData

Hook for filtering data using active filters.

```tsx
import { useFilteredData } from '../hooks/useFilter';

// Usage
const { filteredData, activeFilters } = useFilteredData(data, customFilters);
```

**Parameters:**
- `data`: Array of items to filter
- `customFilters` (optional): Filter set to use instead of context filters

**Returns:**
- `filteredData`: Filtered subset of data
- `activeFilters`: Filters that were applied (from context or custom)

### usePanelState

Hook for managing panel-specific state with persistence.

```tsx
import { usePanelState } from '../hooks/usePanelState';

// Usage
const { 
  state, 
  updateState,
  updatePosition,
  updateSize,
  toggleMaximized,
  resetState,
  metadata
} = usePanelState({
  panelId: 'filter-panel',
  initialState: {},
  contentType: 'filter',
  onStateChange: handleStateChange,
  persistState: true,
  persistenceKey: 'custom-key',
  sessionOnly: false
});
```

**Parameters:**
- `panelId`: Unique identifier for the panel
- `initialState`: Default state object
- `contentType` (optional): Panel content type (default: 'map')
- `onStateChange` (optional): Callback for state changes
- `persistState` (optional): Whether to save state (default: true)
- `persistenceKey` (optional): Custom storage key (default: panelId)
- `sessionOnly` (optional): Use sessionStorage only (default: false)

**Returns:**
- `state`: Current panel state
- `updateState`: Function to update state
- `updatePosition`: Function to update position
- `updateSize`: Function to update size
- `toggleMaximized`: Function to toggle maximized state
- `resetState`: Function to reset to initial state
- `metadata`: Object containing:
  - `isLoading`: Loading state indicator
  - `hasError`: Error state indicator
  - `version`: Current state version

## Services

### Filter Service

#### applyFiltersToData

Applies filters to a dataset.

```tsx
import { applyFiltersToData } from '../services/filterService';

// Usage
const filteredData = applyFiltersToData(data, filters);
```

**Parameters:**
- `data`: Array of items to filter
- `filters`: Filter set to apply

**Returns:**
- Filtered array of items

#### saveFiltersToStorage / loadFiltersFromStorage

Persist and retrieve filter state.

```tsx
import { 
  saveFiltersToStorage, 
  loadFiltersFromStorage 
} from '../services/filterService';

// Usage
saveFiltersToStorage(filters);
const savedFilters = loadFiltersFromStorage();
```

**Storage Key:** `activeFilters`

#### saveFilterPresetsToStorage / loadFilterPresetsFromStorage

Persist and retrieve saved filter presets.

```tsx
import { 
  saveFilterPresetsToStorage, 
  loadFilterPresetsFromStorage 
} from '../services/filterService';

// Usage
saveFilterPresetsToStorage(presets);
const savedPresets = loadFilterPresetsFromStorage();
```

**Storage Key:** `filterPresets`

#### validateFilterConfig

Validates a filter configuration.

```tsx
import { validateFilterConfig } from '../services/filterService';

// Usage
const isValid = validateFilterConfig(config);
```

**Parameters:**
- `config`: FilterConfig object to validate

**Returns:**
- Boolean indicating validity

#### getUniqueFieldValues

Extracts unique values for a specific field from a dataset.

```tsx
import { getUniqueFieldValues } from '../services/filterService';

// Usage
const uniqueStates = getUniqueFieldValues(properties, 'state');
```

**Parameters:**
- `data`: Array of objects
- `field`: Field name to extract values from

**Returns:**
- Array of unique values

#### createFilterConfig / updateFilterConfig

Create or update filter configurations.

```tsx
import { 
  createFilterConfig, 
  updateFilterConfig 
} from '../services/filterService';

// Usage
const newConfig = createFilterConfig('My Filter', filters);
const updatedConfig = updateFilterConfig(config, { name: 'Updated Name' });
```

### Panel State Service

#### savePanelState

Saves panel state to storage.

```tsx
import { savePanelState } from '../services/panelStateService';

// Usage
savePanelState(panelId, contentType, state, version, sessionOnly);
```

**Parameters:**
- `panelId`: Panel identifier
- `contentType`: Panel content type
- `state`: State object to save
- `version` (optional): State version
- `sessionOnly` (optional): Use sessionStorage only

**Storage Key:** `panelState_<panelId>`

#### loadPanelState

Loads panel state from storage.

```tsx
import { loadPanelState } from '../services/panelStateService';

// Usage
const state = loadPanelState(panelId, sessionOnly);
```

**Parameters:**
- `panelId`: Panel identifier
- `sessionOnly` (optional): Use sessionStorage only

**Returns:**
- Saved panel state or null

#### deletePanelState

Removes panel state from storage.

```tsx
import { deletePanelState } from '../services/panelStateService';

// Usage
deletePanelState(panelId, sessionOnly);
```

**Parameters:**
- `panelId`: Panel identifier
- `sessionOnly` (optional): Use sessionStorage only

## Types

### FilterSet

Represents a set of filters.

```typescript
interface FilterSet {
  property?: PropertyFilter;
  geographic?: GeographicFilter;
  version?: number;
  [key: string]: any;
}
```

### PropertyFilter

Property-specific filter criteria.

```typescript
interface PropertyFilter {
  propertyType?: string | string[];
  priceRange?: [number, number];
  bedrooms?: string | number;
  bathrooms?: string | number;
  squareFeet?: [number, number];
  zoning?: string;
  saleType?: string;
  [key: string]: any;
}
```

### GeographicFilter

Geographic filter criteria.

```typescript
interface GeographicFilter {
  state?: string;
  county?: string;
  city?: string;
  zipCode?: string;
  [key: string]: any;
}
```

### FilterConfig

Saved filter configuration.

```typescript
interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: FilterSet;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}
```

## Related Documentation

- [Filter System Architecture](../filter-system/architecture.md)
- [Panel State Management](../panel-system/state-management.md)
- [Using Filters in Components](../guides/using-filters.md) 
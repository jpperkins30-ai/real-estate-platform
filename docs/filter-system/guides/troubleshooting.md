# Filter System Troubleshooting Guide

This document provides solutions for common issues you might encounter when working with the filter system.

## Common Issues and Solutions

### Filters Not Applying

**Symptoms:**
- Changes to filters don't affect the displayed data
- No errors in console

**Possible Causes:**
1. Component not wrapped in `FilterContextProvider`
2. Incorrect usage of `useFilter` hook
3. Filter key mismatch

**Solutions:**

1. Check Provider Hierarchy
```tsx
// Make sure your component is wrapped with FilterContextProvider
import { FilterContextProvider } from '../context/FilterContext';

// Correct:
function App() {
  return (
    <FilterContextProvider>
      <YourComponent />
    </FilterContextProvider>
  );
}
```

2. Verify Hook Usage
```tsx
// Ensure you're using useFilter correctly
import { useFilter } from '../hooks/useFilter';

function YourComponent() {
  // Correct - destructure what you need
  const { activeFilters, applyFilters } = useFilter();
  
  // Incorrect - not destructuring
  const filterContext = useFilter();
  filterContext.applyFilters({}); // Works but not recommended
}
```

3. Check Filter Keys
```tsx
// Make sure filter keys match between where you apply and consume them
// Setting filter:
applyFilters({ priceRange: [100000, 300000] });

// Using filter - correct key
const filteredData = data.filter(item => {
  if (activeFilters.priceRange) {
    const [min, max] = activeFilters.priceRange;
    return item.price >= min && item.price <= max;
  }
  return true;
});

// Using filter - INCORRECT key (typo)
if (activeFilters.price_range) { // Won't work, key mismatch
  // ...
}
```

### Filter Changes Not Persisting

**Symptoms:**
- Filters reset when changing pages or refreshing
- Changes don't synchronize between panels

**Possible Causes:**
1. Storage-related issues
2. Version conflicts
3. Incorrect storage keys

**Solutions:**

1. Check Storage Configuration
```tsx
// In your filterService.ts
import { LocalStorageError } from '../utils/errorTypes';

// Make sure storage is properly configured with fallbacks
export const filterService = {
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Private browsing might block localStorage
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (innerErr) {
        console.error('Storage error:', innerErr);
        throw new LocalStorageError('Failed to store filter data');
      }
    }
  }
  // ...other methods
};
```

2. Check Browser Storage Access
- Open browser dev tools
- Go to Application tab
- Check Local Storage and Session Storage
- Verify the correct keys exist and have valid data

3. Verify Storage Keys
```tsx
// Make sure you're using consistent storage keys
const FILTER_STORAGE_KEYS = {
  ACTIVE_FILTERS: 'activeFilters',
  FILTER_PRESETS: 'filterPresets',
  PANEL_STATE: (panelId) => `panelState_${panelId}`
};

// Use these constants throughout your application
```

### Synchronization Issues Between Panels

**Symptoms:**
- Filters in one panel don't update other panels
- Changes in one panel overwrite changes in another panel

**Possible Causes:**
1. Missing or incorrect panel sync implementation
2. Version conflicts not resolving properly
3. Event broadcasting issues

**Solutions:**

1. Verify Panel Sync Setup
```tsx
// Make sure both panels subscribe to sync events
import { usePanelSync } from '../hooks/usePanelSync';
import { useEffect } from 'react';

function YourPanel({ panelId }) {
  const { subscribe, broadcast } = usePanelSync();
  const { applyFilters } = useFilter();
  
  // Make sure you're subscribing to events
  useEffect(() => {
    const unsubscribe = subscribe(event => {
      if (event.type === 'filter' && event.source !== panelId) {
        applyFilters(event.payload.filters);
      }
    });
    
    return () => unsubscribe();
  }, [subscribe, panelId, applyFilters]);
  
  // Make sure you're broadcasting events when changes happen
  const handleFilterChange = (newFilters) => {
    applyFilters(newFilters);
    broadcast({
      type: 'filter',
      source: panelId,
      payload: { filters: newFilters }
    });
  };
}
```

2. Check Version Conflicts
```tsx
// Debug version conflicts
console.log('Local filters version:', activeFilters.version);
console.log('Remote filters version:', remoteFilters.version);

// Make sure your conflict resolution logic is correct
const resolveConflicts = (local, remote) => {
  if (remote.version > local.version) {
    // Remote is newer, use it
    return remote;
  } else if (local.version > remote.version) {
    // Local is newer, use it
    return local;
  } else {
    // Same version, merge properties with priority to local changes
    return { ...remote, ...local, version: local.version + 1 };
  }
};
```

3. Enable Sync Debugging
```tsx
// Add this to your application
const DEBUG_SYNC = true;

// In your panel sync hook
const broadcast = (event) => {
  if (DEBUG_SYNC) {
    console.log(`[PanelSync] Broadcasting from ${event.source}:`, event);
  }
  // Broadcasting logic...
};

const subscribe = (callback) => {
  const wrappedCallback = (event) => {
    if (DEBUG_SYNC) {
      console.log(`[PanelSync] Received event:`, event);
    }
    callback(event);
  };
  // Subscription logic with wrappedCallback...
};
```

### Performance Issues

**Symptoms:**
- Slow response when applying filters
- UI freezes momentarily
- Excessive renders

**Possible Causes:**
1. Filtering large datasets directly in components
2. Missing memoization
3. Expensive filter operations

**Solutions:**

1. Memoize Filtered Results
```tsx
import { useMemo } from 'react';

function DataList() {
  const { activeFilters } = useFilter();
  const [data, setData] = useState([]);
  
  // Memoize filtered results to prevent recalculation
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Apply filters here
      return true; // Replace with actual logic
    });
  }, [data, activeFilters]); // Only recalculate when these dependencies change
}
```

2. Throttle or Debounce Filter Operations
```tsx
import { useCallback } from 'react';
import debounce from 'lodash/debounce';

function FilterPanel() {
  const { applyFilters } = useFilter();
  
  // Debounce filter application to avoid rapid changes
  const debouncedApplyFilters = useCallback(
    debounce((filters) => {
      applyFilters(filters);
    }, 300),
    [applyFilters]
  );
  
  // Use debouncedApplyFilters instead of applyFilters for frequently changing inputs
}
```

3. Implement Pagination or Virtualization
```tsx
// For large datasets, use pagination or virtualization
import { usePagination } from '../hooks/usePagination';

function PaginatedResults() {
  const { activeFilters } = useFilter();
  const { page, pageSize, setPage } = usePagination(1, 20);
  const [data, setData] = useState([]);
  
  // Apply filters to current page only
  const paginatedData = useMemo(() => {
    const filteredData = data.filter(item => {
      // Apply filters here
      return true; // Replace with actual logic
    });
    
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [data, activeFilters, page, pageSize]);
}
```

### Type Errors and Runtime Exceptions

**Symptoms:**
- TypeScript errors related to filter types
- Runtime errors when accessing filter properties
- "Cannot read property 'X' of undefined" errors

**Possible Causes:**
1. Missing type definitions
2. Optional properties not handled properly
3. Incorrect filter structure

**Solutions:**

1. Check Type Definitions
```tsx
// Make sure your filter types are properly defined
interface FilterSet {
  version?: number;
  [key: string]: any;
}

interface PropertyFilters extends FilterSet {
  priceRange?: [number, number];
  bedrooms?: number;
  propertyType?: string[];
}

// Use these types with useFilter
const { activeFilters } = useFilter<PropertyFilters>();
```

2. Use Optional Chaining and Default Values
```tsx
// Always handle possible undefined values
const minPrice = activeFilters.priceRange?.[0] ?? 0;
const maxPrice = activeFilters.priceRange?.[1] ?? Infinity;

const propertyTypes = activeFilters.propertyType || [];
```

3. Type Guards for Runtime Safety
```tsx
// Define type guards for complex filter structures
function isPriceRangeFilter(filter: any): filter is [number, number] {
  return Array.isArray(filter) && 
         filter.length === 2 && 
         typeof filter[0] === 'number' && 
         typeof filter[1] === 'number';
}

// Use type guards when applying filters
if (activeFilters.priceRange && isPriceRangeFilter(activeFilters.priceRange)) {
  const [min, max] = activeFilters.priceRange;
  // Safe to use min and max now
}
```

## Debugging Techniques

### Enable Debug Mode

Add this to your application for additional logging:

```tsx
// In your FilterContext.tsx
const DEBUG_FILTERS = process.env.NODE_ENV === 'development';

// Then use throughout the filter system
if (DEBUG_FILTERS) {
  console.log('[Filters] Applying filters:', newFilters);
  console.log('[Filters] Current state:', state);
}
```

### Inspect Storage Data

Use this utility function to inspect what's in storage:

```tsx
// Debug utility for storage inspection
export const debugStorage = {
  inspectAllFilterData() {
    try {
      const activeFilters = localStorage.getItem('activeFilters');
      const filterPresets = localStorage.getItem('filterPresets');
      const panelKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('panelState_')
      );
      const panelStates = panelKeys.map(key => ({
        key,
        value: JSON.parse(localStorage.getItem(key) || '{}')
      }));
      
      console.group('Filter Storage Debug');
      console.log('Active Filters:', activeFilters ? JSON.parse(activeFilters) : null);
      console.log('Filter Presets:', filterPresets ? JSON.parse(filterPresets) : null);
      console.log('Panel States:', panelStates);
      console.groupEnd();
      
      return {
        activeFilters: activeFilters ? JSON.parse(activeFilters) : null,
        filterPresets: filterPresets ? JSON.parse(filterPresets) : null,
        panelStates
      };
    } catch (err) {
      console.error('Error inspecting storage:', err);
      return null;
    }
  },
  
  clearAllFilterData() {
    try {
      localStorage.removeItem('activeFilters');
      localStorage.removeItem('filterPresets');
      
      const panelKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('panelState_')
      );
      panelKeys.forEach(key => localStorage.removeItem(key));
      
      console.log('All filter data cleared from storage');
      return true;
    } catch (err) {
      console.error('Error clearing storage:', err);
      return false;
    }
  }
};

// Usage in console for debugging:
// debugStorage.inspectAllFilterData()
// debugStorage.clearAllFilterData()
```

### Monitor Filter Context Changes

Add a debug effect to monitor changes:

```tsx
// In your component using filters
useEffect(() => {
  console.log('Filter state changed:', activeFilters);
}, [activeFilters]);
```

## Testing Fixes

After implementing a fix, verify it using these approaches:

1. **Manual Testing Checklist**
   - Create and apply filters in one panel
   - Verify changes appear in other panels
   - Refresh the page and check if filters persist
   - Clear filters and verify state resets correctly
   - Test conflict resolution by making competing changes

2. **Storage Testing**
   - Open DevTools Application tab
   - Check Local Storage entries
   - Verify data structure matches expected format
   - Test in private browsing to validate fallback mechanism

3. **Automated Test Example**
```tsx
// Jest/React Testing Library example

test('filters should apply correctly and persist', async () => {
  // Setup test
  const { getByTestId, getByText } = render(
    <FilterContextProvider>
      <TestComponent />
    </FilterContextProvider>
  );
  
  // Apply a filter
  fireEvent.change(getByTestId('price-min-input'), { target: { value: '100000' } });
  fireEvent.change(getByTestId('price-max-input'), { target: { value: '500000' } });
  fireEvent.click(getByTestId('apply-filters-button'));
  
  // Check if filter was applied
  expect(getByTestId('active-filters-display')).toHaveTextContent('100000');
  expect(getByTestId('active-filters-display')).toHaveTextContent('500000');
  
  // Check if storage was updated
  const storedFilters = JSON.parse(localStorage.getItem('activeFilters') || '{}');
  expect(storedFilters.data.priceRange[0]).toBe(100000);
  expect(storedFilters.data.priceRange[1]).toBe(500000);
});
```

## Still Having Issues?

If you're still experiencing problems after trying these solutions:

1. **Check Version Compatibility**
   - Ensure you're using the latest version of the filter system
   - Review the CHANGELOG for known issues

2. **Examine Browser Compatibility**
   - Test in another browser to isolate browser-specific issues
   - Check for differences in localStorage implementation

3. **Review Advanced Documentation**
   - See [Filter System Architecture](../architecture.md)
   - Review [Best Practices](../best-practices.md)

4. **Contact Support**
   - File an issue with detailed reproduction steps
   - Include browser, operating system, and device information 
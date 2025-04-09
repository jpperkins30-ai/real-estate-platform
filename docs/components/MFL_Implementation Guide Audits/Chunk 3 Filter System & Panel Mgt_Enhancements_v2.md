# 🧩 Chunk 3: Filter System & Panel State Management (Revised_v2)

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-3-filter-system.md

## 🎯 Objective

Implement a comprehensive filter system and panel state management to enable dynamic filtering across panels with proper state persistence. This includes county-level filtering and ensuring that filter changes are properly broadcasted and synchronized between related panels.

This chunk builds on the panel communication framework from Chunk 2 and creates the filtering capabilities necessary for effective data exploration across the platform.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

1. **Review Documentation**
   - Review the audit report in `Chunk 3 Filter System & Panel Mgt_Revised_audit.md`
   - Review the action plan in `Chunk 3 Filter System & Panel_ActionPlan.md`
   - Understand the current state of the Panel State Management implementation
   - Note the missing Filter System implementation that needs to be addressed

2. **Set Up Source Control**
   - Create your Git branch:
     ```bash
     git checkout develop
     git pull
     git checkout -b feature/filter-system-enhancement
     ```
   - Make sure to commit your changes regularly with descriptive commit messages

3. **Environment Setup**
   - Ensure required folders exist (create if missing):
     ```
     client/src/types/
     client/src/services/
     client/src/hooks/
     client/src/context/
     client/src/components/multiframe/filters/
     ```
   - Verify dependencies in package.json:
     ```bash
     cd client
     npm install
     ```

4. **Implementation Planning**
   - Identify the interdependencies between panel state management and filter system
   - Map the documented filter types to implementation requirements
   - Create a test strategy to address the test coverage gaps

### 🏗️ DURING IMPLEMENTATION

#### 1. Define Filter Types

📄 **client/src/types/filter.types.ts**

```typescript
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

export interface GeographicFilter {
  state?: string;
  county?: string;
  city?: string;
  zipCode?: string;
  [key: string]: any;
}

export interface FilterSet {
  property?: PropertyFilter;
  geographic?: GeographicFilter;
  [key: string]: any;
}

export interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: FilterSet;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: number; // Added for conflict resolution
}
```

#### 2. Create Filter Service

📄 **client/src/services/filterService.ts**

```typescript
import { FilterSet, PropertyFilter, GeographicFilter, FilterConfig } from '../types/filter.types';

// Storage keys
const STORAGE_KEY_ACTIVE_FILTERS = 'activeFilters';
const STORAGE_KEY_FILTER_PRESETS = 'filterPresets';
const STORAGE_VERSION = 'v1'; // For future migration support

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

/**
 * Check if an item matches property filters
 */
function isItemMatchingPropertyFilters<T extends Record<string, any>>(
  item: T, 
  propertyFilters: PropertyFilter
): boolean {
  // Property type filter
  if (propertyFilters.propertyType && 'propertyType' in item) {
    const itemType = item.propertyType;
    
    if (Array.isArray(propertyFilters.propertyType)) {
      if (!propertyFilters.propertyType.includes(itemType)) {
        return false;
      }
    } else if (propertyFilters.propertyType !== 'all' && propertyFilters.propertyType !== itemType) {
      return false;
    }
  }
  
  // Price range filter
  if (propertyFilters.priceRange && 'price' in item) {
    const [min, max] = propertyFilters.priceRange;
    const itemPrice = Number(item.price);
    
    if (isNaN(itemPrice) || itemPrice < min || itemPrice > max) {
      return false;
    }
  }
  
  // Additional property filters implementation...
  
  return true; // Pass if all filters match
}

/**
 * Check if an item matches geographic filters
 */
function isItemMatchingGeographicFilters<T extends Record<string, any>>(
  item: T, 
  geoFilters: GeographicFilter
): boolean {
  // State filter
  if (geoFilters.state && 'state' in item) {
    const itemState = item.state;
    
    if (geoFilters.state !== itemState) {
      return false;
    }
  }
  
  // County filter
  if (geoFilters.county && 'county' in item) {
    const itemCounty = item.county;
    
    if (geoFilters.county !== itemCounty) {
      return false;
    }
  }
  
  // Additional geographic filters implementation...
  
  return true; // Pass if all filters match
}

/**
 * Save filters to local storage with error handling and versioning
 */
export function saveFiltersToStorage(filters: FilterSet): void {
  try {
    const versionedFilters = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      data: filters
    };
    
    localStorage.setItem(STORAGE_KEY_ACTIVE_FILTERS, JSON.stringify(versionedFilters));
  } catch (error) {
    console.error('Error saving filters to storage:', error);
    
    // Fallback to sessionStorage if localStorage fails
    try {
      const versionedFilters = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: filters
      };
      
      sessionStorage.setItem(STORAGE_KEY_ACTIVE_FILTERS, JSON.stringify(versionedFilters));
    } catch (fallbackError) {
      console.error('Error saving filters to fallback storage:', fallbackError);
    }
  }
}

/**
 * Load filters from storage with error handling and version checking
 */
export function loadFiltersFromStorage(): FilterSet | null {
  try {
    // Try localStorage first
    let storedFilters = localStorage.getItem(STORAGE_KEY_ACTIVE_FILTERS);
    
    // If not in localStorage, try sessionStorage as fallback
    if (!storedFilters) {
      storedFilters = sessionStorage.getItem(STORAGE_KEY_ACTIVE_FILTERS);
    }
    
    if (storedFilters) {
      const parsedData = JSON.parse(storedFilters);
      
      // Check if data is in versioned format
      if (parsedData && parsedData.version && parsedData.data) {
        // Return the data portion of versioned format
        return parsedData.data as FilterSet;
      } else {
        // Handle legacy data format (direct FilterSet)
        return parsedData as FilterSet;
      }
    }
  } catch (error) {
    console.error('Error loading filters from storage:', error);
  }
  
  return null;
}

/**
 * Save filter presets to local storage with error handling
 */
export function saveFilterPresetsToStorage(presets: FilterConfig[]): void {
  try {
    const versionedPresets = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      data: presets
    };
    
    localStorage.setItem(STORAGE_KEY_FILTER_PRESETS, JSON.stringify(versionedPresets));
  } catch (error) {
    console.error('Error saving filter presets to storage:', error);
    
    // Fallback to sessionStorage
    try {
      const versionedPresets = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: presets
      };
      
      sessionStorage.setItem(STORAGE_KEY_FILTER_PRESETS, JSON.stringify(versionedPresets));
    } catch (fallbackError) {
      console.error('Error saving filter presets to fallback storage:', fallbackError);
    }
  }
}

/**
 * Load filter presets from storage with error handling
 */
export function loadFilterPresetsFromStorage(): FilterConfig[] {
  try {
    // Try localStorage first
    let storedPresets = localStorage.getItem(STORAGE_KEY_FILTER_PRESETS);
    
    // If not in localStorage, try sessionStorage as fallback
    if (!storedPresets) {
      storedPresets = sessionStorage.getItem(STORAGE_KEY_FILTER_PRESETS);
    }
    
    if (storedPresets) {
      const parsedData = JSON.parse(storedPresets);
      
      // Check if data is in versioned format
      if (parsedData && parsedData.version && parsedData.data) {
        // Return the data portion of versioned format
        return parsedData.data as FilterConfig[];
      } else {
        // Handle legacy data format (direct array)
        return parsedData as FilterConfig[];
      }
    }
  } catch (error) {
    console.error('Error loading filter presets from storage:', error);
  }
  
  return [];
}

/**
 * Validate filter configuration to prevent corrupted filters
 */
export function validateFilterConfig(config: FilterConfig): boolean {
  // Basic validation
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!config.id || !config.name || !config.filters) {
    return false;
  }
  
  // Check that filters field is an object
  if (typeof config.filters !== 'object') {
    return false;
  }
  
  return true;
}

// Additional helper functions...
```

#### 3. Create Filter Context

📄 **client/src/context/FilterContext.tsx**

```typescript
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { FilterSet, FilterConfig } from '../types/filter.types';
import { 
  loadFiltersFromStorage, 
  saveFiltersToStorage, 
  loadFilterPresetsFromStorage, 
  saveFilterPresetsToStorage,
  validateFilterConfig
} from '../services/filterService';

interface FilterContextType {
  activeFilters: FilterSet;
  savedFilters: FilterConfig[];
  applyFilters: (filters: FilterSet) => void;
  clearFilters: () => void;
  saveFilter: (config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteFilter: (id: string) => void;
  loadFilter: (id: string) => void;
  mergeFilters: (filters: FilterSet) => void;
}

// Create a default context value to avoid null checks
const defaultContextValue: FilterContextType = {
  activeFilters: {},
  savedFilters: [],
  applyFilters: () => {},
  clearFilters: () => {},
  saveFilter: () => {},
  deleteFilter: () => {},
  loadFilter: () => {},
  mergeFilters: () => {}
};

export const FilterContext = createContext<FilterContextType>(defaultContextValue);

export const FilterContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State with persistence
  const [activeFilters, setActiveFilters] = useState<FilterSet>(() => {
    const storedFilters = loadFiltersFromStorage();
    return storedFilters || {};
  });
  
  const [savedFilters, setSavedFilters] = useState<FilterConfig[]>(() => {
    const storedPresets = loadFilterPresetsFromStorage();
    return storedPresets || [];
  });
  
  // Persist filter changes
  useEffect(() => {
    saveFiltersToStorage(activeFilters);
  }, [activeFilters]);
  
  // Persist saved filters
  useEffect(() => {
    saveFilterPresetsToStorage(savedFilters);
  }, [savedFilters]);
  
  // Apply filters (replace current filters)
  const applyFilters = useCallback((filters: FilterSet) => {
    setActiveFilters(filters);
  }, []);
  
  // Merge filters (combine with current filters)
  const mergeFilters = useCallback((filters: FilterSet) => {
    setActiveFilters(prev => {
      // Deep merge the filters
      const newFilters = { ...prev };
      
      // Merge property filters
      if (filters.property) {
        newFilters.property = {
          ...newFilters.property,
          ...filters.property
        };
      }
      
      // Merge geographic filters
      if (filters.geographic) {
        newFilters.geographic = {
          ...newFilters.geographic,
          ...filters.geographic
        };
      }
      
      // Merge any other filter types
      Object.keys(filters).forEach(key => {
        if (key !== 'property' && key !== 'geographic') {
          newFilters[key] = {
            ...newFilters[key],
            ...filters[key]
          };
        }
      });
      
      return newFilters;
    });
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);
  
  // Save filter configuration
  const saveFilter = useCallback((config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFilter: FilterConfig = {
      ...config,
      id: `filter-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1 // Initial version
    };
    
    setSavedFilters(prev => [...prev, newFilter]);
  }, []);
  
  // Delete saved filter
  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);
  
  // Load saved filter
  const loadFilter = useCallback((id: string) => {
    const filter = savedFilters.find(filter => filter.id === id);
    
    if (filter && validateFilterConfig(filter)) {
      setActiveFilters(filter.filters);
    } else {
      console.error(`Filter with id ${id} not found or invalid`);
    }
  }, [savedFilters]);
  
  // Context value
  const contextValue = {
    activeFilters,
    savedFilters,
    applyFilters,
    clearFilters,
    saveFilter,
    deleteFilter,
    loadFilter,
    mergeFilters
  };
  
  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
```

#### 4. Implement Panel State Service

📄 **client/src/services/panelStateService.ts**

```typescript
import { PanelContentType } from '../types/layout.types';

export interface PanelState {
  id: string;
  contentType: PanelContentType;
  state: any;
  lastUpdated: string;
  version?: number;
}

// IMPORTANT: Use consistent key format for storage
// Format: panelState_<panelId>
function getStorageKey(panelId: string): string {
  return `panelState_${panelId}`;
}

/**
 * Save panel state with versioning
 */
export function savePanelState(
  panelId: string, 
  contentType: PanelContentType, 
  state: any, 
  version: number = 1,
  sessionOnly: boolean = false
): PanelState {
  try {
    const storage = sessionOnly ? sessionStorage : localStorage;
    const key = getStorageKey(panelId);
    
    // Check for existing state to handle versioning
    const existingState = loadPanelState(panelId, sessionOnly);
    
    // If the existing state has a higher version, we might have a conflict
    if (existingState && existingState.version && existingState.version > version) {
      console.warn(`Panel state version conflict for ${panelId}. Existing version: ${existingState.version}, New version: ${version}`);
      version = existingState.version + 1;
    }
    
    const panelState: PanelState = {
      id: panelId,
      contentType,
      state,
      lastUpdated: new Date().toISOString(),
      version
    };
    
    // Save to storage
    storage.setItem(key, JSON.stringify(panelState));
    
    return panelState;
  } catch (error) {
    console.error('Error saving panel state:', error);
    
    // Try fallback to the other storage if primary fails
    if (!sessionOnly) {
      try {
        return savePanelState(panelId, contentType, state, version, true);
      } catch (fallbackError) {
        console.error('Error using fallback storage for panel state:', fallbackError);
      }
    }
    
    throw error;
  }
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string, sessionOnly: boolean = false): PanelState | null {
  try {
    const storage = sessionOnly ? sessionStorage : localStorage;
    const key = getStorageKey(panelId);
    const stateStr = storage.getItem(key);
    
    if (stateStr) {
      return JSON.parse(stateStr) as PanelState;
    }
    
    // If not found in primary storage and not already trying session only, check the other storage
    if (!sessionOnly) {
      return loadPanelState(panelId, true);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading panel state:', error);
    
    // If not already trying session only, try the other storage
    if (!sessionOnly) {
      try {
        return loadPanelState(panelId, true);
      } catch (fallbackError) {
        console.error('Error using fallback storage for loading panel state:', fallbackError);
      }
    }
    
    return null;
  }
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string, sessionOnly: boolean = false): void {
  try {
    const storage = sessionOnly ? sessionStorage : localStorage;
    const key = getStorageKey(panelId);
    storage.removeItem(key);
    
    // If not session only, also check session storage
    if (!sessionOnly) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error deleting panel state:', error);
  }
}
```

#### 5. Create Enhanced Panel State Hook

📄 **client/src/hooks/usePanelState.ts**

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { savePanelState, loadPanelState, deletePanelState } from '../services/panelStateService';
import { PanelContentType } from '../types/layout.types';

interface PanelStateOptions {
  panelId: string;
  initialState: any;
  contentType?: PanelContentType;
  persistState?: boolean;
  onStateChange?: (state: any) => void;
}

/**
 * Enhanced usePanelState hook with proper storage key format
 */
export function usePanelState({ 
  panelId, 
  initialState,
  contentType = 'default' as PanelContentType,
  persistState = true,
  onStateChange
}: PanelStateOptions) {
  const [state, setState] = useState(() => {
    // Load saved state or use initial state
    if (persistState) {
      try {
        const savedState = loadPanelState(panelId);
        
        if (savedState && savedState.contentType === contentType) {
          // Merge saved state with initial state to ensure all required properties exist
          return { ...initialState, ...savedState.state };
        }
      } catch (error) {
        console.error(`Error loading panel state for ${panelId}:`, error);
      }
    }
    
    return initialState;
  });
  
  const [version, setVersion] = useState(1);
  
  // Save state to storage when it changes
  useEffect(() => {
    if (persistState) {
      try {
        savePanelState(panelId, contentType, state, version);
      } catch (error) {
        console.error(`Error saving panel state for ${panelId}:`, error);
      }
    }
  }, [state, panelId, contentType, persistState, version]);
  
  // Update state function
  const updateState = useCallback((newState: any) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      
      // Call onStateChange callback if provided
      if (onStateChange) {
        onStateChange(updatedState);
      }
      
      // Increment version
      setVersion(prev => prev + 1);
      
      return updatedState;
    });
  }, [onStateChange]);
  
  // Update position
  const updatePosition = useCallback((position: { x: number; y: number }) => {
    updateState({ position });
  }, [updateState]);
  
  // Update size
  const updateSize = useCallback((size: { width: number; height: number }) => {
    updateState({ size });
  }, [updateState]);
  
  // Toggle maximized state
  const toggleMaximized = useCallback(() => {
    updateState(prev => ({ isMaximized: !prev.isMaximized }));
  }, [updateState]);
  
  // Reset state
  const resetState = useCallback(() => {
    setState(initialState);
    setVersion(1);
    
    if (persistState) {
      try {
        deletePanelState(panelId);
      } catch (error) {
        console.error(`Error deleting panel state for ${panelId}:`, error);
      }
    }
    
    // Call onStateChange callback if provided
    if (onStateChange) {
      onStateChange(initialState);
    }
  }, [panelId, initialState, persistState, onStateChange]);
  
  return {
    state,
    updateState,
    updatePosition,
    updateSize,
    toggleMaximized,
    resetState,
    version
  };
}
```

#### 6. Create Filter Hook

📄 **client/src/hooks/useFilter.ts**

```typescript
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';
import { FilterSet } from '../types/filter.types';
import { applyFiltersToData } from '../services/filterService';

export function useFilter() {
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context;
}

/**
 * Custom hook for applying filters to a dataset
 */
export function useFilteredData<T extends Record<string, any>>(
  data: T[],
  customFilters?: FilterSet
) {
  const { activeFilters } = useFilter();
  
  // If custom filters are provided, use those instead of context filters
  const filtersToApply = customFilters || activeFilters;
  
  // Apply filters to the data
  const filteredData = applyFiltersToData(data, filtersToApply);
  
  return {
    filteredData,
    activeFilters: filtersToApply
  };
}
```

#### 7. Implement Filter Panel Component

📄 **client/src/components/multiframe/filters/FilterPanel.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { useFilter } from '../../../hooks/useFilter';
import { PanelContentProps } from '../../../types/panel.types';
import { FilterSet, PropertyFilter, GeographicFilter } from '../../../types/filter.types';
import './FilterPanel.css';

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
  const [isSyncEnabled, setSyncEnabled] = useState<boolean>(true);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  const { applyFilters, clearFilters, activeFilters } = useFilter();
  
  // Initialize with any existing filters
  useEffect(() => {
    if (initialState.filters) {
      setFilters(initialState.filters);
    } else if (Object.keys(activeFilters).length > 0) {
      // If no initial state but active filters exist in context, use those
      setFilters(activeFilters);
    }
  }, [initialState.filters, activeFilters]);
  
  // Subscribe to filter events from other panels
  useEffect(() => {
    if (!isSyncEnabled) return;
    
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        if (event.type === 'filter' && event.payload?.filters) {
          // Update local state with received filters
          setFilters(event.payload.filters);
        } else if (event.type === 'filterCleared') {
          // Clear local filters
          setFilters({
            property: {},
            geographic: {}
          });
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [panelId, subscribe, isSyncEnabled]);
  
  // Handle filter changes
  const handlePropertyFilterChange = (changes: Partial<PropertyFilter>) => {
    setFilters(prev => ({
      ...prev,
      property: {
        ...prev.property,
        ...changes
      }
    }));
  };
  
  const handleGeographicFilterChange = (changes: Partial<GeographicFilter>) => {
    setFilters(prev => ({
      ...prev,
      geographic: {
        ...prev.geographic,
        ...changes
      }
    }));
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    // Apply filters to the global filter context
    applyFilters(filters);
    
    // Broadcast filter changes to other panels if sync is enabled
    if (isSyncEnabled) {
      broadcast({
        type: 'filter',
        payload: { filters },
        source: panelId
      });
    }
    
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
    
    // Broadcast filter cleared to other panels if sync is enabled
    if (isSyncEnabled) {
      broadcast({
        type: 'filterCleared',
        payload: {},
        source: panelId
      });
    }
    
    // Notify parent component
    if (onStateChange) {
      onStateChange({ filters: {} });
    }
    
    // Trigger action
    if (onAction) {
      onAction({
        type: 'filterCleared',
        payload: {}
      });
    }
  };
  
  // Toggle sync
  const handleToggleSync = () => {
    setSyncEnabled(prev => !prev);
  };
  
  // Component UI implementation...
  return (
    <div className="filter-panel">
      {/* Filter UI implementation */}
      <div className="filter-actions">
        <button
          className="apply-button"
          onClick={handleApplyFilters}
          data-testid="apply-filters-button"
        >
          Apply Filters
        </button>
        <button
          className="clear-button"
          onClick={handleClearFilters}
          data-testid="clear-filters-button"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
```

#### 8. Update MultiFrameContainer to Include FilterContextProvider

📄 **client/src/components/multiframe/MultiFrameContainer.tsx**

```typescript
import React from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { FilterContextProvider } from '../../context/FilterContext';
import { PanelConfig, LayoutType } from '../../types/layout.types';
import './MultiFrameContainer.css';

interface MultiFrameContainerProps {
  initialLayout?: LayoutType;
  panels?: PanelConfig[];
  defaultPanelContent?: Record<string, any>;
  onLayoutChange?: (layout: LayoutType) => void;
  className?: string;
}

export const MultiFrameContainer: React.FC<MultiFrameContainerProps> = ({
  initialLayout = 'single',
  panels = [],
  defaultPanelContent = {},
  onLayoutChange,
  className = '',
}) => {
  // Implementation details...
  
  return (
    <div className={`multi-frame-container ${className}`} data-testid="multi-frame-container">
      <FilterContextProvider>
        <LayoutContextProvider>
          <PanelSyncProvider>
            <div className="layout-controls">
              <LayoutSelector
                currentLayout={layoutType}
                onLayoutChange={handleLayoutChange}
              />
            </div>
            <div className="layout-container" data-testid={`${layoutType}-layout`}>
              {renderLayout()}
            </div>
          </PanelSyncProvider>
        </LayoutContextProvider>
      </FilterContextProvider>
    </div>
  );
};
```

### ✅ AFTER IMPLEMENTATION

#### 1. Testing Strategy

Testing is a critical component of ensuring the Filter System and Panel State Management function correctly. Based on recent implementation feedback, special attention must be paid to proper test structure, mocking, and storage key consistency.

##### 1.1 Test Directory Structure

Ensure all test files are placed in the correct locations following this structure:

```
client/src/_tests_/
├── TC1701_context_FilterContext.test.tsx
├── TC2301_services_filterService.test.ts     # To be created
├── TC2401_services_panelStateService.test.ts # To be created
├── TC1401_hooks_usePanelState.test.tsx
├── TC1301_hooks_useFilter.test.tsx          # To be created
├── TC1001_components_multiframe_filters_FilterPanel.test.tsx # To be created
└── TC2603_integration_FilterSystemIntegration.test.tsx # To be created
```

##### 1.2 Storage Key Standardization

Ensure consistent naming conventions for storage keys across the implementation:

- For panel state: `panelState_<panelId>`
- For active filters: `activeFilters`
- For filter presets: `filterPresets`

All tests should use these exact key formats to avoid inconsistencies.

#### 2. Test Creation and Implementation

Below are the detailed instructions for creating the missing test files and fixing the existing ones.

##### 2.1 FilterService Tests

📄 **client/src/_tests_/TC2301_services_filterService.test.ts**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  applyFiltersToData, 
  saveFiltersToStorage, 
  loadFiltersFromStorage,
  saveFilterPresetsToStorage,
  loadFilterPresetsFromStorage,
  validateFilterConfig,
  getUniqueFieldValues
} from '../../services/filterService';
import { FilterConfig } from '../../types/filter.types';

// Mock data
const testData = [
  { id: 1, propertyType: 'Residential', price: 300000, state: 'CA', county: 'Los Angeles' },
  { id: 2, propertyType: 'Commercial', price: 750000, state: 'NY', county: 'Kings' },
  { id: 3, propertyType: 'Residential', price: 450000, state: 'TX', county: 'Harris' },
  { id: 4, propertyType: 'Industrial', price: 1200000, state: 'CA', county: 'Orange' }
];

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

describe('filterService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    // Replace global storage with mocks
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
  });
  
  describe('applyFiltersToData', () => {
    it('returns all data when no filters provided', () => {
      const result = applyFiltersToData(testData, {});
      expect(result).toEqual(testData);
      expect(result).toHaveLength(4);
    });
    
    it('filters by property type', () => {
      const filters = {
        property: { propertyType: 'Residential' }
      };
      
      const result = applyFiltersToData(testData, filters);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });
    
    it('filters by price range', () => {
      const filters = {
        property: { priceRange: [400000, 1000000] }
      };
      
      const result = applyFiltersToData(testData, filters);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(3);
    });
    
    it('filters by geographic location', () => {
      const filters = {
        geographic: { state: 'CA' }
      };
      
      const result = applyFiltersToData(testData, filters);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(4);
    });
    
    it('combines multiple filters', () => {
      const filters = {
        property: { propertyType: 'Residential' },
        geographic: { state: 'CA' }
      };
      
      const result = applyFiltersToData(testData, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
    
    it('handles errors gracefully', () => {
      // Create a scenario that would cause an error
      const data = testData as any;
      data.filter = undefined; // Break the filter method
      
      const filters = {
        property: { propertyType: 'Residential' }
      };
      
      // Should not throw an error
      expect(() => {
        applyFiltersToData(data, filters);
      }).not.toThrow();
    });
  });
  
  describe('Storage Functions', () => {
    it('saves filters to localStorage with versioning', () => {
      const filters = {
        property: { propertyType: 'Residential' },
        geographic: { state: 'CA' }
      };
      
      saveFiltersToStorage(filters);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // Get the saved value and parse it
      const savedValue = JSON.parse(
        vi.mocked(mockLocalStorage.setItem).mock.calls[0][1]
      );
      
      // Check structure
      expect(savedValue).toHaveProperty('version');
      expect(savedValue).toHaveProperty('updatedAt');
      expect(savedValue).toHaveProperty('data');
      expect(savedValue.data).toEqual(filters);
    });
    
    it('loads filters from localStorage with version check', () => {
      const filters = {
        property: { propertyType: 'Commercial' },
        geographic: { state: 'NY' }
      };
      
      // Setup versioned format
      const versionedFilters = {
        version: 'v1',
        updatedAt: new Date().toISOString(),
        data: filters
      };
      
      // Setup mock to return versioned filters
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(JSON.stringify(versionedFilters));
      
      const result = loadFiltersFromStorage();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
      expect(result).toEqual(filters);
    });
    
    it('loads legacy filter format if found', () => {
      const filters = {
        property: { propertyType: 'Commercial' },
        geographic: { state: 'NY' }
      };
      
      // Setup legacy format (direct object)
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(JSON.stringify(filters));
      
      const result = loadFiltersFromStorage();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
      expect(result).toEqual(filters);
    });
    
    it('falls back to sessionStorage if localStorage fails', () => {
      const filters = {
        property: { propertyType: 'Commercial' },
        geographic: { state: 'NY' }
      };
      
      // Setup localStorage to fail
      vi.mocked(mockLocalStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Setup sessionStorage to succeed
      const versionedFilters = {
        version: 'v1',
        updatedAt: new Date().toISOString(),
        data: filters
      };
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(JSON.stringify(versionedFilters));
      
      const result = loadFiltersFromStorage();
      
      expect(mockSessionStorage.getItem).toHaveBeenCalled();
      expect(result).toEqual(filters);
    });
    
    it('returns null when no filters in storage', () => {
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(null);
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(null);
      
      const result = loadFiltersFromStorage();
      
      expect(result).toBeNull();
    });
    
    it('handles JSON parse errors', () => {
      vi.mocked(mockLocalStorage.getItem).mockReturnValue('invalid json');
      
      const result = loadFiltersFromStorage();
      
      expect(result).toBeNull();
    });
  });
  
  describe('validateFilterConfig', () => {
    it('validates a valid filter config', () => {
      const validConfig: FilterConfig = {
        id: 'test-id',
        name: 'Test Filter',
        filters: { property: { propertyType: 'Residential' } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };
      
      expect(validateFilterConfig(validConfig)).toBe(true);
    });
    
    it('rejects config with missing required fields', () => {
      const invalidConfig = {
        name: 'Test Filter',
        filters: { property: { propertyType: 'Residential' } }
      } as FilterConfig;
      
      expect(validateFilterConfig(invalidConfig)).toBe(false);
    });
    
    it('rejects config with non-object filters', () => {
      const invalidConfig = {
        id: 'test-id',
        name: 'Test Filter',
        filters: 'not an object' as any
      } as FilterConfig;
      
      expect(validateFilterConfig(invalidConfig)).toBe(false);
    });
  });
  
  describe('getUniqueFieldValues', () => {
    it('returns unique values for a field', () => {
      const result = getUniqueFieldValues(testData, 'propertyType');
      
      // Should have unique values in any order
      expect(result).toHaveLength(3);
      expect(result).toContain('Residential');
      expect(result).toContain('Commercial');
      expect(result).toContain('Industrial');
    });
    
    it('returns empty array for non-existent field', () => {
      const result = getUniqueFieldValues(testData, 'nonExistentField' as any);
      
      expect(result).toEqual([]);
    });
    
    it('handles empty dataset', () => {
      const result = getUniqueFieldValues([], 'propertyType');
      
      expect(result).toEqual([]);
    });
  });
});
```

##### 2.2 PanelStateService Tests

📄 **client/src/_tests_/TC2401_services_panelStateService.test.ts**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  savePanelState, 
  loadPanelState, 
  deletePanelState 
} from '../../services/panelStateService';
import { PanelContentType } from '../../types/layout.types';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

describe('panelStateService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    // Replace global storage with mocks
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
  });
  
  describe('savePanelState', () => {
    it('saves panel state to localStorage', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const result = savePanelState(panelId, contentType, state);
      
      // Check storage key format
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `panelState_${panelId}`,
        expect.any(String)
      );
      
      // Check result
      expect(result).toHaveProperty('id', panelId);
      expect(result).toHaveProperty('contentType', contentType);
      expect(result).toHaveProperty('state', state);
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('version', 1);
    });
    
    it('saves panel state to sessionStorage when requested', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const result = savePanelState(panelId, contentType, state, 1, true);
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        `panelState_${panelId}`,
        expect.any(String)
      );
      
      expect(result).toHaveProperty('id', panelId);
    });
    
    it('handles version conflicts by incrementing version', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      // Mock an existing state with higher version
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(JSON.stringify({
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 5
      }));
      
      const result = savePanelState(panelId, contentType, state, 1);
      
      // Version should be incremented to 6
      expect(result).toHaveProperty('version', 6);
    });
    
    it('falls back to sessionStorage if localStorage fails', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      // Make localStorage.setItem throw an error
      vi.mocked(mockLocalStorage.setItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      savePanelState(panelId, contentType, state);
      
      // Should fall back to sessionStorage
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });
  });
  
  describe('loadPanelState', () => {
    it('loads panel state from localStorage', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const savedState = {
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 1
      };
      
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(JSON.stringify(savedState));
      
      const result = loadPanelState(panelId);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(`panelState_${panelId}`);
      expect(result).toEqual(savedState);
    });
    
    it('loads panel state from sessionStorage if specified', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const savedState = {
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 1
      };
      
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(JSON.stringify(savedState));
      
      const result = loadPanelState(panelId, true);
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(`panelState_${panelId}`);
      expect(result).toEqual(savedState);
    });
    
    it('returns null when state is not found', () => {
      const panelId = 'test-panel';
      
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(null);
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(null);
      
      const result = loadPanelState(panelId);
      
      expect(result).toBeNull();
    });
    
    it('handles JSON parse errors', () => {
      const panelId = 'test-panel';
      
      vi.mocked(mockLocalStorage.getItem).mockReturnValue('invalid json');
      
      const result = loadPanelState(panelId);
      
      expect(result).toBeNull();
    });
    
    it('checks sessionStorage if localStorage fails', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      // Make localStorage.getItem throw an error
      vi.mocked(mockLocalStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const savedState = {
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 1
      };
      
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(JSON.stringify(savedState));
      
      const result = loadPanelState(panelId);
      
      // Should check sessionStorage
      expect(mockSessionStorage.getItem).toHaveBeenCalled();
      expect(result).toEqual(savedState);
    });
  });
  
  describe('deletePanelState', () => {
    it('deletes panel state from localStorage', () => {
      const panelId = 'test-panel';
      
      deletePanelState(panelId);
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`panelState_${panelId}`);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(`panelState_${panelId}`);
    });
    
    it('deletes panel state from sessionStorage only when specified', () => {
      const panelId = 'test-panel';
      
      deletePanelState(panelId, true);
      
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(`panelState_${panelId}`);
    });
    
    it('handles errors during deletion', () => {
      const panelId = 'test-panel';
      
      // Make localStorage.removeItem throw an error
      vi.mocked(mockLocalStorage.removeItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw
      expect(() => {
        deletePanelState(panelId);
      }).not.toThrow();
      
      // Should still try to remove from sessionStorage
      expect(mockSessionStorage.removeItem).toHaveBeenCalled();
    });
  });
});
```

##### 2.3 useFilter Tests

📄 **client/src/_tests_/TC1301_hooks_useFilter.test.tsx**

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFilter, useFilteredData } from '../../hooks/useFilter';
import { FilterContext, FilterContextProvider } from '../../context/FilterContext';
import React from 'react';
import { applyFiltersToData } from '../../services/filterService';

// Mock the filterService
vi.mock('../../services/filterService', () => ({
  applyFiltersToData: vi.fn((data, filters) => {
    // Simple mock implementation for testing
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }
    
    if (filters.property?.propertyType === 'Residential') {
      return data.filter(item => item.propertyType === 'Residential');
    }
    
    return data;
  }),
  loadFiltersFromStorage: vi.fn(() => null),
  saveFiltersToStorage: vi.fn(),
  loadFilterPresetsFromStorage: vi.fn(() => []),
  saveFilterPresetsToStorage: vi.fn(),
  validateFilterConfig: vi.fn(() => true)
}));

// Mock data
const testData = [
  { id: 1, propertyType: 'Residential', price: 300000 },
  { id: 2, propertyType: 'Commercial', price: 750000 },
  { id: 3, propertyType: 'Residential', price: 450000 }
];

describe('useFilter and useFilteredData hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('useFilter', () => {
    it('throws an error when used outside FilterContextProvider', () => {
      // Mock console.error to avoid cluttering test output
      const originalError = console.error;
      console.error = vi.fn();
      
      expect(() => {
        renderHook(() => useFilter());
      }).toThrow('useFilter must be used within a FilterContextProvider');
      
      // Restore console.error
      console.error = originalError;
    });
    
    it('returns the filter context values', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FilterContextProvider>{children}</FilterContextProvider>
      );
      
      const { result } = renderHook(() => useFilter(), { wrapper });
      
      expect(result.current).toHaveProperty('activeFilters');
      expect(result.current).toHaveProperty('savedFilters');
      expect(result.current).toHaveProperty('applyFilters');
      expect(result.current).toHaveProperty('clearFilters');
      expect(result.current).toHaveProperty('saveFilter');
      expect(result.current).toHaveProperty('deleteFilter');
      expect(result.current).toHaveProperty('loadFilter');
      expect(result.current).toHaveProperty('mergeFilters');
    });
    
    it('updates and accesses activeFilters', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FilterContextProvider>{children}</FilterContextProvider>
      );
      
      const { result } = renderHook(() => useFilter(), { wrapper });
      
      act(() => {
        result.current.applyFilters({
          property: { propertyType: 'Residential' }
        });
      });
      
      expect(result.current.activeFilters).toEqual({
        property: { propertyType: 'Residential' }
      });
    });
  });
  
  describe('useFilteredData', () => {
    it('filters data using activeFilters from context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FilterContextProvider>{children}</FilterContextProvider>
      );
      
      const { result: filterResult } = renderHook(() => useFilter(), { wrapper });
      
      // Set active filters
      act(() => {
        filterResult.current.applyFilters({
          property: { propertyType: 'Residential' }
        });
      });
      
      // Use useFilteredData with context filters
      const { result } = renderHook(() => useFilteredData(testData), { wrapper });
      
      // Should call applyFiltersToData with the active filters
      expect(applyFiltersToData).toHaveBeenCalledWith(
        testData,
        { property: { propertyType: 'Residential' } }
      );
      
      // Should return the filtered data and active filters
      expect(result.current).toHaveProperty('filteredData');
      expect(result.current).toHaveProperty('activeFilters');
      expect(result.current.activeFilters).toEqual({
        property: { propertyType: 'Residential' }
      });
    });
    
    it('filters data using custom filters', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FilterContextProvider>{children}</FilterContextProvider>
      );
      
      const customFilters = {
        property: { propertyType: 'Commercial' }
      };
      
      // Use useFilteredData with custom filters
      const { result } = renderHook(
        () => useFilteredData(testData, customFilters),
        { wrapper }
      );
      
      // Should call applyFiltersToData with the custom filters
      expect(applyFiltersToData).toHaveBeenCalledWith(
        testData,
        customFilters
      );
      
      // Should return the custom filters as activeFilters
      expect(result.current.activeFilters).toEqual(customFilters);
    });
  });
});
```

##### 2.4 Update usePanelState Tests

Make sure the `usePanelState.test.tsx` file correctly uses the standardized storage key format and properly mocks services:

📄 **client/src/_tests_/TC1401_hooks_usePanelState.test.tsx**

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePanelState } from '../../hooks/usePanelState';
import * as panelStateService from '../../services/panelStateService';
import { PanelContentType } from '../../types/layout.types';

// Mock the panel state service
vi.mock('../../services/panelStateService', () => ({
  loadPanelState: vi.fn(),
  savePanelState: vi.fn(),
  deletePanelState: vi.fn()
}));

describe('usePanelState hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset panel state service mocks
    vi.mocked(panelStateService.loadPanelState).mockReset();
    vi.mocked(panelStateService.savePanelState).mockReset();
    vi.mocked(panelStateService.deletePanelState).mockReset();
  });
  
  it('initializes with default state', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {} 
    }));
    
    expect(result.current.state).toEqual({});
  });
  
  it('initializes with provided initial state', () => {
    const initialState = { 
      position: { x: 10, y: 20 },
      size: { width: 300, height: 200 }
    };
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState 
    }));
    
    expect(result.current.state).toEqual(initialState);
  });
  
  it('loads state from localStorage if available', () => {
    const savedState = { 
      position: { x: 50, y: 60 },
      size: { width: 400, height: 300 }
    };
    
    // Set up mock return value with the proper panel state structure
    vi.mocked(panelStateService.loadPanelState).mockReturnValue({
      id: 'test-panel',
      contentType: 'map' as PanelContentType,
      state: savedState,
      lastUpdated: new Date().toISOString(),
      version: 1
    });
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    expect(panelStateService.loadPanelState).toHaveBeenCalledWith('test-panel', false);
    expect(result.current.state).toEqual(savedState);
  });
  
  it('merges localStorage state with initial state', () => {
    const initialState = { 
      position: { x: 10, y: 20 },
      size: { width: 300, height: 200 },
      customProp: 'initial value'
    };
    
    const savedState = { 
      position: { x: 50, y: 60 },
      customProp2: 'saved value'
    };
    
    // Set up mock return value with the proper panel state structure
    vi.mocked(panelStateService.loadPanelState).mockReturnValue({
      id: 'test-panel',
      contentType: 'map' as PanelContentType,
      state: savedState,
      lastUpdated: new Date().toISOString(),
      version: 1
    });
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState
    }));
    
    // Should merge saved state with initial state
    expect(result.current.state).toEqual({
      position: { x: 50, y: 60 }, // From saved state
      size: { width: 300, height: 200 }, // From initial state
      customProp: 'initial value', // From initial state
      customProp2: 'saved value' // From saved state
    });
  });
  
  it('updates position correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(result.current.state.position).toEqual({ x: 100, y: 150 });
    expect(panelStateService.savePanelState).toHaveBeenCalled();
  });
  
  it('updates size correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    act(() => {
      result.current.updateSize({ width: 500, height: 400 });
    });
    
    expect(result.current.state.size).toEqual({ width: 500, height: 400 });
  });
  
  it('toggles maximized state correctly', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    // Initially not maximized
    expect(result.current.state.isMaximized).toBeFalsy();
    
    act(() => {
      result.current.toggleMaximized();
    });
    
    expect(result.current.state.isMaximized).toBe(true);
    
    act(() => {
      result.current.toggleMaximized();
    });
    
    expect(result.current.state.isMaximized).toBe(false);
  });
  
  it('updates custom properties', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    act(() => {
      result.current.updateState({
        customProp: 'test value'
      });
    });
    
    expect(result.current.state.customProp).toBe('test value');
  });
  
  it('updates multiple properties at once', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {}
    }));
    
    act(() => {
      result.current.updateState({
        position: { x: 200, y: 300 },
        size: { width: 600, height: 450 },
        customProp: 'bulk update'
      });
    });
    
    expect(result.current.state).toEqual({
      position: { x: 200, y: 300 },
      size: { width: 600, height: 450 },
      customProp: 'bulk update'
    });
  });
  
  it('resets state to initial values', () => {
    const initialState = { customProp: 'initial value' };
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState
    }));
    
    // Update some state
    act(() => {
      result.current.updateState({
        position: { x: 200, y: 300 },
        customProp: 'modified value'
      });
    });
    
    // Verify state was updated
    expect(result.current.state.customProp).toBe('modified value');
    
    // Reset state
    act(() => {
      result.current.resetState();
    });
    
    // Verify state was reset to initial values
    expect(result.current.state).toEqual(initialState);
    expect(panelStateService.deletePanelState).toHaveBeenCalledWith('test-panel', false);
  });
  
  it('calls onStateChange when state changes', () => {
    const onStateChangeMock = vi.fn();
    
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {},
      onStateChange: onStateChangeMock
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(onStateChangeMock).toHaveBeenCalledWith({
      position: { x: 100, y: 150 }
    });
  });
  
  it('does not persist state when persistState is false', () => {
    const { result } = renderHook(() => usePanelState({ 
      panelId: 'test-panel',
      initialState: {},
      persistState: false
    }));
    
    act(() => {
      result.current.updatePosition({ x: 100, y: 150 });
    });
    
    expect(panelStateService.savePanelState).not.toHaveBeenCalled();
  });
});
```

##### 2.5 FilterPanel Tests

Update the FilterPanel test to ensure it's in the correct location and uses proper mocking:

📄 **client/src/_tests_/TC1001_components_multiframe_filters_FilterPanel.test.tsx**

```typescript
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FilterPanel } from '../../../../components/multiframe/filters/FilterPanel';
import { FilterContextProvider } from '../../../../context/FilterContext';
import { PanelSyncProvider } from '../../../../context/PanelSyncContext';
import * as PanelSyncHook from '../../../../hooks/usePanelSync';
import * as FilterHook from '../../../../hooks/useFilter';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the usePanelSync hook
const mockBroadcast = vi.fn();
const mockSubscribe = vi.fn(() => () => {});

vi.mock('../../../../hooks/usePanelSync', () => ({
  usePanelSync: () => ({
    broadcast: mockBroadcast,
    subscribe: mockSubscribe
  })
}));

// Mock the useFilter hook
const mockApplyFilters = vi.fn();
const mockClearFilters = vi.fn();
const mockMergeFilters = vi.fn();

vi.mock('../../../../hooks/useFilter', () => ({
  useFilter: () => ({
    activeFilters: {},
    applyFilters: mockApplyFilters,
    clearFilters: mockClearFilters,
    mergeFilters: mockMergeFilters,
    savedFilters: [],
    saveFilter: vi.fn(),
    deleteFilter: vi.fn(),
    loadFilter: vi.fn()
  })
}));

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('renders with default state', () => {
    render(
      <FilterContextProvider>
        <PanelSyncProvider>
          <FilterPanel
            panelId="test-panel"
            onStateChange={() => {}}
            onAction={() => {}}
          />
        </PanelSyncProvider>
      </FilterContextProvider>
    );
    
    // Check that the component renders
    expect(screen.getByTestId('apply-filters-button')).toBeInTheDocument();
    expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
  });
  
  it('applies property type filter and broadcasts changes', () => {
    render(
      <FilterContextProvider>
        <PanelSyncProvider>
          <FilterPanel
            panelId="test-panel"
            onStateChange={() => {}}
            onAction={() => {}}
          />
        </PanelSyncProvider>
      </FilterContextProvider>
    );
    
    // Get state property elements if they exist
    const propertyTypeSelect = screen.getByTestId('property-type-filter');
    
    // Select "Residential" from property type dropdown
    act(() => {
      fireEvent.change(propertyTypeSelect, { target: { value: 'Residential' } });
    });
    
    // Click Apply Filters button
    const applyButton = screen.getByTestId('apply-filters-button');
    act(() => {
      fireEvent.click(applyButton);
    });
    
    // Check that applyFilters was called with the correct filters
    expect(mockApplyFilters).toHaveBeenCalled();
    
    // Check that broadcast was called with the correct event
    expect(mockBroadcast).toHaveBeenCalledWith(expect.objectContaining({
      type: 'filter',
      source: 'test-panel'
    }));
  });
  
  it('clears filters and broadcasts clear event', () => {
    render(
      <FilterContextProvider>
        <PanelSyncProvider>
          <FilterPanel
            panelId="test-panel"
            onStateChange={() => {}}
            onAction={() => {}}
          />
        </PanelSyncProvider>
      </FilterContextProvider>
    );
    
    // Click Clear Filters button
    const clearButton = screen.getByTestId('clear-filters-button');
    act(() => {
      fireEvent.click(clearButton);
    });
    
    // Check that clearFilters was called
    expect(mockClearFilters).toHaveBeenCalled();
    
    // Check that broadcast was called with the correct event
    expect(mockBroadcast).toHaveBeenCalledWith(expect.objectContaining({
      type: 'filterCleared',
      source: 'test-panel'
    }));
  });
  
  it('calls onStateChange and onAction when filters are applied', () => {
    const mockOnStateChange = vi.fn();
    const mockOnAction = vi.fn();
    
    render(
      <FilterContextProvider>
        <PanelSyncProvider>
          <FilterPanel
            panelId="test-panel"
            onStateChange={mockOnStateChange}
            onAction={mockOnAction}
          />
        </PanelSyncProvider>
      </FilterContextProvider>
    );
    
    // Click Apply Filters button
    const applyButton = screen.getByTestId('apply-filters-button');
    act(() => {
      fireEvent.click(applyButton);
    });
    
    // Check that callbacks were called
    expect(mockOnStateChange).toHaveBeenCalled();
    expect(mockOnAction).toHaveBeenCalledWith(expect.objectContaining({
      type: 'filter'
    }));
  });
  
  it('subscribes to filter events from other panels', () => {
    render(
      <FilterContextProvider>
        <PanelSyncProvider>
          <FilterPanel
            panelId="test-panel"
            onStateChange={() => {}}
            onAction={() => {}}
          />
        </PanelSyncProvider>
      </FilterContextProvider>
    );
    
    // Check that subscribe was called
    expect(mockSubscribe).toHaveBeenCalled();
  });
});
```

##### A. Integration Tests

Create an integration test to verify that filter system components work together properly:

📄 **client/src/_tests_/TC2603_integration_FilterSystemIntegration.test.tsx**

```typescript
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FilterContextProvider } from '../../context/FilterContext';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { FilterPanel } from '../../components/multiframe/filters/FilterPanel';
import { MultiFrameContainer } from '../../components/multiframe/MultiFrameContainer';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the services to avoid localStorage issues in tests
vi.mock('../../services/filterService', () => ({
  loadFiltersFromStorage: vi.fn(() => null),
  saveFiltersToStorage: vi.fn(),
  loadFilterPresetsFromStorage: vi.fn(() => []),
  saveFilterPresetsToStorage: vi.fn(),
  validateFilterConfig: vi.fn(() => true),
  applyFiltersToData: vi.fn((data, filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }
    
    if (filters.property?.propertyType === 'Residential') {
      return data.filter(item => item.propertyType === 'Residential');
    }
    
    return data;
  })
}));

vi.mock('../../services/panelStateService', () => ({
  loadPanelState: vi.fn(),
  savePanelState: vi.fn(),
  deletePanelState: vi.fn()
}));

// Create a test component that uses filter context and applies filters
const FilterConsumer = ({ panelId }: { panelId: string }) => {
  const [filteredData, setFilteredData] = React.useState<any[]>([]);
  
  // When this component receives filter events, update the filtered data
  React.useEffect(() => {
    // Subscribe to filter events implementation
    
    // Simulate filtering
    setFilteredData([{ id: 1, propertyType: 'Residential' }]);
    
    return () => {
      // Cleanup subscription
    };
  }, [panelId]);
  
  return (
    <div data-testid={`filter-consumer-${panelId}`}>
      <div data-testid={`filtered-count-${panelId}`}>
        {filteredData.length}
      </div>
      <div data-testid={`consumer-data-${panelId}`}>
        {JSON.stringify(filteredData)}
      </div>
    </div>
  );
};

describe('FilterSystem Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('integrates FilterPanel with FilterContext', () => {
    render(
      <FilterContextProvider>
        <PanelSyncProvider>
          <FilterPanel
            panelId="panel-1"
            onStateChange={() => {}}
            onAction={() => {}}
          />
          <FilterConsumer panelId="panel-2" />
        </PanelSyncProvider>
      </FilterContextProvider>
    );
    
    // FilterPanel and FilterConsumer should both render
    expect(screen.getByTestId('apply-filters-button')).toBeInTheDocument();
    expect(screen.getByTestId('filter-consumer-panel-2')).toBeInTheDocument();
    
    // FilterConsumer should have filtered data
    expect(screen.getByTestId('filtered-count-panel-2')).toHaveTextContent('1');
  });
  
  it('properly renders in MultiFrameContainer', () => {
    // Create test panels config
    const panels = [
      {
        id: 'filter-panel',
        title: 'Filters',
        type: 'filter',
        content: (props: any) => (
          <FilterPanel {...props} />
        )
      },
      {
        id: 'data-panel',
        title: 'Data',
        type: 'custom',
        content: (props: any) => (
          <FilterConsumer panelId={props.panelId} />
        )
      }
    ];
    
    render(
      <MultiFrameContainer
        initialLayout="dual"
        panels={panels}
      />
    );
    
    // Both panels should be rendered within the container
    expect(screen.getByTestId('multi-frame-container')).toBeInTheDocument();
  });
});
```

##### B. Test Script

Update the test script to include all the new test files:

📄 **test-filters.ps1**

```powershell
# PowerShell script to run filter system tests with Vitest
cd client

echo "Running Filter System Tests..."

# Run specific filter system tests
npx vitest run src/_tests_/TC1701_context_FilterContext.test.tsx src/_tests_/TC2301_services_filterService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Panel State Tests..."

# Run panel state tests
npx vitest run src/_tests_/TC1401_hooks_usePanelState.test.tsx src/_tests_/TC2401_services_panelStateService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Filter UI Component Tests..."

# Run UI component tests
npx vitest run src/_tests_/TC1001_components_multiframe_filters_FilterPanel.test.tsx src/_tests_/TC1301_hooks_useFilter.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running Integration Tests..."

# Run integration tests
npx vitest run src/_tests_/TC2603_integration_FilterSystemIntegration.test.tsx --config ./vitest.config.ts --no-coverage

echo "All filter system tests completed!"
```

#### 3. Troubleshooting Common Test Issues

During implementation, you might encounter the following common test issues:

##### 3.1 Storage Key Format Issues

**Problem:** Tests fail with errors about storage keys not matching.
**Solution:** 
- Ensure all code uses the standardized key format: `panelState_<panelId>`
- Update all tests to use the same format
- Check for hardcoded key references in both code and tests

##### 3.2 Mock Implementation Problems

**Problem:** Tests fail due to mock functions not working as expected.
**Solution:**
- Use `vi.mock()` at the top level, not inside test functions
- Reset mocks in `beforeEach()` with `vi.resetAllMocks()`
- For complex mocks, use `mockImplementation()` instead of `mockReturnValue()`

##### 3.3 React Testing Library Issues

**Problem:** Components don't update as expected during tests.
**Solution:**
- Wrap state changes in `act()` to ensure React processes updates
- Use `waitFor()` for asynchronous operations
- Check that event handlers are properly triggered with `fireEvent`

##### 3.4 Context Provider Issues

**Problem:** Hooks fail with "must be used within Provider" errors.
**Solution:**
- Always wrap test components in the appropriate providers
- Use the `wrapper` option in `renderHook()` for testing hooks
- Ensure providers are nested in the correct order

#### 4. Testing Best Practices

Follow these best practices for effective testing:

1. **Test in Isolation:** 
   - Use mocks to isolate the component under test
   - Don't rely on external services or APIs
   - Test one thing at a time

2. **Use Descriptive Test Names:**
   - Test names should describe what is being tested
   - Use a consistent naming convention
   - Group related tests using `describe` blocks

3. **Test Edge Cases:**
   - Test error handling
   - Test with empty or invalid data
   - Test with large datasets

4. **Keep Tests DRY (Don't Repeat Yourself):**
   - Use `beforeEach` to set up common test fixtures
   - Create helper functions for common test operations
   - Use shared mocks for common dependencies

5. **Test Coverage:**
   - Aim for high test coverage, especially for critical code paths
   - Use `npx vitest run --coverage` to check coverage
   - Focus on testing behavior, not implementation details

### 🚀 Deployment and Verification

#### 1. Final Verification Checklist

Before merging your changes, verify the following:

- [ ] All filter types are correctly defined
- [ ] Filter Context is fully implemented
- [ ] Panel State Management is enhanced with versioning
- [ ] Filter service implements proper error handling
- [ ] All tests are passing
- [ ] Storage key formats are consistent
- [ ] Components are properly integrated with the context
- [ ] Documentation is complete

#### 2. Git Commit and Push

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Implement Filter System and enhance Panel State Management with versioning and comprehensive tests"

# Push to remote branch
git push origin feature/filter-system-fix
```

#### 3. Create Pull Request

Create a pull request with the following information:

- **Title:** "Implement Filter System and enhance Panel State Management"
- **Description:** Include a summary of changes, focusing on:
  - Implementation of missing Filter System components
  - Enhancements to Panel State Management
  - Addition of comprehensive tests
  - Storage key standardization
  - Error handling improvements

#### 4. Review Process

During the review process, be prepared to:

- Address any feedback promptly
- Fix failing tests
- Update documentation as needed
- Demonstrate functionality with examples

## 📚 Additional Resources

### Filter System Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│ FilterContextProvider                                  │
│                                                        │
│  ┌─────────────────┐          ┌────────────────────┐   │
│  │                 │          │                    │   │
│  │  activeFilters  │◄─────────┤  applyFilters()   │   │
│  │                 │          │                    │   │
│  └─────────────────┘          └────────────────────┘   │
│           │                            ▲               │
│           │                            │               │
│           ▼                            │               │
│  ┌─────────────────┐          ┌────────────────────┐   │
│  │                 │          │                    │   │
│  │  savedFilters   │◄─────────┤  saveFilter()     │   │
│  │                 │          │                    │   │
│  └─────────────────┘          └────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
                   │                 ▲
                   │                 │
                   ▼                 │
┌────────────────────────────────────────────────────────┐
│ PanelSyncProvider                                      │
│                                                        │
│  ┌─────────────────┐          ┌────────────────────┐   │
│  │                 │          │                    │   │
│  │  events         │◄─────────┤  broadcast()      │   │
│  │                 │          │                    │   │
│  └─────────────────┘          └────────────────────┘   │
│           │                            ▲               │
│           │                            │               │
│           ▼                            │               │
│  ┌────────────────────────────────────────────────┐   │
│  │                                                │   │
│  │               Panel Components                 │   │
│  │                                                │   │
│  │  ┌─────────────┐      ┌───────────────────┐   │   │
│  │  │             │      │                   │   │   │
│  │  │ FilterPanel │◄────►│ Data Panels       │   │   │
│  │  │             │      │ (Map, Property,   │   │   │
│  │  └─────────────┘      │  County, etc.)    │   │   │
│  │        │              │                   │   │   │
│  │        │              └───────────────────┘   │   │
│  │        │                      ▲               │   │
│  │        │                      │               │   │
│  │        └──────────────────────┘               │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
│                      ▲                                │
│                      │                                │
└──────────────────────┼────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ Storage Management                                     │
│                                                        │
│  ┌─────────────────┐          ┌────────────────────┐   │
│  │                 │          │                    │   │
│  │  localStorage   │◄─────────┤  filterService    │   │
│  │                 │          │                    │   │
│  └─────────────────┘          └────────────────────┘   │
│                                        │               │
│  ┌─────────────────┐                   │               │
│  │                 │                   │               │
│  │ sessionStorage  │◄──────────────────┘               │
│  │                 │                                   │
│  └─────────────────┘                                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Component Usage Examples

#### Using Filter Context

```typescript
import React from 'react';
import { useFilter } from '../hooks/useFilter';

const MyComponent: React.FC = () => {
  const { 
    activeFilters, 
    applyFilters, 
    clearFilters, 
    mergeFilters 
  } = useFilter();
  
  // Apply a new filter
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    mergeFilters({
      property: { propertyType: event.target.value }
    });
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
  };
  
  return (
    <div>
      <div>Active Filters: {JSON.stringify(activeFilters)}</div>
      
      <select onChange={handleFilterChange}>
        <option value="">All Types</option>
        <option value="Residential">Residential</option>
        <option value="Commercial">Commercial</option>
      </select>
      
      <button onClick={handleClearFilters}>Clear Filters</button>
    </div>
  );
};
```

#### Using Panel State

```typescript
import React from 'react';
import { usePanelState } from '../hooks/usePanelState';

const MyPanel: React.FC<{ panelId: string }> = ({ panelId }) => {
  const { 
    state, 
    updatePosition, 
    updateSize, 
    toggleMaximized, 
    updateState, 
    resetState 
  } = usePanelState({
    panelId,
    initialState: {
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      isMaximized: false,
      customSetting: 'default'
    }
  });
  
  // Move the panel
  const handleMove = () => {
    updatePosition({ x: 100, y: 200 });
  };
  
  // Resize the panel
  const handleResize = () => {
    updateSize({ width: 600, height: 400 });
  };
  
  // Toggle maximized state
  const handleMaximize = () => {
    toggleMaximized();
  };
  
  // Update custom settings
  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ customSetting: event.target.value });
  };
  
  // Reset all state
  const handleReset = () => {
    resetState();
  };
  
  return (
    <div>
      <div>Position: {JSON.stringify(state.position)}</div>
      <div>Size: {JSON.stringify(state.size)}</div>
      <div>Maximized: {state.isMaximized ? 'Yes' : 'No'}</div>
      <div>Custom Setting: {state.customSetting}</div>
      
      <button onClick={handleMove}>Move</button>
      <button onClick={handleResize}>Resize</button>
      <button onClick={handleMaximize}>
        {state.isMaximized ? 'Restore' : 'Maximize'}
      </button>
      
      <input 
        type="text" 
        value={state.customSetting} 
        onChange={handleSettingChange} 
      />
      
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};
```

## 🏁 Conclusion

This updated implementation guide addresses the findings from the audit and action plan documents. By following these instructions, you will implement a robust Filter System and enhanced Panel State Management that meets the project requirements.

Key improvements in this revised version include:
- Standardized storage key formats
- Enhanced error handling and fallback mechanisms
- Comprehensive test coverage with proper mocking
- Clear documentation of usage patterns
- Robust versioning and conflict resolution

After implementing these changes, the application will have a fully functional filter system that enables effective data exploration across panels with synchronized state and persistent settings.

Remember to run the comprehensive test suite provided in the `test-filters.ps1` script to ensure all components are working correctly before submitting your pull request.

Thanks for sharing the testing issues from the implementation. I'll provide a summary of the problems and recommendations for fixing them.

## Testing Issues Summary

### 1. `filterService.test.ts` Issue:
The "falls back to sessionStorage if localStorage fails" test is failing because `mockSessionStorage.getItem` is not being called. This suggests there's a mismatch between:
- How we're implementing the localStorage error handling in our code
- How we're testing the fallback mechanism

### 2. `useFilter.test.tsx` Issue:
The "throws an error when used outside FilterContextProvider" test is failing, indicating the hook isn't throwing an error as expected when used outside the provider context.

## Recommended Fixes

### For the FilterService Test:

1. **Adjust the test implementation**:
   - Ensure the mock for `localStorage.getItem` is properly triggering an error
   - Verify that the error handling in `loadFiltersFromStorage` is correctly attempting to access sessionStorage

2. **Update the test code**:
```typescript
it('falls back to sessionStorage if localStorage fails', () => {
  const filters = {
    property: { propertyType: 'Commercial' },
    geographic: { state: 'NY' }
  };
  
  // Make localStorage.getItem throw an error
  vi.mocked(mockLocalStorage.getItem).mockImplementation(() => {
    throw new Error('localStorage error');
  });
  
  // Setup sessionStorage to return data
  const versionedFilters = {
    version: 'v1',
    updatedAt: new Date().toISOString(),
    data: filters
  };
  vi.mocked(mockSessionStorage.getItem).mockReturnValue(JSON.stringify(versionedFilters));
  
  const result = loadFiltersFromStorage();
  
  expect(mockSessionStorage.getItem).toHaveBeenCalled();
  expect(result).toEqual(filters);
});
```

### For the useFilter Test:

1. **Check how the hook handles missing context**:
   - Verify that `useFilter` is actually throwing an error when the context is null
   - Update the test to correctly simulate using the hook outside a provider

2. **Update the test code**:
```typescript
it('throws an error when used outside FilterContextProvider', () => {
  // Mock useContext to return null
  const originalUseContext = React.useContext;
  React.useContext = vi.fn().mockReturnValue(null);
  
  expect(() => {
    renderHook(() => useFilter());
  }).toThrow('useFilter must be used within a FilterContextProvider');
  
  // Restore original implementation
  React.useContext = originalUseContext;
});
```

## General Testing Recommendations

1. **Review Error Handling Logic**:
   - Make sure all error handling paths are correctly implemented
   - Ensure fallback mechanisms are actually triggered when primary methods fail

2. **Mock Implementation Techniques**:
   - For error testing, use `mockImplementation` rather than `mockReturnValue`
   - Ensure mocks are reset between tests to prevent interference

3. **Context Testing Best Practices**:
   - When testing hooks that depend on context, either:
     - Mock the React.useContext function directly
     - Use a wrapper component that properly simulates the context environment

These adjustments should help resolve the current testing issues and make the test suite more robust.
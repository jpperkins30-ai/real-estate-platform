# 🧩 Chunk 3: Filter System & Panel State Management (Revised)

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-3-filter-system.md

## 🎯 Objective

Implement a comprehensive filter system and panel state management to enable dynamic filtering across panels with proper state persistence. This includes county-level filtering and ensuring that filter changes are properly broadcasted and synchronized between related panels.

This chunk builds on the panel communication framework from Chunk 2 and creates the filtering capabilities necessary for effective data exploration across the platform.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

Create your Git branch:
```bash
git checkout main
git pull
git checkout -b feature/filter-system
```

Required folders:
```
client/src/types/
client/src/services/
client/src/hooks/
client/src/context/
client/src/components/multiframe/filters/
```

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
}
```

#### 2. Create Filter Context

📄 **client/src/context/FilterContext.tsx**
```typescript
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

// Create a default context value to avoid null checks
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
  
  // Apply filters
  const applyFilters = useCallback((filters: FilterSet) => {
    setActiveFilters(prev => ({
      ...prev,
      ...filters
    }));
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
      updatedAt: new Date().toISOString()
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
    
    if (filter) {
      setActiveFilters(filter.filters);
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
    loadFilter
  };
  
  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
```

#### 3. Create Filter Hook

📄 **client/src/hooks/useFilter.ts**
```typescript
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export function useFilter() {
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context;
}
```

#### 4. Implement Filter Service

📄 **client/src/services/filterService.ts**
```typescript
import { FilterSet, PropertyFilter, GeographicFilter, FilterConfig } from '../types/filter.types';

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
  
  // Bedrooms filter
  if (propertyFilters.bedrooms && 'bedrooms' in item) {
    const itemBedrooms = Number(item.bedrooms);
    
    if (isNaN(itemBedrooms) || (propertyFilters.bedrooms !== 'any' && itemBedrooms < Number(propertyFilters.bedrooms))) {
      return false;
    }
  }
  
  // Bathrooms filter
  if (propertyFilters.bathrooms && 'bathrooms' in item) {
    const itemBathrooms = Number(item.bathrooms);
    
    if (isNaN(itemBathrooms) || (propertyFilters.bathrooms !== 'any' && itemBathrooms < Number(propertyFilters.bathrooms))) {
      return false;
    }
  }
  
  // Square feet filter
  if (propertyFilters.squareFeet && 'squareFeet' in item) {
    const [min, max] = propertyFilters.squareFeet;
    const itemSquareFeet = Number(item.squareFeet);
    
    if (isNaN(itemSquareFeet) || itemSquareFeet < min || itemSquareFeet > max) {
      return false;
    }
  }
  
  // Zoning filter
  if (propertyFilters.zoning && 'zoning' in item) {
    const itemZoning = item.zoning;
    
    if (propertyFilters.zoning !== 'all' && propertyFilters.zoning !== itemZoning) {
      return false;
    }
  }
  
  // Sale type filter
  if (propertyFilters.saleType && 'saleType' in item) {
    const itemSaleType = item.saleType;
    
    if (propertyFilters.saleType !== 'all' && propertyFilters.saleType !== itemSaleType) {
      return false;
    }
  }
  
  // Item passed all property filters
  return true;
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
  
  // City filter
  if (geoFilters.city && 'city' in item) {
    const itemCity = item.city;
    
    if (geoFilters.city !== itemCity) {
      return false;
    }
  }
  
  // Zip code filter
  if (geoFilters.zipCode && 'zipCode' in item) {
    const itemZipCode = item.zipCode;
    
    if (geoFilters.zipCode !== itemZipCode) {
      return false;
    }
  }
  
  // Item passed all geographic filters
  return true;
}

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

/**
 * Save filter presets to local storage with error handling
 */
export function saveFilterPresetsToStorage(presets: FilterConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FILTER_PRESETS, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving filter presets to storage:', error);
  }
}

/**
 * Load filter presets from local storage with error handling
 */
export function loadFilterPresetsFromStorage(): FilterConfig[] {
  try {
    const storedPresets = localStorage.getItem(STORAGE_KEY_FILTER_PRESETS);
    
    if (storedPresets) {
      return JSON.parse(storedPresets) as FilterConfig[];
    }
  } catch (error) {
    console.error('Error loading filter presets from storage:', error);
  }
  
  return [];
}

/**
 * Clear all filters from storage
 */
export function clearAllFiltersFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_FILTERS);
  } catch (error) {
    console.error('Error clearing filters from storage:', error);
  }
}

/**
 * Get unique values for a field from a dataset
 * Useful for populating filter dropdown options
 */
export function getUniqueFieldValues<T extends Record<string, any>>(
  data: T[], 
  field: keyof T
): Array<T[keyof T]> {
  try {
    const values = new Set<T[keyof T]>();
    
    data.forEach(item => {
      if (item[field] !== undefined && item[field] !== null) {
        values.add(item[field]);
      }
    });
    
    return Array.from(values);
  } catch (error) {
    console.error(`Error getting unique values for field ${String(field)}:`, error);
    return [];
  }
}

/**
 * Create a filter configuration from the current filters
 */
export function createFilterConfig(
  name: string,
  filters: FilterSet,
  description?: string
): Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description: description || `Filter created on ${new Date().toLocaleDateString()}`,
    filters,
    isDefault: false
  };
}
```

#### 5. Create Panel State Management Service

📄 **client/src/services/panelStateService.ts**
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
  try {
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
  } catch (error) {
    console.error('Error saving panel state:', error);
    throw error;
  }
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string): PanelState | null {
  try {
    const storedStates = sessionStorage.getItem('panelStates');
    
    if (storedStates) {
      try {
        const states: Record<string, PanelState> = JSON.parse(storedStates);
        return states[panelId] || null;
      } catch (error) {
        console.error('Error parsing stored panel states:', error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading panel state:', error);
    return null;
  }
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string): void {
  try {
    const storedStates = sessionStorage.getItem('panelStates');
    
    if (storedStates) {
      try {
        const states: Record<string, PanelState> = JSON.parse(storedStates);
        
        if (panelId in states) {
          delete states[panelId];
          sessionStorage.setItem('panelStates', JSON.stringify(states));
        }
      } catch (error) {
        console.error('Error parsing stored panel states:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting panel state:', error);
  }
}
```

#### 6. Create Enhanced Panel State Hook

📄 **client/src/hooks/usePanelState.ts**
```typescript
import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState, deletePanelState } from '../services/panelStateService';
import { PanelContentType } from '../types/layout.types';

export function usePanelState<T>(
  panelId: string, 
  contentType: PanelContentType, 
  initialState: T
): [T, (newState: Partial<T> | ((prevState: T) => T)) => void, () => void] {
  // Load saved state or use initial state with error handling
  const loadInitialState = () => {
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
  
  // Update state and save changes
  const updateState = useCallback((newState: Partial<T> | ((prevState: T) => T)) => {
    setState(prev => {
      try {
        const updatedState = typeof newState === 'function' 
          ? (newState as Function)(prev) 
          : { ...prev, ...newState };
        
        // Save the updated state
        savePanelState(panelId, contentType, updatedState);
        
        return updatedState;
      } catch (error) {
        console.error(`Error updating panel state for ${panelId}:`, error);
        return prev;
      }
    });
  }, [panelId, contentType]);
  
  // Reset state
  const resetState = useCallback(() => {
    setState(initialState);
    try {
      deletePanelState(panelId);
    } catch (error) {
      console.error(`Error deleting panel state for ${panelId}:`, error);
    }
  }, [panelId, initialState]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      try {
        savePanelState(panelId, contentType, state);
      } catch (error) {
        console.error(`Error saving panel state during cleanup for ${panelId}:`, error);
      }
    };
  }, [panelId, contentType, state]);
  
  // Return state, update function, and reset function
  return [state, updateState, resetState];
}
```

#### 7. Implement FilterPanel Component

📄 **client/src/components/multiframe/panels/FilterPanel.tsx**
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
  
  // Hooks
  const { broadcast } = usePanelSync();
  const { applyFilters, clearFilters } = useFilter();
  
  // Initialize with any existing filters
  useEffect(() => {
    if (initialState.filters) {
      setFilters(initialState.filters);
    }
  }, [initialState.filters]);
  
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
  
  return (
    <div className="filter-panel">
      <div className="filter-section">
        <h3 className="filter-section-title">Geographic Filters</h3>
        
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
        
        <div className="filter-group">
          <label className="filter-label">County</label>
          <select
            className="filter-select"
            value={filters.geographic?.county || ''}
            onChange={(e) => handleGeographicFilterChange({ county: e.target.value })}
            disabled={!filters.geographic?.state}
          >
            <option value="">All Counties</option>
            
            {filters.geographic?.state === 'MD' && (
              <>
                <option value="Montgomery">Montgomery</option>
                <option value="St. Mary's">St. Mary's</option>
                <option value="Howard">Howard</option>
                <option value="Baltimore">Baltimore</option>
              </>
            )}
            
            {/* Add options for other states */}
          </select>
        </div>
      </div>
      
      <div className="filter-section">
        <h3 className="filter-section-title">Property Filters</h3>
        
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
        
        <div className="filter-group">
          <label className="filter-label">Zoning</label>
          <select
            className="filter-select"
            value={filters.property?.zoning || ''}
            onChange={(e) => handlePropertyFilterChange({ zoning: e.target.value })}
          >
            <option value="">All Zoning</option>
            <option value="R1">R1 - Single Family</option>
            <option value="R2">R2 - Multi-Family</option>
            <option value="C1">C1 - Commercial</option>
            <option value="I1">I1 - Industrial</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Sale Type</label>
          <select
            className="filter-select"
            value={filters.property?.saleType || ''}
            onChange={(e) => handlePropertyFilterChange({ saleType: e.target.value })}
          >
            <option value="">All Sales</option>
            <option value="tax">Tax Sale</option>
            <option value="private">Private Sale</option>
            <option value="foreclosure">Foreclosure</option>
            <option value="auction">Auction</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <div className="range-inputs">
            <input
              type="number"
              className="range-input"
              value={(filters.property?.priceRange || [0, 0])[0]}
              onChange={(e) => handlePropertyFilterChange({ 
                priceRange: [parseInt(e.target.value) || 0, (filters.property?.priceRange || [0, 1000000])[1]] 
              })}
              min={0}
              step={10000}
            />
            <span>to</span>
            <input
              type="number"
              className="range-input"
              value={(filters.property?.priceRange || [0, 1000000])[1]}
              onChange={(e) => handlePropertyFilterChange({ 
                priceRange: [(filters.property?.priceRange || [0, 0])[0], parseInt(e.target.value) || 0] 
              })}
              min={0}
              step={10000}
            />
          </div>
        </div>
      </div>
      
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
import React, { useState, useCallback, useMemo } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { FilterContextProvider } from '../../context/FilterContext';
import { PanelConfig, LayoutConfig, LayoutType } from '../../types/layout.types';
import './MultiFrameContainer.css';

// ... existing code ...

export const MultiFrameContainer: React.FC<MultiFrameContainerProps> = ({
  initialLayout = 'single',
  panels = [],
  defaultPanelContent = {},
  onLayoutChange,
  className = '',
}) => {
  // ... existing state code ...
  
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

#### 🔍 Testing

##### 1. Vitest Configuration

📄 **client/vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Exclude node_modules and dist folders explicitly
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Explicitly define specific test patterns to avoid empty
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Explicitly define specific test patterns to avoid empty pattern errors
    include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Enable this if you need to see test coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
    },
    reporters: ['default'],
    // Ensure we're using pool: 'forks' instead of 'threads', which can cause issues
    pool: 'forks',
    // Increase timeout for tests
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

##### 2. Setup Test Environment

📄 **client/src/setupTests.ts**
```typescript
// client/src/setupTests.ts
import '@testing-library/jest-dom'
import { vi, expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Make sure we're clean between tests
afterEach(() => {
  cleanup()
})

// Setup local storage mock for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

// Setup session storage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

// Add matchers to expect
expect.extend(matchers)

// Setup global mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
  vi.resetAllMocks()
})
```

##### 3. Filter Context Tests

📄 **client/src/__tests__/context/FilterContext.test.tsx**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FilterContextProvider, FilterContext } from '../../context/FilterContext'
import { useContext } from 'react'
import { saveFiltersToStorage, loadFiltersFromStorage } from '../../services/filterService'

// Mock the filterService
vi.mock('../../services/filterService', () => ({
  saveFiltersToStorage: vi.fn(),
  loadFiltersFromStorage: vi.fn(() => null),
  saveFilterPresetsToStorage: vi.fn(),
  loadFilterPresetsFromStorage: vi.fn(() => [])
}))

// Test component that uses filter context
const TestComponent = () => {
  const { activeFilters, applyFilters, clearFilters } = useContext(FilterContext)
  
  return (
    <div>
      <button 
        onClick={() => applyFilters({
          property: { propertyType: 'Residential' },
          geographic: { county: 'TestCounty' }
        })}
        data-testid="apply-filters-button"
      >
        Apply Filters
      </button>
      
      <button 
        onClick={() => clearFilters()}
        data-testid="clear-filters-button"
      >
        Clear Filters
      </button>
      
      <div data-testid="active-filters">
        {JSON.stringify(activeFilters)}
      </div>
    </div>
  )
}

describe('FilterContext', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders with default empty state', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    )
    
    expect(screen.getByTestId('active-filters').textContent).toBe('{}')
  })
  
  it('applies filters correctly', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    )
    
    fireEvent.click(screen.getByTestId('apply-filters-button'))
    
    expect(screen.getByTestId('active-filters').textContent).toContain('Residential')
    expect(screen.getByTestId('active-filters').textContent).toContain('TestCounty')
    expect(saveFiltersToStorage).toHaveBeenCalled()
  })
  
  it('clears filters correctly', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    )
    
    // First apply filters
    fireEvent.click(screen.getByTestId('apply-filters-button'))
    
    // Then clear them
    fireEvent.click(screen.getByTestId('clear-filters-button'))
    
    expect(screen.getByTestId('active-filters').textContent).toBe('{}')
    expect(saveFiltersToStorage).toHaveBeenCalledWith({})
  })
  
  it('loads initial filters from storage', () => {
    const storedFilters = {
      property: { propertyType: 'Commercial' },
      geographic: { state: 'CA' }
    }
    
    vi.mocked(loadFiltersFromStorage).mockReturnValue(storedFilters)
    
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    )
    
    expect(screen.getByTestId('active-filters').textContent).toContain('Commercial')
    expect(screen.getByTestId('active-filters').textContent).toContain('CA')
  })
})
```

##### 4. Panel State Hook Tests

📄 **client/src/__tests__/hooks/usePanelState.test.tsx**
```typescript
import { renderHook, act } from '@testing-library/react-hooks'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePanelState } from '../../hooks/usePanelState'
import { savePanelState, loadPanelState, deletePanelState } from '../../services/panelStateService'

// Mock the panel state service
vi.mock('../../services/panelStateService', () => ({
  savePanelState: vi.fn((panelId, contentType, state) => ({
    id: panelId,
    contentType,
    state,
    lastUpdated: new Date().toISOString()
  })),
  loadPanelState: vi.fn(() => null),
  deletePanelState: vi.fn()
}))

describe('usePanelState', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  it('initializes with provided initial state', () => {
    const initialState = { value: 'test' }
    
    const { result } = renderHook(() => 
      usePanelState('panel-1', 'map', initialState)
    )
    
    // First element of result.current is the state
    expect(result.current[0]).toEqual(initialState)
  })
  
  it('loads saved state if available', () => {
    const savedState = { value: 'saved' }
    vi.mocked(loadPanelState).mockReturnValue({
      id: 'panel-1',
      contentType: 'map',
      state: savedState,
      lastUpdated: new Date().toISOString()
    })
    
    const initialState = { value: 'initial' }
    
    const { result } = renderHook(() => 
      usePanelState('panel-1', 'map', initialState)
    )
    
    expect(result.current[0]).toEqual(savedState)
  })
  
  it('updates state and saves changes', () => {
    const initialState = { value: 'initial' }
    const newState = { value: 'updated' }
    
    const { result } = renderHook(() => 
      usePanelState('panel-1', 'map', initialState)
    )
    
    act(() => {
      // Second element of result.current is the update function
      result.current[1](newState)
    })
    
    expect(result.current[0]).toEqual(newState)
    expect(savePanelState).toHaveBeenCalledWith('panel-1', 'map', newState)
  })
  
  it('updates state with function updater', () => {
    const initialState = { count: 5 }
    
    const { result } = renderHook(() => 
      usePanelState('panel-1', 'map', initialState)
    )
    
    act(() => {
      result.current[1]((prev) => ({ count: prev.count + 1 }))
    })
    
    expect(result.current[0]).toEqual({ count: 6 })
    expect(savePanelState).toHaveBeenCalledWith('panel-1', 'map', { count: 6 })
  })
  
  it('resets state to initial value', () => {
    const initialState = { value: 'initial' }
    
    const { result } = renderHook(() => 
      usePanelState('panel-1', 'map', initialState)
    )
    
    // First update the state
    act(() => {
      result.current[1]({ value: 'changed' })
    })
    
    expect(result.current[0]).toEqual({ value: 'changed' })
    
    // Then reset it
    act(() => {
      // Third element of result.current is the reset function
      result.current[2]()
    })
    
    expect(result.current[0]).toEqual(initialState)
    expect(deletePanelState).toHaveBeenCalledWith('panel-1')
  })
  
  it('handles errors when loading state', () => {
    vi.mocked(loadPanelState).mockImplementation(() => {
      throw new Error('Failed to load state')
    })
    
    const initialState = { value: 'initial' }
    
    const { result } = renderHook(() => 
      usePanelState('panel-1', 'map', initialState)
    )
    
    // Should fall back to initial state on error
    expect(result.current[0]).toEqual(initialState)
  })
})
```

##### 5. Filter Service Tests

📄 **client/src/__tests__/services/filterService.test.ts**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  applyFiltersToData, 
  saveFiltersToStorage, 
  loadFiltersFromStorage,
  getUniqueFieldValues
} from '../../services/filterService'

// Mock data
const testData = [
  { id: 1, propertyType: 'Residential', price: 300000, state: 'CA', county: 'Los Angeles' },
  { id: 2, propertyType: 'Commercial', price: 750000, state: 'NY', county: 'Kings' },
  { id: 3, propertyType: 'Residential', price: 450000, state: 'TX', county: 'Harris' },
  { id: 4, propertyType: 'Industrial', price: 1200000, state: 'CA', county: 'Orange' }
]

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    })
  }
})()

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', { 
  value: localStorageMock,
  writable: true 
})

describe('filterService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })
  
  describe('applyFiltersToData', () => {
    it('returns all data when no filters provided', () => {
      const result = applyFiltersToData(testData, {})
      expect(result).toEqual(testData)
      expect(result).toHaveLength(4)
    })
    
    it('filters by property type', () => {
      const filters = {
        property: { propertyType: 'Residential' }
      }
      
      const result = applyFiltersToData(testData, filters)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(3)
    })
    
    it('filters by price range', () => {
      const filters = {
        property: { priceRange: [400000, 1000000] }
      }
      
      const result = applyFiltersToData(testData, filters)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(2)
      expect(result[1].id).toBe(3)
    })
    
    it('filters by geographic location', () => {
      const filters = {
        geographic: { state: 'CA' }
      }
      
      const result = applyFiltersToData(testData, filters)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(4)
    })
    
    it('combines multiple filters', () => {
      const filters = {
        property: { propertyType: 'Residential' },
        geographic: { state: 'CA' }
      }
      
      const result = applyFiltersToData(testData, filters)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })
    
    it('handles errors gracefully', () => {
      // Create a situation that would cause an error
      const filters = {
        property: { propertyType: {} } // Invalid filter value
      }
      
      // This should not throw, but return the original data
      const result = applyFiltersToData(testData, filters as any)
      expect(result).toEqual(testData)
    })
  })
  
  describe('Storage Functions', () => {
    it('saves filters to storage', () => {
      const filters = {
        property: { propertyType: 'Residential' },
        geographic: { state: 'CA' }
      }
      
      saveFiltersToStorage(filters)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'activeFilters',
        JSON.stringify(filters)
      )
    })
    
    it('loads filters from storage', () => {
      const filters = {
        property: { propertyType: 'Commercial' },
        geographic: { state: 'NY' }
      }
      
      // Setup mock to return serialized filters
      vi.mocked(localStorageMock.getItem).mockReturnValue(JSON.stringify(filters))
      
      const result = loadFiltersFromStorage()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('activeFilters')
      expect(result).toEqual(filters)
    })
    
    it('returns null when no filters in storage', () => {
      vi.mocked(localStorageMock.getItem).mockReturnValue(null)
      
      const result = loadFiltersFromStorage()
      
      expect(result).toBeNull()
    })
    
    it('handles JSON parse errors', () => {
      vi.mocked(localStorageMock.getItem).mockReturnValue('invalid json')
      
      const result = loadFiltersFromStorage()
      
      expect(result).toBeNull()
    })
  })
  
  describe('getUniqueFieldValues', () => {
    it('returns unique values for a field', () => {
      const result = getUniqueFieldValues(testData, 'propertyType')
      
      expect(result).toEqual(['Residential', 'Commercial', 'Industrial'])
      expect(result).toHaveLength(3)
    })
    
    it('handles errors gracefully', () => {
      // Create a situation that would cause an error
      const result = getUniqueFieldValues(testData, 'nonExistentField' as any)
      
      expect(result).toEqual([])
    })
  })
})
```

##### 6. County Panel Tests

📄 **client/src/__tests__/components/multiframe/panels/CountyPanel.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountyPanel } from '../../../../components/multiframe/panels/CountyPanel';
import { PanelSyncProvider } from '../../../../context/PanelSyncContext';
import * as panelStateService from '../../../../services/panelStateService';

// Mock the panel state service
vi.mock('../../../../services/panelStateService', () => ({
  savePanelState: vi.fn(),
  loadPanelState: vi.fn(() => null),
  deletePanelState: vi.fn()
}));

// Mock usePanelSync hook
vi.mock('../../../../hooks/usePanelSync', () => ({
  usePanelSync: () => ({
    broadcast: vi.fn(),
    subscribe: vi.fn(() => () => {})
  })
}));

describe('CountyPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders county information when provided', () => {
    // Mock initial state with county data
    const initialState = {
      countyId: 'Test County',
      stateId: 'Test State',
      countyData: {
        name: 'Test County',
        state: 'Test State',
        population: 150000,
        properties: 55000,
        lastUpdated: '1/1/2025',
        propertyTypes: [
          { type: 'Residential', count: 42000 },
          { type: 'Commercial', count: 5000 },
          { type: 'Industrial', count: 3000 },
          { type: 'Land', count: 5000 }
        ]
      }
    };
    
    render(
      <PanelSyncProvider>
        <CountyPanel 
          panelId="test-panel" 
          initialState={initialState}
          onStateChange={() => {}}
          onAction={() => {}}
        />
      </PanelSyncProvider>
    );
    
    // Use content matcher to check for county name and state
    expect(screen.getByText((content) => 
      content.includes('Test County') && content.includes('Test State')
    )).toBeInTheDocument();
    
    // Check for population information
    expect(screen.getByText(/Population:/)).toBeInTheDocument();
    expect(screen.getByText(/150,000/)).toBeInTheDocument();
    
    // Check for property types
    expect(screen.getByText('Residential')).toBeInTheDocument();
    expect(screen.getByText('42,000')).toBeInTheDocument();
  });
  
  it('renders empty state when no county is selected', () => {
    render(
      <PanelSyncProvider>
        <CountyPanel 
          panelId="test-panel" 
          onStateChange={() => {}}
          onAction={() => {}}
        />
      </PanelSyncProvider>
    );
    
    expect(screen.getByText(/Select a county to view data/i)).toBeInTheDocument();
  });
});
```

##### 7. Filter Panel Tests

📄 **client/src/__tests__/components/multiframe/panels/FilterPanel.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterPanel } from '../../../../components/multiframe/panels/FilterPanel';
import { PanelSyncProvider } from '../../../../context/PanelSyncContext';
import { FilterContextProvider } from '../../../../context/FilterContext';
import { usePanelSync } from '../../../../hooks/usePanelSync';

// Mock the usePanelSync hook
const mockBroadcast = vi.fn();
vi.mock('../../../../hooks/usePanelSync', () => ({
  usePanelSync: () => ({
    broadcast: mockBroadcast,
    subscribe: vi.fn(() => () => {})
  })
}));

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    
    // Select "Residential" from property type dropdown
    const propertyTypeSelect = screen.getByLabelText(/Property Type/i);
    fireEvent.change(propertyTypeSelect, { target: { value: 'Residential' } });
    
    // Click Apply Filters button
    const applyButton = screen.getByText(/Apply Filters/i);
    fireEvent.click(applyButton);
    
    // Check if broadcast was called with correctly structured event
    expect(mockBroadcast).toHaveBeenCalledWith({
      type: 'filter',
      payload: {
        filters: {
          property: {
            propertyType: 'Residential'
          },
          geographic: {}
        }
      },
      source: 'test-panel'
    });
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
    
    // Select some filters first
    const propertyTypeSelect = screen.getByLabelText(/Property Type/i);
    fireEvent.change(propertyTypeSelect, { target: { value: 'Residential' } });
    
    // Click Clear Filters button
    const clearButton = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearButton);
    
    // Check if broadcast was called with filterCleared event
    expect(mockBroadcast).toHaveBeenCalledWith({
      type: 'filterCleared',
      payload: {},
      source: 'test-panel'
    });
  });
});
```

##### 8. Test Script for Filter System

📄 **test-filters.ps1**
```powershell
# PowerShell script to run filter system tests with Vitest
cd client

echo "Running Filter System Tests..."

# Run specific filter system tests
npx vitest run src/__tests__/context/FilterContext.test.tsx src/__tests__/services/filterService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Panel State Tests..."

# Run panel state tests
npx vitest run src/__tests__/hooks/usePanelState.test.tsx src/__tests__/services/panelStateService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Filter UI Component Tests..."

# Run UI component tests
npx vitest run src/__tests__/components/multiframe/panels/FilterPanel.test.tsx src/__tests__/components/multiframe/panels/CountyPanel.test.tsx --config ./vitest.config.ts --no-coverage

echo "All filter system tests completed!"
```

### ✅ Commit and Verify

1. Run the tests to ensure all tests pass:
```bash
cd client
npm run test
```

2. Commit your changes:
```bash
git add .
git commit -m "Chunk 3: Implement filter system and panel state management with Vitest tests"
git push origin feature/filter-system
```

3. Create a Pull Request on GitHub with a detailed description and screenshots.

## 📈 Implementation References

### Example Usage of Filters

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

### Example of Panel State Persistence

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
    // Reset state to initial values
    resetState();
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
      
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

### FilterSystem Architecture Diagram

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

# Filter System & Panel Management Implementation Guide

> **IMPORTANT NOTE**: Test file paths in this document reference the old nested test structure. The project has moved to a flattened test directory structure where files are located directly in `src/__tests__/` with underscores replacing directory separators. For example:
> - Old path: `src/__tests__/components/multiframe/panels/FilterPanel.test.tsx`
> - New path: `src/__tests__/components_multiframe_panels_FilterPanel.test.tsx`
>
> For more information on the test structure, see the test guide in `src/__tests__/README.md`.
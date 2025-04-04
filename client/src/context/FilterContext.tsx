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
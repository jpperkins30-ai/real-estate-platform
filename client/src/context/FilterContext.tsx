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
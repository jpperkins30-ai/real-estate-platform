import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';
import { FilterSet } from '../types/filter.types';
import { applyFiltersToData } from '../services/filterService';

export function useFilter() {
  const context = useContext(FilterContext);
  
  // With our default context value, we no longer need this check
  // but we'll keep it for safety and documentation purposes
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
  
  // Apply filters to the data using the service function
  const filteredData = applyFiltersToData(data, filtersToApply);
  
  return {
    filteredData,
    activeFilters: filtersToApply
  };
} 
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export function useFilter() {
  const context = useContext(FilterContext);
  
  // With our default context value, we no longer need this check
  // but we'll keep it for safety and documentation purposes
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context;
} 
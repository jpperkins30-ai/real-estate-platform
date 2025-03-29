import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { State, County, Property } from '../types/inventory';
import { fetchStates, fetchCountiesByState } from '../services/api';
import { useQuery } from 'react-query';

interface InventoryContextType {
  selectedState: State | null;
  setSelectedState: (state: State | null) => void;
  selectedCounty: County | null;
  setSelectedCounty: (county: County | null) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  clearSelections: () => void;
  isLoading: boolean;
  error: Error | null;
  states: State[] | undefined;
  counties: County[] | undefined;
  refreshStates: () => void;
  refreshCounties: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Fetch states
  const { 
    data: states, 
    isLoading: statesLoading, 
    error: statesError,
    refetch: refreshStates
  } = useQuery('states', fetchStates, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch counties based on selected state
  const { 
    data: counties, 
    isLoading: countiesLoading, 
    error: countiesError,
    refetch: refreshCounties
  } = useQuery(
    ['counties', selectedState?.id], 
    () => fetchCountiesByState(selectedState?.id || ''),
    {
      enabled: !!selectedState?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const clearSelections = useCallback(() => {
    setSelectedState(null);
    setSelectedCounty(null);
    setSelectedProperty(null);
  }, []);

  // Combine loading and error states
  const isLoading = statesLoading || countiesLoading;
  const error = statesError || countiesError;

  return (
    <InventoryContext.Provider
      value={{
        selectedState,
        setSelectedState,
        selectedCounty,
        setSelectedCounty,
        selectedProperty,
        setSelectedProperty,
        clearSelections,
        isLoading,
        error: error as Error | null,
        states,
        counties,
        refreshStates,
        refreshCounties
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// Export the hook with both names for backward compatibility
export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// Renamed hook to match the import in InventoryMain.tsx
export const useInventoryContext = useInventory; 
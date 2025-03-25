import React, { createContext, useContext, ReactNode, useState } from 'react';
import { State, County, Property } from '../types/inventory';

interface InventoryContextType {
  selectedState: State | null;
  setSelectedState: (state: State | null) => void;
  selectedCounty: County | null;
  setSelectedCounty: (county: County | null) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  clearSelections: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const clearSelections = () => {
    setSelectedState(null);
    setSelectedCounty(null);
    setSelectedProperty(null);
  };

  return (
    <InventoryContext.Provider
      value={{
        selectedState,
        setSelectedState,
        selectedCounty,
        setSelectedCounty,
        selectedProperty,
        setSelectedProperty,
        clearSelections
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
import React, { createContext, useContext, useCallback } from 'react';
import { PanelConfig } from '../types/layout.types';
import { LayoutContext } from '../contexts/LayoutContext';

interface LayoutContextType {
  registerPanel: (id: string, config: PanelConfig) => void;
  unregisterPanel: (id: string) => void;
  updatePanelConfig: (id: string, config: Partial<PanelConfig>) => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const registerPanel = useCallback((id: string, config: PanelConfig) => {
    // Implementation will be added later
  }, []);

  const unregisterPanel = useCallback((id: string) => {
    // Implementation will be added later
  }, []);

  const updatePanelConfig = useCallback((id: string, config: Partial<PanelConfig>) => {
    // Implementation will be added later
  }, []);

  const value = {
    registerPanel,
    unregisterPanel,
    updatePanelConfig
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}; 
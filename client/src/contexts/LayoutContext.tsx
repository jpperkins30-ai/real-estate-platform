import React, { createContext, useCallback } from 'react';
import { PanelConfig } from '../types/layout.types';

interface LayoutContextType {
  registerPanel: (id: string, config: PanelConfig) => void;
  unregisterPanel: (id: string) => void;
  updatePanelConfig: (id: string, config: Partial<PanelConfig>) => void;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

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

  return (
    <LayoutContext.Provider value={{ registerPanel, unregisterPanel, updatePanelConfig }}>
      {children}
    </LayoutContext.Provider>
  );
}; 
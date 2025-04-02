import React, { createContext, useContext, useCallback } from 'react';

interface PanelSyncContextType {
  broadcast: (panelId: string, data: any) => void;
  subscribe: (panelId: string, callback: (data: any) => void) => () => void;
  unsubscribe: (panelId: string) => void;
}

const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

export const usePanelSync = () => {
  const context = useContext(PanelSyncContext);
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  return context;
};

export const PanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const broadcast = useCallback((panelId: string, data: any) => {
    // Implementation will be added later
  }, []);

  const subscribe = useCallback((panelId: string, callback: (data: any) => void) => {
    // Implementation will be added later
    return () => {};
  }, []);

  const unsubscribe = useCallback((panelId: string) => {
    // Implementation will be added later
  }, []);

  const value = {
    broadcast,
    subscribe,
    unsubscribe
  };

  return (
    <PanelSyncContext.Provider value={value}>
      {children}
    </PanelSyncContext.Provider>
  );
}; 
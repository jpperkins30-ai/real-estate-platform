import React, { createContext, useCallback, useRef } from 'react';

export interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
}

export type PanelSyncCallback = (event: PanelSyncEvent) => void;

interface PanelSyncContextType {
  broadcast: (event: PanelSyncEvent) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
}

export const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

export const PanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use ref for listeners to avoid re-renders
  const listenersRef = useRef<PanelSyncCallback[]>([]);
  
  // Broadcast events to all subscribers
  const broadcast = useCallback((event: PanelSyncEvent) => {
    // Notify all listeners
    listenersRef.current.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in panel sync listener:', error);
      }
    });
  }, []);
  
  // Subscribe to events
  const subscribe = useCallback((callback: PanelSyncCallback) => {
    listenersRef.current.push(callback);
    
    // Return unsubscribe function
    return () => {
      listenersRef.current = listenersRef.current.filter(cb => cb !== callback);
    };
  }, []);
  
  // Context value
  const contextValue = {
    broadcast,
    subscribe
  };
  
  return (
    <PanelSyncContext.Provider value={contextValue}>
      {children}
    </PanelSyncContext.Provider>
  );
}; 
import React, { createContext, useContext, useCallback, useRef } from 'react';

// Define the event type
export interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
  timestamp: number;
}

// Define callback type
export type PanelSyncCallback = (event: PanelSyncEvent) => void;

// Define context type
interface PanelSyncContextType {
  broadcast: (type: string, payload: any, source: string) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
  isSubscribed: (callback: PanelSyncCallback) => boolean;
}

// Create context
const PanelSyncContext = createContext<PanelSyncContextType | undefined>(undefined);

// Provider component
export const PanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use ref for listeners to avoid re-renders
  const listenersRef = useRef<Set<PanelSyncCallback>>(new Set());
  
  // Broadcast event to all subscribers
  const broadcast = useCallback((type: string, payload: any, source: string) => {
    const event: PanelSyncEvent = {
      type,
      payload,
      source,
      timestamp: Date.now()
    };
    
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
    listenersRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);
  
  // Check if callback is subscribed
  const isSubscribed = useCallback((callback: PanelSyncCallback) => {
    return listenersRef.current.has(callback);
  }, []);
  
  return (
    <PanelSyncContext.Provider value={{ broadcast, subscribe, isSubscribed }}>
      {children}
    </PanelSyncContext.Provider>
  );
};

// Custom hook to use the context
export const usePanelSync = () => {
  const context = useContext(PanelSyncContext);
  if (context === undefined) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  return context;
}; 
import React, { createContext, useCallback, useContext, useRef } from 'react';

export interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
  timestamp?: number;
}

export type PanelSyncCallback = (event: PanelSyncEvent) => void;

interface PanelSyncContextType {
  broadcast: (type: string, payload: any, source: string) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
  isSubscribed?: (callback: PanelSyncCallback) => boolean;
  getEventHistory: () => PanelSyncEvent[];
}

export const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

export function usePanelSync() {
  const context = useContext(PanelSyncContext);
  
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  
  return context;
}

export const PanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use ref for listeners to avoid re-renders
  const listenersRef = useRef<PanelSyncCallback[]>([]);
  // Event history
  const eventHistoryRef = useRef<PanelSyncEvent[]>([]);
  
  // Broadcast events to all subscribers
  const broadcast = useCallback((type: string, payload: any, source: string) => {
    const event: PanelSyncEvent = {
      type,
      payload,
      source,
      timestamp: Date.now()
    };
    
    // Add to history
    eventHistoryRef.current = [event, ...eventHistoryRef.current.slice(0, 9)]; // Keep last 10 events
    
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
  
  // Check if callback is subscribed
  const isSubscribed = useCallback((callback: PanelSyncCallback) => {
    return listenersRef.current.includes(callback);
  }, []);
  
  // Get event history
  const getEventHistory = useCallback(() => {
    return [...eventHistoryRef.current];
  }, []);
  
  // Context value
  const contextValue = {
    broadcast,
    subscribe,
    isSubscribed,
    getEventHistory
  };
  
  return (
    <PanelSyncContext.Provider value={contextValue}>
      {children}
    </PanelSyncContext.Provider>
  );
}; 
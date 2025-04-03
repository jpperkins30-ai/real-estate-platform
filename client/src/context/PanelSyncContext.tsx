import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

export interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
  timestamp?: number;
}

export type PanelSyncCallback = (event: PanelSyncEvent) => void;

interface Subscription {
  id: string;
  callback: PanelSyncCallback;
  active: boolean;
}

interface PanelSyncContextType {
  broadcast: (event: Omit<PanelSyncEvent, 'timestamp'>) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
  getEventHistory: () => PanelSyncEvent[];
  clearEventHistory: () => void;
}

const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

export const usePanelSync = () => {
  const context = useContext(PanelSyncContext);
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  return context;
};

export const PanelSyncProvider: React.FC<{ 
  children: React.ReactNode,
  historyLimit?: number
}> = ({ 
  children,
  historyLimit = 100
}) => {
  // Use ref for listeners to avoid re-renders
  const subscriptionsRef = useRef<Subscription[]>([]);
  const subscriptionIdCounter = useRef<number>(0);
  const [eventHistory, setEventHistory] = useState<PanelSyncEvent[]>([]);
  
  // Broadcast events to all subscribers
  const broadcast = useCallback((event: Omit<PanelSyncEvent, 'timestamp'>) => {
    // Add timestamp to event
    const fullEvent: PanelSyncEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    // Update event history
    setEventHistory(prev => {
      const updated = [fullEvent, ...prev];
      return updated.slice(0, historyLimit);
    });
    
    // Notify all active listeners
    subscriptionsRef.current
      .filter(sub => sub.active)
      .forEach(subscription => {
        try {
          subscription.callback(fullEvent);
        } catch (error) {
          console.error('Error in panel sync listener:', error);
        }
      });
  }, [historyLimit]);
  
  // Subscribe to events
  const subscribe = useCallback((callback: PanelSyncCallback) => {
    const id = `sub_${subscriptionIdCounter.current++}`;
    
    const subscription: Subscription = {
      id,
      callback,
      active: true
    };
    
    subscriptionsRef.current.push(subscription);
    
    // Return unsubscribe function
    return () => {
      const index = subscriptionsRef.current.findIndex(sub => sub.id === id);
      if (index !== -1) {
        // Mark as inactive instead of removing to avoid array modification during iteration
        subscriptionsRef.current[index].active = false;
      }
    };
  }, []);
  
  // Get event history
  const getEventHistory = useCallback(() => {
    return [...eventHistory];
  }, [eventHistory]);
  
  // Clear event history
  const clearEventHistory = useCallback(() => {
    setEventHistory([]);
  }, []);
  
  // Provide context value
  const value = {
    broadcast,
    subscribe,
    getEventHistory,
    clearEventHistory
  };

  return (
    <PanelSyncContext.Provider value={value}>
      {children}
    </PanelSyncContext.Provider>
  );
}; 
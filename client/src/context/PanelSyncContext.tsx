import React, { createContext, useContext, ReactNode, useRef, useState } from 'react';

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

export interface PanelSyncContextType {
  broadcast: (event: Omit<PanelSyncEvent, 'timestamp'>) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
  getEventHistory: () => PanelSyncEvent[];
  clearEventHistory: () => void;
}

const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

export const usePanelSync = (): PanelSyncContextType => {
  const context = useContext(PanelSyncContext);
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  return context;
};

interface PanelSyncProviderProps {
  children: ReactNode;
  maxHistorySize?: number;
}

export const PanelSyncProvider: React.FC<PanelSyncProviderProps> = ({ 
  children,
  maxHistorySize = 100
}) => {
  const subscriptionsRef = useRef<Subscription[]>([]);
  const subscriptionIdCounter = useRef<number>(0);
  const [eventHistory, setEventHistory] = useState<PanelSyncEvent[]>([]);
  
  const broadcast = (event: Omit<PanelSyncEvent, 'timestamp'>) => {
    // Add timestamp if not present
    const fullEvent: PanelSyncEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    // Update event history
    setEventHistory(prev => {
      const newHistory = [fullEvent, ...prev];
      return newHistory.slice(0, maxHistorySize);
    });
    
    // Notify all active listeners
    subscriptionsRef.current
      .filter(sub => sub.active)
      .forEach(subscription => {
        try {
          subscription.callback(fullEvent);
        } catch (error) {
          console.error('Error in panel sync event handler:', error);
        }
      });
  };
  
  const subscribe = (callback: PanelSyncCallback) => {
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
  };
  
  const getEventHistory = () => {
    return [...eventHistory];
  };
  
  const clearEventHistory = () => {
    setEventHistory([]);
  };
  
  const contextValue: PanelSyncContextType = {
    broadcast,
    subscribe,
    getEventHistory,
    clearEventHistory
  };
  
  return (
    <PanelSyncContext.Provider value={contextValue}>
      {children}
    </PanelSyncContext.Provider>
  );
}; 
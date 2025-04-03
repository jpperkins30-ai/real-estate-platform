import { useCallback, useEffect, useRef } from 'react';

interface PanelEvent {
  type: string;
  payload: any;
  source: string;
}

type EventCallback = (event: PanelEvent) => void;

interface UsePanelSyncReturn {
  broadcast: (event: Omit<PanelEvent, 'source'>) => void;
  subscribe: (callback: EventCallback) => () => void;
}

export function usePanelSync(): UsePanelSyncReturn {
  const subscribers = useRef<Set<EventCallback>>(new Set());

  const broadcast = useCallback((event: Omit<PanelEvent, 'source'>) => {
    const fullEvent: PanelEvent = {
      ...event,
      source: 'map-panel' // This should be passed as a prop in a real implementation
    };

    subscribers.current.forEach(callback => {
      try {
        callback(fullEvent);
      } catch (error) {
        console.error('Error in panel event callback:', error);
      }
    });
  }, []);

  const subscribe = useCallback((callback: EventCallback) => {
    subscribers.current.add(callback);

    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  return { broadcast, subscribe };
} 
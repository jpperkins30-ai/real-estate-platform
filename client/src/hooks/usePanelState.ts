import { useState, useEffect, useCallback } from 'react';

interface PanelState {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  isMaximized?: boolean;
  [key: string]: any;
}

interface PanelStateOptions {
  panelId: string;
  initialState?: PanelState;
  persistState?: boolean;
  onStateChange?: (state: PanelState) => void;
}

/**
 * Hook for managing panel state with persistence capabilities
 * @param options - Configuration options
 * @returns State management methods
 */
export function usePanelState({
  panelId,
  initialState = {},
  persistState = true,
  onStateChange
}: PanelStateOptions) {
  // Initialize state, loading from localStorage if available
  const [state, setState] = useState<PanelState>(() => {
    if (persistState) {
      try {
        const savedState = localStorage.getItem(`panel-${panelId}-state`);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          
          // Call onStateChange to notify component about the restored state
          if (onStateChange) {
            setTimeout(() => onStateChange({ ...initialState, ...parsedState }), 0);
          }
          
          return { ...initialState, ...parsedState };
        }
      } catch (error) {
        console.error(`Error loading panel state for ${panelId}:`, error);
      }
    }
    return initialState;
  });

  // Save state to localStorage when it changes
  useEffect(() => {
    if (persistState) {
      try {
        localStorage.setItem(`panel-${panelId}-state`, JSON.stringify(state));
      } catch (error) {
        console.error(`Error saving panel state for ${panelId}:`, error);
      }
    }
    
    // Notify parent component about state changes
    if (onStateChange) {
      onStateChange(state);
    }
  }, [panelId, state, persistState, onStateChange]);

  // Update position
  const updatePosition = useCallback((position: { x: number; y: number }) => {
    setState(prevState => ({
      ...prevState,
      position
    }));
  }, []);

  // Update size
  const updateSize = useCallback((size: { width: number; height: number }) => {
    setState(prevState => ({
      ...prevState,
      size
    }));
  }, []);

  // Toggle maximized state
  const toggleMaximized = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isMaximized: !prevState.isMaximized
    }));
  }, []);

  // Update any property
  const updateProperty = useCallback(<T>(key: string, value: T) => {
    setState(prevState => ({
      ...prevState,
      [key]: value
    }));
  }, []);

  // Bulk update multiple properties
  const updateState = useCallback((updates: Partial<PanelState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  // Reset state to initial values
  const resetState = useCallback(() => {
    setState(initialState);
    
    if (onStateChange) {
      onStateChange(initialState);
    }
    
    if (persistState) {
      try {
        localStorage.removeItem(`panel-${panelId}-state`);
      } catch (error) {
        console.error(`Error removing panel state for ${panelId}:`, error);
      }
    }
  }, [panelId, initialState, persistState, onStateChange]);

  return {
    state,
    updatePosition,
    updateSize,
    toggleMaximized,
    updateProperty,
    updateState,
    resetState
  };
} 
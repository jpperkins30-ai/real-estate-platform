import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState, deletePanelState } from '../services/panelStateService';
import { PanelContentType } from '../types/layout.types';

export function usePanelState<T extends Record<string, any>>(
  panelId: string, 
  contentType: PanelContentType, 
  initialState: T = {} as T
): [T, (newState: Partial<T> | ((prevState: T) => T)) => void, () => void] {
  // Load saved state or use initial state with error handling
  const loadInitialState = (): T => {
    try {
      const savedState = loadPanelState(panelId);
      
      if (savedState && savedState.contentType === contentType) {
        return savedState.state as T;
      }
    } catch (error) {
      console.error(`Error loading panel state for ${panelId}:`, error);
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<T>(loadInitialState);
  
  // Update state and save changes
  const updateState = useCallback((newState: Partial<T> | ((prevState: T) => T)) => {
    setState((prev: T) => {
      try {
        // Handle functional updates
        const updatedState = typeof newState === 'function' 
          ? (newState as Function)(prev) 
          : { ...prev, ...newState };
        
        // Save the updated state
        savePanelState(panelId, contentType, updatedState);
        
        return updatedState;
      } catch (error) {
        console.error(`Error updating panel state for ${panelId}:`, error);
        return prev; // Return previous state in case of error
      }
    });
  }, [panelId, contentType]);
  
  // Reset state
  const resetState = useCallback(() => {
    setState(initialState);
    try {
      deletePanelState(panelId);
    } catch (error) {
      console.error(`Error deleting panel state for ${panelId}:`, error);
    }
  }, [panelId, initialState]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      try {
        savePanelState(panelId, contentType, state);
      } catch (error) {
        console.error(`Error saving panel state during cleanup for ${panelId}:`, error);
      }
    };
  }, [panelId, contentType, state]);
  
  // Return state, update function, and reset function
  return [state, updateState, resetState];
} 
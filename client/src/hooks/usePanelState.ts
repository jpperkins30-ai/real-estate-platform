import { useState, useCallback, useEffect, useRef } from 'react';
import { savePanelState, loadPanelState, deletePanelState } from '../services/panelStateService';
import { PanelContentType } from '../types/layout.types';

interface PanelStateOptions {
  panelId: string;
  initialState: Record<string, any>;
  contentType?: PanelContentType;
  onStateChange?: (state: Record<string, any>) => void;
  persistState?: boolean;
  persistenceKey?: string;
  sessionOnly?: boolean;
}

interface PanelStateMetadata {
  isLoading: boolean;
  hasError: boolean;
  version: number;
}

/**
 * Enhanced usePanelState hook with versioning, error handling, and storage options
 */
export function usePanelState({ 
  panelId, 
  initialState = {}, 
  contentType = 'map' as PanelContentType, // Default to 'map' which is a valid PanelContentType
  onStateChange,
  persistState = true,
  persistenceKey,
  sessionOnly = false
}: PanelStateOptions) {
  // Use provided persistenceKey or default to panelId
  const stateKey = persistenceKey || panelId;
  
  // Track version for conflict resolution
  const [version, setVersion] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const lastSavedRef = useRef<string>('');
  
  // Load saved state or use initial state with error handling
  const loadInitialState = useCallback((): Record<string, any> => {
    if (!persistState) {
      setIsLoading(false);
      return initialState;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      const savedState = loadPanelState(stateKey, sessionOnly);
      
      if (savedState) {
        // Set version from saved state or default to 1
        if (savedState.version) {
          setVersion(savedState.version);
        }
        
        // Save serialized state for comparison
        lastSavedRef.current = JSON.stringify(savedState.state);
        
        setIsLoading(false);
        // Merge with initial state to ensure all expected properties exist
        return { ...initialState, ...savedState.state };
      }
    } catch (error) {
      console.error(`Error loading panel state for ${panelId}:`, error);
      setHasError(true);
    }
    
    setIsLoading(false);
    return initialState;
  }, [panelId, initialState, persistState, stateKey, sessionOnly]);
  
  const [state, setState] = useState<Record<string, any>>(loadInitialState);
  
  // Update state and save changes with versioning
  const updateState = useCallback((newState: Record<string, any> | ((prevState: Record<string, any>) => Record<string, any>)) => {
    setState(prev => {
      try {
        // Calculate the updated state
        const updatedState = typeof newState === 'function' 
          ? (newState as Function)(prev) 
          : { ...prev, ...newState };
        
        // Only persist state if enabled
        if (persistState) {
          // Increment version
          const newVersion = version + 1;
          setVersion(newVersion);
          
          // Save the updated state with version
          savePanelState(stateKey, contentType, updatedState, newVersion, sessionOnly);
          
          // Save serialized state for comparison
          lastSavedRef.current = JSON.stringify(updatedState);
        }
        
        // Call onStateChange if provided
        if (onStateChange) {
          onStateChange(updatedState);
        }
        
        return updatedState;
      } catch (error) {
        console.error(`Error updating panel state for ${panelId}:`, error);
        setHasError(true);
        return prev;
      }
    });
  }, [panelId, contentType, persistState, stateKey, sessionOnly, version, onStateChange]);
  
  // Update position within the state
  const updatePosition = useCallback((position: { x: number; y: number }) => {
    updateState({ position });
  }, [updateState]);
  
  // Update size within the state
  const updateSize = useCallback((size: { width: number; height: number }) => {
    updateState({ size });
  }, [updateState]);
  
  // Toggle maximized state
  const toggleMaximized = useCallback(() => {
    updateState((prev) => ({ ...prev, isMaximized: !prev.isMaximized }));
  }, [updateState]);
  
  // Reset state
  const resetState = useCallback(() => {
    setState(initialState);
    
    if (persistState) {
      setVersion(1);
      
      try {
        deletePanelState(stateKey, sessionOnly);
        
        // Update saved state ref
        lastSavedRef.current = JSON.stringify(initialState);
        
        // Call onStateChange if provided
        if (onStateChange) {
          onStateChange(initialState);
        }
      } catch (error) {
        console.error(`Error deleting panel state for ${panelId}:`, error);
        setHasError(true);
      }
    }
  }, [panelId, initialState, persistState, stateKey, sessionOnly, onStateChange]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (persistState) {
        try {
          // Only save if state has changed (compare with last saved)
          const currentStateStr = JSON.stringify(state);
          
          if (currentStateStr !== lastSavedRef.current) {
            savePanelState(stateKey, contentType, state, version, sessionOnly);
          }
        } catch (error) {
          console.error(`Error saving panel state during cleanup for ${panelId}:`, error);
        }
      }
    };
  }, [panelId, state, persistState, stateKey, sessionOnly, version, contentType]);
  
  // Return state and functions as an object to match expected API
  return {
    state,
    updateState,
    updatePosition,
    updateSize,
    toggleMaximized,
    resetState,
    metadata: { 
      isLoading, 
      hasError, 
      version 
    }
  };
} 
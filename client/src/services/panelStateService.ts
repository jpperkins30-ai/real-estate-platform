import { PanelContentType } from '../types/layout.types';

export interface PanelState {
  id: string;
  contentType: PanelContentType;
  state: any;
  lastUpdated: string;
}

// Generate a standard storage key for a panel
export function getPanelStorageKey(panelId: string): string {
  return `panel-${panelId}-state`;
}

/**
 * Save panel state
 */
export function savePanelState(panelId: string, contentType: PanelContentType, state: any): PanelState {
  try {
    const panelState: PanelState = {
      id: panelId,
      contentType,
      state,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to session storage using the panel-specific key
    const storageKey = getPanelStorageKey(panelId);
    sessionStorage.setItem(storageKey, JSON.stringify(panelState));
    
    return panelState;
  } catch (error) {
    console.error('Error saving panel state:', error);
    throw error;
  }
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string): PanelState | null {
  try {
    const storageKey = getPanelStorageKey(panelId);
    const storedState = sessionStorage.getItem(storageKey);
    
    if (storedState) {
      try {
        return JSON.parse(storedState);
      } catch (error) {
        console.error('Error parsing stored panel state:', error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading panel state:', error);
    return null;
  }
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string): void {
  try {
    const storageKey = getPanelStorageKey(panelId);
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error deleting panel state:', error);
  }
}

/**
 * Update a single property in the panel state
 */
export function updatePanelProperty(
  panelId: string, 
  contentType: PanelContentType, 
  propertyName: string, 
  propertyValue: any
): PanelState | null {
  try {
    const currentState = loadPanelState(panelId);
    
    if (currentState) {
      const updatedState = {
        ...currentState.state,
        [propertyName]: propertyValue
      };
      
      return savePanelState(panelId, contentType, updatedState);
    }
    
    // If no current state, create a new one with just this property
    const newState = {
      [propertyName]: propertyValue
    };
    
    return savePanelState(panelId, contentType, newState);
  } catch (error) {
    console.error(`Error updating panel property ${propertyName}:`, error);
    return null;
  }
} 
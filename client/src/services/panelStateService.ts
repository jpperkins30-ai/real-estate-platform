import { PanelContentType } from '../types/layout.types';

export interface PanelState {
  id: string;
  contentType: PanelContentType;
  state: any;
  lastUpdated: string;
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
    
    // Save to session storage for persistence
    const storedStates = sessionStorage.getItem('panelStates');
    let states: Record<string, PanelState> = {};
    
    if (storedStates) {
      try {
        states = JSON.parse(storedStates);
      } catch (error) {
        console.error('Error parsing stored panel states:', error);
      }
    }
    
    states[panelId] = panelState;
    sessionStorage.setItem('panelStates', JSON.stringify(states));
    
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
    const storedStates = sessionStorage.getItem('panelStates');
    
    if (storedStates) {
      try {
        const states: Record<string, PanelState> = JSON.parse(storedStates);
        return states[panelId] || null;
      } catch (error) {
        console.error('Error parsing stored panel states:', error);
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
    const storedStates = sessionStorage.getItem('panelStates');
    
    if (storedStates) {
      try {
        const states: Record<string, PanelState> = JSON.parse(storedStates);
        
        if (panelId in states) {
          delete states[panelId];
          sessionStorage.setItem('panelStates', JSON.stringify(states));
        }
      } catch (error) {
        console.error('Error parsing stored panel states:', error);
      }
    }
  } catch (error) {
    console.error('Error deleting panel state:', error);
  }
} 
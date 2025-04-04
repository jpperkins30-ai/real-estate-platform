import { PanelContentType } from '../types/layout.types';

export interface PanelState {
  id: string;
  contentType: PanelContentType;
  state: any;
  lastUpdated: string;
  version?: number;
}

interface StorageBackupEntry {
  timestamp: string;
  states: Record<string, PanelState>;
}

const STORAGE_KEY_PREFIX = 'panelState';
const BACKUPS_KEY = 'panelStateBackups';
const MAX_BACKUPS = 5;

/**
 * Get storage key for a panel
 */
function getStorageKey(panelId: string): string {
  return `${STORAGE_KEY_PREFIX}_${panelId}`;
}

/**
 * Get appropriate storage object
 */
function getStorage(sessionOnly: boolean): Storage {
  return sessionOnly ? sessionStorage : localStorage;
}

/**
 * Create a backup of current panel states
 */
function createBackup(sessionOnly: boolean): void {
  try {
    const storage = getStorage(sessionOnly);
    const states: Record<string, PanelState> = {};
    
    // Collect all panel states
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      
      if (key && key.startsWith(STORAGE_KEY_PREFIX) && key !== BACKUPS_KEY) {
        try {
          const stateStr = storage.getItem(key);
          
          if (stateStr) {
            const stateData = JSON.parse(stateStr);
            const panelId = key.replace(`${STORAGE_KEY_PREFIX}_`, '');
            states[panelId] = stateData;
          }
        } catch (error) {
          console.error(`Error parsing state for backup: ${key}`, error);
        }
      }
    }
    
    // Skip if no states to backup
    if (Object.keys(states).length === 0) {
      return;
    }
    
    // Create backup entry
    const backupEntry: StorageBackupEntry = {
      timestamp: new Date().toISOString(),
      states
    };
    
    // Get existing backups
    let backups: StorageBackupEntry[] = [];
    const backupsStr = storage.getItem(BACKUPS_KEY);
    
    if (backupsStr) {
      try {
        backups = JSON.parse(backupsStr);
      } catch (error) {
        console.error('Error parsing backups', error);
      }
    }
    
    // Add new backup and limit to max backups
    backups.unshift(backupEntry);
    if (backups.length > MAX_BACKUPS) {
      backups = backups.slice(0, MAX_BACKUPS);
    }
    
    // Save backups
    storage.setItem(BACKUPS_KEY, JSON.stringify(backups));
  } catch (error) {
    console.error('Error creating panel state backup', error);
  }
}

/**
 * Save panel state with versioning and conflict detection
 */
export function savePanelState(
  panelId: string, 
  contentType: PanelContentType, 
  state: any, 
  version: number = 1,
  sessionOnly: boolean = false
): PanelState {
  try {
    // Create backup before changing state
    createBackup(sessionOnly);
    
    const storage = getStorage(sessionOnly);
    const key = getStorageKey(panelId);
    
    // Check for existing state to handle versioning
    const existingState = loadPanelState(panelId, sessionOnly);
    
    // If the existing state has a higher version, we might have a conflict
    if (existingState && existingState.version && existingState.version > version) {
      console.warn(`Panel state version conflict for ${panelId}. Existing version: ${existingState.version}, New version: ${version}`);
      
      // In this simple implementation, we'll use the higher version
      // In a real implementation, you might want to implement a more sophisticated conflict resolution strategy
      version = existingState.version + 1;
    }
    
    const panelState: PanelState = {
      id: panelId,
      contentType,
      state,
      lastUpdated: new Date().toISOString(),
      version
    };
    
    // Save to storage
    storage.setItem(key, JSON.stringify(panelState));
    
    return panelState;
  } catch (error) {
    console.error('Error saving panel state:', error);
    
    // Try fallback to the other storage if primary fails
    if (!sessionOnly) {
      try {
        return savePanelState(panelId, contentType, state, version, true);
      } catch (fallbackError) {
        console.error('Error using fallback storage for panel state:', fallbackError);
      }
    }
    
    throw error;
  }
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string, sessionOnly: boolean = false): PanelState | null {
  try {
    const storage = getStorage(sessionOnly);
    const key = getStorageKey(panelId);
    const stateStr = storage.getItem(key);
    
    if (stateStr) {
      return JSON.parse(stateStr) as PanelState;
    }
    
    // If not found in primary storage and not already trying session only, check the other storage
    if (!sessionOnly) {
      return loadPanelState(panelId, true);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading panel state:', error);
    
    // If not already trying session only, try the other storage
    if (!sessionOnly) {
      try {
        return loadPanelState(panelId, true);
      } catch (fallbackError) {
        console.error('Error using fallback storage for loading panel state:', fallbackError);
      }
    }
    
    return null;
  }
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string, sessionOnly: boolean = false): void {
  try {
    // Create backup before removing state
    createBackup(sessionOnly);
    
    const storage = getStorage(sessionOnly);
    const key = getStorageKey(panelId);
    storage.removeItem(key);
    
    // If not session only, also check session storage
    if (!sessionOnly) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error deleting panel state:', error);
  }
}

/**
 * Restore from backup
 */
export function restoreFromBackup(backupIndex: number, sessionOnly: boolean = false): boolean {
  try {
    const storage = getStorage(sessionOnly);
    const backupsStr = storage.getItem(BACKUPS_KEY);
    
    if (!backupsStr) {
      return false;
    }
    
    const backups = JSON.parse(backupsStr) as StorageBackupEntry[];
    
    if (!backups || !backups[backupIndex]) {
      return false;
    }
    
    const backup = backups[backupIndex];
    
    // Create backup of current state before restoring
    createBackup(sessionOnly);
    
    // Restore states from backup
    Object.entries(backup.states).forEach(([panelId, panelState]) => {
      const key = getStorageKey(panelId);
      storage.setItem(key, JSON.stringify(panelState));
    });
    
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return false;
  }
}

/**
 * List available backups
 */
export function listBackups(sessionOnly: boolean = false): { index: number; timestamp: string }[] {
  try {
    const storage = getStorage(sessionOnly);
    const backupsStr = storage.getItem(BACKUPS_KEY);
    
    if (!backupsStr) {
      return [];
    }
    
    const backups = JSON.parse(backupsStr) as StorageBackupEntry[];
    
    return backups.map((backup, index) => ({
      index,
      timestamp: backup.timestamp
    }));
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

/**
 * Update a single property in the panel state
 */
export function updatePanelProperty(
  panelId: string, 
  contentType: PanelContentType, 
  propertyName: string, 
  propertyValue: any,
  sessionOnly: boolean = false
): PanelState | null {
  try {
    const currentState = loadPanelState(panelId, sessionOnly);
    
    if (currentState) {
      const updatedState = {
        ...currentState.state,
        [propertyName]: propertyValue
      };
      
      // Increment version if it exists
      const newVersion = (currentState.version || 1) + 1;
      
      return savePanelState(panelId, contentType, updatedState, newVersion, sessionOnly);
    }
    
    // If no current state, create a new one with just this property
    const newState = {
      [propertyName]: propertyValue
    };
    
    return savePanelState(panelId, contentType, newState, 1, sessionOnly);
  } catch (error) {
    console.error(`Error updating panel property ${propertyName}:`, error);
    return null;
  }
}

/**
 * Check for state conflicts between local and remote versions
 */
export function hasStateConflict(
  localState: PanelState | null, 
  remoteState: PanelState | null
): boolean {
  if (!localState || !remoteState) {
    return false;
  }
  
  if (!localState.version || !remoteState.version) {
    return false;
  }
  
  return remoteState.version > localState.version;
}

/**
 * Merge states with conflict resolution
 */
export function mergeStates(
  localState: PanelState,
  remoteState: PanelState
): PanelState {
  // Use the state with the higher version as base
  const baseState = hasStateConflict(localState, remoteState) 
    ? remoteState 
    : localState;
  
  // Create a new state with the highest version number
  return {
    ...baseState,
    version: Math.max(
      localState.version || 1,
      remoteState.version || 1
    ) + 1,
    lastUpdated: new Date().toISOString()
  };
} 
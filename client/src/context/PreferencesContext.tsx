import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  fetchUserPreferences, 
  saveUserPreferences, 
  resetUserPreferences 
} from '../services/preferencesService';

// Types
export interface ThemePreferences {
  colorMode: 'light' | 'dark' | 'system';
  mapStyle: 'standard' | 'satellite' | 'terrain';
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

export interface PanelPreferences {
  defaultContentTypes: Record<string, string>;
  showPanelHeader: boolean;
  enablePanelResizing: boolean;
  enablePanelDragging: boolean;
}

export interface LayoutPreferences {
  defaultLayout: string;
  saveLayoutOnExit: boolean;
  rememberLastLayout: boolean;
}

export interface FilterPreferences {
  defaultFilters: Record<string, any>;
  showFilterPanel: boolean;
  applyFiltersAutomatically: boolean;
}

export interface UserPreferences {
  theme: ThemePreferences;
  panel: PanelPreferences;
  layout: LayoutPreferences;
  filter: FilterPreferences;
  [key: string]: any;
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: {
    colorMode: 'system',
    mapStyle: 'standard',
    accentColor: '#2196f3',
    fontSize: 'medium'
  },
  panel: {
    defaultContentTypes: {
      'top-left': 'map',
      'top-right': 'state',
      'bottom-left': 'county',
      'bottom-right': 'property'
    },
    showPanelHeader: true,
    enablePanelResizing: true,
    enablePanelDragging: true
  },
  layout: {
    defaultLayout: 'quad',
    saveLayoutOnExit: true,
    rememberLastLayout: true
  },
  filter: {
    defaultFilters: {},
    showFilterPanel: true,
    applyFiltersAutomatically: true
  }
};

// Context type
interface PreferencesContextType {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  updatePreference: <T>(category: keyof UserPreferences, key: string, value: T) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

// Create context
export const PreferencesContext = createContext<PreferencesContextType | null>(null);

// Provider component
export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userPreferences = await fetchUserPreferences();
        setPreferences(userPreferences);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading preferences:', err);
        setError('Failed to load preferences');
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Update a specific preference
  const updatePreference = useCallback(async <T extends any>(
    category: keyof UserPreferences,
    key: string,
    value: T
  ): Promise<void> => {
    try {
      // Update local state first
      setPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
      
      // Then update on server
      const updatedPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          [key]: value
        }
      };
      
      await saveUserPreferences(updatedPreferences);
    } catch (err) {
      console.error('Error updating preference:', err);
      setError('Failed to update preference');
      
      // Revert to previous state on error
      const userPreferences = await fetchUserPreferences();
      setPreferences(userPreferences);
    }
  }, [preferences]);
  
  // Reset preferences to defaults
  const resetPreferences = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      await resetUserPreferences();
      
      // Load the reset preferences from server
      const userPreferences = await fetchUserPreferences();
      setPreferences(userPreferences);
      
      setLoading(false);
    } catch (err) {
      console.error('Error resetting preferences:', err);
      setError('Failed to reset preferences');
      setLoading(false);
    }
  }, []);
  
  // Context value
  const contextValue: PreferencesContextType = {
    preferences,
    loading,
    error,
    updatePreference,
    resetPreferences
  };
  
  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}; 
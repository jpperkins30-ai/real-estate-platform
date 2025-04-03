# 🧩 Chunk 7: User Preferences & Settings

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-7-user-preferences.md

## 🎯 Objective

Implement a comprehensive user preferences system that allows users to customize their experience, including theme settings, default layouts, panel configurations, and data visualization preferences. This chunk creates the client-side components and services to interact with the preferences API.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

Create your Git branch:
```bash
git checkout main
git pull
git checkout -b feature/user-preferences
```

Required folders:
```
client/src/components/preferences/
client/src/services/preferencesService.ts
client/src/hooks/usePreferences.ts
client/src/context/PreferencesContext.tsx
```

Install necessary packages:
```bash
npm install react-colorful react-switch
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Create Preferences Context

📄 **client/src/context/PreferencesContext.tsx**
```typescript
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
```

#### 2. Create Preferences Service

📄 **client/src/services/preferencesService.ts**
```typescript
import axios from 'axios';
import { UserPreferences, DEFAULT_PREFERENCES } from '../context/PreferencesContext';

/**
 * Fetch user preferences from server
 */
export async function fetchUserPreferences(): Promise<UserPreferences> {
  try {
    const response = await axios.get('/api/user/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    
    // Return default preferences if error occurs
    return getLocalPreferences();
  }
}

/**
 * Save user preferences to server
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
  try {
    const response = await axios.put('/api/user/preferences', preferences);
    
    // Update local storage
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    return response.data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    
    // Save to local storage as fallback
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    throw error;
  }
}

/**
 * Reset user preferences to defaults
 */
export async function resetUserPreferences(): Promise<UserPreferences> {
  try {
    const response = await axios.post('/api/user/preferences/reset');
    
    // Update local storage
    localStorage.setItem('userPreferences', JSON.stringify(DEFAULT_PREFERENCES));
    
    return response.data;
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    
    // Reset local storage
    localStorage.setItem('userPreferences', JSON.stringify(DEFAULT_PREFERENCES));
    
    throw error;
  }
}

/**
 * Get preferences from local storage
 */
export function getLocalPreferences(): UserPreferences {
  const storedPreferences = localStorage.getItem('userPreferences');
  
  if (storedPreferences) {
    try {
      return JSON.parse(storedPreferences);
    } catch (error) {
      console.error('Error parsing stored preferences:', error);
    }
  }
  
  return DEFAULT_PREFERENCES;
}
```

#### 3. Create Preferences Hook

📄 **client/src/hooks/usePreferences.ts**
```typescript
import { useContext } from 'react';
import { PreferencesContext } from '../context/PreferencesContext';

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  
  return context;
};
```

#### 4. Create Preferences Components

📄 **client/src/components/preferences/PreferencesPanel.tsx**
```typescript
import React, { useState } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { ThemeSettings } from './ThemeSettings';
import { PanelSettings } from './PanelSettings';
import { LayoutSettings } from './LayoutSettings';
import { FilterSettings } from './FilterSettings';
import './PreferencesPanel.css';

interface PreferencesPanelProps {
  onClose: () => void;
}

type TabType = 'theme' | 'panels' | 'layout' | 'filters';

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ onClose }) => {
  const { loading, error, resetPreferences } = usePreferences();
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  
  // Render loading state
  if (loading) {
    return (
      <div className="preferences-panel">
        <div className="loading-spinner">Loading preferences...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="preferences-panel">
        <div className="error-message">{error}</div>
        <button className="primary-button" onClick={onClose}>Close</button>
      </div>
    );
  }
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'theme':
        return <ThemeSettings />;
      case 'panels':
        return <PanelSettings />;
      case 'layout':
        return

I'll continue with the implementation of the PreferencesPanel component and complete the remaining components for Chunk 7.

#### 4. Create Preferences Components (continued)

📄 **client/src/components/preferences/PreferencesPanel.tsx** (continued)
```typescript
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'theme':
        return <ThemeSettings />;
      case 'panels':
        return <PanelSettings />;
      case 'layout':
        return <LayoutSettings />;
      case 'filters':
        return <FilterSettings />;
      default:
        return null;
    }
  };
  
  return (
    <div className="preferences-panel">
      <div className="preferences-header">
        <h2>User Preferences</h2>
        <button className="close-button" onClick={onClose}>
          <span>×</span>
        </button>
      </div>
      
      <div className="preferences-tabs">
        <button 
          className={`tab-button ${activeTab === 'theme' ? 'active' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          Theme
        </button>
        <button 
          className={`tab-button ${activeTab === 'panels' ? 'active' : ''}`}
          onClick={() => setActiveTab('panels')}
        >
          Panels
        </button>
        <button 
          className={`tab-button ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          Layout
        </button>
        <button 
          className={`tab-button ${activeTab === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          Filters
        </button>
      </div>
      
      <div className="preferences-content">
        {renderTabContent()}
      </div>
      
      <div className="preferences-footer">
        <button className="reset-button" onClick={resetPreferences}>
          Reset to Defaults
        </button>
        <button className="primary-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
```

📄 **client/src/components/preferences/ThemeSettings.tsx**
```typescript
import React from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { HexColorPicker } from 'react-colorful';
import './ThemeSettings.css';

export const ThemeSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { colorMode, mapStyle, accentColor, fontSize } = preferences.theme;
  
  // Handle color mode change
  const handleColorModeChange = (mode: 'light' | 'dark' | 'system') => {
    updatePreference('theme', 'colorMode', mode);
  };
  
  // Handle map style change
  const handleMapStyleChange = (style: 'standard' | 'satellite' | 'terrain') => {
    updatePreference('theme', 'mapStyle', style);
  };
  
  // Handle accent color change
  const handleAccentColorChange = (color: string) => {
    updatePreference('theme', 'accentColor', color);
  };
  
  // Handle font size change
  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updatePreference('theme', 'fontSize', size);
  };
  
  return (
    <div className="theme-settings">
      <div className="settings-section">
        <h3>Color Mode</h3>
        <div className="button-group">
          <button 
            className={`mode-button ${colorMode === 'light' ? 'active' : ''}`}
            onClick={() => handleColorModeChange('light')}
          >
            Light
          </button>
          <button 
            className={`mode-button ${colorMode === 'dark' ? 'active' : ''}`}
            onClick={() => handleColorModeChange('dark')}
          >
            Dark
          </button>
          <button 
            className={`mode-button ${colorMode === 'system' ? 'active' : ''}`}
            onClick={() => handleColorModeChange('system')}
          >
            System
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Map Style</h3>
        <div className="button-group">
          <button 
            className={`style-button ${mapStyle === 'standard' ? 'active' : ''}`}
            onClick={() => handleMapStyleChange('standard')}
          >
            Standard
          </button>
          <button 
            className={`style-button ${mapStyle === 'satellite' ? 'active' : ''}`}
            onClick={() => handleMapStyleChange('satellite')}
          >
            Satellite
          </button>
          <button 
            className={`style-button ${mapStyle === 'terrain' ? 'active' : ''}`}
            onClick={() => handleMapStyleChange('terrain')}
          >
            Terrain
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Accent Color</h3>
        <div className="color-picker-container">
          <HexColorPicker color={accentColor} onChange={handleAccentColorChange} />
          <div className="color-preview" style={{ backgroundColor: accentColor }}>
            <span>{accentColor}</span>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Font Size</h3>
        <div className="button-group">
          <button 
            className={`size-button ${fontSize === 'small' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('small')}
          >
            Small
          </button>
          <button 
            className={`size-button ${fontSize === 'medium' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('medium')}
          >
            Medium
          </button>
          <button 
            className={`size-button ${fontSize === 'large' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('large')}
          >
            Large
          </button>
        </div>
      </div>
    </div>
  );
};
```

📄 **client/src/components/preferences/PanelSettings.tsx**
```typescript
import React from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import Switch from 'react-switch';
import './PanelSettings.css';

export const PanelSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { defaultContentTypes, showPanelHeader, enablePanelResizing, enablePanelDragging } = preferences.panel;
  
  // Handle panel content type change
  const handleContentTypeChange = (position: string, contentType: string) => {
    const newDefaultContentTypes = {
      ...defaultContentTypes,
      [position]: contentType
    };
    
    updatePreference('panel', 'defaultContentTypes', newDefaultContentTypes);
  };
  
  // Handle toggle settings
  const handleToggleSetting = (key: string, value: boolean) => {
    updatePreference('panel', key, value);
  };
  
  // Available content types
  const contentTypes = [
    { value: 'map', label: 'Map' },
    { value: 'state', label: 'State' },
    { value: 'county', label: 'County' },
    { value: 'property', label: 'Property' },
    { value: 'filter', label: 'Filter' },
    { value: 'stats', label: 'Statistics' },
    { value: 'chart', label: 'Chart' }
  ];
  
  return (
    <div className="panel-settings">
      <div className="settings-section">
        <h3>Default Panel Content Types</h3>
        <p>Select the default content type for each panel position in quad layout</p>
        
        <div className="content-type-grid">
          <div className="grid-cell top-left">
            <label>Top Left</label>
            <select 
              value={defaultContentTypes['top-left'] || 'map'} 
              onChange={(e) => handleContentTypeChange('top-left', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-cell top-right">
            <label>Top Right</label>
            <select 
              value={defaultContentTypes['top-right'] || 'state'} 
              onChange={(e) => handleContentTypeChange('top-right', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-cell bottom-left">
            <label>Bottom Left</label>
            <select 
              value={defaultContentTypes['bottom-left'] || 'county'} 
              onChange={(e) => handleContentTypeChange('bottom-left', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-cell bottom-right">
            <label>Bottom Right</label>
            <select 
              value={defaultContentTypes['bottom-right'] || 'property'} 
              onChange={(e) => handleContentTypeChange('bottom-right', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Panel Display Options</h3>
        
        <div className="toggle-option">
          <label>Show Panel Headers</label>
          <Switch 
            checked={showPanelHeader} 
            onChange={(checked) => handleToggleSetting('showPanelHeader', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
        </div>
        
        <div className="toggle-option">
          <label>Enable Panel Resizing</label>
          <Switch 
            checked={enablePanelResizing} 
            onChange={(checked) => handleToggleSetting('enablePanelResizing', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
        </div>
        
        <div className="toggle-option">
          <label>Enable Panel Dragging</label>
          <Switch 
            checked={enablePanelDragging} 
            onChange={(checked) => handleToggleSetting('enablePanelDragging', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
        </div>
      </div>
    </div>
  );
};
```

📄 **client/src/components/preferences/LayoutSettings.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { fetchLayouts } from '../../services/layoutService';
import Switch from 'react-switch';
import './LayoutSettings.css';

export const LayoutSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { defaultLayout, saveLayoutOnExit, rememberLastLayout } = preferences.layout;
  
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch available layouts on mount
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userLayouts = await fetchLayouts(true); // Include public layouts
        setLayouts(userLayouts);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading layouts:', err);
        setError('Failed to load layouts');
        setLoading(false);
      }
    };
    
    loadLayouts();
  }, []);
  
  // Handle default layout change
  const handleDefaultLayoutChange = (layoutId: string) => {
    updatePreference('layout', 'defaultLayout', layoutId);
  };
  
  // Handle toggle settings
  const handleToggleSetting = (key: string, value: boolean) => {
    updatePreference('layout', key, value);
  };
  
  // Render loading state
  if (loading) {
    return <div className="loading-spinner">Loading layouts...</div>;
  }
  
  // Render error state
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="layout-settings">
      <div className="settings-section">
        <h3>Default Layout</h3>
        
        {layouts.length === 0 ? (
          <p>No saved layouts available. Create and save a layout first.</p>
        ) : (
          <div className="layout-selector">
            <select 
              value={defaultLayout} 
              onChange={(e) => handleDefaultLayoutChange(e.target.value)}
            >
              <option value="">-- Select a default layout --</option>
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>{layout.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="settings-section">
        <h3>Layout Behavior</h3>
        
        <div className="toggle-option">
          <label>Save Layout on Exit</label>
          <Switch 
            checked={saveLayoutOnExit} 
            onChange={(checked) => handleToggleSetting('saveLayoutOnExit', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Automatically save the current layout when you exit the application
          </p>
        </div>
        
        <div className="toggle-option">
          <label>Remember Last Layout</label>
          <Switch 
            checked={rememberLastLayout} 
            onChange={(checked) => handleToggleSetting('rememberLastLayout', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Start with the last used layout instead of the default layout
          </p>
        </div>
      </div>
    </div>
  );
};
```

📄 **client/src/components/preferences/FilterSettings.tsx**
```typescript
import React from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import Switch from 'react-switch';
import './FilterSettings.css';

export const FilterSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { showFilterPanel, applyFiltersAutomatically } = preferences.filter;
  
  // Handle toggle settings
  const handleToggleSetting = (key: string, value: boolean) => {
    updatePreference('filter', key, value);
  };
  
  return (
    <div className="filter-settings">
      <div className="settings-section">
        <h3>Filter Panel</h3>
        
        <div className="toggle-option">
          <label>Show Filter Panel</label>
          <Switch 
            checked={showFilterPanel} 
            onChange={(checked) => handleToggleSetting('showFilterPanel', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Show the filter panel in layouts by default
          </p>
        </div>
        
        <div className="toggle-option">
          <label>Apply Filters Automatically</label>
          <Switch 
            checked={applyFiltersAutomatically} 
            onChange={(checked) => handleToggleSetting('applyFiltersAutomatically', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Apply filters as soon as they are changed (without clicking Apply button)
          </p>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Default Filters</h3>
        <p>Default filters will be applied when you open a new session</p>
        
        <div className="default-filters">
          <p>No default filters configured.</p>
          <button className="secondary-button">Configure Default Filters</button>
        </div>
      </div>
    </div>
  );
};
```

#### 5. Create CSS Files for Preferences Components

📄 **client/src/components/preferences/PreferencesPanel.css**
```css
.preferences-panel {
  width: 600px;
  max-width: 90vw;
  height: 500px;
  max-height: 90vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.preferences-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.preferences-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
}

.tab-button.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
}

.tab-button:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.02);
}

.preferences-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.preferences-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
}

.reset-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.reset-button:hover {
  background-color: #e0e0e0;
}

.primary-button {
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.primary-button:hover {
  background-color: #1976d2;
}

.loading-spinner,
.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: #666;
}

.error-message {
  color: #f44336;
  flex-direction: column;
}

.error-message button {
  margin-top: 16px;
}
```

📄 **client/src/components/preferences/ThemeSettings.css**
```css
.theme-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.button-group {
  display: flex;
  gap: 8px;
}

.mode-button,
.style-button,
.size-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.mode-button:hover,
.style-button:hover,
.size-button:hover {
  background-color: #e0e0e0;
}

.mode-button.active,
.style-button.active,
.size-button.active {
  background-color: #2196f3;
  color: white;
  border-color: #2196f3;
}

.color-picker-container {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.color-preview {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
}
```

📄 **client/src/components/preferences/PanelSettings.css**
```css
.panel-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.settings-section p {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: #666;
}

.content-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.grid-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grid-cell label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}

.grid-cell select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-option label {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
}
```

📄 **client/src/components/preferences/LayoutSettings.css**
```css
.layout-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.layout-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

.toggle-option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-option label {
  width: 200px;
  font-size: 0.9rem;
  color: #333;
}

.option-description {
  width: 100%;
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #666;
  padding-left: 200px;
}
```

📄 **client/src/components/preferences/FilterSettings.css**
```css
.filter-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.settings-section p {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: #666;
}

.toggle-option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}

.toggle-option label {
  width: 200px;
  font-size: 0.9rem;
  color: #333;
}

.option-description {
  width: 100%;
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #666;
  padding-left: 200px;
}

.default-filters {
  background-color: #f9f9f9;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
}

.default-filters p {
  margin-bottom: 12px;
}

.secondary-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.secondary-button:hover {
  background-color: #e0e0e0;
}
```

#### 6. Implement Theme Provider

📄 **client/src/context/ThemeContext.tsx**
```typescript
import React, { createContext, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';

interface ThemeContextType {
  applyTheme: (element: HTMLElement) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = usePreferences();
  const { colorMode, accentColor, fontSize } = preferences.theme;
  
  // Apply theme to root element when preferences change
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color mode
    if (colorMode === 'dark') {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else if (colorMode === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    } else {
      // System preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDarkMode) {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      } else {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
      }
    }
    
    // Apply accent color
    root.style.setProperty('--accent-color', accentColor);
    
    // Apply font size
    root.style.setProperty('--base-font-size', {
      small: '14px',
      medium: '16px',
      large: '18px'
    }[fontSize]);
    
  }, [colorMode, accentColor, fontSize]);
  
  // Helper function to apply theme to any element
  const applyTheme = (element: HTMLElement) => {
    // Apply theme variables to the element
    element.style.setProperty('--accent-color', accentColor);
    element.style.setProperty('--base-font-size', {
      small: '14px',
      medium: '16px',
      large: '18px'
    }[fontSize]);
  };
  
  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 7. Create Theme CSS Variables

📄 **client/src/styles/theme.css**
```css
:root {
  /* Base colors */
  --primary-color: #2196f3;
  --accent-color: #2196f3;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --danger-color: #f44336;
  
  /* Typography */
  --base-font-size: 16px;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  
  /* Light mode colors */
  --background-color: #f5f5f5;
  --surface-color: #ffffff;
  --text-color: #333333;
  --text-secondary-color: #666666;
  --border-color: #e0e0e0;
  --hover-color: rgba(0, 0, 0, 0.05);
  
  /* Sizing */
  --border-radius: 4px;
  --panel-border-radius: 4px;
  --panel-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Dark mode theme */
.dark-mode {
  I'll complete the Chunk 7 document by adding the remaining code and ensuring it follows the template format like Chunk 1. I'll make sure the client object is properly built and address the implementation recommendations.

Let me continue from where the document currently ends and complete it:

```css
.dark-mode {
  --background-color: #121212;
  --surface-color: #1e1e1e;
  --text-color: #e0e0e0;
  --text-secondary-color: #a0a0a0;
  --border-color: #333333;
  --hover-color: rgba(255, 255, 255, 0.05);
  --panel-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Font sizes */
html {
  font-size: var(--base-font-size);
}

body {
  font-family: var(--font-family);
  background-color: var(--background-color);
  color: var(--text-color);
  margin: 0;
  padding: 0;
}
```

#### 8. Create a Preferences Button Component

📄 **client/src/components/preferences/PreferencesButton.tsx**
```typescript
import React, { useState } from 'react';
import { PreferencesPanel } from './PreferencesPanel';
import { createPortal } from 'react-dom';
import './PreferencesButton.css';

export const PreferencesButton: React.FC = () => {
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  
  const togglePreferences = () => {
    setShowPreferences(prev => !prev);
  };
  
  return (
    <>
      <button 
        className="preferences-button"
        onClick={togglePreferences}
        aria-label="Open preferences"
      >
        <span className="gear-icon"></span>
      </button>
      
      {showPreferences && createPortal(
        <div className="preferences-overlay">
          <PreferencesPanel onClose={() => setShowPreferences(false)} />
        </div>,
        document.body
      )}
    </>
  );
};
```

📄 **client/src/components/preferences/PreferencesButton.css**
```css
.preferences-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.preferences-button:hover {
  background-color: var(--primary-color-dark, #1976d2);
}

.gear-icon {
  width: 20px;
  height: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.preferences-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
```

#### 9. Create Default Layouts Configuration

📄 **client/src/config/defaultLayouts.ts**
```typescript
import { LayoutConfig } from '../types/layout.types';

export const defaultLayouts: LayoutConfig[] = [
  {
    id: 'default-single',
    name: 'Single Panel View',
    description: 'Simple view with a full map',
    type: 'single',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 100, height: 100 }
      }
    ],
    isDefault: true,
    isPublic: true
  },
  {
    id: 'default-dual-map-property',
    name: 'Map & Property View',
    description: 'Dual panel layout with map and property details',
    type: 'dual',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 60, height: 100 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 0, col: 1 },
        size: { width: 40, height: 100 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-tri-analysis',
    name: 'Analysis View',
    description: 'Three panel layout for data analysis',
    type: 'tri',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Filters',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 1, col: 0 },
        size: { width: 100, height: 40 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-quad-full',
    name: 'Complete Analysis View',
    description: 'Full analysis dashboard with all panel types',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'state',
        contentType: 'state',
        title: 'State Information',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'county',
        contentType: 'county',
        title: 'County Details',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Properties',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-property-scout',
    name: 'Property Scout View',
    description: 'Optimized for property browsing and evaluation',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'Property Map',
        position: { row: 0, col: 0 },
        size: { width: 70, height: 70 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Search Filters',
        position: { row: 0, col: 1 },
        size: { width: 30, height: 70 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 1, col: 0 },
        size: { width: 70, height: 30 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Market Stats',
        position: { row: 1, col: 1 },
        size: { width: 30, height: 30 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-market-analyst',
    name: 'Market Analyst View',
    description: 'Advanced view for market analysis and trends',
    type: 'quad',
    panels: [
      {
        id: 'chart',
        contentType: 'chart',
        title: 'Market Trends',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'map',
        contentType: 'map',
        title: 'Geographic View',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Analysis Filters',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ],
    isPublic: true
  }
];

// Function to initialize default layouts in the system
export async function initializeDefaultLayouts(layoutService: any): Promise<void> {
  try {
    // Fetch existing layouts first to avoid duplicates
    const existingLayouts = await layoutService.fetchLayouts(true);
    
    // Check for each default layout
    for (const defaultLayout of defaultLayouts) {
      // Check if this default layout already exists
      const exists = existingLayouts.some(layout => layout.id === defaultLayout.id);
      
      if (!exists) {
        // Create the default layout
        await layoutService.saveLayout(defaultLayout);
      }
    }
    
    console.log('Default layouts initialized successfully');
  } catch (error) {
    console.error('Error initializing default layouts:', error);
  }
}
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing

1. Create tests for Preferences Context

📄 **client/src/__tests__/context/PreferencesContext.test.tsx**
```typescript
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { PreferencesProvider, PreferencesContext } from '../../context/PreferencesContext';
import * as preferencesService from '../../services/preferencesService';

// Mock preferences service
jest.mock('../../services/preferencesService', () => ({
  fetchUserPreferences: jest.fn(),
  saveUserPreferences: jest.fn(),
  resetUserPreferences: jest.fn()
}));

// Test component to consume context
const TestConsumer = () => {
  const { preferences, loading, error, updatePreference } = React.useContext(PreferencesContext);
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <>
          <div data-testid="color-mode">{preferences.theme.colorMode}</div>
          <button 
            onClick={() => updatePreference('theme', 'colorMode', 'dark')}
            data-testid="update-button"
          >
            Update Theme
          </button>
        </>
      )}
    </div>
  );
};

describe('PreferencesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('loads preferences on mount', async () => {
    // Mock fetch response
    (preferencesService.fetchUserPreferences as jest.Mock).mockResolvedValue({
      theme: { colorMode: 'light', mapStyle: 'standard' },
      panel: { showPanelHeader: true },
      layout: { defaultLayout: 'quad' },
      filter: { showFilterPanel: true }
    });
    
    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );
    
    // Should show loading first
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
    expect(preferencesService.fetchUserPreferences).toHaveBeenCalledTimes(1);
  });
  
  test('updates preference', async () => {
    // Mock fetch and save responses
    (preferencesService.fetchUserPreferences as jest.Mock).mockResolvedValue({
      theme: { colorMode: 'light', mapStyle: 'standard' },
      panel: { showPanelHeader: true },
      layout: { defaultLayout: 'quad' },
      filter: { showFilterPanel: true }
    });
    
    (preferencesService.saveUserPreferences as jest.Mock).mockResolvedValue({
      theme: { colorMode: 'dark', mapStyle: 'standard' },
      panel: { showPanelHeader: true },
      layout: { defaultLayout: 'quad' },
      filter: { showFilterPanel: true }
    });
    
    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toBeInTheDocument();
    });
    
    // Verify initial value
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
    
    // Update preference
    act(() => {
      screen.getByTestId('update-button').click();
    });
    
    // Wait for update to complete
    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
    });
    
    expect(preferencesService.saveUserPreferences).toHaveBeenCalledTimes(1);
  });
});
```

2. Create tests for Preferences Components

📄 **client/src/__tests__/components/preferences/ThemeSettings.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSettings } from '../../../components/preferences/ThemeSettings';
import { PreferencesContext } from '../../../context/PreferencesContext';

// Mock preferences context
const mockUpdatePreference = jest.fn();
const mockPreferences = {
  theme: {
    colorMode: 'light',
    mapStyle: 'standard',
    accentColor: '#2196f3',
    fontSize: 'medium'
  },
  panel: {
    defaultContentTypes: {},
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

const mockContextValue = {
  preferences: mockPreferences,
  loading: false,
  error: null,
  updatePreference: mockUpdatePreference,
  resetPreferences: jest.fn()
};

const renderWithContext = (ui) => {
  return render(
    <PreferencesContext.Provider value={mockContextValue}>
      {ui}
    </PreferencesContext.Provider>
  );
};

describe('ThemeSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders color mode options', () => {
    renderWithContext(<ThemeSettings />);
    
    expect(screen.getByText('Color Mode')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });
  
  test('renders map style options', () => {
    renderWithContext(<ThemeSettings />);
    
    expect(screen.getByText('Map Style')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Satellite')).toBeInTheDocument();
    expect(screen.getByText('Terrain')).toBeInTheDocument();
  });
  
  test('renders font size options', () => {
    renderWithContext(<ThemeSettings />);
    
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
  });
  
  test('updates color mode when clicked', () => {
    renderWithContext(<ThemeSettings />);
    
    // Click dark mode button
    fireEvent.click(screen.getByText('Dark'));
    
    expect(mockUpdatePreference).toHaveBeenCalledWith('theme', 'colorMode', 'dark');
  });
  
  test('updates map style when clicked', () => {
    renderWithContext(<ThemeSettings />);
    
    // Click satellite style button
    fireEvent.click(screen.getByText('Satellite'));
    
    expect(mockUpdatePreference).toHaveBeenCalledWith('theme', 'mapStyle', 'satellite');
  });
  
  test('updates font size when clicked', () => {
    renderWithContext(<ThemeSettings />);
    
    // Click large font size button
    fireEvent.click(screen.getByText('Large'));
    
    expect(mockUpdatePreference).toHaveBeenCalledWith('theme', 'fontSize', 'large');
  });
});
```

#### ✅ Commit your changes

```bash
git add .
git commit -m "Chunk 7: Implement user preferences and settings"
git push origin feature/user-preferences
```

#### 🔃 Create a Pull Request

1. Go to your repository on GitHub
2. Click on "Pull requests" > "New pull request"
3. Select your branch `feature/user-preferences`
4. Add a title: "Implement User Preferences and Settings"
5. Add a description referencing this markdown doc
6. Add screenshots of preferences UI
7. Request review from team members

#### 📝 Update Documentation

Create a new documentation file:
📄 **docs/components/multi-frame/chunk-7-user-preferences.md**

Include the following content:
- Overview of the preferences system
- Description of each preferences category (theme, panel, layout, filter)
- Instructions for using the preferences components
- How to extend the preferences system with new settings
- Screenshots of the preferences UI

#### 🔗 Integration Targets

- This chunk integrates with all other components through the theme system
- Affects the MultiFrameContainer from Chunk 1
- Enhances the Layout Persistence from Chunk 4
- Configures Panel behavior from Chunks 2 and 5

#### 📋 Completion Log

- [ ] Preferences context implementation complete
- [ ] Preferences service implementation complete
- [ ] Theme provider implementation complete
- [ ] Preferences components implementation complete
- [ ] Default layouts configuration complete
- [ ] Theme CSS variables implementation complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Pull request created

## 📈 Implementation References

### Example Usage

```typescript
import { PreferencesProvider } from './context/PreferencesContext';
import { ThemeProvider } from './context/ThemeContext';
import { MultiFrameContainer } from './components/multiframe/MultiFrameContainer';
import { PreferencesButton } from './components/preferences/PreferencesButton';
import './styles/theme.css';

function App() {
  return (
    <PreferencesProvider>
      <ThemeProvider>
        <div className="app">
          <MultiFrameContainer
            initialLayout="quad"
            defaultPanelContent={{
              'top-left': 'map',
              'top-right': 'state',
              'bottom-left': 'county',
              'bottom-right': 'property'
            }}
          />
          <PreferencesButton />
        </div>
      </ThemeProvider>
    </PreferencesProvider>
  );
}
```

### Visual Structure

```
┌─────────────────────────────────────────────────────┐
│ PreferencesPanel                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Preferences Header                              │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Preferences Tabs                                │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                │ │
│ │ │Theme│ │Panel│ │Layout│ │Filter│                │ │
│ │ └─────┘ └─────┘ └─────┘ └─────┘                │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Tab Content                                     │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Settings Sections                           │ │ │
│ │ │ ┌─────────────────────────────────────────┐ │ │ │
│ │ │ │ Color Mode / Map Style / Font Size      │ │ │ │
│ │ │ └─────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Footer Actions                                  │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Personas and Layout Presets

| Persona | Default Layout | Description |
|---------|---------------|-------------|
| General User | Single Panel View | Simple view with full map |
| Property Scout | Map & Property View | Focus on browsing properties |
| Market Analyst | Analysis View | Data analysis with charts and stats |
| Administrator | Complete Analysis View | Full dashboard with all panels |
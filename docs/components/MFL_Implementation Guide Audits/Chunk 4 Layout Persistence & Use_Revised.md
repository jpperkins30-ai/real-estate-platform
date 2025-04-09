# 🧩 Chunk 4: Layout Persistence & User Preferences (Revised)

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-4-layout-persistence.md

## 🎯 Objective

Implement layout persistence and user preferences to allow users to save, load, and manage layout configurations. This will enable users to create customized layouts tailored to specific tasks and switch between them seamlessly. The implementation will support both local storage for quick access and server-side persistence through MongoDB for cross-device usage.

This chunk builds on the core layout system and filter capabilities from previous chunks, adding the ability to preserve state between sessions.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

Create your Git branch:
```bash
git checkout main
git pull
git checkout -b feature/layout-persistence
```

Required folders:
```
client/src/services/
client/src/components/multiframe/preferences/
client/src/types/
client/src/hooks/
```

Install necessary packages (if not installed):
```bash
npm install axios
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Extend Layout Types for Persistence

📄 **client/src/types/layout.types.ts**
```typescript
// Add to existing layout.types.ts file

export interface SavedLayout extends LayoutConfig {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutSaveRequest {
  name: string;
  description?: string;
  type: LayoutType;
  panels

export interface LayoutSaveRequest {
  name: string;
  description?: string;
  type: LayoutType;
  panels: PanelConfig[];
  isDefault?: boolean;
  isPublic?: boolean;
}
```

#### 2. Create Layout Service

📄 **client/src/services/layoutService.ts**
```typescript
import axios from 'axios';
import { LayoutConfig, SavedLayout, LayoutSaveRequest } from '../types/layout.types';

const API_URL = '/api/layouts';

/**
 * Fetch all layout configurations for the current user
 */
export async function fetchLayouts(includePublic = false): Promise<SavedLayout[]> {
  try {
    const response = await axios.get(API_URL, {
      params: { isPublic: includePublic }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching layouts:', error);
    throw error;
  }
}

/**
 * Fetch a specific layout configuration
 */
export async function fetchLayout(layoutId: string): Promise<SavedLayout> {
  try {
    const response = await axios.get(`${API_URL}/${layoutId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Save a layout configuration
 */
export async function saveLayout(layout: LayoutSaveRequest): Promise<SavedLayout> {
  try {
    const response = await axios.post(API_URL, layout);
    return response.data;
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}

/**
 * Update a layout configuration
 */
export async function updateLayout(layoutId: string, layout: Partial<LayoutSaveRequest>): Promise<SavedLayout> {
  try {
    const response = await axios.put(`${API_URL}/${layoutId}`, layout);
    return response.data;
  } catch (error) {
    console.error(`Error updating layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Delete a layout configuration
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/${layoutId}`);
  } catch (error) {
    console.error(`Error deleting layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Clone a layout configuration
 */
export async function cloneLayout(layoutId: string, name: string): Promise<SavedLayout> {
  try {
    const response = await axios.post(`${API_URL}/${layoutId}/clone`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error cloning layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Save layout to local storage (fallback or offline use)
 */
export function saveLayoutToStorage(layout: LayoutConfig): void {
  try {
    // Get existing layouts
    const storedLayouts = localStorage.getItem('layouts');
    let layouts: LayoutConfig[] = [];
    
    if (storedLayouts) {
      try {
        layouts = JSON.parse(storedLayouts);
      } catch (error) {
        console.error('Error parsing stored layouts:', error);
      }
    }
    
    // Add/update layout
    const existingIndex = layouts.findIndex(l => l.id === layout.id);
    
    if (existingIndex >= 0) {
      layouts[existingIndex] = layout;
    } else {
      // Generate a local ID if none exists
      if (!layout.id) {
        layout.id = `local-${Date.now()}`;
      }
      
      layouts.push(layout);
    }
    
    // Save updated layouts
    localStorage.setItem('layouts', JSON.stringify(layouts));
  } catch (error) {
    console.error('Error saving layout to storage:', error);
  }
}

/**
 * Load layouts from local storage
 */
export function loadLayoutsFromStorage(): LayoutConfig[] {
  try {
    const storedLayouts = localStorage.getItem('layouts');
    
    if (storedLayouts) {
      return JSON.parse(storedLayouts);
    }
  } catch (error) {
    console.error('Error parsing stored layouts:', error);
  }
  
  return [];
}
```

#### 3. Create User Preferences Types

📄 **client/src/types/preferences.types.ts**
```typescript
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
```

#### 4. Create User Preferences Service

📄 **client/src/services/preferencesService.ts**
```typescript
import axios from 'axios';
import { UserPreferences } from '../types/preferences.types';

/**
 * Default user preferences
 */
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
      'top-right': 'property',
      'bottom-left': 'filter',
      'bottom-right': 'stats'
    },
    showPanelHeader: true,
    enablePanelResizing: true,
    enablePanelDragging: true
  },
  layout: {
    defaultLayout: 'single',
    saveLayoutOnExit: true,
    rememberLastLayout: true
  },
  filter: {
    defaultFilters: {},
    showFilterPanel: true,
    applyFiltersAutomatically: true
  }
};

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
  try {
    const storedPreferences = localStorage.getItem('userPreferences');
    
    if (storedPreferences) {
      return JSON.parse(storedPreferences);
    }
  } catch (error) {
    console.error('Error parsing stored preferences:', error);
  }
  
  return DEFAULT_PREFERENCES;
}

/**
 * Update a specific preference
 */
export async function updatePreference<T>(
  category: keyof UserPreferences,
  key: string,
  value: T
): Promise<UserPreferences> {
  // Get current preferences
  const preferences = getLocalPreferences();
  
  // Update the specific preference
  preferences[category] = {
    ...preferences[category],
    [key]: value
  };
  
  // Save updated preferences
  return saveUserPreferences(preferences);
}
```

#### 5. Create Layout Manager Component

📄 **client/src/components/multiframe/preferences/LayoutManager.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import { fetchLayouts, saveLayout, deleteLayout, cloneLayout } from '../../../services/layoutService';
import { LayoutConfig, LayoutType } from '../../../types/layout.types';
import './LayoutManager.css';

interface LayoutManagerProps {
  currentLayout: LayoutConfig | null;
  onLayoutSelect: (layout: LayoutConfig) => void;
  onLayoutChange: (layout: LayoutConfig) => void;
  onClose: () => void;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({
  currentLayout,
  onLayoutSelect,
  onLayoutChange,
  onClose
}) => {
  // State
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newLayoutName, setNewLayoutName] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedLayout, setEditedLayout] = useState<LayoutConfig | null>(null);
  
  // Load layouts on mount
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const layouts = await fetchLayouts(true);
        setLayouts(layouts);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading layouts:', error);
        setError('Failed to load layouts');
        setLoading(false);
      }
    };
    
    loadLayouts();
  }, []);
  
  // Handle layout selection
  const handleSelectLayout = (layout: LayoutConfig) => {
    onLayoutSelect(layout);
  };
  
  // Handle layout save
  const handleSaveLayout = async () => {
    if (!currentLayout) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const savedLayout = await saveLayout(currentLayout);
      
      // Update layouts list
      setLayouts(prevLayouts => {
        const index = prevLayouts.findIndex(l => l.id === savedLayout.id);
        
        if (index >= 0) {
          return [
            ...prevLayouts.slice(0, index),
            savedLayout,
            ...prevLayouts.slice(index + 1)
          ];
        }
        
        return [...prevLayouts, savedLayout];
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error saving layout:', error);
      setError('Failed to save layout');
      setLoading(false);
    }
  };
  
  // Handle layout delete
  const handleDeleteLayout = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteLayout(id);
      
      // Update layouts list
      setLayouts(prevLayouts => prevLayouts.filter(layout => layout.id !== id));
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting layout:', error);
      setError('Failed to delete layout');
      setLoading(false);
    }
  };
  
  // Handle layout clone
  const handleCloneLayout = async (id: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const clonedLayout = await cloneLayout(id, name);
      
      // Update layouts list
      setLayouts(prevLayouts => [...prevLayouts, clonedLayout]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error cloning layout:', error);
      setError('Failed to clone layout');
      setLoading(false);
    }
  };
  
  // Handle create new layout
  const handleCreateLayout = () => {
    if (!newLayoutName.trim()) return;
    
    const newLayout: LayoutConfig = {
      name: newLayoutName,
      description: 'Created from current layout',
      type: currentLayout?.type || 'single',
      panels: currentLayout?.panels || []
    };
    
    // Save the new layout
    onLayoutChange(newLayout);
    
    // Reset state
    setNewLayoutName('');
    setIsCreating(false);
  };
  
  // Handle edit layout
  const handleStartEdit = (layout: LayoutConfig) => {
    setEditedLayout({ ...layout });
    setIsEditing(true);
  };
  
  // Handle save edited layout
  const handleSaveEdit = async () => {
    if (!editedLayout) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const savedLayout = await saveLayout(editedLayout);
      
      // Update layouts list
      setLayouts(prevLayouts => {
        const index = prevLayouts.findIndex(l => l.id === savedLayout.id);
        
        if (index >= 0) {
          return [
            ...prevLayouts.slice(0, index),
            savedLayout,
            ...prevLayouts.slice(index + 1)
          ];
        }
        
        return [...prevLayouts, savedLayout];
      });
      
      // Reset state
      setEditedLayout(null);
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving edited layout:', error);
      setError('Failed to save layout');
      setLoading(false);
    }
  };
  
  // Render layout list
  const renderLayoutList = () => {
    if (loading) {
      return <div className="loading">Loading layouts...</div>;
    }
    
    if (error) {
      return <div className="error">{error}</div>;
    }
    
    if (layouts.length === 0) {
      return <div className="message">No saved layouts</div>;
    }
    
    return (
      <div className="layout-list" data-testid="layout-list">
        {layouts.map(layout => (
          <div 
            key={layout.id}
            className={`layout-item ${currentLayout?.id === layout.id ? 'selected' : ''}`}
            data-testid={`layout-item-${layout.id}`}
          >
            <div className="layout-info">
              <h4 className="layout-name">{layout.name}</h4>
              {layout.description && (
                <p className="layout-description">{layout.description}</p>
              )}
              <div className="layout-meta">
                <span className="layout-type">{layout.type}</span>
                {layout.isDefault && (
                  <span className="layout-default">Default</span>
                )}
              </div>
            </div>
            <div className="layout-actions">
              <button
                className="layout-button"
                onClick={() => handleSelectLayout(layout)}
              >
                Load
              </button>
              <button
                className="layout-button"
                onClick={() => handleStartEdit(layout)}
              >
                Edit
              </button>
              <button
                className="layout-button"
                onClick={() => handleCloneLayout(layout.id!, `Copy of ${layout.name}`)}
              >
                Clone
              </button>
              <button
                className="layout-button delete-button"
                onClick={() => handleDeleteLayout(layout.id!)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="layout-manager" data-testid="layout-manager">
      <div className="header">
        <h3>Layout Manager</h3>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close layout manager"
        >
          <span>×</span>
        </button>
      </div>
      
      <div className="content">
        <div className="actions">
          <button
            className="action-button"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            Create New Layout
          </button>
          <button
            className="action-button"
            onClick={handleSaveLayout}
            disabled={!currentLayout}
          >
            Save Current Layout
          </button>
        </div>
        
        {isCreating && (
          <div className="create-form">
            <input
              type="text"
              className="input"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Enter layout name"
              data-testid="new-layout-name-input"
            />
            <div className="form-actions">
              <button
                className="form-button"
                onClick={handleCreateLayout}
                data-testid="create-layout-button"
              >
                Create
              </button>
              <button
                className="form-button cancel-button"
                onClick={() => {
                  setNewLayoutName('');
                  setIsCreating(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {isEditing && editedLayout && (
          <div className="edit-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="input"
                value={editedLayout.name}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="textarea"
                value={editedLayout.description || ''}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className="form-group">
              <label>Default</label>
              <input
                type="checkbox"
                checked={editedLayout.isDefault || false}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, isDefault: e.target.checked } : null)}
              />
            </div>
            <div className="form-actions">
              <button
                className="form-button"
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button
                className="form-button cancel-button"
                onClick={() => {
                  setEditedLayout(null);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="layouts">
          <h4>Saved Layouts</h4>
          {renderLayoutList()}
        </div>
      </div>
    </div>
  );
};
```

#### 6. Create Layout Selector Component

📄 **client/src/components/multiframe/preferences/LayoutSelector.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import { fetchLayouts } from '../../../services/layoutService';
import { LayoutConfig } from '../../../types/layout.types';
import './LayoutSelector.css';

interface LayoutSelectorProps {
  onSelect: (layout: LayoutConfig) => void;
  onManage: () => void;
  currentLayoutId?: string;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  onSelect,
  onManage,
  currentLayoutId
}) => {
  // State
  const [layouts, setLayouts] = useState<LayoutConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load layouts on mount
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const layouts = await fetchLayouts(true);
        setLayouts(layouts);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading layouts:', error);
        setError('Failed to load layouts');
        setLoading(false);
      }
    };
    
    loadLayouts();
  }, []);
  
  // Handle layout selection
  const handleSelect = (layout: LayoutConfig) => {
    onSelect(layout);
  };
  
  return (
    <div className="layout-selector-dropdown">
      <select
        className="layout-select"
        onChange={(e) => {
          const layoutId = e.target.value;
          
          if (layoutId === 'manage') {
            onManage();
            return;
          }
          
          const layout = layouts.find(l => l.id === layoutId);
          if (layout) {
            handleSelect(layout);
          }
        }}
        value={currentLayoutId || ''}
        aria-label="Select a layout"
      >
        <option value="" disabled>Select Layout</option>
        
        {layouts.filter(layout => layout.isDefault).map(layout => (
          <option key={layout.id} value={layout.id}>
            {layout.name} (Default)
          </option>
        ))}
        
        {layouts.filter(layout => !layout.isDefault).map(layout => (
          <option key={layout.id} value={layout.id}>
            {layout.name}
          </option>
        ))}
        
        <option value="manage">Manage Layouts...</option>
      </select>
      
      {loading && <span className="loading-indicator" role="status" aria-label="Loading layouts"></span>}
    </div>
  );
};
```

#### 7. Update MultiFrameContainer to Include Layout Persistence

📄 **client/src/components/multiframe/MultiFrameContainer.tsx**
```typescript
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LayoutSelector as LayoutTypeSelector } from './controls/LayoutSelector';
import { LayoutSelector as SavedLayoutSelector } from './preferences/LayoutSelector';
import { LayoutManager } from './preferences/LayoutManager';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { FilterContextProvider } from '../../context/FilterContext';
import { saveLayoutToStorage, loadLayoutsFromStorage } from '../../services/layoutService';
import { PanelConfig, LayoutConfig, LayoutType } from '../../types/layout.types';
import './MultiFrameContainer.css';

export interface MultiFrameContainerProps {
  initialLayout: LayoutType;
  panels?: PanelConfig[];
  defaultPanelContent?: Record<string, string>;
  onLayoutChange?: (layout: LayoutConfig) => void;
  className?: string;
}

export const MultiFrameContainer: React.FC<MultiFrameContainerProps> = ({
  initialLayout = 'single',
  panels = [],
  defaultPanelContent = {},
  onLayoutChange,
  className = '',
}) => {
  // State
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [panelConfigs, setPanelConfigs] = useState<PanelConfig[]>(panels);
  const [currentLayout, setCurrentLayout] = useState<LayoutConfig | null>(null);
  const [showLayoutManager, setShowLayoutManager] = useState<boolean>(false);
  
  // Initialize default panels if none provided
  useMemo(() => {
    if (panels.length === 0) {
      // Create default panels based on layout type
      const defaultPanels: PanelConfig[] = [];
      
      if (layoutType === 'single') {
        defaultPanels.push({
          id: 'default',
          contentType: defaultPanelContent.default || 'map',
          title: 'Default Panel',
          position: { row: 0, col: 0 },
          size: { width: 100, height: 100 }
        });
      } else if (layoutType === 'dual') {
        defaultPanels.push({
          id: 'left',
          contentType: defaultPanelContent.left || 'map',
          title: 'Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 100 }
        });
        defaultPanels.push({
          id: 'right',
          contentType: defaultPanelContent.right || 'property',
          title: 'Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 100 }
        });
      } else if (layoutType === 'tri') {
        defaultPanels.push({
          id: 'top-left',
          contentType: defaultPanelContent['top-left'] || 'map',
          title: 'Top Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'top-right',
          contentType: defaultPanelContent['top-right'] || 'state',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom',
          contentType: defaultPanelContent.bottom || 'county',
          title: 'Bottom Panel',
          position: { row: 1, col: 0 },
          size: { width: 100, height: 50 }
        });
      } else if (layoutType === 'quad') {
        defaultPanels.push({
          id: 'top-left',
          contentType: defaultPanelContent['top-left'] || 'map',
          title: 'Top Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'top-right',
          contentType: defaultPanelContent['top-right'] || 'state',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-left',
          contentType: defaultPanelContent['bottom-left'] || 'county',
          title: 'Bottom Left Panel',
          position: { row: 1, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-right',
          contentType: defaultPanelContent['bottom-right'] || 'property',
          title: 'Bottom Right Panel',
          position: { row: 1, col: 1 },
          size: { width: 50, height: 50 }
        });
      }
      
      setPanelConfigs(defaultPanels);
    }
  }, [layoutType, panels.length, defaultPanelContent]);
  
  // Load the last saved layout if configured
  useEffect(() => {
    const layouts = loadLayoutsFromStorage();
    
    // Check local storage for user preference
    const rememberLastLayout = localStorage.getItem('rememberLastLayout') === 'true';
    
    if (rememberLastLayout && layouts.length > 0) {
      // Find the last used layout
      const lastUsedLayoutId = localStorage.getItem('lastUsedLayoutId');
      const lastUsedLayout = layouts.find(layout => layout.id === lastUsedLayoutId);
      
      if (lastUsedLayout) {
        setLayoutType(lastUsedLayout.type);
        setPanelConfigs(lastUsedLayout.panels);
        setCurrentLayout(lastUsedLayout);
      }
    }
  }, []);
  
  // Save the current layout to local storage on changes
  useEffect(() => {
    if (currentLayout) {
      // Save the current layout ID as last used
      localStorage.setItem('lastUsedLayoutId', currentLayout.id || '');
    }
  }, [currentLayout]);
  
  // Create a layout config from current state
  const createLayoutConfig = useCallback((): LayoutConfig => {
    return {
      name: `${layoutType} Layout`,
      type: layoutType,
      panels: panelConfigs
    };
  }, [layoutType, panelConfigs]);
  
  // Update current layout when type or panels change
  useEffect(() => {
    setCurrentLayout(createLayoutConfig());
  }, [layoutType, panelConfigs, createLayoutConfig]);
  
  // Handle layout type change
  const handleLayoutTypeChange = useCallback((newLayout: LayoutType) => {
    setLayoutType(newLayout);
    
    // Notify parent component if callback provided
    if (onLayoutChange) {
      onLayoutChange({
        name: `${newLayout} layout`,
        type: newLayout,
        panels: panelConfigs
      });
    }
  }, [panelConfigs, onLayoutChange]);
  
  // Handle saved layout selection
  const handleLayoutSelect = useCallback((layout: LayoutConfig) => {
    setLayoutType(layout.type);
    setPanelConfigs(layout.panels);
    setCurrentLayout(layout);
    
    // Save the layout ID as last used
    localStorage.setItem('lastUsedLayoutId', layout.id || '');
    
    // Notify parent component if callback provided
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  }, [onLayoutChange]);
  
  // Handle layout change from layout manager
  const handleLayoutChange = useCallback((layout: LayoutConfig) => {
    setCurrentLayout(layout);
    
    // Save to local storage
    saveLayoutToStorage(layout);
    
    // Notify parent component if callback provided
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  }, [onLayoutChange]);
  
  // Render the appropriate layout based on type
  const renderLayout = useCallback(() => {
    switch (layoutType) {
      case 'single':
        return <SinglePanelLayout panels={panelConfigs} />;
      case 'dual':
        return <DualPanelLayout panels={panelConfigs} />;
      case 'tri':
        return <TriPanelLayout panels={panelConfigs} />;
      case 'quad':
        return <QuadPanelLayout panels={panelConfigs} />;
      default:
        return <SinglePanelLayout panels={panelConfigs} />;
    }
  }, [layoutType, panelConfigs]);
  
  return (
    <div className={`multi-frame-container ${className}`} data-testid="multi-frame-container">
      <FilterContextProvider>
        <LayoutContextProvider>
          <PanelSyncProvider>
            <div className="layout-controls">
              <div className="layout-type-selector">
                <LayoutTypeSelector
                  currentLayout={layoutType}
                  onLayoutChange={handleLayoutTypeChange}
                />
              </div>
              
              <div className="layout-persistence">
                <SavedLayoutSelector
                  onSelect={handleLayoutSelect}
                  onManage={() => setShowLayoutManager(true)}
                  currentLayoutId={currentLayout?.id}
                />
              </div>
            </div>
            
            <div className="layout-container" data-testid={`${layoutType}-layout`}>
              {renderLayout()}
            </div>
            
            {showLayoutManager && (
              <div className="layout-manager-overlay">
                <LayoutManager
                  currentLayout={currentLayout}
                  onLayoutSelect={handleLayoutSelect}
                  onLayoutChange={handleLayoutChange}
                  onClose={() => setShowLayoutManager(false)}
                />
              </div>
            )}
          </PanelSyncProvider>
        </LayoutContextProvider>
      </FilterContextProvider>
    </div>
  );
};
```

### CSS for MultiFrameContainer with layout persistence UI:

```css
/* client/src/components/multiframe/MultiFrameContainer.css */
.multi-frame-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--background-color, #f5f5f5);
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  overflow: hidden;
  position: relative;
}

.layout-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: var(--header-bg-color, #fff);
  border-bottom: 1px solid var(--border-color, #ddd);
}

.layout-type-selector {
  display: flex;
  align-items: center;
}

.layout-persistence {
  display: flex;
  align-items: center;
}

.layout-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-manager-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.layout-manager-overlay .layout-manager {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
}
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing

##### 1. Create Vitest Configuration

📄 **client/vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Exclude node_modules and dist folders explicitly
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Explicitly define specific test patterns to avoid empty pattern errors
    include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Enable this if you need to see test coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
    },
    reporters: ['default'],
    // Ensure we're using pool: 'forks' instead of 'threads', which can cause issues
    pool: 'forks',
    // Increase timeout for tests
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

##### 2. Setup Test Environment

📄 **client/src/setupTests.ts**
```typescript
import '@testing-library/jest-dom'
import { vi, expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Make sure we're clean between tests
afterEach(() => {
  cleanup()
})

// Setup local storage mock for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

// Setup session storage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

// Add matchers to expect
expect.extend(matchers)

// Setup global mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
  vi.resetAllMocks()
})
```

##### 3. Layout Service Tests

📄 **client/src/_tests_/TC2301_services_layoutService.test.ts**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveLayoutToStorage, loadLayoutsFromStorage } from '../../services/layoutService';
import { LayoutConfig } from '../../types/layout.types';

// Create localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', { 
  value: localStorageMock,
  writable: true 
});

describe('layoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });
  
  it('saves layout to local storage', () => {
    const layout: LayoutConfig = {
      id: 'test-layout',
      name: 'Test Layout',
      type: 'dual',
      panels: [
        {
          id: 'left',
          contentType: 'map',
          title: 'Map Panel',
          position: { row: 0, col: 0 }
        },
        {
          id: 'right',
          contentType: 'property',
          title: 'Property Panel',
          position: { row: 0, col: 1 }
        }
      ]
    };
    
    saveLayoutToStorage(layout);
    
    // Check if localStorage.setItem was called with correct arguments
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'layouts', 
      expect.any(String)
    );
    
    // Parse the string passed to localStorage.setItem
    const setItemCall = vi.mocked(localStorageMock.setItem).mock.calls[0];
    const storedLayouts = JSON.parse(setItemCall[1]);
    
    // Check stored data
    expect(storedLayouts).toHaveLength(1);
    expect(storedLayouts[0].id).toBe('test-layout');
    expect(storedLayouts[0].name).toBe('Test Layout');
  });
  
  it('loads layouts from local storage', () => {
    // Setup localStorage with test data
    const layout: LayoutConfig = {
      id: 'test-layout',
      name: 'Test Layout',
      type: 'single',
      panels: [
        {
          id: 'default',
          contentType: 'map',
          title: 'Map Panel',
          position: { row: 0, col: 0 }
        }
      ]
    };
    
    vi.mocked(localStorageMock.getItem).mockReturnValue(JSON.stringify([layout]));
    
    // Load layouts
    const layouts = loadLayoutsFromStorage();
    
    // Check if localStorage.getItem was called
    expect(localStorageMock.getItem).toHaveBeenCalledWith('layouts');
    
    // Check loaded data
    expect(layouts).toHaveLength(1);
    expect(layouts[0].id).toBe('test-layout');
    expect(layouts[0].name).toBe('Test Layout');
  });
  
  it('returns empty array when no layouts in storage', () => {
    vi.mocked(localStorageMock.getItem).mockReturnValue(null);
    
    const layouts = loadLayoutsFromStorage();
    
    expect(layouts).toEqual([]);
  });
  
  it('handles JSON parse errors', () => {
    // Setup localStorage with invalid JSON
    vi.mocked(localStorageMock.getItem).mockReturnValue('invalid json');
    
    // This should not throw an error
    const layouts = loadLayoutsFromStorage();
    
    // It should return an empty array
    expect(layouts).toEqual([]);
  });
});
```

##### 4. User Preferences Service Tests

📄 **client/src/_tests_/TC2201_services_preferencesService.test.ts**
```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { 
  fetchUserPreferences, 
  saveUserPreferences, 
  resetUserPreferences, 
  getLocalPreferences,
  updatePreference,
  DEFAULT_PREFERENCES
} from '../../services/preferencesService';
import { UserPreferences } from '../../types/preferences.types';

// Mock axios
vi.mock('axios');

// Create localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', { 
  value: localStorageMock,
  writable: true 
});

describe('preferencesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchUserPreferences', () => {
    it('fetches user preferences from API', async () => {
      const mockPreferences: UserPreferences = {
        theme: {
          colorMode: 'dark',
          mapStyle: 'satellite',
          accentColor: '#ff0000',
          fontSize: 'large'
        },
        panel: {
          defaultContentTypes: {
            'top-left': 'map',
            'top-right': 'property'
          },
          showPanelHeader: true,
          enablePanelResizing: true,
          enablePanelDragging: true
        },
        layout: {
          defaultLayout: 'dual',
          saveLayoutOnExit: true,
          rememberLastLayout: true
        },
        filter: {
          defaultFilters: {},
          showFilterPanel: true,
          applyFiltersAutomatically: true
        }
      };

      // Mock axios get to return preferences
      vi.mocked(axios.get).mockResolvedValue({ data: mockPreferences });

      const result = await fetchUserPreferences();

      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledWith('/api/user/preferences');

      // Verify result
      expect(result).toEqual(mockPreferences);
    });

    it('returns local preferences if API call fails', async () => {
      // Setup localStorage with preferences
      const localPrefs = {
        theme: {
          colorMode: 'light',
          mapStyle: 'standard'
        }
      };
      
      localStorageMock.setItem('userPreferences', JSON.stringify(localPrefs));

      // Mock axios to throw error
      vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

      const result = await fetchUserPreferences();

      // Should return local preferences
      expect(result).toEqual(localPrefs);
    });

    it('returns default preferences if API call fails and no local preferences', async () => {
      // Mock axios to throw error
      vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

      const result = await fetchUserPreferences();

      // Should return default preferences
      expect(result).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('saveUserPreferences', () => {
    it('saves preferences to API and local storage', async () => {
      const mockPreferences: UserPreferences = {
        theme: {
          colorMode: 'dark',
          mapStyle: 'terrain',
          fontSize: 'medium'
        },
        panel: {
          defaultContentTypes: {},
          showPanelHeader: true,
          enablePanelResizing: true,
          enablePanelDragging: false
        },
        layout: {
          defaultLayout: 'tri',
          saveLayoutOnExit: false,
          rememberLastLayout: true
        },
        filter: {
          defaultFilters: {},
          showFilterPanel: false,
          applyFiltersAutomatically: false
        }
      };

      // Mock axios put to return preferences
      vi.mocked(axios.put).mockResolvedValue({ data: mockPreferences });

      const result = await saveUserPreferences(mockPreferences);

      // Verify axios was called correctly
      expect(axios.put).toHaveBeenCalledWith('/api/user/preferences', mockPreferences);

      // Verify result
      expect(result).toEqual(mockPreferences);

      // Verify localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify(mockPreferences)
      );
    });

    it('saves to localStorage even if API call fails', async () => {
      const mockPreferences: UserPreferences = {
        theme: {
          colorMode: 'dark',
          mapStyle: 'terrain',
          fontSize: 'medium'
        },
        panel: {
          defaultContentTypes: {},
          showPanelHeader: true,
          enablePanelResizing: true,
          enablePanelDragging: false
        },
        layout: {
          defaultLayout: 'tri',
          saveLayoutOnExit: false,
          rememberLastLayout: true
        },
        filter: {
          defaultFilters: {},
          showFilterPanel: false,
          applyFiltersAutomatically: false
        }
      };

      // Mock axios to throw error
      vi.mocked(axios.put).mockRejectedValue(new Error('API error'));

      // This should throw
      await expect(saveUserPreferences(mockPreferences)).rejects.toThrow();

      // But localStorage should still be updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify(mockPreferences)
      );
    });
  });

  describe('resetUserPreferences', () => {
    it('resets preferences to defaults via API', async () => {
      // Mock axios post to return default preferences
      vi.mocked(axios.post).mockResolvedValue({ data: DEFAULT_PREFERENCES });

      const result = await resetUserPreferences();

      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith('/api/user/preferences/reset');

      // Verify result
      expect(result).toEqual(DEFAULT_PREFERENCES);

      // Verify localStorage was updated with defaults
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify(DEFAULT_PREFERENCES)
      );
    });

    it('resets localStorage even if API call fails', async () => {
      // Mock axios to throw error
      vi.mocked(axios.post).mockRejectedValue(new Error('API error'));

      // This should throw
      await expect(resetUserPreferences()).rejects.toThrow();

      // But localStorage should still be reset
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify(DEFAULT_PREFERENCES)
      );
    });
  });

  describe('getLocalPreferences', () => {
    it('gets preferences from localStorage', () => {
      const mockPreferences: UserPreferences = {
        theme: {
          colorMode: 'dark',
          mapStyle: 'terrain',
          fontSize: 'medium'
        },
        panel: {
          defaultContentTypes: {},
          showPanelHeader: true,
          enablePanelResizing: true,
          enablePanelDragging: false
        },
        layout: {
          defaultLayout: 'tri',
          saveLayoutOnExit: false,
          rememberLastLayout: true
        },
        filter: {
          defaultFilters: {},
          showFilterPanel: false,
          applyFiltersAutomatically: false
        }
      };

      // Set up localStorage with preferences
      localStorageMock.setItem('userPreferences', JSON.stringify(mockPreferences));

      const result = getLocalPreferences();

      // Verify localStorage was read
      expect(localStorageMock.getItem).toHaveBeenCalledWith('userPreferences');

      // Verify result
      expect(result).toEqual(mockPreferences);
    });

    it('returns default preferences if localStorage is empty', () => {
      // Ensure localStorage returns null
      vi.mocked(localStorageMock.getItem).mockReturnValue(null);

      const result = getLocalPreferences();

      // Should return default preferences
      expect(result).toEqual(DEFAULT_PREFERENCES);
    });

    it('handles JSON parse errors', () => {
      // Set up localStorage with invalid JSON
      localStorageMock.setItem('userPreferences', 'invalid json');

      const result = getLocalPreferences();

      // Should return default preferences
      expect(result).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('updatePreference', () => {
    it('updates a specific preference and saves it', async () => {
      // Set up initial preferences
      const initialPrefs: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        theme: {
          ...DEFAULT_PREFERENCES.theme,
          colorMode: 'light'
        }
      };

      localStorageMock.setItem('userPreferences', JSON.stringify(initialPrefs));

      // Mock axios put to return updated preferences
      vi.mocked(axios.put).mockImplementation(async (url, data) => {
        return { data };
      });

      // Update a specific preference
      const result = await updatePreference('theme', 'colorMode', 'dark');

      // Expected updated preferences
      const expectedPrefs = {
        ...initialPrefs,
        theme: {
          ...initialPrefs.theme,
          colorMode: 'dark'
        }
      };

      // Verify axios was called with updated preferences
      expect(axios.put).toHaveBeenCalledWith('/api/user/preferences', expectedPrefs);

      // Verify result
      expect(result).toEqual(expectedPrefs);

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify(expectedPrefs)
      );
    });

    it('creates a new category if it does not exist', async () => {
      // Set up initial preferences with missing category
      const initialPrefs = {
        theme: DEFAULT_PREFERENCES.theme,
        // Missing panel category
        layout: DEFAULT_PREFERENCES.layout,
        filter: DEFAULT_PREFERENCES.filter
      };

      localStorageMock.setItem('userPreferences', JSON.stringify(initialPrefs));

      // Mock axios put
      vi.mocked(axios.put).mockImplementation(async (url, data) => {
        return { data };
      });

      // Update a preference in the missing category
      await updatePreference('panel', 'showPanelHeader', false);

      // Verify that the request included the new category
      const lastCall = vi.mocked(axios.put).mock.calls[0];
      const requestData = lastCall[1];
      
      expect(requestData).toHaveProperty('panel');
      expect(requestData.panel).toHaveProperty('showPanelHeader', false);
    });
  });
});
```

##### 5. Layout Manager Component Tests

📄 **client/src/_tests_/TC3101_components_multiframe_preferences_LayoutManager.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LayoutManager } from '../../../../components/multiframe/preferences/LayoutManager';
import { fetchLayouts, saveLayout, deleteLayout, cloneLayout } from '../../../../services/layoutService';
import { LayoutConfig } from '../../../../types/layout.types';

// Mock the layout service methods
vi.mock('../../../../services/layoutService', () => ({
  fetchLayouts: vi.fn(),
  saveLayout: vi.fn(),
  deleteLayout: vi.fn(),
  cloneLayout: vi.fn()
}));

describe('LayoutManager', () => {
  const mockCurrentLayout: LayoutConfig = {
    id: 'current-layout',
    name: 'Current Layout',
    type: 'dual',
    panels: [
      {
        id: 'left',
        contentType: 'map',
        title: 'Map Panel',
        position: { row: 0, col: 0 }
      },
      {
        id: 'right',
        contentType: 'property',
        title: 'Property Panel',
        position: { row: 0, col: 1 }
      }
    ]
  };
  
  const mockLayouts: LayoutConfig[] = [
    {
      id: 'layout-1',
      name: 'Test Layout 1',
      type: 'single',
      panels: [
        {
          id: 'default',
          contentType: 'map',
          title: 'Map Panel',
          position: { row: 0, col: 0 }
        }
      ],
      isDefault: true
    },
    {
      id: 'layout-2',
      name: 'Test Layout 2',
      type: 'quad',
      panels: [
        {
          id: 'top-left',
          contentType: 'map',
          title: 'Map Panel',
          position: { row: 0, col: 0 }
        },
        {
          id: 'top-right',
          contentType: 'property',
          title: 'Property Panel',
          position: { row: 0, col: 1 }
        },
        {
          id: 'bottom-left',
          contentType: 'filter',
          title: 'Filter Panel',
          position: { row: 1, col: 0 }
        },
        {
          id: 'bottom-right',
          contentType: 'stats',
          title: 'Stats Panel',
          position: { row: 1, col: 1 }
        }
      ]
    }
  ];
  
  const mockProps = {
    currentLayout: mockCurrentLayout,
    onLayoutSelect: vi.fn(),
    onLayoutChange: vi.fn(),
    onClose: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetchLayouts to return test layouts
    vi.mocked(fetchLayouts).mockResolvedValue(mockLayouts);
    
    // Mock other service functions
    vi.mocked(saveLayout).mockResolvedValue({
      ...mockCurrentLayout,
      id: 'saved-layout-id',
      updatedAt: new Date().toISOString()
    });
    
    vi.mocked(deleteLayout).mockResolvedValue();
    
    vi.mocked(cloneLayout).mockResolvedValue({
      ...mockLayouts[0],
      id: 'cloned-layout-id',
      name: 'Copy of Test Layout 1'
    });
  });
  
  it('renders the layout manager with title', () => {
    render(<LayoutManager {...mockProps} />);
    
    expect(screen.getByText('Layout Manager')).toBeInTheDocument();
  });
  
  it('loads and displays saved layouts', async () => {
    render(<LayoutManager {...mockProps} />);
    
    // Check if fetchLayouts was called
    expect(fetchLayouts).toHaveBeenCalledWith(true);
    
    // Wait for layouts to load
    await waitFor(() => {
      expect(screen.getByText('Test Layout 1')).toBeInTheDocument();
      expect(screen.getByText('Test Layout 2')).toBeInTheDocument();
    });
    
    // Check if default label is shown
    expect(screen.getByText('Default')).toBeInTheDocument();
  });
  
  it('handles layout selection', async () => {
    render(<LayoutManager {...mockProps} />);
    
    // Wait for layouts to load
    await waitFor(() => {
      expect(screen.getByText('Test Layout 1')).toBeInTheDocument();
    });
    
    // Find and click the load button for the first layout
    const loadButtons = screen.getAllByText('Load');
    fireEvent.click(loadButtons[0]);
    
    // Check if onLayoutSelect was called with the correct layout
    expect(mockProps.onLayoutSelect).toHaveBeenCalledWith(mockLayouts[0]);
  });
  
  it('handles layout deletion', async () => {
    render(<LayoutManager {...mockProps} />);
    
    // Wait for layouts to load
    await waitFor(() => {
      expect(screen.getByText('Test Layout 1')).toBeInTheDocument();
    });
    
    // Find and click the delete button for the first layout
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Check if deleteLayout was called with the correct ID
    expect(deleteLayout).toHaveBeenCalledWith('layout-1');
  });
  
  it('handles creating a new layout', async () => {
    render(<LayoutManager {...mockProps} />);
    
    // Click the create new layout button
    fireEvent.click(screen.getByText('Create New Layout'));
    
    // Input a name for the new layout
    const nameInput = screen.getByPlaceholderText('Enter layout name');
    fireEvent.change(nameInput, { target: { value: 'New Layout' } });
    
    // Click the create button
    fireEvent.click(screen.getByTestId('create-layout-button'));
    
    // Check if onLayoutChange was called with a layout containing the new name
    expect(mockProps.onLayoutChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Layout'
      })
    );
  });
  
  it('handles closing the layout manager', () => {
    render(<LayoutManager {...mockProps} />);
    
    // Click the close button
    fireEvent.click(screen.getByLabelText('Close layout manager'));
    
    // Check if onClose was called
    expect(mockProps.onClose).toHaveBeenCalled();
  });
  
  it('handles errors when loading layouts', async () => {
    // Mock fetchLayouts to throw an error
    vi.mocked(fetchLayouts).mockRejectedValue(new Error('Failed to load layouts'));
    
    render(<LayoutManager {...mockProps} />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load layouts')).toBeInTheDocument();
    });
  });
});
```

##### 6. Layout Selector Component Tests

📄 **client/src/_tests_/TC101_components_multiframe_controls_LayoutSelector.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LayoutSelector } from '../../../../components/multiframe/controls/LayoutSelector';
import { fetchLayouts } from '../../../../services/layoutService';
import { LayoutConfig } from '../../../../types/layout.types';

// Mock fetchLayouts function
vi.mock('../../../../services/layoutService', () => ({
  fetchLayouts: vi.fn()
}));

describe('LayoutSelector', () => {
  const mockLayouts: LayoutConfig[] = [
    {
      id: 'default-layout',
      name: 'Default Layout',
      type: 'dual',
      panels: [],
      isDefault: true
    },
    {
      id: 'custom-layout',
      name: 'Custom Layout',
      type: 'quad',
      panels: []
    }
  ];
  
  const mockProps = {
    onSelect: vi.fn(),
    onManage: vi.fn(),
    currentLayoutId: 'default-layout'
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup fetchLayouts mock
    vi.mocked(fetchLayouts).mockResolvedValue(mockLayouts);
  });
  
  it('renders with the current layout selected', async () => {
    render(<LayoutSelector {...mockProps} />);
    
    // Wait for layouts to load
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveValue('default-layout');
    });
  });
  
  it('loads layouts on mount', async () => {
    render(<LayoutSelector {...mockProps} />);
    
    // Check if fetchLayouts was called with the correct parameters
    expect(fetchLayouts).toHaveBeenCalledWith(true);
    
    // Wait for layouts to be loaded
    await waitFor(() => {
      // We can check if default-layout option is in the document
      const options = screen.getAllByRole('option');
      const defaultLayoutOption = options.find(option => option.getAttribute('value') === 'default-layout');
      expect(defaultLayoutOption).toBeInTheDocument();
    });
  });
  
  it('displays default layouts with (Default) suffix', async () => {
    render(<LayoutSelector {...mockProps} />);
    
    // Wait for layouts to load
    await waitFor(() => {
      // Check for the text "Default Layout (Default)"
      expect(screen.getByText(/Default Layout \(Default\)/)).toBeInTheDocument();
    });
  });
  
  it('calls onSelect when a layout is selected', async () => {
    render(<LayoutSelector {...mockProps} />);
    
    // Wait for layouts to load
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toBeInTheDocument();
    });
    
    // Change the selected layout
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'custom-layout' } });
    
    // Check if onSelect was called with the correct layout
    expect(mockProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'custom-layout',
        name: 'Custom Layout'
      })
    );
  });
  
  it('calls onManage when "Manage Layouts..." is selected', async () => {
    render(<LayoutSelector {...mockProps} />);
    
    // Wait for layouts to load
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toBeInTheDocument();
    });
    
    // Select the "Manage Layouts..." option
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'manage' } });
    
    // Check if onManage was called
    expect(mockProps.onManage).toHaveBeenCalled();
  });
  
  it('shows loading indicator while fetching layouts', async () => {
    // Set up a delayed resolution for fetchLayouts
    vi.mocked(fetchLayouts).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockLayouts), 100);
      });
    });
    
    render(<LayoutSelector {...mockProps} />);
    
    // Check if loading indicator is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for layouts to load
    await waitFor(() => {
      // After loading, the Select should have options
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(1);
    });
  });
});
```

##### 7. MultiFrameContainer Layout Tests

📄 **client/src/_tests_/TC201_components_MultiFrameContainer.layout.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiFrameContainer } from '../../components/multiframe/MultiFrameContainer';
import { saveLayoutToStorage, loadLayoutsFromStorage } from '../../services/layoutService';
import { LayoutConfig } from '../../types/layout.types';

// Mock layoutService
vi.mock('../../services/layoutService', () => ({
  saveLayoutToStorage: vi.fn(),
  loadLayoutsFromStorage: vi.fn(() => [
    {
      id: 'saved-layout',
      name: 'Saved Layout',
      type: 'dual',
      panels: [
        {
          id: 'left',
          contentType: 'map',
          title: 'Map Panel',
          position: { row: 0, col: 0 }
        },
        {
          id: 'right',
          contentType: 'property',
          title: 'Property Panel',
          position: { row: 0, col: 1 }
        }
      ]
    }
  ])
}));

// Mock panel content registry
vi.mock('../../services/panelContentRegistry', () => ({
  getPanelContent: () => () => <div data-testid="mock-panel-content">Mock Panel Content</div>,
  initializeContentRegistry: vi.fn()
}));

// Create localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

describe('MultiFrameContainer with Layout Persistence', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });
  
  it('creates and maintains layout configuration', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
        onLayoutChange={onLayoutChange}
      />
    );
    
    // Change layout type
    // Note: We need to find the correct selector for your layout selector
    // This might require updating based on your actual implementation
    const layoutSelector = screen.getByTestId('layout-selector-dual');
    fireEvent.click(layoutSelector);
    
    // Check if onLayoutChange was called with correct layout
    expect(onLayoutChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dual'
      })
    );
    
    // Check if layout was saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
  
  it('loads saved layout on selection', () => {
    const onLayoutChange = vi.fn();
    
    // Mock localStorage to simulate a saved layout
    vi.mocked(localStorageMock.getItem).mockImplementation((key) => {
      if (key === 'rememberLastLayout') return 'true';
      if (key === 'lastUsedLayoutId') return 'saved-layout';
      return null;
    });
    
    render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
        onLayoutChange={onLayoutChange}
      />
    );
    
    // The component should load the saved layout on mount
    // We can verify this was attempted by checking if loadLayoutsFromStorage was called
    expect(loadLayoutsFromStorage).toHaveBeenCalled();
    
    // We also expect a localStorage getItem call to check for the lastUsedLayoutId
    expect(localStorageMock.getItem).toHaveBeenCalledWith('lastUsedLayoutId');
  });
  
  it('initializes with default panels when none provided', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
      />
    );
    
    // Check if a default panel was created
    // This test might need adjustment based on how you render panels
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
  });
});
```

##### 8. Vitest Test Script for Layout Persistence

📄 **test-layout-persistence.ps1**
```powershell
# PowerShell script to run layout persistence tests with Vitest
cd client

echo "Running Layout Persistence Tests..."

# Run specific layout persistence tests
npx vitest run src/_tests_/TC2301_services_layoutService.test.ts src/_tests_/TC2201_services_preferencesService.test.ts --config ./vitest.config.ts --no-coverage

echo "Running Layout Component Tests..."

# Run UI component tests for layout management
npx vitest run "src/_tests_/TC*_components_multiframe_preferences_*" --config ./vitest.config.ts --no-coverage

echo "Running MultiFrameContainer Layout Tests..."

# Run container tests with layout integration
npx vitest run src/_tests_/TC201_components_MultiFrameContainer.layout.test.tsx --config ./vitest.config.ts --no-coverage

echo "All layout persistence tests completed!"
```

### ✅ Commit and Deploy

```bash
# Run tests to verify implementation
cd client
./test-layout-persistence.ps1

# Commit changes
git add .
git commit -m "Chunk 4: Implement layout persistence and user preferences with Vitest tests"
git push origin feature/layout-persistence

# Create a pull request
# Add documentation, screenshots, and test results to the PR
```

## 📈 Implementation References

### Example Usage of Layout Persistence

```typescript
// Using layout persistence in an application
import { MultiFrameContainer } from './components/multiframe/MultiFrameContainer';

function App() {
  const handleLayoutChange = (layout) => {
    console.log('Layout changed:', layout);
    // You might want to save this to a database or store in app state
  };
  
  return (
    <div className="app">
      <MultiFrameContainer
        initialLayout="dual"
        defaultPanelContent={{
          'left': 'map',
          'right': 'property'
        }}
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
}
```

### Layout Persistence Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│ MultiFrameContainer                                    │
│                                                        │
│  ┌───────────────┐      ┌──────────────────────────┐   │
│  │               │      │                          │   │
│  │ Layout State  │◄────►│  Layout Type Selector    │   │
│  │               │      │                          │   │
│  └───────┬───────┘      └──────────────────────────┘   │
│          │                                             │
│          │              ┌──────────────────────────┐   │
│          │              │                          │   │
│          └─────────────►│  Layout Selector         │   │
│          │              │                          │   │
│          │              └──────────────────┬───────┘   │
│          │                                 │           │
│          │                                 ▼           │
│          │              ┌──────────────────────────┐   │
│          │              │                          │   │
│          └─────────────►│  Layout Manager          │   │
│                         │                          │   │
│                         └──────────────┬───────────┘   │
│                                        │               │
└────────────────────────────────────────┼───────────────┘
                                         │               
                                         ▼               
┌────────────────────────────────────────────────────────┐
│                                                        │
│           Local Storage / Backend API                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### MongoDB Schema for Layout Persistence

```javascript
// Layout Configuration Schema (MongoDB)
const LayoutConfigSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  layoutType: {
    type: String,
    enum: ['single', 'dual', 'tri', 'quad'],
    required: true
  },
  panels: [{
    id: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    title: String,
    position: {
      row: Number,
      col: Number
    },
    size: {
      width: Number,
      height: Number
    },
    state: Schema.Types.Mixed,
    visible: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```
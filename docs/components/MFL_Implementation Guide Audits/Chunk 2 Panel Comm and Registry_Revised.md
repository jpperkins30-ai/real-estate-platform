# 🧩 Chunk 2: Panel Communication & Content Registry

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-2-panel-communication.md

## 🎯 Objective

Establish robust panel communication and content registry systems to enable dynamic loading of panel content and inter-panel communication. This includes implementing the county-specific components and ensuring panels can publish/subscribe to state changes across the layout.

This chunk builds on the core layout framework from Chunk 1 and enables the dynamic communication needed for synchronized views and data filtering.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

#### Git Setup
```bash
# Ensure you're in the project directory
cd path/to/your/project

# Checkout development branch and get latest changes
git checkout development
git pull origin development

# Create your feature branch
git checkout -b feature/panel-communication
```

Required folders:
```
client/src/context/
client/src/hooks/
client/src/services/
client/src/components/multiframe/panels/
```

Install necessary packages (if not installed):
```bash
npm install react-leaflet leaflet vitest @testing-library/react @testing-library/jest-dom
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Create Panel Synchronization Context

📄 **client/src/context/PanelSyncContext.tsx**
```typescript
import React, { createContext, useCallback, useRef } from 'react';

export interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
}

export type PanelSyncCallback = (event: PanelSyncEvent) => void;

interface PanelSyncContextType {
  broadcast: (event: PanelSyncEvent) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
}

export const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

export const PanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use ref for listeners to avoid re-renders
  const listenersRef = useRef<PanelSyncCallback[]>([]);
  
  // Broadcast events to all subscribers
  const broadcast = useCallback((event: PanelSyncEvent) => {
    // Notify all listeners
    listenersRef.current.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in panel sync listener:', error);
      }
    });
  }, []);
  
  // Subscribe to events
  const subscribe = useCallback((callback: PanelSyncCallback) => {
    listenersRef.current.push(callback);
    
    // Return unsubscribe function
    return () => {
      listenersRef.current = listenersRef.current.filter(cb => cb !== callback);
    };
  }, []);
  
  // Context value
  const contextValue = {
    broadcast,
    subscribe
  };
  
  return (
    <PanelSyncContext.Provider value={contextValue}>
      {children}
    </PanelSyncContext.Provider>
  );
};
```

#### 2. Create Layout Context

📄 **client/src/context/LayoutContext.tsx**
```typescript
import React, { createContext, useCallback, useState } from 'react';
import { PanelConfig, LayoutType } from '../types/layout.types';

interface LayoutContextType {
  layoutType: LayoutType;
  panels: Record<string, PanelConfig>;
  registerPanel: (id: string, config: PanelConfig) => void;
  unregisterPanel: (id: string) => void;
  updatePanelConfig: (id: string, updates: Partial<PanelConfig>) => void;
  setLayoutType: (type: LayoutType) => void;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

export const LayoutContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [layoutType, setLayoutType] = useState<LayoutType>('single');
  const [panels, setPanels] = useState<Record<string, PanelConfig>>({});
  
  // Register a panel
  const registerPanel = useCallback((id: string, config: PanelConfig) => {
    setPanels(prev => ({
      ...prev,
      [id]: config
    }));
  }, []);
  
  // Unregister a panel
  const unregisterPanel = useCallback((id: string) => {
    setPanels(prev => {
      const newPanels = { ...prev };
      delete newPanels[id];
      return newPanels;
    });
  }, []);
  
  // Update panel configuration
  const updatePanelConfig = useCallback((id: string, updates: Partial<PanelConfig>) => {
    setPanels(prev => {
      const panel = prev[id];
      
      if (!panel) {
        return prev;
      }
      
      return {
        ...prev,
        [id]: {
          ...panel,
          ...updates
        }
      };
    });
  }, []);
  
  // Context value
  const contextValue = {
    layoutType,
    panels,
    registerPanel,
    unregisterPanel,
    updatePanelConfig,
    setLayoutType
  };
  
  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};
```

#### 3. Create Custom Hooks for Contexts

📄 **client/src/hooks/usePanelSync.ts**
```typescript
import { useContext } from 'react';
import { PanelSyncContext, PanelSyncEvent } from '../context/PanelSyncContext';

export function usePanelSync() {
  const context = useContext(PanelSyncContext);
  
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  
  return context;
}
```

📄 **client/src/hooks/useLayoutContext.ts**
```typescript
import { useContext } from 'react';
import { LayoutContext } from '../context/LayoutContext';

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutContextProvider');
  }
  
  return context;
}
```

#### 4. Enhance Panel Content Registry

📄 **client/src/services/panelContentRegistry.ts**
```typescript
import React from 'react';
import { PanelContentType } from '../types/layout.types';

// Map of content types to components
const contentRegistry: Record<string, React.ComponentType<any>> = {};

/**
 * Register a panel content component
 * 
 * @param contentType - Type identifier for the panel content
 * @param Component - React component to render for this content type
 */
export function registerPanelContent(
  contentType: PanelContentType,
  Component: React.ComponentType<any>
): void {
  contentRegistry[contentType] = Component;
}

/**
 * Get a panel content component by type
 * 
 * @param contentType - Type identifier for the panel content
 * @returns React component or null if not found
 */
export function getPanelContent(
  contentType: PanelContentType
): React.ComponentType<any> | null {
  return contentRegistry[contentType] || null;
}

/**
 * Get all registered panel content types
 * 
 * @returns Array of registered content types
 */
export function getRegisteredContentTypes(): PanelContentType[] {
  return Object.keys(contentRegistry) as PanelContentType[];
}

/**
 * Initialize the content registry with default components
 */
export function initializeContentRegistry(): void {
  // Import components dynamically to avoid circular dependencies
  import('../components/multiframe/panels/MapPanel').then(module => {
    registerPanelContent('map', module.MapPanel);
  });
  
  import('../components/multiframe/panels/StatePanel').then(module => {
    registerPanelContent('state', module.StatePanel);
  });
  
  import('../components/multiframe/panels/CountyPanel').then(module => {
    registerPanelContent('county', module.CountyPanel);
  });
  
  import('../components/multiframe/panels/PropertyPanel').then(module => {
    registerPanelContent('property', module.PropertyPanel);
  });
  
  import('../components/multiframe/panels/FilterPanel').then(module => {
    registerPanelContent('filter', module.FilterPanel);
  });
  
  import('../components/multiframe/panels/StatsPanel').then(module => {
    registerPanelContent('stats', module.StatsPanel);
  });
}
```

#### 5. Update MultiFrameContainer to Use Contexts

📄 **client/src/components/multiframe/MultiFrameContainer.tsx**
```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { PanelConfig, LayoutConfig, LayoutType } from '../../types/layout.types';
import './MultiFrameContainer.css';

// ... existing code ...

export const MultiFrameContainer: React.FC<MultiFrameContainerProps> = ({
  initialLayout = 'single',
  panels = [],
  defaultPanelContent = {},
  onLayoutChange,
  className = '',
}) => {
  // ... existing state code ...
  
  return (
    <div className={`multi-frame-container ${className}`} data-testid="multi-frame-container">
      <LayoutContextProvider>
        <PanelSyncProvider>
          <div className="layout-controls">
            <LayoutSelector
              currentLayout={layoutType}
              onLayoutChange={handleLayoutChange}
            />
          </div>
          <div className="layout-container" data-testid={`${layoutType}-layout`}>
            {renderLayout()}
          </div>
        </PanelSyncProvider>
      </LayoutContextProvider>
    </div>
  );
};
```

#### 6. Update PanelContainer to Use Contexts

📄 **client/src/components/multiframe/PanelContainer.tsx**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { PanelHeader } from './PanelHeader';
import { usePanelSync } from '../../hooks/usePanelSync';
import { useLayoutContext } from '../../hooks/useLayoutContext';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelAction, PanelContentType } from '../../types/panel.types';
import './PanelContainer.css';

export interface PanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType;
  initialState?: any;
  position?: { row: number; col: number };
  size?: { width: number; height: number };
  onStateChange?: (newState: any) => void;
  onAction?: (action: PanelAction) => void;
  className?: string;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  id,
  title,
  contentType,
  initialState = {},
  position,
  size,
  onStateChange,
  onAction,
  className = '',
}) => {
  // State
  const [state, setState] = useState(initialState);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  const { registerPanel, unregisterPanel } = useLayoutContext();
  
  // Register panel with layout context
  useEffect(() => {
    registerPanel(id, {
      id,
      contentType,
      title,
      position,
      size,
      state
    });
    
    return () => {
      unregisterPanel(id);
    };
  }, [id, contentType, title, position, size, registerPanel, unregisterPanel]);
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      // Handle events from other panels
      if (event.source !== id) {
        // Process event based on type
        if (event.type === 'select' || event.type === 'filter') {
          // Update local state based on event
          setState(prevState => ({
            ...prevState,
            ...event.payload
          }));
        }
      }
    });
    
    return unsubscribe;
  }, [id, subscribe]);
  
  // Handle panel state changes
  const handleStateChange = useCallback((newState: any) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      
      // Notify parent component if callback provided
      if (onStateChange) {
        onStateChange(updatedState);
      }
      
      return updatedState;
    });
  }, [onStateChange]);
  
  // Handle panel actions
  const handleAction = useCallback((action: PanelAction) => {
    // Handle basic actions internally
    if (action.type === 'maximize') {
      setIsMaximized(prev => !prev);
    }
    
    // Broadcast action to other panels if needed
    if (['select', 'filter', 'highlight'].includes(action.type)) {
      broadcast({
        type: action.type,
        payload: action.payload,
        source: id
      });
    }
    
    // Notify parent component if callback provided
    if (onAction) {
      onAction(action);
    }
  }, [id, broadcast, onAction]);
  
  // Get the appropriate content component for this panel
  const PanelContent = getPanelContent(contentType);
  
  // Class names based on state
  const containerClassNames = [
    'panel-container',
    isMaximized ? 'maximized' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={containerClassNames} 
      data-panel-id={id}
      data-testid={`panel-${id}`}
    >
      <PanelHeader 
        title={title} 
        isMaximized={isMaximized}
        onAction={handleAction}
      />
      <div className="panel-content">
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={state}
            onStateChange={handleStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className="no-content">
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### 7. Create Panel Types Definition

📄 **client/src/types/panel.types.ts**
```typescript
export interface PanelContentProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: PanelContentAction) => void;
}

export interface PanelContentAction {
  type: string;
  payload?: any;
}

export interface PanelAction {
  type: 'maximize' | 'minimize' | 'close' | 'refresh' | 'export' | 'filter' | 'select';
  payload?: any;
}
```

#### 8. Implement CountyPanel Component

📄 **client/src/components/multiframe/panels/CountyPanel.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { PanelContentProps } from '../../../types/panel.types';
import './CountyPanel.css';

interface CountyData {
  name: string;
  state: string;
  population: number;
  properties: number;
  lastUpdated: string;
  propertyTypes: {
    type: string;
    count: number;
  }[];
}

export const CountyPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [county, setCounty] = useState<CountyData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  
  // Subscribe to state selection events
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        if (event.type === 'select' && event.payload?.entityType === 'county') {
          // Load county data
          loadCountyData(event.payload.entityId, event.payload.properties?.stateId);
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Load initial county if provided
  useEffect(() => {
    if (initialState.countyId && initialState.stateId) {
      loadCountyData(initialState.countyId, initialState.stateId);
    }
  }, [initialState.countyId, initialState.stateId]);
  
  // Mock function to load county data
  const loadCountyData = (countyId: string, stateId: string) => {
    setLoading(true);
    setError(null);
    
    // In production, this would be an API call
    setTimeout(() => {
      // Mock data
      const countyData: CountyData = {
        name: countyId,
        state: stateId,
        population: 150000,
        properties: 55000,
        lastUpdated: new Date().toLocaleDateString(),
        propertyTypes: [
          { type: 'Residential', count: 42000 },
          { type: 'Commercial', count: 5000 },
          { type: 'Industrial', count: 3000 },
          { type: 'Land', count: 5000 }
        ]
      };
      
      setCounty(countyData);
      setLoading(false);
      
      // Update state
      if (onStateChange) {
        onStateChange({
          countyId,
          stateId,
          countyData
        });
      }
    }, 500);
  };
  
  // Handle property type selection
  const handlePropertyTypeSelect = (propertyType: string) => {
    // Broadcast selection to other panels
    broadcast({
      type: 'filter',
      payload: {
        propertyType,
        county: county?.name,
        state: county?.state
      },
      source: panelId
    });
    
    // Notify parent
    if (onAction) {
      onAction({
        type: 'filter',
        payload: {
          propertyType,
          county: county?.name,
          state: county?.state
        }
      });
    }
  };
  
  // Render functions
  const renderCountyData = () => {
    if (loading) {
      return <div className="county-loading">Loading county data...</div>;
    }
    
    if (error) {
      return <div className="county-error">{error}</div>;
    }
    
    if (!county) {
      return <div className="county-empty">Select a county to view data</div>;
    }
    
    return (
      <div className="county-data">
        <h3 className="county-name">{county.name} County, {county.state}</h3>
        
        <div className="county-info">
          <div className="info-item">
            <span className="info-label">Population:</span>
            <span className="info-value">{county.population.toLocaleString()}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Properties:</span>
            <span className="info-value">{county.properties.toLocaleString()}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">{county.lastUpdated}</span>
          </div>
        </div>
        
        <div className="county-property-types">
          <h4>Property Types</h4>
          <div className="property-type-list">
            {county.propertyTypes.map((type) => (
              <div 
                key={type.type}
                className="property-type-item"
                onClick={() => handlePropertyTypeSelect(type.type)}
              >
                <span className="property-type-name">{type.type}</span>
                <span className="property-type-count">{type.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="county-panel" data-testid={`county-panel-${panelId}`}>
      {renderCountyData()}
    </div>
  );
};
```

📄 **client/src/components/multiframe/panels/CountyPanel.css**
```css
.county-panel {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.county-loading,
.county-error,
.county-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted, #777);
  font-style: italic;
}

.county-error {
  color: var(--error-color, #f44336);
}

.county-name {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color, #2196f3);
}

.county-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: var(--panel-bg-light, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--border-color-light, #eee);
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-label {
  font-weight: 500;
  color: var(--text-muted, #777);
}

.info-value {
  font-weight: 600;
}

.county-property-types h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.property-type-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.property-type-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: var(--panel-bg-light, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--border-color-light, #eee);
  cursor: pointer;
  transition: background-color 0.2s;
}

.property-type-item:hover {
  background-color: var(--hover-bg-color, #e3f2fd);
}

.property-type-name {
  font-weight: 500;
}

.property-type-count {
  font-weight: 600;
  color: var(--primary-color, #2196f3);
}
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing with Vitest

##### 1. Create Vitest Configuration (if not already done)

Use the existing vitest.config.ts file from Chunk 1, or create it if needed:

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
    exclude: ['**/node_modules/**', '**/dist/**'],
    include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**']
    },
    reporters: ['default'],
    pool: 'forks',
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

##### 2. Create tests for PanelSyncContext

📄 **client/src/__tests__/context/PanelSyncContext.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { usePanelSync } from '../../hooks/usePanelSync';

// Test component that uses panel sync context
const TestComponent = ({ onEvent }: { onEvent: (event: any) => void }) => {
  const { subscribe, broadcast } = usePanelSync();
  
  React.useEffect(() => {
    return subscribe((event) => {
      onEvent(event);
    });
  }, [subscribe, onEvent]);
  
  return (
    <button 
      onClick={() => broadcast({ type: 'test', payload: { value: 'test' }, source: 'test' })}
      data-testid="broadcast-button"
    >
      Broadcast
    </button>
  );
};

describe('PanelSyncContext', () => {
  it('broadcasts events to subscribers', () => {
    const mockEventHandler = vi.fn();
    
    render(
      <PanelSyncProvider>
        <TestComponent onEvent={mockEventHandler} />
      </PanelSyncProvider>
    );
    
    // Click the broadcast button
    fireEvent.click(screen.getByTestId('broadcast-button'));
    
    // Verify event handler was called with correct event
    expect(mockEventHandler).toHaveBeenCalledWith({
      type: 'test',
      payload: { value: 'test' },
      source: 'test'
    });
  });
});
```

##### 3. Create integration test for panel communication

📄 **client/src/__tests__/integration/PanelCommunication.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MultiFrameContainer } from '../../components/multiframe/MultiFrameContainer';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';

// Mock for the panel content registry
vi.mock('../../services/panelContentRegistry', () => {
  const MockCountyPanel = ({ panelId, onAction }: any) => (
    <div data-testid={`county-panel-${panelId}`}>
      <button 
        data-testid="county-filter-button"
        onClick={() => onAction({ 
          type: 'filter', 
          payload: { propertyType: 'Residential' } 
        })}
      >
        Filter
      </button>
    </div>
  );
  
  const MockPropertyPanel = ({ panelId, initialState }: any) => (
    <div data-testid={`property-panel-${panelId}`}>
      <div data-testid="property-filter-value">
        {initialState.propertyType || 'None'}
      </div>
    </div>
  );
  
  return {
    getPanelContent: (type: string) => {
      if (type === 'county') return MockCountyPanel;
      if (type === 'property') return MockPropertyPanel;
      return () => <div>Mock Panel</div>;
    },
    initializeContentRegistry: vi.fn()
  };
});

describe('Panel Communication Integration', () => {
  it('panels can communicate via events', async () => {
    render(
      <LayoutContextProvider>
        <PanelSyncProvider>
          <MultiFrameContainer
            initialLayout="dual"
            panels={[
              { id: 'county', contentType: 'county', title: 'County', position: { row: 0, col: 0 } },
              { id: 'property', contentType: 'property', title: 'Properties', position: { row: 0, col: 1 } }
            ]}
          />
        </PanelSyncProvider>
      </LayoutContextProvider>
    );
    
    // Verify panels are rendered
    expect(screen.getByTestId('county-panel-county')).toBeInTheDocument();
    expect(screen.getByTestId('property-panel-property')).toBeInTheDocument();
    
    // Initial property filter should be 'None'
    expect(screen.getByTestId('property-filter-value')).toHaveTextContent('None');
    
    // Click the filter button in the county panel
    fireEvent.click(screen.getByTestId('county-filter-button'));
    
    // Property panel should receive the filter event
    expect(screen.getByTestId('property-filter-value')).toHaveTextContent('Residential');
  });
});
```

##### 4. Create Test Script for Panel Communication

📄 **test-panel-communication.ps1**
```powershell
# PowerShell script to run panel communication tests with Vitest
cd client

echo "Running Panel Communication Tests..."

# Run context tests
npx vitest run src/__tests__/context/ --config ./vitest.config.ts --no-coverage

echo "Running Integration Tests..."

# Run integration tests
npx vitest run src/__tests__/integration/ --config ./vitest.config.ts --no-coverage

echo "All panel communication tests completed!"
```

##### 5. Run tests to verify implementation

```bash
# Navigate to client directory
cd client

# Run the test script
./test-panel-communication.ps1

# Or run all tests
npx vitest run
```

#### ✅ Commit and Push Your Changes

```bash
# Make sure all changes are staged
git add .

# Commit your changes with a descriptive message
git commit -m "Chunk 2: Implement panel communication and content registry with Vitest tests"

# Push your changes to the remote repository
git push origin feature/panel-communication
```

#### 🔃 Create a Pull Request

1. Go to your repository on GitHub
2. Click on "Pull requests" > "New pull request"
3. Set the base branch to `development` (not main)
4. Set the compare branch to `feature/panel-communication`
5. Add a title: "Implement Panel Communication and Content Registry"
6. Add a description referencing this markdown doc
7. Add screenshots of panel communication in action
8. Request review from team members

#### 📝 Update Documentation

Create a new documentation file:
📄 **docs/components/multi-frame/chunk-2-panel-communication.md**

Include the following content:
- Overview of the panel communication system
- Explanation of the PanelSyncContext and LayoutContext
- Diagrams showing event flow between panels
- Code examples for broadcasting and subscribing to events
- Screenshots of CountyPanel in action
- Description of the panel content registry system

#### 🔗 Integration Targets

- Builds on Core Container and Layout (Chunk 1)
- Enables Panel State Management (Chunk 3)
- Provides foundation for Layout Persistence (Chunk 4)
- Supports Controller Integration (Chunk 5)

#### 📋 Completion Log

- [ ] PanelSyncContext implementation complete
- [ ] LayoutContext implementation complete
- [ ] Custom hooks implementation complete
- [ ] Enhanced panel content registry complete
- [ ] CountyPanel implementation complete
- [ ] Vitest configuration complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Pull request created

## 📈 Implementation References

### Example of Panel Communication

```typescript
// In a panel component
import { usePanelSync } from '../../../hooks/usePanelSync';

export const ExamplePanel = ({ panelId }) => {
  const { broadcast, subscribe } = usePanelSync();
  
  // Subscribe to events
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId && event.type === 'select') {
        // Handle selection event from another panel
        console.log('Selected:', event.payload);
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Broadcast an event
  const handleSelection = (item) => {
    broadcast({
      type: 'select',
      payload: item,
      source: panelId
    });
  };
  
  return (
    <div>
      {/* Panel content */}
    </div>
  );
};
```

### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ PanelSyncProvider                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ LayoutContextProvider                               │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ MultiFrameContainer                             │ │ │
│ │ │                                                 │ │ │
│ │ │     ┌─────────────┐         ┌─────────────┐    │ │ │
│ │ │     │ CountyPanel │◄───────►│PropertyPanel│    │ │ │
│ │ │     └─────────────┘  Events └─────────────┘    │ │ │
│ │ │                                                 │ │ │
│ │ │     ┌─────────────┐         ┌─────────────┐    │ │ │
│ │ │     │   MapPanel  │◄───────►│ FilterPanel │    │ │ │
│ │ │     └─────────────┘  Events └─────────────┘    │ │ │
│ │ │                                                 │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Event Flow Diagram

```
┌─────────────┐                         ┌─────────────┐
│ CountyPanel │                         │PropertyPanel│
└──────┬──────┘                         └──────┬──────┘
       │                                       │
       │  1. User selects property type        │
       │                                       │
       ▼                                       │
┌─────────────────┐     2. Broadcast event     │
│  broadcast()    │────────────────────────────┘
│ type: 'filter'  │                             
└─────────────────┘                             
       │                                        
       │                                        
       │                                        
       ▼                                        
┌─────────────────┐                             
│PanelSyncContext │                             
└─────────────────┘                             
       │                                        
       │  3. Notify all subscribers             
       │                                        
       ▼                                        
┌─────────────────┐                             
│  subscribe()    │                             
│ PropertyPanel   │                             
└─────────────────┘                             
       │                                        
       │  4. Update PropertyPanel state         
       │                                        
       ▼                                        
┌─────────────────┐                             
│  Filter applied │                             
└─────────────────┘                             
```
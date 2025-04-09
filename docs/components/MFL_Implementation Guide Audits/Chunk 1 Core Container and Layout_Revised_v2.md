✅ **Status**: Ready for Implementation  
📅 **Target Completion**: Two weeks from start date
📄 **Doc Path**: /docs/components/multi-frame/chunk-1-core-layout-v2.md

# 🧩 Chunk 1: Core Container and Layout System (Comprehensive Revision)

## 🎯 Objective

Establish the core container and layout architecture for the multi-frame interface. This includes:

1. The foundational `MultiFrameContainer` component that supports both standard layouts and an advanced layout system
2. Standard layout components (Single, Dual, Tri, and Quad panel layouts)
3. An advanced layout system with draggable and resizable panels
4. Proper support for different panel types (map, state, county, property)
5. A unified type system that supports both positioning approaches

This chunk lays the foundation for a flexible and extensible visual system that will be enhanced with panel communication and state management in later chunks.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

#### 1. Git Repository Setup

Create your Git branch:
```bash
# Make sure you're in your project directory
cd path/to/your/project

# Checkout development branch and get latest changes
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/multi-frame-core-layout-v2
```

#### 2. Required Folders
Verify these folders exist, create them if they don't:
```
client/src/components/multiframe/
client/src/components/multiframe/layouts/
client/src/components/multiframe/controls/
client/src/components/multiframe/panels/
client/src/types/
client/src/__tests__/components/multiframe/
client/src/__tests__/components/multiframe/layouts/
client/src/__tests__/components/multiframe/controls/
client/src/__tests__/services/
```

#### 3. Install Necessary Packages
```bash
# Navigate to client directory
cd client

# Install required packages
npm install clsx react-resizable vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom mongodb-memory-server
```

#### 4. Vitest Setup
Create `client/vitest.config.ts`:

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

Create `client/src/setupTests.ts`:

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

// Add matchers to expect
expect.extend(matchers)

// Setup global mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear()
  vi.resetAllMocks()
})
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Define Unified Type Definitions

📄 **client/src/types/layout.types.ts**
```typescript
// Layout Types
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad' | 'advanced';

// Panel Content Types
export type PanelContentType = 'map' | 'state' | 'county' | 'property' | 'filter' | 'stats' | 'chart';

// Panel Position - Standard Layout (Row/Column based)
export interface PanelPosition {
  row: number;
  col: number;
}

// Panel Position - Advanced Layout (X/Y/Width/Height based)
export interface AdvancedPanelPosition {
  x: number;      // Position from left (percentage of container width)
  y: number;      // Position from top (percentage of container height)
  width: number;  // Percentage of container width
  height: number; // Percentage of container height
}

// Panel Size for Standard Layouts
export interface PanelSize {
  width: number;  // Percentage of container width
  height: number; // Percentage of container height
}

// Base Panel Configuration
export interface PanelConfigBase {
  id: string;
  contentType: PanelContentType;
  title: string;
  state?: any;
  visible?: boolean;
  closable?: boolean;
  maximizable?: boolean;
}

// Standard Panel Configuration
export interface StandardPanelConfig extends PanelConfigBase {
  position?: PanelPosition;
  size?: PanelSize;
}

// Advanced Panel Configuration
export interface AdvancedPanelConfig extends PanelConfigBase {
  position: AdvancedPanelPosition;
}

// Union type for panel configuration
export type PanelConfig = StandardPanelConfig | AdvancedPanelConfig;

// Layout Configuration
export interface LayoutConfig {
  id?: string;
  name: string;
  description?: string;
  type: LayoutType;
  panels: PanelConfig[];
  isDefault?: boolean;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper to determine if a panel config is an advanced panel config
export function isAdvancedPanelConfig(config: PanelConfig): config is AdvancedPanelConfig {
  return 'position' in config && 
         'x' in (config.position as AdvancedPanelPosition) && 
         'y' in (config.position as AdvancedPanelPosition);
}
```

#### 2. Create MultiFrameContainer Component

📄 **client/src/components/multiframe/MultiFrameContainer.tsx**
```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { AdvancedLayout } from './layouts/AdvancedLayout';
import { 
  PanelConfig, 
  LayoutConfig, 
  LayoutType, 
  StandardPanelConfig, 
  AdvancedPanelConfig,
  PanelContentType 
} from '../../types/layout.types';
import './MultiFrameContainer.css';

export interface MultiFrameContainerProps {
  initialLayout: LayoutType;
  panels?: PanelConfig[];
  defaultPanelContent?: Record<string, string>;
  onLayoutChange?: (layout: LayoutConfig) => void;
  className?: string;
  enableAdvancedLayout?: boolean;
  _isTestingMode?: boolean; // Special flag to prevent infinite renders in tests
}

/* 
 * IMPORTANT NOTE ON enableAdvancedLayout:
 * The MultiFrameContainer component sets enableAdvancedLayout to true by default,
 * while the LayoutSelector component sets its own enableAdvancedLayout to false by default.
 * 
 * When MultiFrameContainer passes this property to LayoutSelector, the container's value
 * overrides the selector's default, making advanced layout options enabled by default
 * when using MultiFrameContainer.
 * 
 * This behavior ensures that:
 * 1. When the MultiFrameContainer is used directly, the advanced layout is available by default
 * 2. When the LayoutSelector is used independently, the advanced layout is disabled by default
 * 3. The advanced layout can be explicitly disabled by passing enableAdvancedLayout={false}
 *    to MultiFrameContainer
 */

export const MultiFrameContainer: React.FC<MultiFrameContainerProps> = ({
  initialLayout = 'single',
  panels = [],
  defaultPanelContent = {},
  onLayoutChange,
  className = '',
  enableAdvancedLayout = true,
  _isTestingMode = false,
}) => {
  // State
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [panelConfigs, setPanelConfigs] = useState<PanelConfig[]>(panels);
  
  // Initialize default panels if none provided
  useMemo(() => {
    if (panels.length === 0) {
      const defaultPanels: PanelConfig[] = [];
      
      if (layoutType === 'single') {
        defaultPanels.push({
          id: 'default',
          contentType: (defaultPanelContent.default || 'map') as PanelContentType,
          title: 'Default Panel',
          position: { row: 0, col: 0 },
          size: { width: 100, height: 100 },
          maximizable: true,
          closable: false
        });
      } else if (layoutType === 'dual') {
        defaultPanels.push({
          id: 'left',
          contentType: (defaultPanelContent.left || 'map') as PanelContentType,
          title: 'Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 100 },
          maximizable: true,
          closable: false
        });
        defaultPanels.push({
          id: 'right',
          contentType: (defaultPanelContent.right || 'property') as PanelContentType,
          title: 'Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 100 },
          maximizable: true,
          closable: false
        });
      } else if (layoutType === 'tri') {
        defaultPanels.push({
          id: 'top-left',
          contentType: (defaultPanelContent['top-left'] || 'map') as PanelContentType,
          title: 'Top Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 50 },
          maximizable: true,
          closable: false
        });
        defaultPanels.push({
          id: 'top-right',
          contentType: (defaultPanelContent['top-right'] || 'state') as PanelContentType,
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 },
          maximizable: true,
          closable: false
        });
        defaultPanels.push({
          id: 'bottom',
          contentType: (defaultPanelContent.bottom || 'county') as PanelContentType,
          title: 'Bottom Panel',
          position: { row: 1, col: 0 },
          size: { width: 100, height: 50 },
          maximizable: true,
          closable: false
        });
      } else if (layoutType === 'quad') {
        defaultPanels.push({
          id: 'top-left',
          contentType: (defaultPanelContent['top-left'] || 'map') as PanelContentType,
          title: 'Top Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 50 },
          maximizable: true,
          closable: false
        });
        defaultPanels.push({
          id: 'top-right',
          contentType: (defaultPanelContent['top-right'] || 'state') as PanelContentType,
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 },
          maximizable: true,
          closable: false
        });
        defaultPanels.push({
          id: 'bottom-left',
          contentType: (defaultPanelContent['bottom-left'] || 'county') as PanelContentType,
          title: 'Bottom Left Panel',
          position: { row: 1, col: 0 },
          size: { width: 50, height: 50 },
          maximizable: true,
          closable: false
        });
        defaultPanels.push({
          id: 'bottom-right',
          contentType: (defaultPanelContent['bottom-right'] || 'property') as PanelContentType,
          title: 'Bottom Right Panel',
          position: { row: 1, col: 1 },
          size: { width: 50, height: 50 },
          maximizable: true,
          closable: false
        });
      } else if (layoutType === 'advanced') {
        // For advanced layout, provide default panels with x/y positioning
        defaultPanels.push({
          id: 'panel-1',
          contentType: 'map',
          title: 'Map Panel',
          position: { x: 0, y: 0, width: 70, height: 70 },
          maximizable: true,
          closable: true
        } as AdvancedPanelConfig);
        
        defaultPanels.push({
          id: 'panel-2',
          contentType: 'property',
          title: 'Property Panel',
          position: { x: 70, y: 0, width: 30, height: 70 },
          maximizable: true,
          closable: true
        } as AdvancedPanelConfig);
        
        defaultPanels.push({
          id: 'panel-3',
          contentType: 'county',
          title: 'County Panel',
          position: { x: 0, y: 70, width: 100, height: 30 },
          maximizable: true,
          closable: true
        } as AdvancedPanelConfig);
      }
      
      setPanelConfigs(defaultPanels);
    }
  }, [layoutType, panels.length, defaultPanelContent]);
  
  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
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
      case 'advanced':
        return <AdvancedLayout panels={panelConfigs} />;
      default:
        return <SinglePanelLayout panels={panelConfigs} />;
    }
  }, [layoutType, panelConfigs]);
  
  return (
    <div className={`multi-frame-container ${className}`} data-testid="multi-frame-container">
      <div className="layout-controls">
        <LayoutSelector
          currentLayout={layoutType}
          onLayoutChange={handleLayoutChange}
          enableAdvancedLayout={enableAdvancedLayout}
        />
      </div>
      <div className="layout-container" data-testid={`${layoutType}-layout-container`}>
        {renderLayout()}
      </div>
    </div>
  );
};
```

#### 3. Create Enhanced MultiFrame Container Component

📄 **client/src/components/multiframe/EnhancedMultiFrameContainer.tsx**
```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { AdvancedLayout } from './layouts/AdvancedLayout';
import { 
  PanelConfig, 
  LayoutConfig, 
  LayoutType, 
  AdvancedPanelConfig,
  AdvancedPanelPosition
} from '../../types/layout.types';
import './EnhancedMultiFrameContainer.css';

/**
 * Enhanced MultiFrame Container Props
 * This container is specialized for advanced layout scenarios with
 * more granular control over panel positioning and behavior.
 */
export interface EnhancedMultiFrameContainerProps {
  initialLayout?: LayoutType;
  panels?: AdvancedPanelConfig[];
  onLayoutChange?: (layout: LayoutConfig) => void;
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelClose?: (panelId: string) => void;
  onPanelAdd?: (newPanel: AdvancedPanelConfig) => void;
  className?: string;
  showLayoutSelector?: boolean;
  layoutOptions?: LayoutType[];
}

export const EnhancedMultiFrameContainer: React.FC<EnhancedMultiFrameContainerProps> = ({
  initialLayout = 'advanced',
  panels = [],
  onLayoutChange,
  onPanelStateChange,
  onPanelClose,
  onPanelAdd,
  className = '',
  showLayoutSelector = true,
  layoutOptions = ['advanced'],
}) => {
  // State
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [panelConfigs, setPanelConfigs] = useState<AdvancedPanelConfig[]>(panels);
  
  // Effect to initialize default panels if none provided
  useEffect(() => {
    if (panels.length === 0) {
      // Create default panels for an advanced layout
      const defaultPanels: AdvancedPanelConfig[] = [
        {
          id: 'panel-1',
          contentType: 'map',
          title: 'Map Panel',
          position: { x: 0, y: 0, width: 70, height: 70 },
          maximizable: true,
          closable: true
        },
        {
          id: 'panel-2',
          contentType: 'property',
          title: 'Property Panel',
          position: { x: 70, y: 0, width: 30, height: 70 },
          maximizable: true,
          closable: true
        },
        {
          id: 'panel-3',
          contentType: 'county',
          title: 'County Panel',
          position: { x: 0, y: 70, width: 100, height: 30 },
          maximizable: true,
          closable: true
        }
      ];
      
      setPanelConfigs(defaultPanels);
    }
  }, [panels.length]);
  
  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    setLayoutType(newLayout);
    
    // Notify parent component
    if (onLayoutChange) {
      onLayoutChange({
        name: `${newLayout} layout`,
        type: newLayout,
        panels: panelConfigs
      });
    }
  }, [panelConfigs, onLayoutChange]);
  
  // Handle panel position change
  const handlePanelPositionChange = useCallback((panelId: string, newPosition: AdvancedPanelPosition) => {
    setPanelConfigs(prev => {
      const updated = prev.map(panel => {
        if (panel.id === panelId) {
          return { ...panel, position: newPosition };
        }
        return panel;
      });
      
      // Notify parent component
      if (onLayoutChange) {
        onLayoutChange({
          name: `${layoutType} layout`,
          type: layoutType,
          panels: updated
        });
      }
      
      return updated;
    });
  }, [layoutType, onLayoutChange]);
  
  // Handle panel state change
  const handlePanelStateChange = useCallback((panelId: string, newState: any) => {
    if (onPanelStateChange) {
      onPanelStateChange(panelId, newState);
    }
  }, [onPanelStateChange]);
  
  // Handle panel close
  const handlePanelClose = useCallback((panelId: string) => {
    setPanelConfigs(prev => {
      const updated = prev.filter(panel => panel.id !== panelId);
      
      // Notify parent component
      if (onLayoutChange) {
        onLayoutChange({
          name: `${layoutType} layout`,
          type: layoutType,
          panels: updated
        });
      }
      
      if (onPanelClose) {
        onPanelClose(panelId);
      }
      
      return updated;
    });
  }, [layoutType, onLayoutChange, onPanelClose]);
  
  // Handle adding a new panel
  const handlePanelAdd = useCallback((newPanel: AdvancedPanelConfig) => {
    setPanelConfigs(prev => {
      const updated = [...prev, newPanel];
      
      // Notify parent component
      if (onLayoutChange) {
        onLayoutChange({
          name: `${layoutType} layout`,
          type: layoutType,
          panels: updated
        });
      }
      
      if (onPanelAdd) {
        onPanelAdd(newPanel);
      }
      
      return updated;
    });
  }, [layoutType, onLayoutChange, onPanelAdd]);
  
  return (
    <div className={`enhanced-multi-frame-container ${className}`} data-testid="enhanced-multi-frame-container">
      {showLayoutSelector && (
        <div className="layout-controls">
          <LayoutSelector
            currentLayout={layoutType}
            onLayoutChange={handleLayoutChange}
            enableAdvancedLayout={true}
            availableLayouts={layoutOptions}
          />
        </div>
      )}
      <div className="advanced-layout-container" data-testid="advanced-layout-container">
        <AdvancedLayout 
          panels={panelConfigs}
          onPanelPositionChange={handlePanelPositionChange}
          onPanelStateChange={handlePanelStateChange}
          onPanelClose={handlePanelClose}
          onPanelAdd={handlePanelAdd}
        />
      </div>
    </div>
  );
};
```

#### 4. Create LayoutSelector Component

📄 **client/src/components/multiframe/controls/LayoutSelector.tsx**
```typescript
import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import './LayoutSelector.css';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  enableAdvancedLayout?: boolean;
  availableLayouts?: LayoutType[];
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
  enableAdvancedLayout = false,
  availableLayouts = ['single', 'dual', 'tri', 'quad']
}) => {
  // If advanced layout is enabled, add it to available layouts
  const layouts = enableAdvancedLayout 
    ? [...availableLayouts, 'advanced'].filter((layout, index, self) => self.indexOf(layout) === index)
    : availableLayouts;
  
  return (
    <div className="layout-selector" data-testid="layout-selector">
      {layouts.includes('single') && (
        <button
          className={`layout-button ${currentLayout === 'single' ? 'active' : ''}`}
          onClick={() => onLayoutChange('single')}
          aria-label="Single panel layout"
          data-testid="layout-selector-single"
        >
          <div className="single-icon"></div>
          <span>Single</span>
        </button>
      )}
      
      {layouts.includes('dual') && (
        <button
          className={`layout-button ${currentLayout === 'dual' ? 'active' : ''}`}
          onClick={() => onLayoutChange('dual')}
          aria-label="Dual panel layout"
          data-testid="layout-selector-dual"
        >
          <div className="dual-icon"></div>
          <span>Dual</span>
        </button>
      )}
      
      {layouts.includes('tri') && (
        <button
          className={`layout-button ${currentLayout === 'tri' ? 'active' : ''}`}
          onClick={() => onLayoutChange('tri')}
          aria-label="Tri panel layout"
          data-testid="layout-selector-tri"
        >
          <div className="tri-icon"></div>
          <span>Tri</span>
        </button>
      )}
      
      {layouts.includes('quad') && (
        <button
          className={`layout-button ${currentLayout === 'quad' ? 'active' : ''}`}
          onClick={() => onLayoutChange('quad')}
          aria-label="Quad panel layout"
          data-testid="layout-selector-quad"
        >
          <div className="quad-icon"></div>
          <span>Quad</span>
        </button>
      )}
      
      {layouts.includes('advanced') && (
        <button
          className={`layout-button ${currentLayout === 'advanced' ? 'active' : ''}`}
          onClick={() => onLayoutChange('advanced')}
          aria-label="Advanced customizable layout"
          data-testid="layout-selector-advanced"
        >
          <div className="advanced-icon"></div>
          <span>Advanced</span>
        </button>
      )}
    </div>
  );
};
```

#### 5. Implement Standard Layout Components

📄 **client/src/components/multiframe/layouts/SinglePanelLayout.tsx**
```typescript
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig, StandardPanelConfig } from '../../../types/layout.types';
import './SinglePanelLayout.css';

interface SinglePanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const SinglePanelLayout: React.FC<SinglePanelLayoutProps> = ({ 
  panels,
  onPanelStateChange,
  onPanelAction
}) => {
  // For single panel layout, we only use the first panel
  const panel = panels[0] as StandardPanelConfig;
  
  if (!panel) {
    return <div className="empty-layout" data-testid="empty-single-layout">No panel configured</div>;
  }
  
  return (
    <div className="single-panel-layout" data-testid="single-layout">
      <PanelContainer
        id={panel.id}
        title={panel.title}
        contentType={panel.contentType}
        initialState={panel.state}
        className="full-size-panel"
        maximizable={panel.maximizable}
        closable={panel.closable}
        onStateChange={newState => onPanelStateChange?.(panel.id, newState)}
        onAction={action => onPanelAction?.(panel.id, action)}
      />
    </div>
  );
};

📄 **client/src/components/multiframe/layouts/TriPanelLayout.tsx**
```typescript
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig, StandardPanelConfig } from '../../../types/layout.types';
import './TriPanelLayout.css';

interface TriPanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const TriPanelLayout: React.FC<TriPanelLayoutProps> = ({ 
  panels,
  onPanelStateChange,
  onPanelAction
}) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const topRightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  const bottomPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 1
  ) || panels[2];
  
  if (!topLeftPanel || !topRightPanel || !bottomPanel) {
    return <div className="empty-layout" data-testid="empty-tri-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="tri-panel-layout" data-testid="tri-layout">
      <div className="top-row">
        <div className="top-left-panel">
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className="panel-container"
            maximizable={'maximizable' in topLeftPanel ? topLeftPanel.maximizable : true}
            closable={'closable' in topLeftPanel ? topLeftPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(topLeftPanel.id, newState)}
            onAction={action => onPanelAction?.(topLeftPanel.id, action)}
          />
        </div>
        <div className="top-right-panel">
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className="panel-container"
            maximizable={'maximizable' in topRightPanel ? topRightPanel.maximizable : true}
            closable={'closable' in topRightPanel ? topRightPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(topRightPanel.id, newState)}
            onAction={action => onPanelAction?.(topRightPanel.id, action)}
          />
        </div>
      </div>
      <div className="bottom-row">
        <PanelContainer
          id={bottomPanel.id}
          title={bottomPanel.title}
          contentType={bottomPanel.contentType}
          initialState={bottomPanel.state}
          className="panel-container"
          maximizable={'maximizable' in bottomPanel ? bottomPanel.maximizable : true}
          closable={'closable' in bottomPanel ? bottomPanel.closable : false}
          onStateChange={newState => onPanelStateChange?.(bottomPanel.id, newState)}
          onAction={action => onPanelAction?.(bottomPanel.id, action)}
        />
      </div>
    </div>
  );
};
```

📄 **client/src/components/multiframe/layouts/QuadPanelLayout.tsx**
```typescript
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig, StandardPanelConfig } from '../../../types/layout.types';
import './QuadPanelLayout.css';

interface QuadPanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const QuadPanelLayout: React.FC<QuadPanelLayoutProps> = ({ 
  panels,
  onPanelStateChange,
  onPanelAction
}) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const topRightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  const bottomLeftPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 1 && p.position.col === 0
  ) || panels[2];
  
  const bottomRightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && 
    p.position.row === 1 && p.position.col === 1
  ) || panels[3];
  
  if (!topLeftPanel || !topRightPanel || !bottomLeftPanel || !bottomRightPanel) {
    return <div className="empty-layout" data-testid="empty-quad-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="quad-panel-layout" data-testid="quad-layout">
      <div className="top-row">
        <div className="top-left-panel">
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className="panel-container"
            maximizable={'maximizable' in topLeftPanel ? topLeftPanel.maximizable : true}
            closable={'closable' in topLeftPanel ? topLeftPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(topLeftPanel.id, newState)}
            onAction={action => onPanelAction?.(topLeftPanel.id, action)}
          />
        </div>
        <div className="top-right-panel">
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className="panel-container"
            maximizable={'maximizable' in topRightPanel ? topRightPanel.maximizable : true}
            closable={'closable' in topRightPanel ? topRightPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(topRightPanel.id, newState)}
            onAction={action => onPanelAction?.(topRightPanel.id, action)}
          />
        </div>
      </div>
      <div className="bottom-row">
        <div className="bottom-left-panel">
          <PanelContainer
            id={bottomLeftPanel.id}
            title={bottomLeftPanel.title}
            contentType={bottomLeftPanel.contentType}
            initialState={bottomLeftPanel.state}
            className="panel-container"
            maximizable={'maximizable' in bottomLeftPanel ? bottomLeftPanel.maximizable : true}
            closable={'closable' in bottomLeftPanel ? bottomLeftPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(bottomLeftPanel.id, newState)}
            onAction={action => onPanelAction?.(bottomLeftPanel.id, action)}
          />
        </div>
        <div className="bottom-right-panel">
          <PanelContainer
            id={bottomRightPanel.id}
            title={bottomRightPanel.title}
            contentType={bottomRightPanel.contentType}
            initialState={bottomRightPanel.state}
            className="panel-container"
            maximizable={'maximizable' in bottomRightPanel ? bottomRightPanel.maximizable : true}
            closable={'closable' in bottomRightPanel ? bottomRightPanel.closable : false}
            onStateChange={newState => onPanelStateChange?.(bottomRightPanel.id, newState)}
            onAction={action => onPanelAction?.(bottomRightPanel.id, action)}
          />
        </div>
      </div>
    </div>
  );
};
```

📄 **client/src/components/multiframe/layouts/DualPanelLayout.tsx**
```typescript
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig, StandardPanelConfig } from '../../../types/layout.types';
import './DualPanelLayout.css';

interface DualPanelLayoutProps {
  panels: PanelConfig[];
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelAction?: (panelId: string, action: any) => void;
}

export const DualPanelLayout: React.FC<DualPanelLayoutProps> = ({ 
  panels,
  onPanelStateChange,
  onPanelAction
}) => {
  // Ensure we have exactly two panels
  const leftPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 0
  ) || panels[0];
  
  const rightPanel = panels.find(p => 
    'position' in p && p.position && 'row' in p.position && p.position.row === 0 && p.position.col === 1
  ) || panels[1];
  
  if (!leftPanel || !rightPanel) {
    return <div className="empty-layout" data-testid="empty-dual-layout">Insufficient panels configured</div>;
  }
  
  return (
    <div className="dual-panel-layout" data-testid="dual-layout">
      <div className="left-panel">
        <PanelContainer
          id={leftPanel.id}
          title={leftPanel.title}
          contentType={leftPanel.contentType}
          initialState={leftPanel.state}
          className="panel-container"
          maximizable={'maximizable' in leftPanel ? leftPanel.maximizable : true}
          closable={'closable' in leftPanel ? leftPanel.closable : false}
          onStateChange={newState => onPanelStateChange?.(leftPanel.id, newState)}
          onAction={action => onPanelAction?.(leftPanel.id, action)}
        />
      </div>
      <div className="right-panel">
        <PanelContainer
          id={rightPanel.id}
          title={rightPanel.title}
          contentType={rightPanel.contentType}
          initialState={rightPanel.state}
          className="panel-container"
          maximizable={'maximizable' in rightPanel ? rightPanel.maximizable : true}
          closable={'closable' in rightPanel ? rightPanel.closable : false}
          onStateChange={newState => onPanelStateChange?.(rightPanel.id, newState)}
          onAction={action => onPanelAction?.(rightPanel.id, action)}
        />
      </div>
    </div>
  );
};

#### 6. Implement Advanced Layout Component

📄 **client/src/components/multiframe/layouts/AdvancedLayout.tsx**
```typescript
import React, { useState, useCallback } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { PanelContainer } from '../PanelContainer';
import { AdvancedPanelConfig, AdvancedPanelPosition } from '../../../types/layout.types';
import './AdvancedLayout.css';

interface AdvancedLayoutProps {
  panels: AdvancedPanelConfig[];
  onPanelPositionChange?: (panelId: string, newPosition: AdvancedPanelPosition) => void;
  onPanelStateChange?: (panelId: string, newState: any) => void;
  onPanelClose?: (panelId: string) => void;
  onPanelAdd?: (newPanel: AdvancedPanelConfig) => void;
}

export const AdvancedLayout: React.FC<AdvancedLayoutProps> = ({
  panels,
  onPanelPositionChange,
  onPanelStateChange,
  onPanelClose,
  onPanelAdd
}) => {
  // State for dragging
  const [draggingPanel, setDraggingPanel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Handle panel drag start
  const handleDragStart = useCallback((panelId: string, clientX: number, clientY: number) => {
    setDraggingPanel(panelId);
    
    // Find panel element to calculate drag offset
    const panelElement = document.querySelector(`[data-panel-id="${panelId}"]`);
    if (panelElement) {
      const rect = panelElement.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  }, []);
  
  // Handle panel drag
  const handleDrag = useCallback((clientX: number, clientY: number) => {
    if (!draggingPanel || !onPanelPositionChange) return;
    
    const panel = panels.find(p => p.id === draggingPanel);
    if (!panel) return;
    
    // Get container dimensions for percentage calculation
    const container = document.querySelector('.advanced-layout-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate new position in percentages
    const newX = Math.max(0, Math.min(100, ((clientX - dragOffset.x - containerRect.left) / containerRect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((clientY - dragOffset.y - containerRect.top) / containerRect.height) * 100));
    
    // Update panel position
    onPanelPositionChange(draggingPanel, {
      ...panel.position,
      x: newX,
      y: newY
    });
  }, [draggingPanel, dragOffset, panels, onPanelPositionChange]);
  
  // Handle panel drag end
  const handleDragEnd = useCallback(() => {
    setDraggingPanel(null);
  }, []);
  
  // Handle panel resize
  const handleResize = useCallback((panelId: string, _: React.SyntheticEvent, data: ResizeCallbackData) => {
    if (!onPanelPositionChange) return;
    
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;
    
    // Get container dimensions for percentage calculation
    const container = document.querySelector('.advanced-layout-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate new size in percentages
    const newWidth = Math.max(10, Math.min(100, (data.size.width / containerRect.width) * 100));
    const newHeight = Math.max(10, Math.min(100, (data.size.height / containerRect.height) * 100));
    
    // Update panel position with new size
    onPanelPositionChange(panelId, {
      ...panel.position,
      width: newWidth,
      height: newHeight
    });
  }, [panels, onPanelPositionChange]);
  
  // Handle panel close
  const handlePanelClose = useCallback((panelId: string) => {
    if (onPanelClose) {
      onPanelClose(panelId);
    }
  }, [onPanelClose]);
  
  // Handle panel action
  const handlePanelAction = useCallback((panelId: string, action: any) => {
    if (action.type === 'close') {
      handlePanelClose(panelId);
    }
  }, [handlePanelClose]);
  
  return (
    <div 
      className="advanced-layout" 
      data-testid="advanced-layout"
      onMouseMove={e => draggingPanel && handleDrag(e.clientX, e.clientY)}
      onMouseUp={() => draggingPanel && handleDragEnd()}
      onMouseLeave={() => draggingPanel && handleDragEnd()}
    >
      {panels.map(panel => (
        <Resizable
          key={panel.id}
          width={panel.position.width * 10} // Convert percentage to pixels for the resizable component
          height={panel.position.height * 10}
          onResize={(e, data) => handleResize(panel.id, e, data)}
          draggableOpts={{ grid: [10, 10] }}
        >
          <div 
            className="advanced-panel-wrapper"
            style={{
              position: 'absolute',
              left: `${panel.position.x}%`,
              top: `${panel.position.y}%`,
              width: `${panel.position.width}%`,
              height: `${panel.position.height}%`,
              zIndex: draggingPanel === panel.id ? 10 : 1
            }}
          >
            <div 
              className="panel-drag-handle"
              onMouseDown={e => handleDragStart(panel.id, e.clientX, e.clientY)}
            ></div>
            <PanelContainer
              id={panel.id}
              title={panel.title}
              contentType={panel.contentType}
              initialState={panel.state}
              className="advanced-panel"
              maximizable={panel.maximizable}
              closable={panel.closable}
              onStateChange={newState => onPanelStateChange?.(panel.id, newState)}
              onAction={action => handlePanelAction(panel.id, action)}
            />
          </div>
        </Resizable>
      ))}
      
      {/* Optional: Add panel button */}
      {onPanelAdd && (
        <button 
          className="add-panel-button" 
          onClick={() => {
            if (onPanelAdd) {
              const newPanelId = `panel-${Date.now()}`;
              onPanelAdd({
                id: newPanelId,
                contentType: 'map',
                title: 'New Panel',
                position: { x: 10, y: 10, width: 30, height: 30 },
                maximizable: true,
                closable: true
              });
            }
          }}
          data-testid="add-panel-button"
        >
          Add Panel
        </button>
      )}
    </div>
  );
};
```

#### 7. Create PanelContainer Component

📄 **client/src/components/multiframe/PanelContainer.tsx**
```typescript
import React, { useState } from 'react';
import { PanelHeader } from './PanelHeader';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelContentType } from '../../types/layout.types';
import './PanelContainer.css';

export interface PanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
  className?: string;
  maximizable?: boolean;
  closable?: boolean;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  id,
  title,
  contentType,
  initialState = {},
  onStateChange,
  onAction,
  className = '',
  maximizable = true,
  closable = false,
}) => {
  // State
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  
  // Handle panel actions
  const handleAction = (action: { type: string, payload?: any }) => {
    // Handle basic actions internally
    if (action.type === 'maximize' && maximizable) {
      setIsMaximized(prev => !prev);
    }
    
    // Pass action to parent if callback provided
    if (onAction) {
      onAction(action);
    }
  };
  
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
        showMaximizeButton={maximizable}
        showCloseButton={closable}
      />
      <div className="panel-content">
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={initialState}
            onStateChange={onStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className="no-content" data-testid="no-content">
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### 8. Create PanelHeader Component

📄 **client/src/components/multiframe/PanelHeader.tsx**
```typescript
import React, { useCallback } from 'react';
import './PanelHeader.css';

interface PanelHeaderProps {
  title: string;
  isMaximized?: boolean;
  onAction: (action: any) => void;
  showMaximizeButton?: boolean;
  showCloseButton?: boolean;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  isMaximized = false,
  onAction,
  showMaximizeButton = true,
  showCloseButton = false
}) => {
  const handleMaximizeClick = useCallback(() => {
    onAction({ type: 'maximize' });
  }, [onAction]);
  
  const handleRefreshClick = useCallback(() => {
    onAction({ type: 'refresh' });
  }, [onAction]);
  
  const handleExportClick = useCallback(() => {
    onAction({ type: 'export' });
  }, [onAction]);
  
  const handleCloseClick = useCallback(() => {
    onAction({ type: 'close' });
  }, [onAction]);
  
  return (
    <div className="panel-header">
      <h3 className="panel-title">{title}</h3>
      <div className="panel-actions">
        <button
          className="action-button"
          onClick={handleRefreshClick}
          aria-label="Refresh panel"
          data-testid="refresh-button"
        >
          <span className="refresh-icon"></span>
        </button>
        <button
          className="action-button"
          onClick={handleExportClick}
          aria-label="Export panel data"
          data-testid="export-button"
        >
          <span className="export-icon"></span>
        </button>
        {showMaximizeButton && (
          <button
            className={`action-button ${isMaximized ? 'active' : ''}`}
            onClick={handleMaximizeClick}
            aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
            data-testid="maximize-button"
          >
            <span className={isMaximized ? 'restore-icon' : 'maximize-icon'}></span>
          </button>
        )}
        {showCloseButton && (
          <button
            className="action-button"
            onClick={handleCloseClick}
            aria-label="Close panel"
            data-testid="close-button"
          >
            <span className="close-icon"></span>
          </button>
        )}
      </div>
    </div>
  );
};
```
#### 9. Update Panel Content Registry Service

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
  
  // New panel types
  import('../components/multiframe/panels/FilterPanel').then(module => {
    registerPanelContent('filter', module.FilterPanel);
  });
  
  import('../components/multiframe/panels/StatsPanel').then(module => {
    registerPanelContent('stats', module.StatsPanel);
  });
  
  import('../components/multiframe/panels/ChartPanel').then(module => {
    registerPanelContent('chart', module.ChartPanel);
  });
}
```

#### 10. Create Basic Panel Content Components

📄 **client/src/components/multiframe/panels/MapPanel.tsx**
```typescript
import React from 'react';
import './MapPanel.css';

interface MapPanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // This is a placeholder component
  // Actual map implementation will be added in a later chunk
  
  return (
    <div className="map-panel" data-testid={`map-panel-${panelId}`}>
      <div className="map-placeholder">
        <h3>Map Panel</h3>
        <p>Map visualization will be implemented in a later chunk.</p>
      </div>
    </div>
  );
};
```

📄 **client/src/components/multiframe/panels/StatePanel.tsx**
```typescript
import React from 'react';
import './StatePanel.css';

interface StatePanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const StatePanel: React.FC<StatePanelProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // This is a placeholder component
  // Actual state data visualization will be added in a later chunk
  
  return (
    <div className="state-panel" data-testid={`state-panel-${panelId}`}>
      <div className="state-placeholder">
        <h3>State Panel</h3>
        <p>State data visualization will be implemented in a later chunk.</p>
      </div>
    </div>
  );
};
```

📄 **client/src/components/multiframe/panels/CountyPanel.tsx**
```typescript
import React from 'react';
import './CountyPanel.css';

interface CountyPanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const CountyPanel: React.FC<CountyPanelProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // This is a placeholder component
  // Actual county data visualization will be added in a later chunk
  
  return (
    <div className="county-panel" data-testid={`county-panel-${panelId}`}>
      <div className="county-placeholder">
        <h3>County Panel</h3>
        <p>County data visualization will be implemented in a later chunk.</p>
      </div>
    </div>
  );
};
```

📄 **client/src/components/multiframe/panels/PropertyPanel.tsx**
```typescript
import React from 'react';
import './PropertyPanel.css';

interface PropertyPanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // This is a placeholder component
  // Actual property data visualization will be added in a later chunk
  
  return (
    <div className="property-panel" data-testid={`property-panel-${panelId}`}>
      <div className="property-placeholder">
        <h3>Property Panel</h3>
        <p>Property data visualization will be implemented in a later chunk.</p>
      </div>
    </div>
  );
};
```

#### 11. MongoDB Integration for Testing

📄 **client/src/services/dbConnection.ts**
```typescript
import mongoose from 'mongoose';

// MongoDB connection settings
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multi-frame-app';

// Function to connect to MongoDB
export const connectToDatabase = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Function to disconnect from MongoDB
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Setup MongoDB schema for layouts
export const setupLayoutSchema = () => {
  // Only create schema if it doesn't already exist
  if (mongoose.models.Layout) {
    return mongoose.models.Layout;
  }
  
  const layoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['single', 'dual', 'tri', 'quad', 'advanced'],
      required: true 
    },
    panels: [{ 
      id: { type: String, required: true },
      contentType: { 
        type: String, 
        enum: ['map', 'state', 'county', 'property', 'filter', 'stats', 'chart'],
        required: true 
      },
      title: { type: String, required: true },
      position: {
        // For standard layouts
        row: { type: Number },
        col: { type: Number },
        // For advanced layouts
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number }
      },
      size: {
        width: { type: Number },
        height: { type: Number }
      },
      state: { type: mongoose.Schema.Types.Mixed },
      visible: { type: Boolean, default: true },
      closable: { type: Boolean, default: false },
      maximizable: { type: Boolean, default: true }
    }],
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  return mongoose.model('Layout', layoutSchema);
};
```

📄 **client/src/__tests__/setup/mongodb.ts**
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// Mock MongoDB for tests
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set environment variable
  process.env.MONGODB_URI = uri;
  
  // Connect to in-memory database
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  // Clear all collections after each test
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing with Vitest

##### 1. Create Vitest Test Script for Core Layout

📄 **client/test-core-layout.ps1**
```powershell
# PowerShell script to run core layout tests with Vitest
cd client

echo "Running Core Layout Tests..."

# Run core components tests
npx vitest run src/_tests_/TC*_components_multiframe_controls_*.test.tsx --config ./vitest.config.ts --no-coverage
npx vitest run src/_tests_/TC*_components_multiframe_layouts_*.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running Panel Registry Tests..."

# Run panel registry service tests
npx vitest run src/_tests_/TC*_services_panelRegistry.test.ts --config ./vitest.config.ts --no-coverage

echo "Running MultiFrameContainer Tests..."

# Run container tests
npx vitest run src/_tests_/TC201_components_multiframe_MultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running EnhancedMultiFrameContainer Tests..."

# Run enhanced container tests
npx vitest run src/_tests_/TC201_components_multiframe_EnhancedMultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running Database Integration Tests..."

# Run database integration tests
npx vitest run src/_tests_/TC*_services_dbConnection.test.ts --config ./vitest.config.ts --no-coverage

echo "All core layout tests completed!"
```

##### 2. Layout Components Tests

📄 **client/src/__tests__/components/multiframe/layouts/SinglePanelLayout.test.tsx**
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SinglePanelLayout } from '../../../../components/multiframe/layouts/SinglePanelLayout';

// Mock PanelContainer component
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid="panel-title">{title}</div>
      <div data-testid="panel-content-type">{contentType}</div>
    </div>
  )
}));

describe('SinglePanelLayout', () => {
  it('renders a panel container with the correct props', () => {
    const panels = [{
      id: 'test-panel',
      title: 'Test Panel',
      contentType: 'map',
      position: { row: 0, col: 0 },
      size: { width: 100, height: 100 }
    }];
    
    render(<SinglePanelLayout panels={panels} />);
    
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-test-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title')).toHaveTextContent('Test Panel');
    expect(screen.getByTestId('panel-content-type')).toHaveTextContent('map');
  });
  
  it('shows empty message when no panels are provided', () => {
    render(<SinglePanelLayout panels={[]} />);
    
    expect(screen.getByTestId('empty-single-layout')).toBeInTheDocument();
    expect(screen.getByText('No panel configured')).toBeInTheDocument();
  });
});
```

📄 **client/src/__tests__/components/multiframe/layouts/DualPanelLayout.test.tsx**
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DualPanelLayout } from '../../../../components/multiframe/layouts/DualPanelLayout';

// Mock PanelContainer component
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('DualPanelLayout', () => {
  it('renders two panel containers with the correct props', () => {
    const panels = [
      {
        id: 'left-panel',
        title: 'Left Panel',
        contentType: 'map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 100 }
      },
      {
        id: 'right-panel',
        title: 'Right Panel',
        contentType: 'property',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 100 }
      }
    ];
    
    render(<DualPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('dual-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-left-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-right-panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-left-panel')).toHaveTextContent('Left Panel');
    expect(screen.getByTestId('panel-title-right-panel')).toHaveTextContent('Right Panel');
    expect(screen.getByTestId('panel-content-type-left-panel')).toHaveTextContent('map');
    expect(screen.getByTestId('panel-content-type-right-panel')).toHaveTextContent('property');
  });
  
  it('shows empty message when insufficient panels are provided', () => {
    render(<DualPanelLayout panels={[{ id: 'single', title: 'Single', contentType: 'map' }]} />);
    
    expect(screen.getByTestId('empty-dual-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
});
```

📄 **client/src/__tests__/components/multiframe/layouts/TriPanelLayout.test.tsx**
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TriPanelLayout } from '../../../../components/multiframe/layouts/TriPanelLayout';

// Mock PanelContainer component
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('TriPanelLayout', () => {
  it('renders three panel containers with the correct props', () => {
    const panels = [
      {
        id: 'top-left',
        title: 'Top Left Panel',
        contentType: 'map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'top-right',
        title: 'Top Right Panel',
        contentType: 'state',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom',
        title: 'Bottom Panel',
        contentType: 'county',
        position: { row: 1, col: 0 },
        size: { width: 100, height: 50 }
      }
    ];
    
    render(<TriPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('tri-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-right')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-bottom')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-top-left')).toHaveTextContent('Top Left Panel');
    expect(screen.getByTestId('panel-title-top-right')).toHaveTextContent('Top Right Panel');
    expect(screen.getByTestId('panel-title-bottom')).toHaveTextContent('Bottom Panel');
  });
  
  it('shows empty message when insufficient panels are provided', () => {
    render(<TriPanelLayout panels={[{ id: 'single', title: 'Single', contentType: 'map' }]} />);
    
    expect(screen.getByTestId('empty-tri-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
});
```

📄 **client/src/__tests__/components/multiframe/layouts/QuadPanelLayout.test.tsx**
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuadPanelLayout } from '../../../../components/multiframe/layouts/QuadPanelLayout';

// Mock PanelContainer component
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('QuadPanelLayout', () => {
  it('renders four panel containers with the correct props', () => {
    const panels = [
      {
        id: 'top-left',
        title: 'Top Left Panel',
        contentType: 'map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'top-right',
        title: 'Top Right Panel',
        contentType: 'state',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-left',
        title: 'Bottom Left Panel',
        contentType: 'county',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-right',
        title: 'Bottom Right Panel',
        contentType: 'property',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ];
    
    render(<QuadPanelLayout panels={panels} />);
    
    expect(screen.getByTestId('quad-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-left')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-top-right')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-bottom-left')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-bottom-right')).toBeInTheDocument();
  });
  
  it('shows empty message when insufficient panels are provided', () => {
    render(<QuadPanelLayout panels={[{ id: 'single', title: 'Single', contentType: 'map' }]} />);
    
    expect(screen.getByTestId('empty-quad-layout')).toBeInTheDocument();
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
});
```

📄 **client/src/__tests__/components/multiframe/layouts/AdvancedLayout.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdvancedLayout } from '../../../../components/multiframe/layouts/AdvancedLayout';
import { AdvancedPanelConfig } from '../../../../types/layout.types';

// Mock react-resizable
vi.mock('react-resizable', () => ({
  Resizable: ({ children }) => children,
}));

// Mock PanelContainer component
vi.mock('../../../../components/multiframe/PanelContainer', () => ({
  PanelContainer: ({ id, title, contentType }) => (
    <div data-testid={`panel-container-${id}`}>
      <div data-testid={`panel-title-${id}`}>{title}</div>
      <div data-testid={`panel-content-type-${id}`}>{contentType}</div>
    </div>
  )
}));

describe('AdvancedLayout', () => {
  const mockPanels: AdvancedPanelConfig[] = [
    {
      id: 'panel-1',
      contentType: 'map',
      title: 'Map Panel',
      position: { x: 0, y: 0, width: 70, height: 70 },
      maximizable: true,
      closable: true
    },
    {
      id: 'panel-2',
      contentType: 'property',
      title: 'Property Panel',
      position: { x: 70, y: 0, width: 30, height: 70 },
      maximizable: true,
      closable: true
    }
  ];
  
  it('renders panels with correct positions and properties', () => {
    render(<AdvancedLayout panels={mockPanels} />);
    
    expect(screen.getByTestId('advanced-layout')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-panel-1')).toBeInTheDocument();
    expect(screen.getByTestId('panel-container-panel-2')).toBeInTheDocument();
    expect(screen.getByTestId('panel-title-panel-1')).toHaveTextContent('Map Panel');
    expect(screen.getByTestId('panel-title-panel-2')).toHaveTextContent('Property Panel');
  });
  
  it('calls onPanelClose when a panel is closed', () => {
    const onPanelClose = vi.fn();
    
    render(<AdvancedLayout panels={mockPanels} onPanelClose={onPanelClose} />);
    
    // Simulate a close action
    const panelElement = screen.getByTestId('panel-container-panel-1');
    fireEvent.click(panelElement.querySelector('[data-testid="close-button"]'));
    
    expect(onPanelClose).toHaveBeenCalledWith('panel-1');
  });
  
  it('shows add panel button when onPanelAdd is provided', () => {
    const onPanelAdd = vi.fn();
    
    render(<AdvancedLayout panels={mockPanels} onPanelAdd={onPanelAdd} />);
    
    const addButton = screen.getByTestId('add-panel-button');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    
    expect(onPanelAdd).toHaveBeenCalledWith(expect.objectContaining({
      contentType: 'map',
      title: 'New Panel',
      maximizable: true,
      closable: true
    }));
  });
});
```

##### 3. PanelContentRegistry Tests

📄 **client/src/__tests__/services/panelContentRegistry.test.tsx**
```typescript
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  registerPanelContent, 
  getPanelContent, 
  getRegisteredContentTypes,
  initializeContentRegistry
} from '../../services/panelContentRegistry';

// Mock dynamic imports
vi.mock('../../components/multiframe/panels/MapPanel', () => ({
  MapPanel: () => <div>Map Panel</div>
}));

vi.mock('../../components/multiframe/panels/StatePanel', () => ({
  StatePanel: () => <div>State Panel</div>
}));

vi.mock('../../components/multiframe/panels/CountyPanel', () => ({
  CountyPanel: () => <div>County Panel</div>
}));

vi.mock('../../components/multiframe/panels/PropertyPanel', () => ({
  PropertyPanel: () => <div>Property Panel</div>
}));

vi.mock('../../components/multiframe/panels/FilterPanel', () => ({
  FilterPanel: () => <div>Filter Panel</div>
}));

vi.mock('../../components/multiframe/panels/StatsPanel', () => ({
  StatsPanel: () => <div>Stats Panel</div>
}));

vi.mock('../../components/multiframe/panels/ChartPanel', () => ({
  ChartPanel: () => <div>Chart Panel</div>
}));

describe('panelContentRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    vi.restoreAllMocks();
    
    // Clear any registered content
    const registry = vi.spyOn(global, 'Object').mockImplementation((obj) => {
      if (obj && typeof obj === 'object') {
        return Object.create(obj);
      }
      return {};
    });
  });
  
  it('registers and retrieves panel content components', () => {
    const MapComponent = () => <div>Map Component</div>;
    
    registerPanelContent('map', MapComponent);
    
    const retrievedComponent = getPanelContent('map');
    expect(retrievedComponent).toBe(MapComponent);
  });
  
  it('returns null for unregistered content types', () => {
    const component = getPanelContent('unregistered');
    expect(component).toBeNull();
  });
  
  it('returns registered content types', () => {
    registerPanelContent('map', () => <div>Map</div>);
    registerPanelContent('state', () => <div>State</div>);
    
    const types = getRegisteredContentTypes();
    expect(types).toContain('map');
    expect(types).toContain('state');
    expect(types.length).toBe(2);
  });
  
  it('initializes content registry with default components', async () => {
    // Initialize registry with default components
    initializeContentRegistry();
    
    // Wait for dynamic imports to resolve
    await vi.runAllTimersAsync();
    
    // Verify that components were registered
    expect(getRegisteredContentTypes()).toContain('map');
    expect(getRegisteredContentTypes()).toContain('state');
    expect(getRegisteredContentTypes()).toContain('county');
    expect(getRegisteredContentTypes()).toContain('property');
    expect(getRegisteredContentTypes()).toContain('filter');
    expect(getRegisteredContentTypes()).toContain('stats');
    expect(getRegisteredContentTypes()).toContain('chart');
  });
});
```

##### 4. MultiFrameContainer Tests

📄 **client/src/_tests_/TC201_components_multiframe_MultiFrameContainer.test.tsx**
```typescript
// Test Case 201: Verify MultiFrameContainer renders with default layout
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiFrameContainer } from '../../src/components/multiframe/MultiFrameContainer';

// Mock layout components
vi.mock('../../src/components/multiframe/layouts/SinglePanelLayout', () => ({
  SinglePanelLayout: ({ panels }) => <div data-testid="single-layout-mock">Single Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/DualPanelLayout', () => ({
  DualPanelLayout: ({ panels }) => <div data-testid="dual-layout-mock">Dual Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/TriPanelLayout', () => ({
  TriPanelLayout: ({ panels }) => <div data-testid="tri-layout-mock">Tri Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/QuadPanelLayout', () => ({
  QuadPanelLayout: ({ panels }) => <div data-testid="quad-layout-mock">Quad Layout</div>
}));

vi.mock('../../src/components/multiframe/layouts/AdvancedLayout', () => ({
  AdvancedLayout: ({ panels }) => <div data-testid="advanced-layout-mock">Advanced Layout</div>
}));

// Mock LayoutSelector
vi.mock('../../src/components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ currentLayout, onLayoutChange }) => (
    <div data-testid="layout-selector-mock">
      <button onClick={() => onLayoutChange('single')} data-testid="select-single">Single</button>
      <button onClick={() => onLayoutChange('dual')} data-testid="select-dual">Dual</button>
      <button onClick={() => onLayoutChange('tri')} data-testid="select-tri">Tri</button>
      <button onClick={() => onLayoutChange('quad')} data-testid="select-quad">Quad</button>
      <button onClick={() => onLayoutChange('advanced')} data-testid="select-advanced">Advanced</button>
      <div>Current: {currentLayout}</div>
    </div>
  )
}));

describe('MultiFrameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC201: should render with default layout', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        _isTestingMode={true}
      />
    );
    
    expect(screen.getByTestId('multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('single-layout-mock')).toBeInTheDocument();
  });
  
  it('TC202: should change layout when layout selector is used', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        _isTestingMode={true}
      />
    );
    
    // Single layout initially
    expect(screen.getByTestId('single-layout-mock')).toBeInTheDocument();
    
    // Change to dual layout
    fireEvent.click(screen.getByTestId('select-dual'));
    expect(screen.getByTestId('dual-layout-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('single-layout-mock')).not.toBeInTheDocument();
    
    // Change to tri layout
    fireEvent.click(screen.getByTestId('select-tri'));
    expect(screen.getByTestId('tri-layout-mock')).toBeInTheDocument();
    
    // Change to quad layout
    fireEvent.click(screen.getByTestId('select-quad'));
    expect(screen.getByTestId('quad-layout-mock')).toBeInTheDocument();
    
    // Change to advanced layout
    fireEvent.click(screen.getByTestId('select-advanced'));
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
  });
  
  it('TC203: should handle custom className properly', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        className="custom-container-class"
        _isTestingMode={true}
      />
    );
    
    const container = screen.getByTestId('multi-frame-container');
    expect(container).toHaveClass('custom-container-class');
  });

  it('TC204: should disable advanced layout when specified', () => {
    // This test would verify that enableAdvancedLayout={false} properly disables the advanced layout option
    // Implementation would depend on specific testing approach chosen
  });
});
```

##### 5. EnhancedMultiFrameContainer Tests

📄 **client/src/_tests_/TC201_components_multiframe_EnhancedMultiFrameContainer.test.tsx**
```typescript
// Test Case 201: Verify EnhancedMultiFrameContainer renders with default layout
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedMultiFrameContainer } from '../../src/components/multiframe/EnhancedMultiFrameContainer';

// Mock AdvancedLayout
vi.mock('../../src/components/multiframe/layouts/AdvancedLayout', () => ({
  AdvancedLayout: ({ 
    panels, 
    onPanelPositionChange, 
    onPanelStateChange, 
    onPanelClose, 
    onPanelAdd 
  }: {
    panels: any[];
    onPanelPositionChange?: (id: string, position: any) => void;
    onPanelStateChange?: (id: string, state: any) => void;
    onPanelClose?: (id: string) => void;
    onPanelAdd?: (panel: any) => void;
  }) => (
    <div data-testid="advanced-layout-mock">
      <button 
        onClick={() => onPanelPositionChange?.('panel-1', { x: 10, y: 10, width: 50, height: 50 })}
        data-testid="test-position-change"
      >
        Change Position
      </button>
      <button 
        onClick={() => onPanelStateChange?.('panel-1', { test: 'state' })}
        data-testid="test-state-change"
      >
        Change State
      </button>
      <button 
        onClick={() => onPanelClose?.('panel-1')}
        data-testid="test-panel-close"
      >
        Close Panel
      </button>
      <button 
        onClick={() => onPanelAdd?.({
          id: 'new-panel',
          contentType: 'map',
          title: 'New Panel',
          position: { x: 20, y: 20, width: 30, height: 30 },
          maximizable: true,
          closable: true
        })}
        data-testid="test-panel-add"
      >
        Add Panel
      </button>
    </div>
  )
}));

// Mock LayoutSelector
vi.mock('../../src/components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ 
    currentLayout, 
    onLayoutChange, 
    availableLayouts 
  }: {
    currentLayout: string;
    onLayoutChange: (layout: string) => void;
    availableLayouts?: string[];
  }) => (
    <div data-testid="layout-selector-mock">
      {availableLayouts?.map(layout => (
        <button 
          key={layout}
          onClick={() => onLayoutChange(layout)}
          data-testid={`select-${layout}`}
        >
          {layout}
        </button>
      ))}
      <div>Current: {currentLayout}</div>
    </div>
  )
}));

describe('EnhancedMultiFrameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC501: should render with advanced layout by default', () => {
    render(<EnhancedMultiFrameContainer />);
    
    expect(screen.getByTestId('enhanced-multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
  });
  
  it('TC502: should initialize with provided panels', () => {
    const customPanels = [
      {
        id: 'custom-panel',
        contentType: 'map',
        title: 'Custom Panel',
        position: { x: 10, y: 10, width: 40, height: 40 },
        maximizable: true,
        closable: true
      }
    ];
    
    render(
      <EnhancedMultiFrameContainer
        panels={customPanels}
      />
    );
    
    // Panel should be passed to the advanced layout
    expect(screen.getByTestId('advanced-layout-mock')).toBeInTheDocument();
  });
  
  it('TC503: should support custom layout options', () => {
    const layoutOptions = ['single', 'advanced'];
    
    render(
      <EnhancedMultiFrameContainer
        layoutOptions={layoutOptions}
      />
    );
    
    // Layout options should be passed to the layout selector
    expect(screen.getByTestId('layout-selector-mock')).toBeInTheDocument();
  });
});
```

##### 6. LayoutSelector Tests

📄 **client/src/_tests_/TC101_components_multiframe_controls_LayoutSelector.test.tsx**
```typescript
// Test Case 101: Verify LayoutSelector renders layout options correctly
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayoutSelector } from '../../src/components/multiframe/controls/LayoutSelector';

describe('LayoutSelector', () => {
  it('TC101: should render standard layout options by default', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
      />
    );
    
    expect(screen.getByTestId('layout-selector')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-dual')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-tri')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-quad')).toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-advanced')).not.toBeInTheDocument();
  });
  
  it('TC102: should show advanced layout option when enabled', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        enableAdvancedLayout={true}
      />
    );
    
    expect(screen.getByTestId('layout-selector-advanced')).toBeInTheDocument();
  });
  
  it('TC103: should mark the current layout button as active', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="dual"
        onLayoutChange={onLayoutChange}
      />
    );
    
    const dualButton = screen.getByTestId('layout-selector-dual');
    expect(dualButton.className).toContain('active');
  });
  
  it('TC104: should call onLayoutChange when a layout button is clicked', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        enableAdvancedLayout={true}
      />
    );
    
    // Test standard layout selection
    fireEvent.click(screen.getByTestId('layout-selector-tri'));
    expect(onLayoutChange).toHaveBeenCalledWith('tri');
    
    // Test advanced layout selection
    fireEvent.click(screen.getByTestId('layout-selector-advanced'));
    expect(onLayoutChange).toHaveBeenCalledWith('advanced');
  });
  
  it('TC105: should only render available layouts', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
        availableLayouts={['single', 'dual']}
      />
    );
    
    expect(screen.getByTestId('layout-selector-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-dual')).toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-tri')).not.toBeInTheDocument();
    expect(screen.queryByTestId('layout-selector-quad')).not.toBeInTheDocument();
  });
});
```




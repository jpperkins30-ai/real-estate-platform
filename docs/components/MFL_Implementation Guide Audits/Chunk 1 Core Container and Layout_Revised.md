✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-1-core-layout.md

# Core Container and Layout Component Implementation Guide

> **IMPORTANT NOTE**: Test file paths in this document reference the old nested test structure. The project has moved to a flattened test directory structure where files are located directly in `src/__tests__/` with underscores replacing directory separators. For example:
> - Old path: `src/__tests__/components/multiframe/layouts/SinglePanelLayout.test.tsx`
> - New path: `src/__tests__/components_multiframe_layouts_SinglePanelLayout.test.tsx`
>
> For more information on the test structure, see the test guide in `src/__tests__/README.md`.

## Overview

The Multi-Frame Layout system consists of a collection of components that work together to create flexible, configurable layouts for displaying various panels of content. This implementation focuses on the core container and layout components which form the foundation of the system.

# 🧩 Chunk 1: Core Container and Layout System (Updated with Vitest)

## 🎯 Objective

Establish the core container and layout architecture for the multi-frame interface. This includes the foundational components for single, dual, tri, and quad panel layouts, with proper support for different panel types (map, state, county, property).

This chunk lays the foundation for a flexible and extensible visual system that will be enhanced with panel communication and state management in later chunks.

##git Process

# Make sure you're in your project directory
cd path/to/your/project

# Checkout development branch and get latest changes
git checkout develop
git pull origin develop

# Checkout the existing feature branch
git checkout feature/multi-frame-core-layout

# Get any remote changes that might have happened
git pull origin feature/multi-frame-core-layout

# Make your changes to update to Vitest
# ... (implement all the changes from our updated chunk)

# Run the tests with Vitest to make sure everything passes
cd client
./test-core-layout.ps1

# Go back to project root if needed
cd ..

# Stage all the changes
git add .

# Commit with a descriptive message
git commit -m "Update core layout implementation to use Vitest instead of Jest"

# Push the changes back to the remote branch
git push origin feature/multi-frame-core-layout

# If needed, update the pull request with additional details about the testing changes
# This would be done through your git hosting service (GitHub, GitLab, etc.)

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

Create your Git branch:
```bash
git checkout develop
git pull
git checkout -b feature/multi-frame-core-layout
```

Required folders:
```
client/src/components/multiframe/
client/src/components/multiframe/layouts/
client/src/components/multiframe/controls/
client/src/types/
```

Install necessary packages:
```bash
npm install clsx react-resizable vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Define Core Type Definitions

📄 **client/src/types/layout.types.ts**
```typescript
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad';

export type PanelContentType = 'map' | 'state' | 'county' | 'property' | 'filter' | 'stats' | 'chart';

export interface PanelPosition {
  row: number;
  col: number;
}

export interface PanelSize {
  width: number; // Percentage of container width
  height: number; // Percentage of container height
}

export interface PanelConfig {
  id: string;
  contentType: PanelContentType;
  title: string;
  position?: PanelPosition;
  size?: PanelSize;
  state?: any;
  visible?: boolean;
}

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
          size: { width: 100, height: 100 }
        });
      } else if (layoutType === 'dual') {
        defaultPanels.push({
          id: 'left',
          contentType: (defaultPanelContent.left || 'map') as PanelContentType,
          title: 'Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 100 }
        });
        defaultPanels.push({
          id: 'right',
          contentType: (defaultPanelContent.right || 'property') as PanelContentType,
          title: 'Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 100 }
        });
      } else if (layoutType === 'tri') {
        // Add tri-panel default configuration
        defaultPanels.push({
          id: 'top-left',
          contentType: (defaultPanelContent['top-left'] || 'map') as PanelContentType,
          title: 'Top Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'top-right',
          contentType: (defaultPanelContent['top-right'] || 'state') as PanelContentType,
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom',
          contentType: (defaultPanelContent.bottom || 'county') as PanelContentType,
          title: 'Bottom Panel',
          position: { row: 1, col: 0 },
          size: { width: 100, height: 50 }
        });
      } else if (layoutType === 'quad') {
        // Add quad-panel default configuration
        defaultPanels.push({
          id: 'top-left',
          contentType: (defaultPanelContent['top-left'] || 'map') as PanelContentType,
          title: 'Top Left Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'top-right',
          contentType: (defaultPanelContent['top-right'] || 'state') as PanelContentType,
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-left',
          contentType: (defaultPanelContent['bottom-left'] || 'county') as PanelContentType,
          title: 'Bottom Left Panel',
          position: { row: 1, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-right',
          contentType: (defaultPanelContent['bottom-right'] || 'property') as PanelContentType,
          title: 'Bottom Right Panel',
          position: { row: 1, col: 1 },
          size: { width: 50, height: 50 }
        });
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
        />
      </div>
      <div className="layout-container" data-testid={`${layoutType}-layout`}>
        {renderLayout()}
      </div>
    </div>
  );
};
```

#### 3. Create LayoutSelector Component

📄 **client/src/components/multiframe/controls/LayoutSelector.tsx**
```typescript
import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import './LayoutSelector.css';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange
}) => {
  return (
    <div className="layout-selector">
      <button
        className={`layout-button ${currentLayout === 'single' ? 'active' : ''}`}
        onClick={() => onLayoutChange('single')}
        aria-label="Single panel layout"
        data-testid="layout-selector-single"
      >
        <div className="single-icon"></div>
        <span>Single</span>
      </button>
      
      <button
        className={`layout-button ${currentLayout === 'dual' ? 'active' : ''}`}
        onClick={() => onLayoutChange('dual')}
        aria-label="Dual panel layout"
        data-testid="layout-selector-dual"
      >
        <div className="dual-icon"></div>
        <span>Dual</span>
      </button>
      
      <button
        className={`layout-button ${currentLayout === 'tri' ? 'active' : ''}`}
        onClick={() => onLayoutChange('tri')}
        aria-label="Tri panel layout"
        data-testid="layout-selector-tri"
      >
        <div className="tri-icon"></div>
        <span>Tri</span>
      </button>
      
      <button
        className={`layout-button ${currentLayout === 'quad' ? 'active' : ''}`}
        onClick={() => onLayoutChange('quad')}
        aria-label="Quad panel layout"
        data-testid="layout-selector-quad"
      >
        <div className="quad-icon"></div>
        <span>Quad</span>
      </button>
    </div>
  );
};
```

#### 4. Implement Layout Components

📄 **client/src/components/multiframe/layouts/SinglePanelLayout.tsx**
```typescript
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import './SinglePanelLayout.css';

interface SinglePanelLayoutProps {
  panels: PanelConfig[];
}

export const SinglePanelLayout: React.FC<SinglePanelLayoutProps> = ({ panels }) => {
  // For single panel layout, we only use the first panel
  const panel = panels[0];
  
  if (!panel) {
    return <div className="empty-layout">No panel configured</div>;
  }
  
  return (
    <div className="single-panel-layout" data-testid="single-layout">
      <PanelContainer
        id={panel.id}
        title={panel.title}
        contentType={panel.contentType}
        initialState={panel.state}
        className="full-size-panel"
      />
    </div>
  );
};
```

📄 **client/src/components/multiframe/layouts/DualPanelLayout.tsx**
```typescript
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import './DualPanelLayout.css';

interface DualPanelLayoutProps {
  panels: PanelConfig[];
}

export const DualPanelLayout: React.FC<DualPanelLayoutProps> = ({ panels }) => {
  // Ensure we have exactly two panels
  const leftPanel = panels.find(p => p.position?.col === 0) || panels[0];
  const rightPanel = panels.find(p => p.position?.col === 1) || panels[1];
  
  if (!leftPanel || !rightPanel) {
    return <div className="empty-layout">Insufficient panels configured</div>;
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
        />
      </div>
      <div className="right-panel">
        <PanelContainer
          id={rightPanel.id}
          title={rightPanel.title}
          contentType={rightPanel.contentType}
          initialState={rightPanel.state}
          className="panel-container"
        />
      </div>
    </div>
  );
};
```

📄 **client/src/components/multiframe/layouts/TriPanelLayout.tsx**
```typescript
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import './TriPanelLayout.css';

interface TriPanelLayoutProps {
  panels: PanelConfig[];
}

export const TriPanelLayout: React.FC<TriPanelLayoutProps> = ({ panels }) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 0) || panels[0];
  const topRightPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 1) || panels[1];
  const bottomPanel = panels.find(p => p.position?.row === 1) || panels[2];
  
  if (!topLeftPanel || !topRightPanel || !bottomPanel) {
    return <div className="empty-layout">Insufficient panels configured</div>;
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
          />
        </div>
        <div className="top-right-panel">
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className="panel-container"
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
import { PanelConfig } from '../../../types/layout.types';
import './QuadPanelLayout.css';

interface QuadPanelLayoutProps {
  panels: PanelConfig[];
}

export const QuadPanelLayout: React.FC<QuadPanelLayoutProps> = ({ panels }) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 0) || panels[0];
  const topRightPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 1) || panels[1];
  const bottomLeftPanel = panels.find(p => p.position?.row === 1 && p.position?.col === 0) || panels[2];
  const bottomRightPanel = panels.find(p => p.position?.row === 1 && p.position?.col === 1) || panels[3];
  
  if (!topLeftPanel || !topRightPanel || !bottomLeftPanel || !bottomRightPanel) {
    return <div className="empty-layout">Insufficient panels configured</div>;
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
          />
        </div>
        <div className="top-right-panel">
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className="panel-container"
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
          />
        </div>
        <div className="bottom-right-panel">
          <PanelContainer
            id={bottomRightPanel.id}
            title={bottomRightPanel.title}
            contentType={bottomRightPanel.contentType}
            initialState={bottomRightPanel.state}
            className="panel-container"
          />
        </div>
      </div>
    </div>
  );
};
```

#### 5. Create PanelContainer Component

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
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  id,
  title,
  contentType,
  initialState = {},
  onStateChange,
  onAction,
  className = '',
}) => {
  // State
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  
  // Handle panel actions
  const handleAction = (action: { type: string, payload?: any }) => {
    // Handle basic actions internally
    if (action.type === 'maximize') {
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
          <div className="no-content">
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### 6. Create PanelHeader Component

📄 **client/src/components/multiframe/PanelHeader.tsx**
```typescript
import React, { useCallback } from 'react';
import './PanelHeader.css';

interface PanelHeaderProps {
  title: string;
  isMaximized: boolean;
  onAction: (action: any) => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  isMaximized,
  onAction
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
        <button
          className={`action-button ${isMaximized ? 'active' : ''}`}
          onClick={handleMaximizeClick}
          aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
          data-testid="maximize-button"
        >
          <span className={isMaximized ? 'restore-icon' : 'maximize-icon'}></span>
        </button>
      </div>
    </div>
  );
};
```

#### 7. Update Panel Content Registry Service

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
}
```

##### 6. Layout Component Tests

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
    
    expect(screen.getByText('Insufficient panels configured')).toBeInTheDocument();
  });
});
```

##### 7. PanelContentRegistry Tests

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
  });
});
```

##### 8. MongoDB Integration for Testing

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

// Setup models
export const setupModels = () => {
  // Define models here if needed
  // This will be expanded in Chunk 4 when implementing layout persistence
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

📄 **test-core-layout.ps1**
```powershell
# PowerShell script to run core layout tests with Vitest
cd client

echo "Running Core Layout Tests..."

# Run core components tests
npx vitest run src/__tests__/components/multiframe/ --config ./vitest.config.ts --no-coverage

echo "Running Panel Registry Tests..."

# Run panel registry service tests
npx vitest run src/__tests__/services/panelContentRegistry.test.tsx --config ./vitest.config.ts --no-coverage

echo "Running MultiFrameContainer Tests..."

# Run container tests
npx vitest run src/__tests__/components/MultiFrameContainer.test.tsx --config ./vitest.config.ts --no-coverage

echo "All core layout tests completed!"
```

##### 2. Create Vitest Configuration

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

##### 3. LayoutSelector Component Tests

📄 **client/src/__tests__/components/multiframe/controls/LayoutSelector.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayoutSelector } from '../../../../components/multiframe/controls/LayoutSelector';

describe('LayoutSelector', () => {
  it('renders all layout options', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
      />
    );
    
    expect(screen.getByTestId('layout-selector-single')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-dual')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-tri')).toBeInTheDocument();
    expect(screen.getByTestId('layout-selector-quad')).toBeInTheDocument();
  });
  
  it('marks the current layout button as active', () => {
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
  
  it('calls onLayoutChange when a layout button is clicked', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="single"
        onLayoutChange={onLayoutChange}
      />
    );
    
    const triButton = screen.getByTestId('layout-selector-tri');
    fireEvent.click(triButton);
    
    expect(onLayoutChange).toHaveBeenCalledWith('tri');
  });
  
  it('does not call onLayoutChange when clicking the current layout', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <LayoutSelector
        currentLayout="quad"
        onLayoutChange={onLayoutChange}
      />
    );
    
    const quadButton = screen.getByTestId('layout-selector-quad');
    fireEvent.click(quadButton);
    
    // Should still call even if it's the current layout
    expect(onLayoutChange).toHaveBeenCalledWith('quad');
  });
});
```

##### 4. PanelContainer Component Tests

📄 **client/src/__tests__/components/multiframe/PanelContainer.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PanelContainer } from '../../../components/multiframe/PanelContainer';

// Mock the panel content registry
vi.mock('../../../services/panelContentRegistry', () => ({
  getPanelContent: () => () => <div data-testid="mock-panel-content">Mock Panel Content</div>
}));

describe('PanelContainer', () => {
  it('renders with title and content', () => {
    render(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
      />
    );
    
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByTestId('mock-panel-content')).toBeInTheDocument();
  });
  
  it('toggles maximize state when maximize button is clicked', () => {
    render(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
      />
    );
    
    const maximizeButton = screen.getByTestId('maximize-button');
    
    // Initially not maximized
    expect(screen.getByTestId('panel-test-panel').className).not.toContain('maximized');
    
    // Click to maximize
    fireEvent.click(maximizeButton);
    expect(screen.getByTestId('panel-test-panel').className).toContain('maximized');
    
    // Click to restore
    fireEvent.click(maximizeButton);
    expect(screen.getByTestId('panel-test-panel').className).not.toContain('maximized');
  });
  
  it('calls onAction when panel action buttons are clicked', () => {
    const onAction = vi.fn();
    
    render(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
        onAction={onAction}
      />
    );
    
    const refreshButton = screen.getByTestId('refresh-button');
    const exportButton = screen.getByTestId('export-button');
    
    fireEvent.click(refreshButton);
    expect(onAction).toHaveBeenCalledWith({ type: 'refresh' });
    
    fireEvent.click(exportButton);
    expect(onAction).toHaveBeenCalledWith({ type: 'export' });
  });
  
  it('displays error message when no content is available', () => {
    // Override mock for this test to return null
    vi.mocked(require('../../../services/panelContentRegistry').getPanelContent).mockReturnValue(null);
    
    render(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="unknown"
      />
    );
    
    expect(screen.getByText(/No content available for type/)).toBeInTheDocument();
  });
});
```

##### 5. MultiFrameContainer Component Tests

📄 **client/src/__tests__/components/MultiFrameContainer.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiFrameContainer } from '../../components/multiframe/MultiFrameContainer';

// Mock panel content registry
vi.mock('../../services/panelContentRegistry', () => ({
  getPanelContent: () => () => <div data-testid="mock-panel-content">Mock Panel Content</div>
}));

describe('MultiFrameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default layout', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    expect(screen.getByTestId('multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
  });
  
  it('creates different layout types with correct panels', () => {
    // Test for quad panel layout
    render(
      <MultiFrameContainer
        initialLayout="quad"
        defaultPanelContent={{
          'top-left': 'map',
          'top-right': 'state',
          'bottom-left': 'county', 
          'bottom-right': 'property'
        }}
      />
    );
    
    expect(screen.getByTestId('quad-layout')).toBeInTheDocument();
    expect(screen.getAllByTestId(/panel-/)).toHaveLength(4);
  });
  
  it('changes layout when layout selector is clicked', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    const dualLayoutButton = screen.getByTestId('layout-selector-dual');
    fireEvent.click(dualLayoutButton);
    
    expect(screen.getByTestId('dual-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('single-layout')).not.toBeInTheDocument();
  });
  
  it('notifies parent component when layout changes', () => {
    const onLayoutChange = vi.fn();
    
    render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
        onLayoutChange={onLayoutChange}
      />
    );
    
    const dualLayoutButton = screen.getByTestId('layout-selector-dual');
    fireEvent.click(dualLayoutButton);
    
    expect(onLayoutChange).toHaveBeenCalledWith(expect.objectContaining({
      type: 'dual'
    }));
  });

  it('initializes with default panels when none provided', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
      />
    );
    
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
  });
});
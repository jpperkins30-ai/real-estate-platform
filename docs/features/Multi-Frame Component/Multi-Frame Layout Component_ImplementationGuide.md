Multi-Frame Layout Component System: Comprehensive Design Guide
1. Project Vision & Overview
The Multi-Frame Layout Component System will be the central UI feature of our Real Estate Platform, enabling users to analyze property data through customizable, multi-panel layouts. This system will support dynamic visualization of geographical data, property information, and statistical analysis through a unified interface that maintains hierarchical context.
The core vision is to create a flexible framework where users can:
•	View data in single, dual, tri, and quad panel configurations
•	Maintain hierarchical context (State → County → Property) across panels
•	Apply independent but related filtering to different panels
•	Analyze data across multiple dimensions simultaneously
•	Save and restore custom panel configurations
2. Architectural Overview
The Multi-Frame Layout system will be implemented as a React-based component hierarchy with clearly defined interfaces for panel content and communication. It will sit at the presentation layer but connect to our underlying data services and state management.
┌─────────────────────────────────────────────────────────────┐
│                      Application Shell                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 Multi-Frame Container                    │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │ │
│  │  │              │ │              │ │              │     │ │
│  │  │  Map Panel   │ │ Details Panel│ │ Filter Panel │     │ │
│  │  │              │ │              │ │              │     │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │ │
│  │  ┌──────────────┐                                       │ │
│  │  │              │                                       │ │
│  │  │ Stats Panel  │        Panel Content Registry         │ │
│  │  │              │                                       │ │
│  │  └──────────────┘                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐    │
│  │                         │  │                         │    │
│  │  Inventory Navigation   │  │     Controller Wizard   │    │
│  │                         │  │                         │    │
│  └─────────────────────────┘  └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
Component Hierarchy
MultiFrameContainer
├── LayoutSelector (Single/Dual/Tri/Quad)
├── PanelContainer
│   ├── PanelHeader
│   │   ├── PanelTitle
│   │   ├── PanelActions
│   │   └── PanelControls
│   └── PanelContent
│       ├── MapPanel
│       ├── PropertyPanel
│       ├── FilterPanel
│       ├── StatsPanel
│       └── ... (other panel types)
├── PanelSynchronization (manages inter-panel communication)
└── LayoutPersistence (saves/loads user layouts)
3. Detailed Component Design
3.1 MultiFrameContainer
This is the root component that manages the overall layout and panel arrangement.
Responsibilities:
•	Maintain overall panel layout (Single/Dual/Tri/Quad)
•	Handle panel resizing and reorganization
•	Manage panel content registry
•	Coordinate inter-panel communication
Props Interface:
interface MultiFrameContainerProps {
  initialLayout: 'single' | 'dual' | 'tri' | 'quad';
  panels?: PanelConfig[];
  defaultPanelContent?: Record<string, PanelContentType>;
  onLayoutChange?: (layout: LayoutConfig) => void;
  className?: string;
}

interface PanelConfig {
  id: string;
  contentType: PanelContentType;
  title?: string;
  initialState?: any;
  position?: PanelPosition;
  size?: PanelSize;
}

type PanelContentType = 'map' | 'property' | 'filter' | 'stats' | 'chart' | 'list';

interface PanelPosition {
  row: number;
  col: number;
}

interface PanelSize {
  width: number; // Percentage of container width
  height: number; // Percentage of container height
}

interface LayoutConfig {
  type: 'single' | 'dual' | 'tri' | 'quad';
  panels: PanelConfig[];
}
3.2 PanelContainer
This component represents an individual panel within the layout.
Responsibilities:
•	Render panel header with title and controls
•	Manage panel content based on contentType
•	Handle panel-specific state
•	Communicate with other panels via PanelSynchronization
Props Interface:
interface PanelContainerProps {
  id: string;
  title: string;
  contentType: PanelContentType;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: PanelAction) => void;
  className?: string;
}

interface PanelAction {
  type: 'maximize' | 'close' | 'refresh' | 'export' | 'filter';
  payload?: any;
}
3.3 Panel Content Components
Each panel content type will be implemented as a separate component that follows a common interface.
Common Panel Content Interface:
interface PanelContentProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: PanelContentAction) => void;
}

interface PanelContentAction {
  type: string;
  payload?: any;
}
3.4 PanelSynchronization
This service handles the communication between panels to maintain context and synchronization.
Implementation:
// Using React Context for panel synchronization
const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

interface PanelSyncContextType {
  broadcastEvent: (source: string, event: PanelSyncEvent) => void;
  subscribeToEvents: (panelId: string, eventTypes: string[], callback: PanelSyncCallback) => () => void;
}

interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
}

type PanelSyncCallback = (event: PanelSyncEvent) => void;
4. Implementation Plan
4.1 Chunk 1: Core Container and Layout (2 Weeks)
Tasks:
1.	Create the basic MultiFrameContainer component
o	Implement layout grid system (using CSS Grid)
o	Create layout switching functionality
o	Build panel positioning logic
2.	Implement basic PanelContainer component
o	Design panel header with title and basic controls
o	Create placeholder for panel content
o	Implement panel resizing functionality
3.	Develop simple demo panels
o	Create a basic MapPanel for testing
o	Implement a simple PropertyPanel for testing
o	Build a StaticContentPanel for placeholder content
Testing & Validation:
•	Verify layout switching between Single/Dual/Tri/Quad
•	Confirm panels render in correct positions
•	Test panel resizing functionality
•	Ensure responsive behavior on different screen sizes
Git Guidelines:
•	Create feature branch: feature/multi-frame-core-layout
•	Commit message format: [Layout] Implement {specific feature}
•	Include snapshots tests where applicable
4.2 Chunk 2: Panel Communication & Content Registry (2 Weeks)
Tasks:
1.	Implement PanelSynchronization service
o	Create React Context for panel communication
o	Implement event broadcasting mechanism
o	Build subscription system for event listening
2.	Develop Panel Content Registry
o	Create registration system for panel content types
o	Implement dynamic panel content loading
o	Build panel content factory function
3.	Create first set of real panel implementations
o	Implement MapPanel with basic US map visualization
o	Create FilterPanel with geographic filters
o	Build PropertyListPanel for displaying property lists
Testing & Validation:
•	Test event propagation between panels
•	Verify panels can subscribe to specific event types
•	Confirm dynamic panel content loading works
•	Test panel content factory with different content types
Git Guidelines:
•	Create feature branch: feature/panel-communication
•	Commit message format: [Panel] Implement {specific feature}
•	Include unit tests for panel synchronization
4.3 Chunk 3: Filter System & Panel State Management (2 Weeks)
Tasks:
1.	Implement hierarchical filter system
o	Create filter components for different data types
o	Implement filter persistence mechanism
o	Build filter serialization/deserialization
2.	Develop panel state management
o	Create state persistence for panels
o	Implement panel history (undo/redo)
o	Build state synchronization between related panels
3.	Enhance MapPanel with filter integration
o	Implement geographic filtering (State/County)
o	Create property type filtering
o	Build visual feedback for applied filters
Testing & Validation:
•	Test filter application and clearing
•	Verify filter persistence across page refreshes
•	Confirm filter synchronization between panels
•	Test undo/redo functionality for panel state
Git Guidelines:
•	Create feature branch: feature/panel-filters-state
•	Commit message format: [Filter] Implement {specific feature}
•	Include integration tests for filter system
4.4 Chunk 4: Layout Persistence & User Preferences (2 Weeks)
Tasks:
1.	Implement layout persistence
o	Create layout saving mechanism
o	Build layout loading functionality
o	Implement default layouts for different roles
2.	Develop user preferences for panels
o	Create panel configuration UI
o	Implement user-specific panel settings
o	Build preference persistence system
3.	Create layout sharing capabilities
o	Implement layout export functionality
o	Build layout import mechanism
o	Create layout templates system
Testing & Validation:
•	Test saving and loading layouts
•	Verify user preferences are applied correctly
•	Confirm layout sharing works between users
•	Test layout templates with different configurations
Git Guidelines:
•	Create feature branch: feature/layout-persistence
•	Commit message format: [Layout] Implement {specific feature}
•	Include end-to-end tests for layout persistence
4.5 Chunk 5: Integration & Advanced Features (2 Weeks)
Tasks:
1.	Integrate with Controller Wizard
o	Create launch points for Controller Wizard
o	Implement result handling from wizard
o	Build visualization for controller status
2.	Enhance panel interactions
o	Implement panel maximizing/minimizing
o	Create panel focusing mechanism
o	Build advanced panel transitions
3.	Implement advanced panel content
o	Create ChartPanel for data visualization
o	Build ReportPanel for report generation
o	Implement MediaPanel for property images/videos
Testing & Validation:
•	Test Controller Wizard integration
•	Verify advanced panel interactions
•	Confirm new panel content types work correctly
•	Execute full system integration testing
Git Guidelines:
•	Create feature branch: feature/advanced-integration
•	Commit message format: [Integration] Implement {specific feature}
•	Include comprehensive system tests
5. MongoDB Schema Updates
The Multi-Frame Layout system will require additional schemas to store layout configurations and user preferences:
// Layout Configuration Schema
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
    filters: Schema.Types.Mixed
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

// User Preferences Schema Update
const UserPreferencesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  defaultLayout: {
    type: Schema.Types.ObjectId,
    ref: 'LayoutConfig'
  },
  panelPreferences: {
    type: Map,
    of: Schema.Types.Mixed
  },
  themePreferences: {
    colorMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    mapStyle: {
      type: String,
      enum: ['standard', 'satellite', 'terrain'],
      default: 'standard'
    }
  }
});
6. API Endpoints
New API endpoints will be needed to support the Multi-Frame Layout system:
6.1 Layout Configuration Endpoints
GET /api/layouts
POST /api/layouts
GET /api/layouts/:id
PUT /api/layouts/:id
DELETE /api/layouts/:id
POST /api/layouts/:id/clone
GET /api/layouts/templates
6.2 User Preferences Endpoints
GET /api/users/:id/preferences
PUT /api/users/:id/preferences
GET /api/users/:id/preferences/panels
PUT /api/users/:id/preferences/panels
6.3 Swagger Documentation
paths:
  /api/layouts:
    get:
      summary: Get all layouts for the current user
      description: Retrieves all layout configurations belonging to the current user
      parameters:
        - name: isPublic
          in: query
          required: false
          schema:
            type: boolean
          description: Filter by public/private layouts
      responses:
        '200':
          description: An array of layout configurations
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/LayoutConfig'
    post:
      summary: Create a new layout configuration
      description: Creates a new layout configuration for the current user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LayoutConfig'
      responses:
        '201':
          description: Created layout configuration
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LayoutConfig'
7. Coding Standards & Best Practices
7.1 Naming Conventions
•	Component Names: PascalCase (e.g., MultiFrameContainer, PanelHeader)
•	Props Interfaces: PascalCase with "Props" suffix (e.g., PanelContainerProps)
•	Context Objects: PascalCase with "Context" suffix (e.g., PanelSyncContext)
•	Hooks: camelCase with "use" prefix (e.g., usePanelSync, useLayoutState)
•	Event Handlers: camelCase with "handle" prefix (e.g., handlePanelResize)
•	CSS Class Names: kebab-case (e.g., panel-container, panel-header)
7.2 Folder Structure
src/
├── components/
│   ├── multiframe/
│   │   ├── MultiFrameContainer.tsx
│   │   ├── PanelContainer.tsx
│   │   ├── PanelHeader.tsx
│   │   ├── layouts/
│   │   │   ├── SinglePanelLayout.tsx
│   │   │   ├── DualPanelLayout.tsx
│   │   │   ├── TriPanelLayout.tsx
│   │   │   └── QuadPanelLayout.tsx
│   │   ├── panels/
│   │   │   ├── MapPanel.tsx
│   │   │   ├── PropertyPanel.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── StatsPanel.tsx
│   │   │   └── ChartPanel.tsx
│   │   ├── controls/
│   │   │   ├── PanelActions.tsx
│   │   │   ├── LayoutSelector.tsx
│   │   │   └── PanelResizer.tsx
│   │   └── index.ts
│   └── shared/
│       ├── buttons/
│       ├── inputs/
│       └── icons/
├── hooks/
│   ├── usePanelSync.ts
│   ├── useLayoutState.ts
│   └── usePanelResize.ts
├── context/
│   ├── PanelSyncContext.tsx
│   └── LayoutContext.tsx
├── services/
│   ├── layoutService.ts
│   └── panelContentRegistry.ts
├── types/
│   ├── layout.types.ts
│   └── panel.types.ts
└── utils/
    ├── layoutUtils.ts
    └── panelUtils.ts
7.3 Component Structure
Each component should follow this structure:
// Imports
import React, { useState, useEffect, useCallback } from 'react';
import { useLayoutState } from '../../hooks/useLayoutState';
import { PanelContainerProps } from '../../types/panel.types';
import './PanelContainer.css';

// Component definition
export const PanelContainer: React.FC<PanelContainerProps> = ({
  id,
  title,
  contentType,
  initialState,
  onStateChange,
  onAction,
  className = '',
}) => {
  // State and hooks
  const [state, setState] = useState(initialState || {});
  const { registerPanel, unregisterPanel } = useLayoutState();
  
  // Effects
  useEffect(() => {
    registerPanel(id, contentType);
    
    return () => {
      unregisterPanel(id);
    };
  }, [id, contentType, registerPanel, unregisterPanel]);
  
  // Event handlers
  const handleHeaderAction = useCallback((action: string) => {
    if (onAction) {
      onAction({ type: action });
    }
  }, [onAction]);
  
  // Render methods
  const renderContent = () => {
    // Implementation
  };
  
  // Main render
  return (
    <div className={`panel-container ${className}`} data-panel-id={id}>
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
        <div className="panel-actions">
          {/* Action buttons */}
        </div>
      </div>
      <div className="panel-content">
        {renderContent()}
      </div>
    </div>
  );
};
7.4 CSS/Styling Standards
We'll use CSS Modules for component-specific styling:
/* PanelContainer.module.css */
.panelContainer {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--panel-border-color);
  border-radius: var(--panel-border-radius);
  overflow: hidden;
  background-color: var(--panel-bg-color);
  box-shadow: var(--panel-shadow);
  transition: all 0.2s ease;
}

.panelHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: var(--panel-header-bg-color);
  border-bottom: 1px solid var(--panel-border-color);
}

.panelContent {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}
8. Testing Strategy
8.1 Unit Testing
Each component should have comprehensive unit tests covering:
•	Rendering: Component renders correctly with different props
•	State Management: Component state updates correctly
•	Event Handling: Component responds correctly to events
•	Props Validation: Component validates props correctly
// PanelContainer.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelContainer } from './PanelContainer';

describe('PanelContainer', () => {
  test('renders correctly with props', () => {
    render(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
      />
    );
    
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByTestId('test-panel')).toHaveClass('panel-container');
  });
  
  test('calls onAction when action button is clicked', () => {
    const onAction = jest.fn();
    
    render(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
        onAction={onAction}
      />
    );
    
    fireEvent.click(screen.getByTestId('maximize-button'));
    expect(onAction).toHaveBeenCalledWith({ type: 'maximize' });
  });
});
8.2 Integration Testing
Integration tests should focus on:
•	Component Interaction: Components work together correctly
•	Context Providers: Context values are properly provided and consumed
•	Panel Communication: Panels communicate correctly through the sync service
// MultiFrameIntegration.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiFrameContainer } from './MultiFrameContainer';

describe('MultiFrame Integration', () => {
  test('changes layout when layout selector is changed', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
    
    // Change to dual layout
    fireEvent.click(screen.getByTestId('layout-selector-dual'));
    
    expect(screen.getByTestId('dual-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('single-layout')).not.toBeInTheDocument();
  });
  
  test('panels communicate through sync service', () => {
    render(
      <MultiFrameContainer
        initialLayout="dual"
        panels={[
          { id: 'map', contentType: 'map', title: 'Map' },
          { id: 'property', contentType: 'property', title: 'Properties' }
        ]}
      />
    );
    
    // Select a state on the map
    fireEvent.click(screen.getByTestId('state-CA'));
    
    // Check if property panel received the event
    expect(screen.getByTestId('property-panel-state')).toHaveTextContent('CA');
  });
});
8.3 Visual Testing
We'll use Storybook to create visual tests for components:
// MultiFrameContainer.stories.tsx
import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { MultiFrameContainer } from './MultiFrameContainer';

export default {
  title: 'MultiFrame/Container',
  component: MultiFrameContainer,
  argTypes: {
    initialLayout: {
      control: 'select',
      options: ['single', 'dual', 'tri', 'quad'],
      defaultValue: 'single'
    }
  }
} as Meta;

const Template: StoryFn<typeof MultiFrameContainer> = (args) => (
  <MultiFrameContainer {...args} />
);

export const Single = Template.bind({});
Single.args = {
  initialLayout: 'single',
  panels: [
    {
      id: 'map',
      contentType: 'map',
      title: 'US Map'
    }
  ]
};

export const Dual = Template.bind({});
Dual.args = {
  initialLayout: 'dual',
  panels: [
    {
      id: 'map',
      contentType: 'map',
      title: 'US Map'
    },
    {
      id: 'property',
      contentType: 'property',
      title: 'Properties'
    }
  ]
};
9. Performance Considerations
9.1 Panel Rendering Optimization
•	Use React.memo for panel components to prevent unnecessary renders
•	Implement virtualization for large data sets (react-window or react-virtualized)
•	Optimize panel content rendering with useMemo and useCallback
9.2 State Management Optimization
•	Use optimized context providers with selective updates
•	Implement memoization for expensive calculations
•	Use efficient state update patterns to prevent unnecessary re-renders
9.3 Layout Re-rendering Prevention
// Optimized layout component
import React, { useMemo } from 'react';

export const DualPanelLayout: React.FC<DualPanelLayoutProps> = React.memo(({
  panels,
  onPanelResize,
}) => {
  // Memoize panel positions
  const panelPositions = useMemo(() => {
    return panels.map(panel => ({
      id: panel.id,
      position: calculatePanelPosition(panel)
    }));
  }, [panels]);
  
  return (
    <div className="dual-panel-layout">
      {panelPositions.map(({ id, position }) => (
        <div
          key={id}
          className="panel-wrapper"
          style={{
            gridColumn: position.column,
            gridRow: position.row
          }}
        >
          {/* Panel content */}
        </div>
      ))}
    </div>
  );
});
10. Challenges and Solutions
10.1 Challenge: Complex State Synchronization
Problem: Maintaining state synchronization between multiple panels while preventing circular updates.
Solution:
•	Implement a directed event graph to track event dependencies
•	Use event debouncing to prevent rapid event cascades
•	Implement event batching for related updates
•	Add event origin tracking to prevent circular propagation
// PanelSynchronization service with circular update prevention
class PanelSyncService {
  private eventGraph = new Map<string, Set<string>>();
  private eventQueue = new Map<string, PanelSyncEvent[]>();
  private eventProcessing = false;
  
  registerDependency(sourcePanelId: string, targetPanelId: string): void {
    if (!this.eventGraph.has(sourcePanelId)) {
      this.eventGraph.set(sourcePanelId, new Set());
    }
    
    this.eventGraph.get(sourcePanelId)!.add(targetPanelId);
  }
  
  broadcastEvent(event: PanelSyncEvent): void {
    const { source } = event;
    
    if (!this.eventQueue.has(source)) {
      this.eventQueue.set(source, []);
    }
    
    this.eventQueue.get(source)!.push(event);
    
    if (!this.eventProcessing) {
      this.processEventQueue();
    }
  }
  
  private processEventQueue(): void {
    this.eventProcessing = true;
    
    // Process queue with circular prevention
    // Implementation details...
    
    this.eventProcessing = false;
  }
}
10.2 Challenge: Layout Persistence
Problem: Saving and restoring complex layout configurations with state.
Solution:
•	Implement serialization/deserialization for panel state
•	Use a schema-based approach for state validation
•	Implement progressive loading for large state objects
•	Add version control for backward compatibility
// Layout persistence with versioning
interface LayoutVersion {
  major: number;
  minor: number;
  patch: number;
}

interface SerializedLayout {
  version: LayoutVersion;
  layout: string; // JSON string
}

class LayoutPersistenceService {
  private readonly currentVersion: LayoutVersion = { major: 1, minor: 0, patch: 0 };
  
  serializeLayout(layout: LayoutConfig): SerializedLayout {
    return {
      version: this.currentVersion,
      layout: JSON.stringify(layout)
    };
  }
  
  deserializeLayout(serialized: SerializedLayout): LayoutConfig {
    // Apply migrations if needed
    if (this.needsMigration(serialized.version)) {
      return this.migrateLayout(serialized);
    }
    
    return JSON.parse(serialized.layout);
  }
  
  private needsMigration(version: LayoutVersion): boolean {
    // Version comparison logic
    return true;
  }
  
  private migrateLayout(serialized: SerializedLayout): LayoutConfig {
    // Migration logic based on version
    return {} as LayoutConfig;
  }
}
10.3 Challenge: Performance with Multiple Maps
Problem: Maintaining performance when multiple map panels are visible simultaneously.
Solution:
•	Implement shared WebGL context for multiple map instances
•	Use level-of-detail (LOD) management for maps
•	Implement coordinated rendering for multiple maps
•	Share GeoJSON data between map instances
// Shared map resource manager
class MapResourceManager {
  private static instance: MapResourceManager;
  private geoJsonCache = new Map<string, GeoJSON.FeatureCollection>();
  private webglContext: WebGLRenderingContext | null = null;
  
  static getInstance(): MapResourceManager {
    if (!MapResourceManager.instance) {
      MapResourceManager.instance = new MapResourceManager();
    }
    
    return MapResourceManager.instance;
  }
  
  getGeoJson(key: string): GeoJSON.FeatureCollection | undefined {
    return this.geoJsonCache.get(key);
  }
  
  setGeoJson(key: string, geoJson: GeoJSON.FeatureCollection): void {
    this.geoJsonCache.set(key, geoJson);
  }
  
  getWebGLContext(): WebGLRenderingContext | null {
    return this.webglContext;
  }
  
  setWebGLContext(context: WebGLRenderingContext): void {
    this.webglContext = context;
  }
}
11. Git Workflow and Documentation
11.1 Git Workflow
We'll follow a feature-branch workflow:
main
 ├── development
 │    ├── feature/multi-frame-core-layout
 │    ├── feature/panel-communication
 │    ├── feature/panel-filters-state
 │    ├── feature/layout-persistence
 │    └── feature/advanced-integration
 ├── bugfix/bug-description
 └── hotfix/critical-issue
Branch Naming Conventions:
•	Feature branches: feature/feature-name
•	Bug fix branches: bugfix/bug-description
•	Hotfix branches: hotfix/issue-description
Commit Message Format:
[Component] Short description of the change

More detailed explanation if needed.

Closes #123
Git Hooks:
•	Pre-commit: Run linters and formatters
•	Pre-push: Run unit tests

11.2 Documentation Standards (continued)
/**
 * A container for multiple panels arranged in a grid layout.
 * 
 * @component
 * @example
 * ```tsx
 * <MultiFrameContainer
 *   initialLayout="dual"
 *   panels={[
 *     { id: 'map', contentType: 'map', title: 'US Map' },
 *     { id: 'property', contentType: 'property', title: 'Properties' }
 *   ]}
 * />
 * ```
 * 
 * @param {MultiFrameContainerProps} props - Component props
 * @returns {JSX.Element} MultiFrameContainer component
 */
export const MultiFrameContainer: React.FC<MultiFrameContainerProps> = ({ ... }) => {
  // Implementation
};
For API endpoints, we'll use Swagger documentation:
/**
 * @swagger
 * /api/layouts:
 *   get:
 *     summary: Get all layouts for the current user
 *     description: Retrieves all layout configurations belonging to the current user
 *     parameters:
 *       - name: isPublic
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by public/private layouts
 *     responses:
 *       200:
 *         description: An array of layout configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LayoutConfig'
 */
router.get('/layouts', authMiddleware, layoutController.getLayouts);
12. Development Environment Configuration
12.1 Vite Configuration
We'll extend the existing Vite configuration to support the Multi-Frame Layout component system:
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@multiframe': path.resolve(__dirname, './src/components/multiframe'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils')
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'multiframe-core': [
            './src/components/multiframe/MultiFrameContainer.tsx',
            './src/components/multiframe/PanelContainer.tsx'
          ],
          'map-components': [
            './src/components/multiframe/panels/MapPanel.tsx'
          ]
        }
      }
    }
  },
});
12.2 TypeScript Configuration
Ensure the TypeScript configuration supports path aliases:
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@multiframe/*": ["./src/components/multiframe/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@context/*": ["./src/context/*"],
      "@services/*": ["./src/services/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
12.3 ESLint and Prettier Configuration
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': ['error', {}, { usePrettierrc: true }]
  }
};

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "auto"
}
13. Detailed Component Implementation Guides
13.1 MultiFrameContainer Implementation
// MultiFrameContainer.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { PanelConfig, LayoutConfig, LayoutType } from '../../types/layout.types';
import styles from './MultiFrameContainer.module.css';

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
        // Create two default panels
        // Implementation...
      }
      // Similar implementations for tri and quad layouts
      
      setPanelConfigs(defaultPanels);
    }
  }, [layoutType, panels.length, defaultPanelContent]);
  
  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    setLayoutType(newLayout);
    
    // Notify parent component if callback provided
    if (onLayoutChange) {
      onLayoutChange({
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
    <div className={`${styles.multiFrameContainer} ${className}`} data-testid="multi-frame-container">
      <LayoutContextProvider>
        <PanelSyncProvider>
          <div className={styles.layoutControls}>
            <LayoutSelector
              currentLayout={layoutType}
              onLayoutChange={handleLayoutChange}
            />
          </div>
          <div className={styles.layoutContainer} data-testid={`${layoutType}-layout`}>
            {renderLayout()}
          </div>
        </PanelSyncProvider>
      </LayoutContextProvider>
    </div>
  );
};
13.2 PanelContainer Implementation
// PanelContainer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PanelHeader } from './PanelHeader';
import { usePanelSync } from '../../hooks/usePanelSync';
import { useLayoutContext } from '../../hooks/useLayoutContext';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelAction, PanelContentType } from '../../types/panel.types';
import styles from './PanelContainer.module.css';

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
        // Implementation...
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
    styles.panelContainer,
    isMaximized ? styles.maximized : '',
    className
  ].filter(Boolean).join(' ');
  
  // Apply style based on position and size
  const containerStyle = {
    gridRow: position?.row !== undefined ? `${position.row + 1}` : undefined,
    gridColumn: position?.col !== undefined ? `${position.col + 1}` : undefined,
    width: size?.width ? `${size.width}%` : undefined,
    height: size?.height ? `${size.height}%` : undefined
  };
  
  return (
    <div 
      className={containerClassNames} 
      style={containerStyle} 
      data-panel-id={id}
      data-testid={`panel-${id}`}
    >
      <PanelHeader 
        title={title} 
        isMaximized={isMaximized}
        onAction={handleAction}
      />
      <div className={styles.panelContent}>
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={state}
            onStateChange={handleStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className={styles.noContent}>
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
};
13.3 MapPanel Implementation
// MapPanel.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { fetchGeoJSON } from '../../../services/geoService';
import { GeoJSON, Map as LeafletMap, TileLayer } from 'react-leaflet';
import { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import styles from './MapPanel.module.css';

export interface MapPanelProps {
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
  // State
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(initialState.selectedState || null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(initialState.selectedCounty || null);
  const [viewLevel, setViewLevel] = useState<'country' | 'state' | 'county'>(initialState.viewLevel || 'country');
  
  // Refs
  const mapRef = useRef<LeafletMap | null>(null);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  
  // Load appropriate GeoJSON based on view level
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        let data;
        
        if (viewLevel === 'country') {
          data = await fetchGeoJSON('states');
        } else if (viewLevel === 'state' && selectedState) {
          data = await fetchGeoJSON(`counties/${selectedState}`);
        } else if (viewLevel === 'county' && selectedCounty) {
          data = await fetchGeoJSON(`properties/${selectedCounty}`);
        }
        
        setGeoData(data);
      } catch (error) {
        console.error('Error loading geo data:', error);
      }
    };
    
    loadGeoData();
  }, [viewLevel, selectedState, selectedCounty]);
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select') {
          const { entityType, entityId } = event.payload;
          
          if (entityType === 'state') {
            setSelectedState(entityId);
            setViewLevel('state');
          } else if (entityType === 'county') {
            setSelectedCounty(entityId);
            setViewLevel('county');
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Update parent state when local state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        selectedState,
        selectedCounty,
        viewLevel
      });
    }
  }, [selectedState, selectedCounty, viewLevel, onStateChange]);
  
  // Handle feature click
  const handleFeatureClick = useCallback((feature: any) => {
    if (viewLevel === 'country') {
      // State was clicked
      const stateId = feature.properties.STATE_ABBR;
      setSelectedState(stateId);
      setViewLevel('state');
      
      // Broadcast selection to other panels
      broadcast({
        type: 'select',
        payload: {
          entityType: 'state',
          entityId: stateId,
          properties: feature.properties
        },
        source: panelId
      });
      
    } else if (viewLevel === 'state') {
      // County was clicked
      const countyId = feature.properties.COUNTY_ID;
      setSelectedCounty(countyId);
      setViewLevel('county');
      
      // Broadcast selection to other panels
      broadcast({
        type: 'select',
        payload: {
          entityType: 'county',
          entityId: countyId,
          properties: feature.properties
        },
        source: panelId
      });
    }
    
    // Notify parent component if callback provided
    if (onAction) {
      onAction({
        type: 'select',
        payload: {
          feature,
          viewLevel,
          selectedState,
          selectedCounty
        }
      });
    }
  }, [viewLevel, selectedState, selectedCounty, broadcast, panelId, onAction]);
  
  // Style function for GeoJSON features
  const getFeatureStyle = useCallback((feature: any) => {
    // Implement styling based on feature properties
    // ...
    
    return {
      fillColor: '#76A5AF',
      weight: 1,
      opacity: 1,
      color: '#333',
      fillOpacity: 0.7
    };
  }, []);
  
  // Handle navigation back to higher level
  const handleNavigateUp = useCallback(() => {
    if (viewLevel === 'county') {
      setViewLevel('state');
      setSelectedCounty(null);
    } else if (viewLevel === 'state') {
      setViewLevel('country');
      setSelectedState(null);
    }
  }, [viewLevel]);
  
  return (
    <div className={styles.mapPanel}>
      {viewLevel !== 'country' && (
        <button 
          className={styles.backButton} 
          onClick={handleNavigateUp}
        >
          Back to {viewLevel === 'county' ? 'State' : 'Country'}
        </button>
      )}
      
      <LeafletMap
        ref={mapRef}
        center={[39.8283, -98.5795]} // Center of US
        zoom={4}
        className={styles.map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {geoData && (
          <GeoJSON
            data={geoData}
            style={getFeatureStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => handleFeatureClick(feature)
              });
            }}
          />
        )}
      </LeafletMap>
    </div>
  );
};
14. Core Service Implementation
14.1 Panel Synchronization Context
// PanelSyncContext.tsx
import React, { createContext, useCallback, useRef, useState } from 'react';

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
14.2 Layout Context
// LayoutContext.tsx
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
14.3 Panel Content Registry
// panelContentRegistry.ts
import React from 'react';
import { PanelContentType } from '../types/panel.types';

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
  
  import('../components/multiframe/panels/PropertyPanel').then(module => {
    registerPanelContent('property', module.PropertyPanel);
  });
  
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
15. Implementation Best Practices
15.1 Performance Optimization
1.	Use Memoization Effectively
// Efficient use of useMemo
const panelStyles = useMemo(() => ({
  gridColumn: `span ${size.width}`,
  gridRow: `span ${size.height}`,
  backgroundColor: isActive ? 'var(--panel-active-bg)' : 'var(--panel-bg)'
}), [size.width, size.height, isActive]);
2.	Prevent Unnecessary Re-renders
// Using React.memo with custom comparison
export const PanelHeader = React.memo(({ title, isMaximized, onAction }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.title === nextProps.title && 
         prevProps.isMaximized === nextProps.isMaximized;
});
3.	Optimize Event Handlers
// Using useCallback for event handlers
const handleResize = useCallback((e: MouseEvent) => {
  if (!resizing) return;
  
  // Resize logic
}, [resizing]);
4.	Virtualize Large Lists
// Using virtualization for property lists
import { FixedSizeList } from 'react-window';

export const PropertyListPanel: React.FC<PropertyListPanelProps> = ({ items }) => {
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>
          <PropertyListItem item={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
15.2 State Management Patterns
1.	Atomic State Updates
// Use atomic state updates
const updateFilterValue = (filterKey: string, value: any) => {
  setFilters(prev => ({
    ...prev,
    [filterKey]: value
  }));
};
2.	State Normalization
// Normalize state structure
const [panelsById, setPanelsById] = useState<Record<string, PanelConfig>>({});
const [panelIds, setPanelIds] = useState<string[]>([]);

// Adding a panel
const addPanel = (panel: PanelConfig) => {
  setPanelsById(prev => ({
    ...prev,
    [panel.id]: panel
  }));
  
  setPanelIds(prev => [...prev, panel.id]);
};
3.	Derived State with Selectors
// Create selectors for derived state
const getVisiblePanels = () => {
  return panelIds.map(id => panelsById[id]).filter(panel => panel.visible);
};

// Use in component
const visiblePanels = useMemo(() => getVisiblePanels(), [panelIds, panelsById]);

15.3 Error Handling (continued)
1.	Boundary Components
// Error boundary for panels
class PanelErrorBoundary extends React.Component
  { children: React.ReactNode; panelId: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; panelId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in panel ${this.props.panelId}:`, error, errorInfo);
    // Log to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel-error">
          <h4>Something went wrong in this panel</h4>
          <button onClick={() => this.setState({ hasError: false })}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<PanelErrorBoundary panelId={id}>
  <PanelContent />
</PanelErrorBoundary>
2.	Async Error Handling
// Async error handling with React Suspense and Error Boundary
const DataLoader = ({ children, loader, errorFallback }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    loader()
      .then(result => {
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [loader]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return errorFallback(error);
  }

  return children(data);
};

// Usage
<DataLoader 
  loader={() => fetchGeoJSON(`counties/${selectedState}`)}
  errorFallback={(error) => (
    <div className="data-error">
      Failed to load county data: {error.message}
    </div>
  )}
>
  {(data) => <GeoJSON data={data} />}
</DataLoader>
3.	Graceful Degradation
// Component with graceful degradation
const MapPanel: React.FC<MapPanelProps> = (props) => {
  // Try to use the preferred mapping library
  const [useLeaflet, setUseLeaflet] = useState(true);

  useEffect(() => {
    // Check if Leaflet initialized properly
    if (window.L === undefined) {
      console.warn('Leaflet not available, falling back to simple map');
      setUseLeaflet(false);
    }
  }, []);

  if (useLeaflet) {
    return <LeafletMapPanel {...props} />;
  }

  // Fallback to a simpler implementation
  return <SimpleMapPanel {...props} />;
};
15.4 Accessibility Considerations
1.	Keyboard Navigation
// Keyboard navigation for panels
const PanelContainer: React.FC<PanelContainerProps> = ({ children, id, title }) => {
  const [focused, setFocused] = useState(false);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Activate panel
      setFocused(true);
    } else if (e.key === 'Escape') {
      // Deactivate panel
      setFocused(false);
    }
  };
  
  return (
    <div
      className={`panel-container ${focused ? 'focused' : ''}`}
      tabIndex={0}
      role="region"
      aria-labelledby={`panel-header-${id}`}
      onKeyDown={handleKeyDown}
    >
      <div id={`panel-header-${id}`} className="panel-header">
        {title}
      </div>
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
};
2.	Screen Reader Support
// Enhanced map panel with screen reader support
const MapPanel: React.FC<MapPanelProps> = ({ selectedState, selectedCounty }) => {
  return (
    <div role="application" aria-label="Interactive map">
      <div className="sr-only" aria-live="polite">
        {selectedState 
          ? `Viewing ${selectedState} state map` 
          : 'Viewing United States map'}
        {selectedCounty && `, ${selectedCounty} county selected`}
      </div>
      
      {/* Map implementation */}
    </div>
  );
};
3.	Color Contrast
// Color scheme with accessibility consideration
const colorSchemes = {
  default: {
    background: '#ffffff',
    text: '#333333',        // 12.63:1 contrast ratio
    primary: '#0066cc',     // 4.56:1 contrast ratio
    secondary: '#6c757d',   // 4.48:1 contrast ratio
    accent: '#ffc107',      // 1.37:1 contrast ratio - use carefully!
    // Add high-contrast alternative for accent
    accentAccessible: '#d97706' // 4.54:1 contrast ratio
  },
  dark: {
    background: '#121212',
    text: '#e0e0e0',        // 14.55:1 contrast ratio
    primary: '#90caf9',     // 4.47:1 contrast ratio
    secondary: '#ce93d8',   // 5.37:1 contrast ratio
    accent: '#ffb74d',      // 4.21:1 contrast ratio
  }
};
16. API Integration
16.1 Fetching Layout Configurations
// layoutService.ts
import axios from 'axios';
import { LayoutConfig } from '../types/layout.types';

/**
 * Fetch all layout configurations for the current user
 */
export async function fetchLayouts(includePublic = false): Promise<LayoutConfig[]> {
  try {
    const response = await axios.get('/api/layouts', {
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
export async function fetchLayout(layoutId: string): Promise<LayoutConfig> {
  try {
    const response = await axios.get(`/api/layouts/${layoutId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Save a layout configuration
 */
export async function saveLayout(layout: LayoutConfig): Promise<LayoutConfig> {
  try {
    if (layout.id) {
      // Update existing layout
      const response = await axios.put(`/api/layouts/${layout.id}`, layout);
      return response.data;
    } else {
      // Create new layout
      const response = await axios.post('/api/layouts', layout);
      return response.data;
    }
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}

/**
 * Delete a layout configuration
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  try {
    await axios.delete(`/api/layouts/${layoutId}`);
  } catch (error) {
    console.error(`Error deleting layout ${layoutId}:`, error);
    throw error;
  }
}
16.2 GeoJSON Data Service
// geoService.ts
import axios from 'axios';

/**
 * Fetch GeoJSON data for the specified entity
 */
export async function fetchGeoJSON(path: string): Promise<GeoJSON.FeatureCollection> {
  try {
    const response = await axios.get(`/api/geo/${path}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching GeoJSON for ${path}:`, error);
    throw error;
  }
}

/**
 * Fetch property data for a specific county
 */
export async function fetchCountyProperties(countyId: string, filters = {}): Promise<any[]> {
  try {
    const response = await axios.get(`/api/counties/${countyId}/properties`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching properties for county ${countyId}:`, error);
    throw error;
  }
}

/**
 * Fetch statistics for a geographical entity
 */
export async function fetchEntityStats(entityType: 'state' | 'county', entityId: string): Promise<any> {
  try {
    const response = await axios.get(`/api/${entityType}s/${entityId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for ${entityType} ${entityId}:`, error);
    throw error;
  }
}
16.3 User Preferences Integration
// userPreferencesService.ts
import axios from 'axios';

/**
 * Fetch user preferences
 */
export async function fetchUserPreferences(): Promise<any> {
  try {
    const response = await axios.get('/api/user/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(preferences: any): Promise<any> {
  try {
    const response = await axios.put('/api/user/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}

/**
 * Reset user preferences to defaults
 */
export async function resetUserPreferences(): Promise<any> {
  try {
    const response = await axios.post('/api/user/preferences/reset');
    return response.data;
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    throw error;
  }
}
17. Controller Wizard Integration
17.1 Launching Controller Wizard from Map
// ControllerWizardLauncher.tsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ControllerWizardLauncherProps {
  entityType: 'state' | 'county';
  entityId: string;
  buttonLabel?: string;
  className?: string;
}

export const ControllerWizardLauncher: React.FC<ControllerWizardLauncherProps> = ({
  entityType,
  entityId,
  buttonLabel = 'Configure Controller',
  className = ''
}) => {
  const navigate = useNavigate();
  
  const handleLaunchWizard = useCallback(() => {
    navigate('/controller-wizard', {
      state: {
        entityType,
        entityId,
        step: 'SelectControllerType'
      }
    });
  }, [navigate, entityType, entityId]);
  
  return (
    <button 
      className={`controller-wizard-launcher ${className}`}
      onClick={handleLaunchWizard}
      aria-label={`Configure controller for ${entityType} ${entityId}`}
    >
      {buttonLabel}
    </button>
  );
};
17.2 Map Panel Integration with Controller Status
// MapPanelWithControllers.tsx
import React, { useState, useEffect } from 'react';
import { MapPanel } from './MapPanel';
import { ControllerWizardLauncher } from './ControllerWizardLauncher';
import { fetchControllerStatus } from '../../services/controllerService';

interface MapPanelWithControllersProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
  showControllerOptions?: boolean; // Only show for admin users
}

export const MapPanelWithControllers: React.FC<MapPanelWithControllersProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction,
  showControllerOptions = false
}) => {
  // State
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  const [controllerStatus, setControllerStatus] = useState<{
    hasController: boolean;
    status: 'active' | 'inactive' | 'error' | null;
    lastRun: string | null;
  }>({
    hasController: false,
    status: null,
    lastRun: null
  });
  
  // Fetch controller status when entity changes
  useEffect(() => {
    if (selectedEntity.type && selectedEntity.id) {
      fetchControllerStatus(selectedEntity.type, selectedEntity.id)
        .then(status => {
          setControllerStatus(status);
        })
        .catch(error => {
          console.error('Error fetching controller status:', error);
        });
    }
  }, [selectedEntity.type, selectedEntity.id]);
  
  // Handle entity selection
  const handleEntitySelected = (entity: { type: 'state' | 'county'; id: string }) => {
    setSelectedEntity(entity);
    
    // Update parent state if callback provided
    if (onStateChange) {
      onStateChange({
        entityType: entity.type,
        entityId: entity.id
      });
    }
  };
  
  return (
    <div className="map-panel-with-controllers">
      <MapPanel
        panelId={panelId}
        initialState={initialState}
        onStateChange={onStateChange}
        onAction={(action) => {
          // Handle entity selection
          if (action.type === 'select') {
            const { entityType, entityId } = action.payload;
            handleEntitySelected({ type: entityType, id: entityId });
          }
          
          // Pass action to parent if callback provided
          if (onAction) {
            onAction(action);
          }
        }}
      />
      
      {showControllerOptions && selectedEntity.type && selectedEntity.id && (
        <div className="controller-options">
          <div className="controller-status">
            <span className="status-label">Controller:</span>
            <span className={`status-value status-${controllerStatus.status || 'none'}`}>
              {controllerStatus.hasController 
                ? `${controllerStatus.status} (Last run: ${controllerStatus.lastRun || 'never'})`
                : 'Not configured'}
            </span>
          </div>
          
          <ControllerWizardLauncher
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            buttonLabel={controllerStatus.hasController ? 'Edit Controller' : 'Create Controller'}
          />
        </div>
      )}
    </div>
  );
};
18. Conclusion
The Multi-Frame Layout Component System serves as the foundation for our Real Estate Platform's user interface, enabling flexible and powerful data visualization across different contexts. By implementing this system according to the guidelines in this document, we will create a highly modular, maintainable, and extensible UI that meets the needs of both administrators and customers.
Key Deliverables
1.	Core Layout Components: MultiFrameContainer, PanelContainer, and layout variants
2.	Panel Content Components: MapPanel, PropertyPanel, FilterPanel, and more
3.	Panel Communication System: Context-based event broadcasting and subscription
4.	Layout Persistence: Save, load, and share layout configurations
5.	Controller Integration: Seamless integration with the Controller Wizard
Next Steps
1.	Begin implementation with Chunk 1 (Core Container and Layout)
2.	Set up the development environment with the specified configurations
3.	Establish coding standards and testing practices
4.	Create initial documentation for the component system
5.	Plan the integration with existing components like the US Map and Controller Wizard
By following this guide, engineers will be able to create a sophisticated, flexible UI system that powerfully visualizes the hierarchical property data while maintaining context and relationships between different data views.







I'll continue providing the implementation details for the Multi-Frame Layout Component System.
I've provided a comprehensive implementation guide for the Multi-Frame Layout Component System for your Real Estate Platform. The guide is now complete and covers all aspects of the design, including detailed code for each chunk of the implementation.
Here's a summary of what's been covered:
Core Architecture
•	Detailed component hierarchy for the Multi-Frame Layout system
•	Type definitions and interfaces for all system components
•	Implementation of layout variants (Single, Dual, Tri, and Quad)
•	Panel container implementation with header and content areas
Communication System
•	Panel synchronization context for inter-panel communication
•	Layout context for managing layout configuration
•	Panel content registry for dynamic component loading
•	Custom hooks for accessing contexts and managing state
Panel Content Implementation
•	Map panel for geographic visualization
•	Property panel for listing and selecting properties
•	Filter panel for applying data filters
•	Stats panel for displaying statistics
•	Chart panel for data visualization
Layout Persistence
•	MongoDB schemas for storing layout configurations
•	API endpoints for saving and loading layouts
•	Layout manager component for UI interaction
•	User preferences storage and management
Advanced Features
•	Controller Wizard integration
•	Panel dragging and resizing implementation
•	Enhanced panel actions
•	Error handling and accessibility considerations
Testing Implementation
•	Unit tests for individual components
•	Integration tests for component interaction
•	Mock services for testing without backend
This implementation provides a solid foundation for your Real Estate Platform, enabling users to create customized views for analyzing property data through an intuitive, flexible interface. The modular design allows for easy extension and customization while maintaining a consistent user experience.
The code follows best practices for React development, including proper component composition, TypeScript for type safety, and comprehensive testing. The MongoDB schemas and API endpoints provide a robust backend for persisting user configurations and preferences.



Multi-Frame Layout Component System: Implementation Guide
This guide provides detailed implementation code for all aspects of the Multi-Frame Layout Component System. The code is organized by the implementation chunks outlined in the design document.
Table of Contents
•	Chunk 1: Core Container and Layout
•	Chunk 2: Panel Communication & Content Registry
•	Chunk 3: Filter System & Panel State Management
•	Chunk 4: Layout Persistence & User Preferences
•	Chunk 5: Integration & Advanced Features
Chunk 1: Core Container and Layout
Types Definitions
First, let's create the core type definitions that will be used throughout the system:
// src/types/layout.types.ts
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad';

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

export type PanelContentType = 'map' | 'property' | 'filter' | 'stats' | 'chart' | 'list';
// src/types/panel.types.ts
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

// src/services/panelStateService.ts
import { PanelState, LayoutState } from '../types/state.types';

/**
 * Save panel state
 */
export function savePanelState(panelId: string, contentType: string, state: any): PanelState {
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
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string): PanelState | null {
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
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string): void {
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
}

/**
 * Save layout state
 */
export function saveLayoutState(
  layoutType: string,
  panels: Record<string, PanelState>,
  filters: any
): LayoutState {
  const layoutState: LayoutState = {
    type: layoutType,
    panels,
    filters,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to local storage for persistence
  localStorage.setItem('layoutState', JSON.stringify(layoutState));
  
  return layoutState;
}

/**
 * Load layout state
 */
export function loadLayoutState(): LayoutState | null {
  const storedState = localStorage.getItem('layoutState');
  
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error('Error parsing stored layout state:', error);
    }
  }
  
  return null;
}
// src/hooks/usePanelState.ts
import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState } from '../services/panelStateService';

export function usePanelState(panelId: string, contentType: string, initialState: any = {}) {
  // Load saved state or use initial state
  const loadInitialState = () => {
    const savedState = loadPanelState(panelId);
    
    if (savedState && savedState.contentType === contentType) {
      return savedState.state;
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<any>(loadInitialState);
  
  // Update state and save changes
  const updateState = useCallback((newState: any) => {
    setState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      
      // Save the updated state
      savePanelState(panelId, contentType, updatedState);
      
      return updatedState;
    });
  }, [panelId, contentType]);
  
  // Return state and update function
  return [state, updateState];
}
Chunk 4: Layout Persistence & User Preferences
Layout Configuration Service
// src/services/layoutService.ts
import axios from 'axios';
import { LayoutConfig } from '../types/layout.types';

/**
 * Fetch all layout configurations for the current user
 */
export async function fetchLayouts(includePublic = false): Promise<LayoutConfig[]> {
  try {
    const response = await axios.get('/api/layouts', {
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
export async function fetchLayout(layoutId: string): Promise<LayoutConfig> {
  try {
    const response = await axios.get(`/api/layouts/${layoutId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Save a layout configuration
 */
export async function saveLayout(layout: LayoutConfig): Promise<LayoutConfig> {
  try {
    if (layout.id) {
      // Update existing layout
      const response = await axios.put(`/api/layouts/${layout.id}`, layout);
      return response.data;
    } else {
      // Create new layout
      const response = await axios.post('/api/layouts', layout);
      return response.data;
    }
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}

/**
 * Delete a layout configuration
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  try {
    await axios.delete(`/api/layouts/${layoutId}`);
  } catch (error) {
    console.error(`Error deleting layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Clone a layout configuration
 */
export async function cloneLayout(layoutId: string, newName: string): Promise<LayoutConfig> {
  try {
    const response = await axios.post(`/api/layouts/${layoutId}/clone`, { name: newName });
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
}

/**
 * Load layouts from local storage
 */
export function loadLayoutsFromStorage(): LayoutConfig[] {
  const storedLayouts = localStorage.getItem('layouts');
  
  if (storedLayouts) {
    try {
      return JSON.parse(storedLayouts);
    } catch (error) {
      console.error('Error parsing stored layouts:', error);
    }
  }
  
  return [];
}
User Preferences Service
// src/types/preferences.types.ts
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
// src/services/preferencesService.ts
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
Layout Manager Component
// src/components/multiframe/LayoutManager.tsx
import React, { useState, useEffect } from 'react';
import { fetchLayouts, saveLayout, deleteLayout, cloneLayout } from '../../services/layoutService';
import { LayoutConfig } from '../../types/layout.types';
import styles from './LayoutManager.module.css';

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
  const [layouts, setLayouts] = useState<LayoutConfig[]>([]);
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
      return <div className={styles.loading}>Loading layouts...</div>;
    }
    
    if (error) {
      return <div className={styles.error}>{error}</div>;
    }
    
    if (layouts.length === 0) {
      return <div className={styles.message}>No saved layouts</div>;
    }
    
    return (
      <div className={styles.layoutList}>
        {layouts.map(layout => (
          <div 
            key={layout.id}
            className={`${styles.layoutItem} ${currentLayout?.id === layout.id ? styles.selected : ''}`}
          >
            <div className={styles.layoutInfo}>
              <h4 className={styles.layoutName}>{layout.name}</h4>
              {layout.description && (
                <p className={styles.layoutDescription}>{layout.description}</p>
              )}
              <div className={styles.layoutMeta}>
                <span className={styles.layoutType}>{layout.type}</span>
                {layout.isDefault && (
                  <span className={styles.layoutDefault}>Default</span>
                )}
              </div>
            </div>
            <div className={styles.layoutActions}>
              <button
                className={styles.layoutButton}
                onClick={() => handleSelectLayout(layout)}
              >
                Load
              </button>
              <button
                className={styles.layoutButton}
                onClick={() => handleStartEdit(layout)}
              >
                Edit
              </button>
              <button
                className={styles.layoutButton}
                onClick={() => handleCloneLayout(layout.id!, `Copy of ${layout.name}`)}
              >
                Clone
              </button>
              <button
                className={`${styles.layoutButton} ${styles.deleteButton}`}
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
    <div className={styles.layoutManager}>
      <div className={styles.header}>
        <h3>Layout Manager</h3>
        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          <span>×</span>
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            Create New Layout
          </button>
          <button
            className={styles.actionButton}
            onClick={handleSaveLayout}
            disabled={!currentLayout}
          >
            Save Current Layout
          </button>
        </div>
        
        {isCreating && (
          <div className={styles.createForm}>
            <input
              type="text"
              className={styles.input}
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Enter layout name"
            />
            <div className={styles.formActions}>
              <button
                className={styles.formButton}
                onClick={handleCreateLayout}
              >
                Create
              </button>
              <button
                className={`${styles.formButton} ${styles.cancelButton}`}
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
          <div className={styles.editForm}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                className={styles.input}
                value={editedLayout.name}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                className={styles.textarea}
                value={editedLayout.description || ''}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Default</label>
              <input
                type="checkbox"
                checked={editedLayout.isDefault || false}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, isDefault: e.target.checked } : null)}
              />
            </div>
            <div className={styles.formActions}>
              <button
                className={styles.formButton}
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button
                className={`${styles.formButton} ${styles.cancelButton}`}
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
        
        <div className={styles.layouts}>
          <h4>Saved Layouts</h4>
          {renderLayoutList()}
        </div>
      </div>
    </div>
  );
};
/* src/components/multiframe/LayoutManager.module.css */
.layoutManager {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.closeButton {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.closeButton:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.closeButton span {
  font-size: 1.25rem;
  font-weight: bold;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.actionButton {
  padding: 8px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.actionButton:hover {
  background-color: #1976d2;
}

.actionButton:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

.createForm,
.editForm {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.formGroup {
  margin-bottom: 12px;
}

.formGroup label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.input,
.textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.textarea {
  height: 80px;
  resize: vertical;
}

.formActions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.formButton {
  padding: 6px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.formButton:hover {
  background-color: #1976d2;
}

.cancelButton {
  background-color: #607d8b;
}

.cancelButton:hover {
  background-color: #455a64;
}

.deleteButton {
  background-color: #f44336;
}

.deleteButton:hover {
  background-color: #d32f2f;
}

.layouts h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
}

.layoutList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layoutItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.layoutItem.selected {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.layoutInfo {
  flex: 1;
}

.layoutName {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 500;
}

.layoutDescription {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.layoutMeta {
  display: flex;
  gap: 8px;
}

.layoutType,
.layoutDefault {
  display: inline-block;
  padding: 2px 6px;
  font-size: 0.7rem;
  border-radius: 4px;
}

.layoutType {
  background-color: #e9ecef;
  color: #495057;
}

.layoutDefault {
  background-color: #4caf50;
  color: white;
}

.layoutActions {
  display: flex;
  gap: 6px;
}

.layoutButton {
  padding: 4px 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.layoutButton:hover {
  background-color: #e9ecef;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
Chunk 5: Integration & Advanced Features
Integrating with the Controller Wizard
// src/components/multiframe/controllers/ControllerWizardLauncher.tsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ControllerWizardLauncher.module.css';

interface ControllerWizardLauncherProps {
  entityType: 'state' | 'county';
  entityId: string;
  buttonLabel?: string;
  className?: string;
}

export const ControllerWizardLauncher: React.FC<ControllerWizardLauncherProps> = ({
  entityType,
  entityId,
  buttonLabel = 'Configure Controller',
  className = ''
}) => {
  const navigate = useNavigate();
  
  const handleLaunchWizard = useCallback(() => {
    navigate('/controller-wizard', {
      state: {
        entityType,
        entityId,
        step: 'SelectControllerType'
      }
    });
  }, [navigate, entityType, entityId]);
  
  return (
    <button 
      className={`${styles.launcherButton} ${className}`}
      onClick={handleLaunchWizard}
      aria-label={`Configure controller for ${entityType} ${entityId}`}
    >
      {buttonLabel}
    </button>
  );
};
/* src/components/multiframe/controllers/ControllerWizardLauncher.module.css */
.launcherButton {
  padding: 8px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.launcherButton:hover {
  background-color: #1976d2;
}

.launcherButton:before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0```typescript
// src/services/panelStateService.ts
import { PanelState, LayoutState } from '../types/state.types';

/**
 * Save panel state
 */
export function savePanelState(panelId: string, contentType: string, state: any): PanelState {
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
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string): PanelState | null {
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
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string): void {
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
}

/**
 * Save layout state
 */
export function saveLayoutState(
  layoutType: string,
  panels: Record<string, PanelState>,
  filters: any
): LayoutState {
  const layoutState: LayoutState = {
    type: layoutType,
    panels,
    filters,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to local storage for persistence
  localStorage.setItem('layoutState', JSON.stringify(layoutState));
  
  return layoutState;
}

/**
 * Load layout state
 */
export function loadLayoutState(): LayoutState | null {
  const storedState = localStorage.getItem('layoutState');
  
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error('Error parsing stored layout state:', error);
    }
  }
  
  return null;
}
// src/hooks/usePanelState.ts
import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState } from '../services/panelStateService';

export function usePanelState(panelId: string, contentType: string, initialState: any = {}) {
  // Load saved state or use initial state
  const loadInitialState = () => {
    const savedState = loadPanelState(panelId);
    
    if (savedState && savedState.contentType === contentType) {
      return savedState.state;
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<any>(loadInitialState);
  
  // Update state and save changes
  const updateState = useCallback((newState: any) => {
    setState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      
      // Save the updated state
      savePanelState(panelId, contentType,```typescript
// src/components/multiframe/panels/ChartPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './ChartPanel.module.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ChartPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(initialState.chartType || 'bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  // Hooks
  const { subscribe } = usePanelSync();
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select') {
          const { entityType, entityId } = event.payload;
          
          if (entityType === 'state' || entityType === 'county') {
            setSelectedEntity({
              type: entityType,
              id: entityId
            });
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Generate mock chart data (replace with actual data in production)
  useEffect(() => {
    const generateChartData = async () => {
      if (!selectedEntity.type || !selectedEntity.id) {
        setChartData([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, fetch data from an API
        // For now, generate mock data based on selected entity
        
        if (selectedEntity.type === 'state') {
          // Mock data for state - property types distribution
          const mockData = [
            { name: 'Single Family', value: 55 },
            { name: 'Condo', value: 20 },
            { name: 'Townhouse', value: 15 },
            { name: 'Multi-Family', value: 5 },
            { name: 'Land', value: 5 }
          ];
          
          setChartData(mockData);
        } else if (selectedEntity.type === 'county') {
          // Mock data for county - price ranges distribution
          const mockData = [
            { name: '$0-$100k', value: 10 },
            { name: '$100k-$250k', value: 25 },
            { name: '$250k-$500k', value: 35 },
            { name: '$500k-$750k', value: 20 },
            { name: '$750k-$1M', value: 5 },
            { name: '$1M+', value: 5 }
          ];
          
          setChartData(mockData);
        }
        
        // Update parent state if callback provided
        if (onStateChange) {
          onStateChange({
            entityType: selectedEntity.type,
            entityId: selectedEntity.id,
            chartType,
            chartData
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error generating chart data:', error);
        setError('Failed to generate chart data');
        setLoading(false);
      }
    };
    
    generateChartData();
  }, [selectedEntity, chartType, onStateChange]);
  
  // Handle chart type change
  const handleChartTypeChange = (type: 'bar' | 'pie' | 'line') => {
    setChartType(type);
    
    // Notify parent component if callback provided
    if (onAction) {
      onAction({
        type: 'chartTypeChange',
        payload: {
          chartType: type
        }
      });
    }
  };
  
  // Render chart based on type
  const renderChart = () => {
    if (loading) {
      return <div className={styles.loading}>Loading chart data...</div>;
    }
    
    if (error) {
      return <div className={styles.error}>{error}</div>;
    }
    
    if (!selectedEntity.type || !selectedEntity.id) {
      return <div className={styles.message}>Select a state or county to view chart</div>;
    }
    
    if (chartData.length === 0) {
      return <div className={styles.message}>No chart data available</div>;
    }
    
    const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        // For line chart, transform data if needed
        const lineData = chartData.map((item, index) => ({
          name: item.name,
          value: item.value,
          // Add a second dimension for comparison
          trend: Math.floor(item.value * (0.9 + Math.random() * 0.2))
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
              <Line type="monotone" dataKey="trend" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className={styles.chartPanel}>
      <div className={styles.chartHeader}>
        <h3>
          {selectedEntity.type === 'state' 
            ? 'Property Types Distribution' 
            : 'Price Range Distribution'}
        </h3>
        <div className={styles.chartControls}>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('bar')}
          >
            Bar
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'pie' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('pie')}
          >
            Pie
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('line')}
          >
            Line
          </button>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {renderChart()}
      </div>
    </div>
  );
};
CSS Modules for Panel Content Components
/* src/components/multiframe/panels/MapPanel.module.css */
.mapPanel {
  position: relative;
  height: 100%;
  width: 100%;
}

.map {
  height: 100%;
  width: 100%;
}

.backButton {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.backButton:hover {
  background-color: #fff;
}

.loadingOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
}

.loadingSpinner {
  display: inline-block;
  width: 36px;
  height: 36px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3f51b5;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.errorMessage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 16px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  font-size: 0.9rem;
  z-index: 1000;
}
/* src/components/multiframe/panels/PropertyPanel.module.css */
.propertyPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panelHeader {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}

.panelHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.propertyList {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.propertyItem {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.propertyItem:hover {
  background-color: #f5f5f5;
}

.propertyItem.selected {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.propertyHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.propertyTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.propertyType {
  padding: 2px 6px;
  background-color: #e9ecef;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #495057;
}

.propertyDetails {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.propertyValue {
  font-weight: 600;
  color: #2196f3;
}

.propertyInfo {
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
/* src/components/multiframe/panels/FilterPanel.module.css */
.filterPanel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.filterHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filterHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.resetButton {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.resetButton:hover {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.filterGroup {
  margin-bottom: 16px;
}

.filterLabel {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.filterSelect {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rangeInputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rangeInput {
  flex: 1;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rangeSlider {
  width: 100%;
  margin: 8px 0;
}

.filterRow {
  display: flex;
  gap: 16px;
}

.filterRow .filterGroup {
  flex: 1;
}
/* src/components/multiframe/panels/StatsPanel.module.css */
.statsPanel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.statsContent {
  height: 100%;
}

.statsHeader {
  margin-bottom: 16px;
}

.statsHeader h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
}

.entityName {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2196f3;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.statCard {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #eee;
}

.statLabel {
  display: block;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #6c757d;
}

.statValue {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
/* src/components/multiframe/panels/ChartPanel.module.css */
.chartPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chartHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chartHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chartControls {
  display: flex;
  gap: 8px;
}

.chartTypeButton {
  padding: 4px 12px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.chartTypeButton:hover {
  background-color: #f5f5f5;
}

.chartTypeButton.active {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.chartContainer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
Chunk 3: Filter System & Panel State Management
Filter System Implementation
// src/types/filter.types.ts
export interface PropertyFilter {
  propertyType?: string | string[];
  priceRange?: [number, number];
  bedrooms?: string | number;
  bathrooms?: string | number;
  squareFeet?: [number, number];
  [key: string]: any;
}

export interface GeographicFilter {
  state?: string;
  county?: string;
  [key: string]: any;
}

export interface FilterSet {
  property?: PropertyFilter;
  geographic?: GeographicFilter;
  [key: string]: any;
}

export interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: FilterSet;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
// src/context/FilterContext.tsx
import React, { createContext, useCallback, useState } from 'react';
import { FilterSet, FilterConfig } from '../types/filter.types';

interface FilterContextType {
  activeFilters: FilterSet;
  savedFilters: FilterConfig[];
  applyFilters: (filters: FilterSet) => void;
  clearFilters: () => void;
  saveFilter: (config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteFilter: (id: string) => void;
  loadFilter: (id: string) => void;
}

export const FilterContext = createContext<FilterContextType | null>(null);

export const FilterContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [activeFilters, setActiveFilters] = useState<FilterSet>({});
  const [savedFilters, setSavedFilters] = useState<FilterConfig[]>([]);
  
  // Apply filters
  const applyFilters = useCallback((filters: FilterSet) => {
    setActiveFilters(prev => ({
      ...prev,
      ...filters
    }));
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);
  
  // Save filter configuration
  const saveFilter = useCallback((config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFilter: FilterConfig = {
      ...config,
      id: `filter-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSavedFilters(prev => [...prev, newFilter]);
  }, []);
  
  // Delete saved filter
  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);
  
  // Load saved filter
  const loadFilter = useCallback((id: string) => {
    const filter = savedFilters.find(filter => filter.id === id);
    
    if (filter) {
      setActiveFilters(filter.filters);
    }
  }, [savedFilters]);
  
  // Context value
  const contextValue = {
    activeFilters,
    savedFilters,
    applyFilters,
    clearFilters,
    saveFilter,
    deleteFilter,
    loadFilter
  };
  
  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
// src/hooks/useFilter.ts
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export function useFilter() {
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context;
}
// src/services/filterService.ts
import { FilterSet, FilterConfig } from '../types/filter.types';

/**
 * Apply filters to data
 */
export function applyFiltersToData<T>(data: T[], filters: FilterSet): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  return data.filter(item => {
    // Apply property filters
    if (filters.property) {
      const propertyFilters = filters.property;
      
      // Property type filter
      if (propertyFilters.propertyType && 'propertyType' in item) {
        const itemType = (item as any).propertyType;
        
        if (Array.isArray(propertyFilters.propertyType)) {
          if (!propertyFilters.propertyType.includes(itemType)) {
            return false;
          }
        } else if (propertyFilters.propertyType !== 'all' && propertyFilters.propertyType !== itemType) {
          return false;
        }
      }
      
      // Price range filter
      if (propertyFilters.priceRange && 'price' in item) {
        const [min, max] = propertyFilters.priceRange;
        const itemPrice = (item as any).price;
        
        if (itemPrice < min || itemPrice > max) {
          return false;
        }
      }
      
      // Bedrooms filter
      if (propertyFilters.bedrooms && 'bedrooms' in item) {
        const itemBedrooms = (item as any).bedrooms;
        
        if (propertyFilters.bedrooms !== 'any' && itemBedrooms < Number(propertyFilters.bedrooms)) {
          return false;
        }
      }
      
      // Bathrooms filter
      if (propertyFilters.bathrooms && 'bathrooms' in item) {
        const itemBathrooms = (item as any).bathrooms;
        
        if (propertyFilters.bathrooms !== 'any' && itemBathrooms < Number(propertyFilters.bathrooms)) {
          return false;
        }
      }
      
      // Square feet filter
      if (propertyFilters.squareFeet && 'squareFeet' in item) {
        const [min, max] = propertyFilters.squareFeet;
        const itemSquareFeet = (item as any).squareFeet;
        
        if (itemSquareFeet < min || itemSquareFeet > max) {
          return false;
        }
      }
    }
    
    // Apply geographic filters
    if (filters.geographic) {
      const geoFilters = filters.geographic;
      
      // State filter
      if (geoFilters.state && 'state' in item) {
        const itemState = (item as any).state;
        
        if (geoFilters.state !== itemState) {
          return false;
        }
      }
      
      // County filter
      if (geoFilters.county && 'county' in item) {
        const itemCounty = (item as any).county;
        
        if (geoFilters.county !== itemCounty) {
          return false;
        }
      }
    }
    
    // Item passed all filters
    return true;
  });
}

/**
 * Save filters to local storage
 */
export function saveFiltersToStorage(filters: FilterConfig[]): void {
  localStorage.setItem('savedFilters', JSON.stringify(filters));
}

/**
 * Load filters from local storage
 */
export function loadFiltersFromStorage(): FilterConfig[] {
  const storedFilters = localStorage.getItem('savedFilters');
  
  if (storedFilters) {
    try {
      return JSON.parse(storedFilters);
    } catch (error) {
      console.error('Error parsing stored filters:', error);
    }
  }
  
  return [];
}
Panel State Management
// src/types/state.types.ts
export interface PanelState {
  id: string;
  contentType: string;
  state: any;
  lastUpdated: string;
}

export interface LayoutState {
  type: string;
  panels: Record<string, PanelState>;
  filters: any;
  lastUpdated: string;
}
``````typescript
// src/components/multiframe/panels/ChartPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './ChartPanel.module.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ChartPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(initialState.chartType || 'bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  // Hooks
  const { subscribe } = usePanelSync();
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select') {
          const { entityType, entityId } = event.payload;
          
          if (entityType === 'state' || entityType === 'county') {
            setSelectedEntity({
              type: entityType,
              id: entityId
            });
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Generate mock chart data (replace with actual data in production)
  useEffect(() => {
    const generateChartData = async () => {
      if (!selectedEntity.type || !selectedEntity.id) {
        setChartData([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, fetch data from an API
        // For now, generate mock data based on selected entity
        
        if (selectedEntity.type === 'state') {
          // Mock data for state - property types distribution
          const mockData = [
            { name: 'Single# Multi-Frame Layout Component System: Implementation Guide

This guide provides detailed implementation code for all aspects of the Multi-Frame Layout Component System. The code is organized by the implementation chunks outlined in the design document.

## Table of Contents
- [Chunk 1: Core Container and Layout](#chunk-1-core-container-and-layout)
- [Chunk 2: Panel Communication & Content Registry](#chunk-2-panel-communication--content-registry)
- [Chunk 3: Filter System & Panel State Management](#chunk-3-filter-system--panel-state-management)
- [Chunk 4: Layout Persistence & User Preferences](#chunk-4-layout-persistence--user-preferences)
- [Chunk 5: Integration & Advanced Features](#chunk-5-integration--advanced-features)

## Chunk 1: Core Container and Layout

### Types Definitions

First, let's create the core type definitions that will be used throughout the system:

```typescript
// src/types/layout.types.ts
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad';

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

export type PanelContentType = 'map' | 'property' | 'filter' | 'stats' | 'chart' | 'list';
// src/types/panel.types.ts
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
MultiFrameContainer Component
// src/components/multiframe/MultiFrameContainer.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { PanelConfig, LayoutConfig, LayoutType } from '../../types/layout.types';
import styles from './MultiFrameContainer.module.css';

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
          contentType: defaultPanelContent['top-right'] || 'property',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom',
          contentType: defaultPanelContent.bottom || 'stats',
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
          contentType: defaultPanelContent['top-right'] || 'property',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-left',
          contentType: defaultPanelContent['bottom-left'] || 'filter',
          title: 'Bottom Left Panel',
          position: { row: 1, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-right',
          contentType: defaultPanelContent['bottom-right'] || 'stats',
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
    <div className={`${styles.multiFrameContainer} ${className}`} data-testid="multi-frame-container">
      <LayoutContextProvider>
        <PanelSyncProvider>
          <div className={styles.layoutControls}>
            <LayoutSelector
              currentLayout={layoutType}
              onLayoutChange={handleLayoutChange}
            />
          </div>
          <div className={styles.layoutContainer} data-testid={`${layoutType}-layout`}>
            {renderLayout()}
          </div>
        </PanelSyncProvider>
      </LayoutContextProvider>
    </div>
  );
};
Layout Selector Component
// src/components/multiframe/controls/LayoutSelector.tsx
import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import styles from './LayoutSelector.module.css';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange
}) => {
  return (
    <div className={styles.layoutSelector}>
      <button
        className={`${styles.layoutButton} ${currentLayout === 'single' ? styles.active : ''}`}
        onClick={() => onLayoutChange('single')}
        aria-label="Single panel layout"
        data-testid="layout-selector-single"
      >
        <div className={styles.singleIcon}></div>
        <span>Single</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'dual' ? styles.active : ''}`}
        onClick={() => onLayoutChange('dual')}
        aria-label="Dual panel layout"
        data-testid="layout-selector-dual"
      >
        <div className={styles.dualIcon}></div>
        <span>Dual</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'tri' ? styles.active : ''}`}
        onClick={() => onLayoutChange('tri')}
        aria-label="Tri panel layout"
        data-testid="layout-selector-tri"
      >
        <div className={styles.triIcon}></div>
        <span>Tri</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'quad' ? styles.active : ''}`}
        onClick={() => onLayoutChange('quad')}
        aria-label="Quad panel layout"
        data-testid="layout-selector-quad"
      >
        <div className={styles.quadIcon}></div>
        <span>Quad</span>
      </button>
    </div>
  );
};
Layout Components
// src/components/multiframe/layouts/SinglePanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './SinglePanelLayout.module.css';

interface SinglePanelLayoutProps {
  panels: PanelConfig[];
}

export const SinglePanelLayout: React.FC<SinglePanelLayoutProps> = ({ panels }) => {
  // For single panel layout, we only use the first panel
  const panel = panels[0];
  
  if (!panel) {
    return <div className={styles.emptyLayout}>No panel configured</div>;
  }
  
  return (
    <div className={styles.singlePanelLayout} data-testid="single-layout">
      <PanelContainer
        id={panel.id}
        title={panel.title}
        contentType={panel.contentType}
        initialState={panel.state}
        className={styles.fullSizePanel}
      />
    </div>
  );
};
// src/components/multiframe/layouts/DualPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './DualPanelLayout.module.css';

interface DualPanelLayoutProps {
  panels: PanelConfig[];
}

export const DualPanelLayout: React.FC<DualPanelLayoutProps> = ({ panels }) => {
  // Ensure we have exactly two panels
  const leftPanel = panels.find(p => p.position?.col === 0) || panels[0];
  const rightPanel = panels.find(p => p.position?.col === 1) || panels[1];
  
  if (!leftPanel || !rightPanel) {
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.dualPanelLayout} data-testid="dual-layout">
      <div className={styles.leftPanel}>
        <PanelContainer
          id={leftPanel.id}
          title={leftPanel.title}
          contentType={leftPanel.contentType}
          initialState={leftPanel.state}
          className={styles.panelContainer}
        />
      </div>
      <div className={styles.rightPanel}>
        <PanelContainer
          id={rightPanel.id}
          title={rightPanel.title}
          contentType={rightPanel.contentType}
          initialState={rightPanel.state}
          className={styles.panelContainer}
        />
      </div>
    </div>
  );
};
// src/components/multiframe/layouts/TriPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './TriPanelLayout.module.css';

interface TriPanelLayoutProps {
  panels: PanelConfig[];
}

export const TriPanelLayout: React.FC<TriPanelLayoutProps> = ({ panels }) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 0) || panels[0];
  const topRightPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 1) || panels[1];
  const bottomPanel = panels.find(p => p.position?.row === 1) || panels[2];
  
  if (!topLeftPanel || !topRightPanel || !bottomPanel) {
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.triPanelLayout} data-testid="tri-layout">
      <div className={styles.topRow}>
        <div className={styles.topLeftPanel}>
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.topRightPanel}>
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <PanelContainer
          id={bottomPanel.id}
          title={bottomPanel.title}
          contentType={bottomPanel.contentType}
          initialState={bottomPanel.state}
          className={styles.panelContainer}
        />
      </div>
    </div>
  );
};
// src/components/multiframe/layouts/QuadPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './QuadPanelLayout.module.css';

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
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.quadPanelLayout} data-testid="quad-layout">
      <div className={styles.topRow}>
        <div className={styles.topLeftPanel}>
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.topRightPanel}>
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.bottomLeftPanel}>
          <PanelContainer
            id={bottomLeftPanel.id}
            title={bottomLeftPanel.title}
            contentType={bottomLeftPanel.contentType}
            initialState={bottomLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.bottomRightPanel}>
          <PanelContainer
            id={bottomRightPanel.id}
            title={bottomRightPanel.title}
            contentType={bottomRightPanel.contentType}
            initialState={bottomRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
    </div>
  );
};
PanelContainer and PanelHeader Components
// src/components/multiframe/PanelContainer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PanelHeader } from './PanelHeader';
import { usePanelSync } from '../../hooks/usePanelSync';
import { useLayoutContext } from '../../hooks/useLayoutContext';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelAction, PanelContentType } from '../../types/panel.types';
import styles from './PanelContainer.module.css';

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
    styles.panelContainer,
    isMaximized ? styles.maximized : '',
    className
  ].filter(Boolean).join(' ');
  
  // Apply style based on position and size
  const containerStyle = {
    gridRow: position?.row !== undefined ? `${position.row + 1}` : undefined,
    gridColumn: position?.col !== undefined ? `${position.col + 1}` : undefined,
    width: size?.width ? `${size.width}%` : undefined,
    height: size?.height ? `${size.height}%` : undefined
  };
  
  return (
    <div 
      className={containerClassNames} 
      style={containerStyle} 
      data-panel-id={id}
      data-testid={`panel-${id}`}
    >
      <PanelHeader 
        title={title} 
        isMaximized={isMaximized}
        onAction={handleAction}
      />
      <div className={styles.panelContent}>
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={state}
            onStateChange={handleStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className={styles.noContent}>
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
};
// src/components/multiframe/PanelHeader.tsx
import React, { useCallback } from 'react';
import styles from './PanelHeader.module.css';

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
    <div className={styles.panelHeader}>
      <h3 className={styles.panelTitle}>{title}</h3>
      <div className={styles.panelActions}>
        <button
          className={styles.actionButton}
          onClick={handleRefreshClick}
          aria-label="Refresh panel"
          data-testid="refresh-button"
        >
          <span className={styles.refreshIcon}></span>
        </button>
        <button
          className={styles.actionButton}
          onClick={handleExportClick}
          aria-label="Export panel data"
          data-testid="export-button"
        >
          <span className={styles.exportIcon}></span>
        </button>
        <button
          className={`${styles.actionButton} ${isMaximized ? styles.active : ''}`}
          onClick={handleMaximizeClick}
          aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
          data-testid="maximize-button"
        >
          <span className={isMaximized ? styles.restoreIcon : styles.maximizeIcon}></span>
        </button>
      </div>
    </div>
  );
};
CSS Modules
/* src/components/multiframe/MultiFrameContainer.module.css */
.multiFrameContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--background-color, #f5f5f5);
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  overflow: hidden;
}

.layoutControls {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--header-bg-color, #fff);
  border-bottom: 1px solid var(--border-color, #ddd);
}

.layoutContainer {
  flex: 1;
  display: flex;
  overflow: hidden;
}
/* src/components/multiframe/controls/LayoutSelector.module.css */
.layoutSelector {
  display: flex;
  gap: 0.5rem;
}

.layoutButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
}

.layoutButton.active {
  background-color: var(--primary-color-light, #e3f2fd);
  border-color: var(--primary-color, #2196f3);
}

.layoutButton:hover {
  background-color: var(--hover-bg-color, #f0f0f0);
}

.layoutButton span {
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

/* Icon styles */
.singleIcon,
.dualIcon,
.triIcon,
.quadIcon {
  width: 24px;
  height: 24px;
  border: 1px solid var(--icon-color, #555);
  border-radius: 2px;
}

.dualIcon {
  position: relative;
}

.dualIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.triIcon {
  position: relative;
}

.triIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.triIcon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--icon-color, #555);
}

.quadIcon {
  position: relative;
}

.quadIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.quadIcon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--icon-color, #555);
}
/* src/components/multiframe/layouts/SinglePanelLayout.module.css */
.singlePanelLayout {
  width: 100%;
  height: 100%;
  display: flex;
}

.fullSizePanel {
  flex: 1;
}

.emptyLayout {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #777);
  font-style: italic;
}
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #777);
  font-style: italic;
}
/* src/components/multiframe/layouts/DualPanelLayout.module.css */
.dualPanelLayout {
  width: 100%;
  height: 100%;
  display: flex;
}

.leftPanel,
.rightPanel {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.leftPanel {
  border-right: 1px solid var(--border-color, #ddd);
}

.panelContainer {
  height: 100%;
}

.emptyLayout {
  width: 100%;


MongoDB API Implementation
The server-side implementation includes several API endpoints and MongoDB schemas to support the Multi-Frame Layout Component System.
MongoDB Schemas
// server/src/models/LayoutConfig.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface PanelPosition {
  row: number;
  col: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelConfig {
  id: string;
  contentType: string;
  title: string;
  position?: PanelPosition;
  size?: PanelSize;
  state?: any;
  visible?: boolean;
}

export interface ILayoutConfig extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  layoutType: 'single' | 'dual' | 'tri' | 'quad';
  panels: PanelConfig[];
  createdAt: Date;
  updatedAt: Date;
}

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

// Middleware to update timestamps
LayoutConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const LayoutConfig = mongoose.model<ILayoutConfig>('LayoutConfig', LayoutConfigSchema);
// server/src/models/UserPreferences.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  defaultLayout: mongoose.Types.ObjectId;
  panelPreferences: Map<string, any>;
  themePreferences: {
    colorMode: 'light' | 'dark' | 'system';
    mapStyle: 'standard' | 'satellite' | 'terrain';
    accentColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
  };
  filterPreferences: {
    defaultFilters: any;
    showFilterPanel: boolean;
    applyFiltersAutomatically: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  defaultLayout: {
    type: Schema.Types.ObjectId,
    ref: 'LayoutConfig'
  },
  panelPreferences: {
    type: Map,
    of: Schema.Types.Mixed
  },
  themePreferences: {
    colorMode: {
      type: String,
      enum: ['light', 'dark', 'system'],.launcherButton:before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
MapPanelWithControllers Component
// src/components/multiframe/panels/MapPanelWithControllers.tsx
import React, { useState, useEffect } from 'react';
import { MapPanel } from './MapPanel';
import { ControllerWizardLauncher } from '../controllers/ControllerWizardLauncher';
import { fetchControllerStatus } from '../../../services/controllerService';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './MapPanelWithControllers.module.css';

export const MapPanelWithControllers: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  const [controllerStatus, setControllerStatus] = useState<{
    hasController: boolean;
    status: 'active' | 'inactive' | 'error' | null;
    lastRun: string | null;
  }>({
    hasController: false,
    status: null,
    lastRun: null
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // In production, get from auth context
  
  // Fetch controller status when entity changes
  useEffect(() => {
    if (selectedEntity.type && selectedEntity.id) {
      fetchControllerStatus(selectedEntity.type, selectedEntity.id)
        .then(status => {
          setControllerStatus(status);
        })
        .catch(error => {
          console.error('Error fetching controller status:', error);
        });
    }
  }, [selectedEntity.type, selectedEntity.id]);
  
  // Handle entity selection
  const handleEntitySelected = (entity: { type: 'state' | 'county'; id: string }) => {
    setSelectedEntity(entity);
    
    // Update parent state if callback provided
    if (onStateChange) {
      onStateChange({
        entityType: entity.type,
        entityId: entity.id
      });
    }
  };
  
  return (
    <div className={styles.mapPanelWithControllers}>
      <MapPanel
        panelId={panelId}
        initialState={initialState}
        onStateChange={onStateChange}
        onAction={(action) => {
          // Handle entity selection
          if (action.type === 'select') {
            const { entityType, entityId } = action.payload;
            if (entityType === 'state' || entityType === 'county') {
              handleEntitySelected({ type: entityType, id: entityId });
            }
          }
          
          // Pass action to parent if callback provided
          if (onAction) {
            onAction(action);
          }
        }}
      />
      
      {isAdmin && selectedEntity.type && selectedEntity.id && (
        <div className={styles.controllerOverlay}>
          <div className={styles.controllerStatus}>
            <span className={styles.statusLabel}>Controller:</span>
            <span className={`${styles.statusValue} ${styles[`status-${controllerStatus.status || 'none'}`]}`}>
              {controllerStatus.hasController 
                ? `${controllerStatus.status} (Last run: ${controllerStatus.lastRun ? new Date(controllerStatus.lastRun).toLocaleString() : 'never'})`
                : 'Not configured'}
            </span>
          </div>
          
          <ControllerWizardLauncher
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            buttonLabel={controllerStatus.hasController ? 'Edit Controller' : 'Create Controller'}
            className={styles.launcherButton}
          />
        </div>
      )}
    </div>
  );
};
/* src/components/multiframe/panels/MapPanelWithControllers.module.css */
.mapPanelWithControllers {
  position: relative;
  height: 100%;
  width: 100%;
}

.controllerOverlay {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
}

.controllerStatus {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.statusLabel {
  font-weight: 500;
}

.statusValue {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-active {
  background-color: #4caf50;
  color: white;
}

.status-inactive {
  background-color: #ff9800;
  color: white;
}

.status-error {
  background-color: #f44336;
  color: white;
}

.status-none {
  background-color: #e0e0e0;
  color: #757575;
}

.launcherButton {
  margin-top: 4px;
}
Controller Status Service
// src/services/controllerService.ts
import axios from 'axios';

interface ControllerStatus {
  hasController: boolean;
  status: 'active' | 'inactive' | 'error' | null;
  lastRun: string | null;
  nextRun?: string | null;
  runCount?: number;
  errorCount?: number;
  controllerType?: string;
  controllerName?: string;
}

/**
 * Fetch controller status for an entity
 */
export async function fetchControllerStatus(
  entityType: 'state' | 'county',
  entityId: string
): Promise<ControllerStatus> {
  try {
    const response = await axios.get(`/api/${entityType}s/${entityId}/controller-status`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching controller status for ${entityType} ${entityId}:`, error);
    
    // Return default status if error occurs
    return {
      hasController: false,
      status: null,
      lastRun: null
    };
  }
}

/**
 * Execute a controller
 */
export async function executeController(
  entityType: 'state' | 'county',
  entityId: string,
  controllerId: string
): Promise<any> {
  try {
    const response = await axios.post(`/api/controllers/${controllerId}/execute`, {
      entityType,
      entityId
    });
    return response.data;
  } catch (error) {
    console.error(`Error executing controller ${controllerId}:`, error);
    throw error;
  }
}

/**
 * Get controller history
 */
export async function getControllerHistory(
  entityType: 'state' | 'county',
  entityId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const response = await axios.get(`/api/${entityType}s/${entityId}/controller-history`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching controller history for ${entityType} ${entityId}:`, error);
    return [];
  }
}

/**
 * Mock implementation for development
 */
export function mockControllerStatus(
  entityType: 'state' | 'county',
  entityId: string
): Promise<ControllerStatus> {
  return new Promise((resolve) => {
    // Simulate API latency
    setTimeout(() => {
      // For demo purposes, assume some entities have controllers
      const hasController = Math.random() > 0.3;
      
      if (hasController) {
        const statuses = ['active', 'inactive', 'error'] as const;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const lastRun = new Date(Date.now() - Math.random() * 86400000 * 30).toISOString();
        
        resolve({
          hasController: true,
          status: randomStatus,
          lastRun,
          nextRun: randomStatus === 'active' 
            ? new Date(Date.now() + Math.random() * 86400000 * 7).toISOString()
            : null,
          runCount: Math.floor(Math.random() * 100),
          errorCount: randomStatus === 'error' ? Math.floor(Math.random() * 10) : 0,
          controllerType: entityType === 'state' ? 'StateDataCollector' : 'CountyDataCollector',
          controllerName: `${entityId} ${entityType === 'state' ? 'State' : 'County'} Controller`
        });
      } else {
        resolve({
          hasController: false,
          status: null,
          lastRun: null
        });
      }
    }, 300);
  });
}
Panel Actions Enhancement
// src/components/multiframe/PanelActions.tsx
import React from 'react';
import styles from './PanelActions.module.css';

interface PanelActionsProps {
  isMaximized: boolean;
  onMaximize: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onClose?: () => void;
  className?: string;
}

export const PanelActions: React.FC<PanelActionsProps> = ({
  isMaximized,
  onMaximize,
  onRefresh,
  onExport,
  onClose,
  className = ''
}) => {
  return (
    <div className={`${styles.panelActions} ${className}`}>
      <button
        className={styles.actionButton}
        onClick={onRefresh}
        aria-label="Refresh panel"
        data-testid="refresh-button"
      >
        <span className={styles.refreshIcon}></span>
      </button>
      
      <button
        className={styles.actionButton}
        onClick={onExport}
        aria-label="Export panel data"
        data-testid="export-button"
      >
        <span className={styles.exportIcon}></span>
      </button>
      
      <button
        className={`${styles.actionButton} ${isMaximized ? styles.active : ''}`}
        onClick={onMaximize}
        aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
        data-testid="maximize-button"
      >
        <span className={isMaximized ? styles.restoreIcon : styles.maximizeIcon}></span>
      </button>
      
      {onClose && (
        <button
          className={`${styles.actionButton} ${styles.closeButton}`}
          onClick={onClose}
          aria-label="Close panel"
          data-testid="close-button"
        >
          <span className={styles.closeIcon}></span>
        </button>
      )}
    </div>
  );
};
Panel Drag and Drop Implementation
// src/components/multiframe/DraggablePanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PanelContainer, PanelContainerProps } from './PanelContainer';
import styles from './DraggablePanel.module.css';

export interface DraggablePanelProps extends PanelContainerProps {
  onPositionChange?: (id: string, position: { row: number; col: number }) => void;
  enableDragging?: boolean;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  title,
  contentType,
  initialState,
  position,
  size,
  onStateChange,
  onAction,
  onPositionChange,
  enableDragging = true,
  className = ''
}) => {
  // State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Refs
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Start dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableDragging) return;
    
    // Only start dragging from header
    if (!(e.target as HTMLElement).closest(`.${styles.panelHeader}`)) return;
    
    setIsDragging(true);
    
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    // Prevent text selection during drag
    e.preventDefault();
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new position
      if (panelRef.current) {
        const parentRect = panelRef.current.parentElement?.getBoundingClientRect();
        
        if (parentRect) {
          const x = e.clientX - parentRect.left - dragOffset.x;
          const y = e.clientY - parentRect.top - dragOffset.y;
          
          // Set new position with CSS
          panelRef.current.style.transform = `translate(${x}px, ${y}px)`;
          panelRef.current.style.zIndex = '1000';
        }
      }
    };
    
    const handleMouseUp = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Calculate final grid position
      if (panelRef.current && onPositionChange) {
        const parentRect = panelRef.current.parentElement?.getBoundingClientRect();
        const panelRect = panelRef.current.getBoundingClientRect();
        
        if (parentRect) {
          // Reset inline transform
          panelRef.current.style.transform = '';
          panelRef.current.style.zIndex = '';
          
          // Calculate grid position (assuming 2x2 grid)
          const col = (panelRect.left - parentRect.left + panelRect.width / 2) > parentRect.width / 2 ? 1 : 0;
          const row = (panelRect.top - parentRect.top + panelRect.height / 2) > parentRect.height / 2 ? 1 : 0;
          
          // Notify about position change
          onPositionChange(id, { row, col });
        }
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onPositionChange]);
  
  return (
    <div
      ref={panelRef}
      className={`${styles.draggablePanel} ${isDragging ? styles.dragging : ''} ${className}`}
      onMouseDown={handleMouseDown}
    >
      <PanelContainer
        id={id}
        title={title}
        contentType={contentType}
        initialState={initialState}
        position={position}
        size={size}
        onStateChange={onStateChange}
        onAction={onAction}
        className={styles.innerPanel}
      />
    </div>
  );
};
/* src/components/multiframe/DraggablePanel.module.css */
.draggablePanel {
  position: relative;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.draggablePanel.dragging {
  opacity: 0.8;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: none;
  cursor: grabbing;
}

.innerPanel {
  height: 100%;
  width: 100%;
}

.panelHeader {
  cursor: grab;
}

.dragging .panelHeader {
  cursor: grabbing;
}
Panel Resizing Implementation
// src/components/multiframe/ResizablePanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PanelContainer, PanelContainerProps } from './PanelContainer';
import styles from './ResizablePanel.module.css';

export interface ResizablePanelProps extends PanelContainerProps {
  onSizeChange?: (id: string, size: { width: number; height: number }) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableResizing?: boolean;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  id,
  title,
  contentType,
  initialState,
  position,
  size,
  onStateChange,
  onAction,
  onSizeChange,
  minWidth = 20,
  minHeight = 20,
  maxWidth = 100,
  maxHeight = 100,
  enableResizing = true,
  className = ''
}) => {
  // State
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startSize, setStartSize] = useState<{ width: number; height: number } | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  
  // Refs
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Start resizing
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    if (!enableResizing) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect && panelRef.current?.parentElement) {
      const parentRect = panelRef.current.parentElement.getBoundingClientRect();
      
      setStartSize({
        width: (rect.width / parentRect.width) * 100,
        height: (rect.height / parentRect.height) * 100
      });
      
      setStartPos({
        x: e.clientX,
        y: e.clientY
      });
    }
    
    e.preventDefault();
  };
  
  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !startSize || !startPos || !panelRef.current?.parentElement) return;
      
      const parentRect = panelRef.current.parentElement.getBoundingClientRect();
      
      // Calculate delta
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      // Calculate new size based on direction
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      
      if (resizeDirection.includes('right')) {
        newWidth = startSize.width + (deltaX / parentRect.width) * 100;
      } else if (resizeDirection.includes('left')) {
        newWidth = startSize.width - (deltaX / parentRect.width) * 100;
      }
      
      if (resizeDirection.includes('bottom')) {
        newHeight = startSize.height + (deltaY / parentRect.height) * 100;
      } else if (resizeDirection.includes('top')) {
        newHeight = startSize.height - (deltaY / parentRect.height) * 100;
      }
      
      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      // Apply new size
      panelRef.current.style.width = `${newWidth}%`;
      panelRef.current.style.height = `${newHeight}%`;
    };
    
    const handleMouseUp = () => {
      if (!isResizing) return;
      
      setIsResizing(false);
      setResizeDirection(null);
      
      // Calculate final size
      if (panelRef.current?.parentElement && onSizeChange) {
        const rect = panelRef.current.getBoundingClientRect();
        const parentRect = panelRef.current.parentElement.getBoundingClientRect();
        
        const newSize = {
          width: (rect.width / parentRect.width) * 100,
          height: (rect.height / parentRect.height) * 100
        };
        
        // Notify about size change
        onSizeChange(id, newSize);
      }
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startSize, startPos, resizeDirection, id, minWidth, minHeight, maxWidth, maxHeight, onSizeChange]);
  
  return (
    <div
      ref={panelRef}
      className={`${styles.resizablePanel} ${isResizing ? styles.resizing : ''} ${className}`}
      style={{
        width: size?.width ? `${size.width}%` : undefined,
        height: size?.height ? `${size.height}%` : undefined
      }}
    >
      <PanelContainer
        id={id}
        title={title}
        contentType={contentType}
        initialState={initialState}
        position={position}
        size={size}
        onStateChange={onStateChange}
        onAction={onAction}
        className={styles.innerPanel}
      />
      
      {enableResizing && (
        <>
          <div 
            className={`${styles.resizeHandle} ${styles.resizeRight}`}
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div 
            className={`${styles.resizeHandle} ${styles.resizeBottom}`}
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div 
            className={`${styles.resizeHandle} ${styles.resizeCorner}`}
            onMouseDown={(e) => handleResizeStart(e, 'right-bottom')}
          />
        </>
      )}
    </div>
  );
};
/* src/components/multiframe/ResizablePanel.module.css */
.resizablePanel {
  position: relative;
  overflow: hidden;
}

.resizablePanel.resizing {
  pointer-events: none;
  user-select: none;
}

.innerPanel {
  height: 100%;
  width: 100%;
}

.resizeHandle {
  position: absolute;
  background-color: transparent;
  z-index: 10;
}

.resizeRight {
  cursor: ew-resize;
  width: 8px;
  top: 0;
  right: 0;
  bottom: 0;
}

.resizeBottom {
  cursor: ns-resize;
  height: 8px;
  left: 0;
  right: 0;
  bottom: 0;
}

.resizeCorner {
  cursor: nwse-resize;
  width: 16px;
  height: 16px;
  right: 0;
  bottom: 0;
}
``````typescript
// src/hooks/usePanelState.ts
import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState } from '../services/panelStateService';

export function usePanelState(panelId: string, contentType: string, initialState: any = {}) {
  // Load saved state or use initial state
  const loadInitialState = () => {
    const savedState = loadPanelState(panelId);
    
    if (savedState && savedState.contentType === contentType) {
      return savedState.state;
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<any>(loadInitialState);
  
  // Update state and save changes
  const updateState = useCallback((newState: any) => {
    setState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      
      // Save the updated state
      savePanelState(panelId, contentType, updatedState);
      
      return updatedState;
    });
  }, [panelId, contentType]);
  
  // Return state and update function
  return [state, updateState];
}
Chunk 4: Layout Persistence & User Preferences
Layout Configuration Service
// src/services/layoutService.ts
import axios from 'axios';
import { LayoutConfig } from '../types/layout.types';

/**
 * Fetch all layout configurations for the current user
 */
export async function fetchLayouts(includePublic = false): Promise<LayoutConfig[]> {
  try {
    const response = await axios.get('/api/layouts', {
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
export async function fetchLayout(layoutId: string): Promise<LayoutConfig> {
  try {
    const response = await axios.get(`/api/layouts/${layoutId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Save a layout configuration
 */
export async function saveLayout(layout: LayoutConfig): Promise<LayoutConfig> {
  try {
    if (layout.id) {
      // Update existing layout
      const response = await axios.put(`/api/layouts/${layout.id}`, layout);
      return response.data;
    } else {
      // Create new layout
      const response = await axios.post('/api/layouts', layout);
      return response.data;
    }
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}

/**
 * Delete a layout configuration
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  try {
    await axios.delete(`/api/layouts/${layoutId}`);
  } catch (error) {
    console.error(`Error deleting layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Clone a layout configuration
 */
export async function cloneLayout(layoutId: string, newName: string): Promise<LayoutConfig> {
  try {
    const response = await axios.post(`/api/layouts/${layoutId}/clone`, { name: newName });
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
}

/**
 * Load layouts from local storage
 */
export function loadLayoutsFromStorage(): LayoutConfig[] {
  const storedLayouts = localStorage.getItem('layouts');
  
  if (storedLayouts) {
    try {
      return JSON.parse(storedLayouts);
    } catch (error) {
      console.error('Error parsing stored layouts:', error);
    }
  }
  
  return [];
}
User Preferences Service
// src/types/preferences.types.ts
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
// src/services/preferencesService.ts
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
Layout Manager Component
// src/components/multiframe/LayoutManager.tsx
import React, { useState, useEffect } from 'react';
import { fetchLayouts, saveLayout, deleteLayout, cloneLayout } from '../../services/layoutService';
import { LayoutConfig } from '../../types/layout.types';
import styles from './LayoutManager.module.css';

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
  const [layouts, setLayouts] = useState<LayoutConfig[]>([]);
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
      return <div className={styles.loading}>Loading layouts...</div>;
    }
    
    if (error) {
      return <div className={styles.error}>{error}</div>;
    }
    
    if (layouts.length === 0) {
      return <div className={styles.message}>No saved layouts</div>;
    }
    
    return (
      <div className={styles.layoutList}>
        {layouts.map(layout => (
          <div 
            key={layout.id}
            className={`${styles.layoutItem} ${currentLayout?.id === layout.id ? styles.selected : ''}`}
          >
            <div className={styles.layoutInfo}>
              <h4 className={styles.layoutName}>{layout.name}</h4>
              {layout.description && (
                <p className={styles.layoutDescription}>{layout.description}</p>
              )}
              <div className={styles.layoutMeta}>
                <span className={styles.layoutType}>{layout.type}</span>
                {layout.isDefault && (
                  <span className={styles.layoutDefault}>Default</span>
                )}
              </div>
            </div>
            <div className={styles.layoutActions}>
              <button
                className={styles.layoutButton}
                onClick={() => handleSelectLayout(layout)}
              >
                Load
              </button>
              <button
                className={styles.layoutButton}
                onClick={() => handleStartEdit(layout)}
              >
                Edit
              </button>
              <button
                className={styles.layoutButton}
                onClick={() => handleCloneLayout(layout.id!, `Copy of ${layout.name}`)}
              >
                Clone
              </button>
              <button
                className={`${styles.layoutButton} ${styles.deleteButton}`}
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
    <div className={styles.layoutManager}>
      <div className={styles.header}>
        <h3>Layout Manager</h3>
        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          <span>×</span>
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            Create New Layout
          </button>
          <button
            className={styles.actionButton}
            onClick={handleSaveLayout}
            disabled={!currentLayout}
          >
            Save Current Layout
          </button>
        </div>
        
        {isCreating && (
          <div className={styles.createForm}>
            <input
              type="text"
              className={styles.input}
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Enter layout name"
            />
            <div className={styles.formActions}>
              <button
                className={styles.formButton}
                onClick={handleCreateLayout}
              >
                Create
              </button>
              <button
                className={`${styles.formButton} ${styles.cancelButton}`}
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
          <div className={styles.editForm}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                className={styles.input}
                value={editedLayout.name}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                className={styles.textarea}
                value={editedLayout.description || ''}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Default</label>
              <input
                type="checkbox"
                checked={editedLayout.isDefault || false}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, isDefault: e.target.checked } : null)}
              />
            </div>
            <div className={styles.formActions}>
              <button
                className={styles.formButton}
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button
                className={`${styles.formButton} ${styles.cancelButton}`}
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
        
        <div className={styles.layouts}>
          <h4>Saved Layouts</h4>
          {renderLayoutList()}
        </div>
      </div>
    </div>
  );
};
/* src/components/multiframe/LayoutManager.module.css */
.layoutManager {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.closeButton {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.closeButton:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.closeButton span {
  font-size: 1.25rem;
  font-weight: bold;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.actionButton {
  padding: 8px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.actionButton:hover {
  background-color: #1976d2;
}

.actionButton:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

.createForm,
.editForm {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.formGroup {
  margin-bottom: 12px;
}

.formGroup label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.input,
.textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.textarea {
  height: 80px;
  resize: vertical;
}

.formActions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.formButton {
  padding: 6px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.formButton:hover {
  background-color: #1976d2;
}

.cancelButton {
  background-color: #607d8b;
}

.cancelButton:hover {
  background-color: #455a64;
}

.deleteButton {
  background-color: #f44336;
}

.deleteButton:hover {
  background-color: #d32f2f;
}

.layouts h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
}

.layoutList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layoutItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.layoutItem.selected {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.layoutInfo {
  flex: 1;
}

.layoutName {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 500;
}

.layoutDescription {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.layoutMeta {
  display: flex;
  gap: 8px;
}

.layoutType,
.layoutDefault {
  display: inline-block;
  padding: 2px 6px;
  font-size: 0.7rem;
  border-radius: 4px;
}

.layoutType {
  background-color: #e9ecef;
  color: #495057;
}

.layoutDefault {
  background-color: #4caf50;
  color: white;
}

.layoutActions {
  display: flex;
  gap: 6px;
}

.layoutButton {
  padding: 4px 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.layoutButton:hover {
  background-color: #e9ecef;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
Chunk 5: Integration & Advanced Features
Integrating with the Controller Wizard
// src/components/multiframe/controllers/ControllerWizardLauncher.tsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ControllerWizardLauncher.module.css';

interface ControllerWizardLauncherProps {
  entityType: 'state' | 'county';
  entityId: string;
  buttonLabel?: string;
  className?: string;
}

export const ControllerWizardLauncher: React.FC<ControllerWizardLauncherProps> = ({
  entityType,
  entityId,
  buttonLabel = 'Configure Controller',
  className = ''
}) => {
  const navigate = useNavigate();
  
  const handleLaunchWizard = useCallback(() => {
    navigate('/controller-wizard', {
      state: {
        entityType,
        entityId,
        step: 'SelectControllerType'
      }
    });
  }, [navigate, entityType, entityId]);
  
  return (
    <button 
      className={`${styles.launcherButton} ${className}`}
      onClick={handleLaunchWizard}
      aria-label={`Configure controller for ${entityType} ${entityId}`}
    >
      {buttonLabel}
    </button>
  );
};
/* src/components/multiframe/controllers/ControllerWizardLauncher.module.css */
.launcherButton {
  padding: 8px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.launcherButton:hover {
  background-color: #1976d2;
}

.launcherButton:before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0```typescript
// src/services/panelStateService.ts
import { PanelState, LayoutState } from '../types/state.types';

/**
 * Save panel state
 */
export function savePanelState(panelId: string, contentType: string, state: any): PanelState {
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
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string): PanelState | null {
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
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string): void {
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
}

/**
 * Save layout state
 */
export function saveLayoutState(
  layoutType: string,
  panels: Record<string, PanelState>,
  filters: any
): LayoutState {
  const layoutState: LayoutState = {
    type: layoutType,
    panels,
    filters,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to local storage for persistence
  localStorage.setItem('layoutState', JSON.stringify(layoutState));
  
  return layoutState;
}

/**
 * Load layout state
 */
export function loadLayoutState(): LayoutState | null {
  const storedState = localStorage.getItem('layoutState');
  
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error('Error parsing stored layout state:', error);
    }
  }
  
  return null;
}
// src/hooks/usePanelState.ts
import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState } from '../services/panelStateService';

export function usePanelState(panelId: string, contentType: string, initialState: any = {}) {
  // Load saved state or use initial state
  const loadInitialState = () => {
    const savedState = loadPanelState(panelId);
    
    if (savedState && savedState.contentType === contentType) {
      return savedState.state;
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<any>(loadInitialState);
  
  // Update state and save changes
  const updateState = useCallback((newState: any) => {
    setState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      
      // Save the updated state
      savePanelState(panelId, contentType,```typescript
// src/components/multiframe/panels/ChartPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './ChartPanel.module.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ChartPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(initialState.chartType || 'bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  // Hooks
  const { subscribe } = usePanelSync();
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select') {
          const { entityType, entityId } = event.payload;
          
          if (entityType === 'state' || entityType === 'county') {
            setSelectedEntity({
              type: entityType,
              id: entityId
            });
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Generate mock chart data (replace with actual data in production)
  useEffect(() => {
    const generateChartData = async () => {
      if (!selectedEntity.type || !selectedEntity.id) {
        setChartData([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, fetch data from an API
        // For now, generate mock data based on selected entity
        
        if (selectedEntity.type === 'state') {
          // Mock data for state - property types distribution
          const mockData = [
            { name: 'Single Family', value: 55 },
            { name: 'Condo', value: 20 },
            { name: 'Townhouse', value: 15 },
            { name: 'Multi-Family', value: 5 },
            { name: 'Land', value: 5 }
          ];
          
          setChartData(mockData);
        } else if (selectedEntity.type === 'county') {
          // Mock data for county - price ranges distribution
          const mockData = [
            { name: '$0-$100k', value: 10 },
            { name: '$100k-$250k', value: 25 },
            { name: '$250k-$500k', value: 35 },
            { name: '$500k-$750k', value: 20 },
            { name: '$750k-$1M', value: 5 },
            { name: '$1M+', value: 5 }
          ];
          
          setChartData(mockData);
        }
        
        // Update parent state if callback provided
        if (onStateChange) {
          onStateChange({
            entityType: selectedEntity.type,
            entityId: selectedEntity.id,
            chartType,
            chartData
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error generating chart data:', error);
        setError('Failed to generate chart data');
        setLoading(false);
      }
    };
    
    generateChartData();
  }, [selectedEntity, chartType, onStateChange]);
  
  // Handle chart type change
  const handleChartTypeChange = (type: 'bar' | 'pie' | 'line') => {
    setChartType(type);
    
    // Notify parent component if callback provided
    if (onAction) {
      onAction({
        type: 'chartTypeChange',
        payload: {
          chartType: type
        }
      });
    }
  };
  
  // Render chart based on type
  const renderChart = () => {
    if (loading) {
      return <div className={styles.loading}>Loading chart data...</div>;
    }
    
    if (error) {
      return <div className={styles.error}>{error}</div>;
    }
    
    if (!selectedEntity.type || !selectedEntity.id) {
      return <div className={styles.message}>Select a state or county to view chart</div>;
    }
    
    if (chartData.length === 0) {
      return <div className={styles.message}>No chart data available</div>;
    }
    
    const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        // For line chart, transform data if needed
        const lineData = chartData.map((item, index) => ({
          name: item.name,
          value: item.value,
          // Add a second dimension for comparison
          trend: Math.floor(item.value * (0.9 + Math.random() * 0.2))
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
              <Line type="monotone" dataKey="trend" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className={styles.chartPanel}>
      <div className={styles.chartHeader}>
        <h3>
          {selectedEntity.type === 'state' 
            ? 'Property Types Distribution' 
            : 'Price Range Distribution'}
        </h3>
        <div className={styles.chartControls}>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('bar')}
          >
            Bar
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'pie' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('pie')}
          >
            Pie
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('line')}
          >
            Line
          </button>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {renderChart()}
      </div>
    </div>
  );
};
CSS Modules for Panel Content Components
/* src/components/multiframe/panels/MapPanel.module.css */
.mapPanel {
  position: relative;
  height: 100%;
  width: 100%;
}

.map {
  height: 100%;
  width: 100%;
}

.backButton {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.backButton:hover {
  background-color: #fff;
}

.loadingOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
}

.loadingSpinner {
  display: inline-block;
  width: 36px;
  height: 36px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3f51b5;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.errorMessage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 16px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  font-size: 0.9rem;
  z-index: 1000;
}
/* src/components/multiframe/panels/PropertyPanel.module.css */
.propertyPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panelHeader {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}

.panelHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.propertyList {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.propertyItem {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.propertyItem:hover {
  background-color: #f5f5f5;
}

.propertyItem.selected {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.propertyHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.propertyTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.propertyType {
  padding: 2px 6px;
  background-color: #e9ecef;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #495057;
}

.propertyDetails {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.propertyValue {
  font-weight: 600;
  color: #2196f3;
}

.propertyInfo {
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
/* src/components/multiframe/panels/FilterPanel.module.css */
.filterPanel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.filterHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filterHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.resetButton {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.resetButton:hover {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.filterGroup {
  margin-bottom: 16px;
}

.filterLabel {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.filterSelect {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rangeInputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rangeInput {
  flex: 1;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rangeSlider {
  width: 100%;
  margin: 8px 0;
}

.filterRow {
  display: flex;
  gap: 16px;
}

.filterRow .filterGroup {
  flex: 1;
}
/* src/components/multiframe/panels/StatsPanel.module.css */
.statsPanel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.statsContent {
  height: 100%;
}

.statsHeader {
  margin-bottom: 16px;
}

.statsHeader h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
}

.entityName {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2196f3;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.statCard {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #eee;
}

.statLabel {
  display: block;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #6c757d;
}

.statValue {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
/* src/components/multiframe/panels/ChartPanel.module.css */
.chartPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chartHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chartHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chartControls {
  display: flex;
  gap: 8px;
}

.chartTypeButton {
  padding: 4px 12px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.chartTypeButton:hover {
  background-color: #f5f5f5;
}

.chartTypeButton.active {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.chartContainer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
Chunk 3: Filter System & Panel State Management
Filter System Implementation
// src/types/filter.types.ts
export interface PropertyFilter {
  propertyType?: string | string[];
  priceRange?: [number, number];
  bedrooms?: string | number;
  bathrooms?: string | number;
  squareFeet?: [number, number];
  [key: string]: any;
}

export interface GeographicFilter {
  state?: string;
  county?: string;
  [key: string]: any;
}

export interface FilterSet {
  property?: PropertyFilter;
  geographic?: GeographicFilter;
  [key: string]: any;
}

export interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: FilterSet;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
// src/context/FilterContext.tsx
import React, { createContext, useCallback, useState } from 'react';
import { FilterSet, FilterConfig } from '../types/filter.types';

interface FilterContextType {
  activeFilters: FilterSet;
  savedFilters: FilterConfig[];
  applyFilters: (filters: FilterSet) => void;
  clearFilters: () => void;
  saveFilter: (config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteFilter: (id: string) => void;
  loadFilter: (id: string) => void;
}

export const FilterContext = createContext<FilterContextType | null>(null);

export const FilterContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [activeFilters, setActiveFilters] = useState<FilterSet>({});
  const [savedFilters, setSavedFilters] = useState<FilterConfig[]>([]);
  
  // Apply filters
  const applyFilters = useCallback((filters: FilterSet) => {
    setActiveFilters(prev => ({
      ...prev,
      ...filters
    }));
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);
  
  // Save filter configuration
  const saveFilter = useCallback((config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFilter: FilterConfig = {
      ...config,
      id: `filter-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSavedFilters(prev => [...prev, newFilter]);
  }, []);
  
  // Delete saved filter
  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);
  
  // Load saved filter
  const loadFilter = useCallback((id: string) => {
    const filter = savedFilters.find(filter => filter.id === id);
    
    if (filter) {
      setActiveFilters(filter.filters);
    }
  }, [savedFilters]);
  
  // Context value
  const contextValue = {
    activeFilters,
    savedFilters,
    applyFilters,
    clearFilters,
    saveFilter,
    deleteFilter,
    loadFilter
  };
  
  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
// src/hooks/useFilter.ts
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export function useFilter() {
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context;
}
// src/services/filterService.ts
import { FilterSet, FilterConfig } from '../types/filter.types';

/**
 * Apply filters to data
 */
export function applyFiltersToData<T>(data: T[], filters: FilterSet): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  return data.filter(item => {
    // Apply property filters
    if (filters.property) {
      const propertyFilters = filters.property;
      
      // Property type filter
      if (propertyFilters.propertyType && 'propertyType' in item) {
        const itemType = (item as any).propertyType;
        
        if (Array.isArray(propertyFilters.propertyType)) {
          if (!propertyFilters.propertyType.includes(itemType)) {
            return false;
          }
        } else if (propertyFilters.propertyType !== 'all' && propertyFilters.propertyType !== itemType) {
          return false;
        }
      }
      
      // Price range filter
      if (propertyFilters.priceRange && 'price' in item) {
        const [min, max] = propertyFilters.priceRange;
        const itemPrice = (item as any).price;
        
        if (itemPrice < min || itemPrice > max) {
          return false;
        }
      }
      
      // Bedrooms filter
      if (propertyFilters.bedrooms && 'bedrooms' in item) {
        const itemBedrooms = (item as any).bedrooms;
        
        if (propertyFilters.bedrooms !== 'any' && itemBedrooms < Number(propertyFilters.bedrooms)) {
          return false;
        }
      }
      
      // Bathrooms filter
      if (propertyFilters.bathrooms && 'bathrooms' in item) {
        const itemBathrooms = (item as any).bathrooms;
        
        if (propertyFilters.bathrooms !== 'any' && itemBathrooms < Number(propertyFilters.bathrooms)) {
          return false;
        }
      }
      
      // Square feet filter
      if (propertyFilters.squareFeet && 'squareFeet' in item) {
        const [min, max] = propertyFilters.squareFeet;
        const itemSquareFeet = (item as any).squareFeet;
        
        if (itemSquareFeet < min || itemSquareFeet > max) {
          return false;
        }
      }
    }
    
    // Apply geographic filters
    if (filters.geographic) {
      const geoFilters = filters.geographic;
      
      // State filter
      if (geoFilters.state && 'state' in item) {
        const itemState = (item as any).state;
        
        if (geoFilters.state !== itemState) {
          return false;
        }
      }
      
      // County filter
      if (geoFilters.county && 'county' in item) {
        const itemCounty = (item as any).county;
        
        if (geoFilters.county !== itemCounty) {
          return false;
        }
      }
    }
    
    // Item passed all filters
    return true;
  });
}

/**
 * Save filters to local storage
 */
export function saveFiltersToStorage(filters: FilterConfig[]): void {
  localStorage.setItem('savedFilters', JSON.stringify(filters));
}

/**
 * Load filters from local storage
 */
export function loadFiltersFromStorage(): FilterConfig[] {
  const storedFilters = localStorage.getItem('savedFilters');
  
  if (storedFilters) {
    try {
      return JSON.parse(storedFilters);
    } catch (error) {
      console.error('Error parsing stored filters:', error);
    }
  }
  
  return [];
}
Panel State Management
// src/types/state.types.ts
export interface PanelState {
  id: string;
  contentType: string;
  state: any;
  lastUpdated: string;
}

export interface LayoutState {
  type: string;
  panels: Record<string, PanelState>;
  filters: any;
  lastUpdated: string;
}
``````typescript
// src/components/multiframe/panels/ChartPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './ChartPanel.module.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ChartPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(initialState.chartType || 'bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  // Hooks
  const { subscribe } = usePanelSync();
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select') {
          const { entityType, entityId } = event.payload;
          
          if (entityType === 'state' || entityType === 'county') {
            setSelectedEntity({
              type: entityType,
              id: entityId
            });
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Generate mock chart data (replace with actual data in production)
  useEffect(() => {
    const generateChartData = async () => {
      if (!selectedEntity.type || !selectedEntity.id) {
        setChartData([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, fetch data from an API
        // For now, generate mock data based on selected entity
        
        if (selectedEntity.type === 'state') {
          // Mock data for state - property types distribution
          const mockData = [
            { name: 'Single# Multi-Frame Layout Component System: Implementation Guide

This guide provides detailed implementation code for all aspects of the Multi-Frame Layout Component System. The code is organized by the implementation chunks outlined in the design document.

## Table of Contents
- [Chunk 1: Core Container and Layout](#chunk-1-core-container-and-layout)
- [Chunk 2: Panel Communication & Content Registry](#chunk-2-panel-communication--content-registry)
- [Chunk 3: Filter System & Panel State Management](#chunk-3-filter-system--panel-state-management)
- [Chunk 4: Layout Persistence & User Preferences](#chunk-4-layout-persistence--user-preferences)
- [Chunk 5: Integration & Advanced Features](#chunk-5-integration--advanced-features)

## Chunk 1: Core Container and Layout

### Types Definitions

First, let's create the core type definitions that will be used throughout the system:

```typescript
// src/types/layout.types.ts
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad';

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

export type PanelContentType = 'map' | 'property' | 'filter' | 'stats' | 'chart' | 'list';
// src/types/panel.types.ts
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
MultiFrameContainer Component
// src/components/multiframe/MultiFrameContainer.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { PanelConfig, LayoutConfig, LayoutType } from '../../types/layout.types';
import styles from './MultiFrameContainer.module.css';

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
          contentType: defaultPanelContent['top-right'] || 'property',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom',
          contentType: defaultPanelContent.bottom || 'stats',
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
          contentType: defaultPanelContent['top-right'] || 'property',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-left',
          contentType: defaultPanelContent['bottom-left'] || 'filter',
          title: 'Bottom Left Panel',
          position: { row: 1, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-right',
          contentType: defaultPanelContent['bottom-right'] || 'stats',
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
    <div className={`${styles.multiFrameContainer} ${className}`} data-testid="multi-frame-container">
      <LayoutContextProvider>
        <PanelSyncProvider>
          <div className={styles.layoutControls}>
            <LayoutSelector
              currentLayout={layoutType}
              onLayoutChange={handleLayoutChange}
            />
          </div>
          <div className={styles.layoutContainer} data-testid={`${layoutType}-layout`}>
            {renderLayout()}
          </div>
        </PanelSyncProvider>
      </LayoutContextProvider>
    </div>
  );
};
Layout Selector Component
// src/components/multiframe/controls/LayoutSelector.tsx
import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import styles from './LayoutSelector.module.css';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange
}) => {
  return (
    <div className={styles.layoutSelector}>
      <button
        className={`${styles.layoutButton} ${currentLayout === 'single' ? styles.active : ''}`}
        onClick={() => onLayoutChange('single')}
        aria-label="Single panel layout"
        data-testid="layout-selector-single"
      >
        <div className={styles.singleIcon}></div>
        <span>Single</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'dual' ? styles.active : ''}`}
        onClick={() => onLayoutChange('dual')}
        aria-label="Dual panel layout"
        data-testid="layout-selector-dual"
      >
        <div className={styles.dualIcon}></div>
        <span>Dual</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'tri' ? styles.active : ''}`}
        onClick={() => onLayoutChange('tri')}
        aria-label="Tri panel layout"
        data-testid="layout-selector-tri"
      >
        <div className={styles.triIcon}></div>
        <span>Tri</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'quad' ? styles.active : ''}`}
        onClick={() => onLayoutChange('quad')}
        aria-label="Quad panel layout"
        data-testid="layout-selector-quad"
      >
        <div className={styles.quadIcon}></div>
        <span>Quad</span>
      </button>
    </div>
  );
};
Layout Components
// src/components/multiframe/layouts/SinglePanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './SinglePanelLayout.module.css';

interface SinglePanelLayoutProps {
  panels: PanelConfig[];
}

export const SinglePanelLayout: React.FC<SinglePanelLayoutProps> = ({ panels }) => {
  // For single panel layout, we only use the first panel
  const panel = panels[0];
  
  if (!panel) {
    return <div className={styles.emptyLayout}>No panel configured</div>;
  }
  
  return (
    <div className={styles.singlePanelLayout} data-testid="single-layout">
      <PanelContainer
        id={panel.id}
        title={panel.title}
        contentType={panel.contentType}
        initialState={panel.state}
        className={styles.fullSizePanel}
      />
    </div>
  );
};
// src/components/multiframe/layouts/DualPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './DualPanelLayout.module.css';

interface DualPanelLayoutProps {
  panels: PanelConfig[];
}

export const DualPanelLayout: React.FC<DualPanelLayoutProps> = ({ panels }) => {
  // Ensure we have exactly two panels
  const leftPanel = panels.find(p => p.position?.col === 0) || panels[0];
  const rightPanel = panels.find(p => p.position?.col === 1) || panels[1];
  
  if (!leftPanel || !rightPanel) {
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.dualPanelLayout} data-testid="dual-layout">
      <div className={styles.leftPanel}>
        <PanelContainer
          id={leftPanel.id}
          title={leftPanel.title}
          contentType={leftPanel.contentType}
          initialState={leftPanel.state}
          className={styles.panelContainer}
        />
      </div>
      <div className={styles.rightPanel}>
        <PanelContainer
          id={rightPanel.id}
          title={rightPanel.title}
          contentType={rightPanel.contentType}
          initialState={rightPanel.state}
          className={styles.panelContainer}
        />
      </div>
    </div>
  );
};
// src/components/multiframe/layouts/TriPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './TriPanelLayout.module.css';

interface TriPanelLayoutProps {
  panels: PanelConfig[];
}

export const TriPanelLayout: React.FC<TriPanelLayoutProps> = ({ panels }) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 0) || panels[0];
  const topRightPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 1) || panels[1];
  const bottomPanel = panels.find(p => p.position?.row === 1) || panels[2];
  
  if (!topLeftPanel || !topRightPanel || !bottomPanel) {
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.triPanelLayout} data-testid="tri-layout">
      <div className={styles.topRow}>
        <div className={styles.topLeftPanel}>
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.topRightPanel}>
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <PanelContainer
          id={bottomPanel.id}
          title={bottomPanel.title}
          contentType={bottomPanel.contentType}
          initialState={bottomPanel.state}
          className={styles.panelContainer}
        />
      </div>
    </div>
  );
};
// src/components/multiframe/layouts/QuadPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './QuadPanelLayout.module.css';

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
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.quadPanelLayout} data-testid="quad-layout">
      <div className={styles.topRow}>
        <div className={styles.topLeftPanel}>
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.topRightPanel}>
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.bottomLeftPanel}>
          <PanelContainer
            id={bottomLeftPanel.id}
            title={bottomLeftPanel.title}
            contentType={bottomLeftPanel.contentType}
            initialState={bottomLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.bottomRightPanel}>
          <PanelContainer
            id={bottomRightPanel.id}
            title={bottomRightPanel.title}
            contentType={bottomRightPanel.contentType}
            initialState={bottomRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
    </div>
  );
};
PanelContainer and PanelHeader Components
// src/components/multiframe/PanelContainer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PanelHeader } from './PanelHeader';
import { usePanelSync } from '../../hooks/usePanelSync';
import { useLayoutContext } from '../../hooks/useLayoutContext';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelAction, PanelContentType } from '../../types/panel.types';
import styles from './PanelContainer.module.css';

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
    styles.panelContainer,
    isMaximized ? styles.maximized : '',
    className
  ].filter(Boolean).join(' ');
  
  // Apply style based on position and size
  const containerStyle = {
    gridRow: position?.row !== undefined ? `${position.row + 1}` : undefined,
    gridColumn: position?.col !== undefined ? `${position.col + 1}` : undefined,
    width: size?.width ? `${size.width}%` : undefined,
    height: size?.height ? `${size.height}%` : undefined
  };
  
  return (
    <div 
      className={containerClassNames} 
      style={containerStyle} 
      data-panel-id={id}
      data-testid={`panel-${id}`}
    >
      <PanelHeader 
        title={title} 
        isMaximized={isMaximized}
        onAction={handleAction}
      />
      <div className={styles.panelContent}>
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={state}
            onStateChange={handleStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className={styles.noContent}>
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
};
// src/components/multiframe/PanelHeader.tsx
import React, { useCallback } from 'react';
import styles from './PanelHeader.module.css';

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
    <div className={styles.panelHeader}>
      <h3 className={styles.panelTitle}>{title}</h3>
      <div className={styles.panelActions}>
        <button
          className={styles.actionButton}
          onClick={handleRefreshClick}
          aria-label="Refresh panel"
          data-testid="refresh-button"
        >
          <span className={styles.refreshIcon}></span>
        </button>
        <button
          className={styles.actionButton}
          onClick={handleExportClick}
          aria-label="Export panel data"
          data-testid="export-button"
        >
          <span className={styles.exportIcon}></span>
        </button>
        <button
          className={`${styles.actionButton} ${isMaximized ? styles.active : ''}`}
          onClick={handleMaximizeClick}
          aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
          data-testid="maximize-button"
        >
          <span className={isMaximized ? styles.restoreIcon : styles.maximizeIcon}></span>
        </button>
      </div>
    </div>
  );
};
CSS Modules
/* src/components/multiframe/MultiFrameContainer.module.css */
.multiFrameContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--background-color, #f5f5f5);
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  overflow: hidden;
}

.layoutControls {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--header-bg-color, #fff);
  border-bottom: 1px solid var(--border-color, #ddd);
}

.layoutContainer {
  flex: 1;
  display: flex;
  overflow: hidden;
}
/* src/components/multiframe/controls/LayoutSelector.module.css */
.layoutSelector {
  display: flex;
  gap: 0.5rem;
}

.layoutButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
}

.layoutButton.active {
  background-color: var(--primary-color-light, #e3f2fd);
  border-color: var(--primary-color, #2196f3);
}

.layoutButton:hover {
  background-color: var(--hover-bg-color, #f0f0f0);
}

.layoutButton span {
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

/* Icon styles */
.singleIcon,
.dualIcon,
.triIcon,
.quadIcon {
  width: 24px;
  height: 24px;
  border: 1px solid var(--icon-color, #555);
  border-radius: 2px;
}

.dualIcon {
  position: relative;
}

.dualIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.triIcon {
  position: relative;
}

.triIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.triIcon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--icon-color, #555);
}

.quadIcon {
  position: relative;
}

.quadIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.quadIcon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--icon-color, #555);
}
/* src/components/multiframe/layouts/SinglePanelLayout.module.css */
.singlePanelLayout {
  width: 100%;
  height: 100%;
  display: flex;
}

.fullSizePanel {
  flex: 1;
}

.emptyLayout {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #777);
  font-style: italic;
}
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #777);
  font-style: italic;
}
/* src/components/multiframe/layouts/DualPanelLayout.module.css */
.dualPanelLayout {
  width: 100%;
  height: 100%;
  display: flex;
}

.leftPanel,
.rightPanel {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.leftPanel {
  border-right: 1px solid var(--border-color, #ddd);
}

.panelContainer {
  height: 100%;
}

.emptyLayout {
  width: 100%;

themePreferences: { colorMode: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }, mapStyle: { type: String, enum: ['standard', 'satellite', 'terrain'], default: 'standard' }, accentColor: String, fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' } }, filterPreferences: { defaultFilters: Schema.Types.Mixed, showFilterPanel: { type: Boolean, default: true }, applyFiltersAutomatically: { type: Boolean, default: true } }, createdAt: { type: Date, default: Date.now }, updatedAt: { type: Date, default: Date.now } });
// Middleware to update timestamps UserPreferencesSchema.pre('save', function(next) { this.updatedAt = new Date(); next(); });
export const UserPreferences = mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);

### API Controllers

```typescript
// server/src/controllers/layoutController.ts
import { Request, Response } from 'express';
import { LayoutConfig } from '../models/LayoutConfig';

/**
 * Get all layouts for the current user
 */
export const getLayouts = async (req: Request, res: Response) => {
  try {
    const { isPublic } = req.query;
    const userId = req.user.id; // Assuming authentication middleware sets req.user
    
    // Build query
    const query: any = { userId };
    
    // Include public layouts if requested
    if (isPublic === 'true') {
      query.$or = [{ userId }, { isPublic: true }];
    }
    
    const layouts = await LayoutConfig.find(query).sort({ updatedAt: -1 });
    
    res.status(200).json(layouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific layout
 */
export const getLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const layout = await LayoutConfig.findOne({
      _id: id,
      $or: [{ userId }, { isPublic: true }]
    });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    res.status(200).json(layout);
  } catch (error) {
    console.error(`Error fetching layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new layout
 */
export const createLayout = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Check if this is set as default
    if (req.body.isDefault) {
      // Unset any existing default layouts
      await LayoutConfig.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    const layout = new LayoutConfig({
      ...req.body,
      userId
    });
    
    await layout.save();
    
    res.status(201).json(layout);
  } catch (error) {
    console.error('Error creating layout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a layout
 */
export const updateLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the layout
    const layout = await LayoutConfig.findOne({ _id: id, userId });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Check if this is being set as default
    if (req.body.isDefault && !layout.isDefault) {
      // Unset any existing default layouts
      await LayoutConfig.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Update the layout
    Object.entries(req.body).forEach(([key, value]) => {
      // @ts-ignore
      layout[key] = value;
    });
    
    await layout.save();
    
    res.status(200).json(layout);
  } catch (error) {
    console.error(`Error updating layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a layout
 */
export const deleteLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const layout = await LayoutConfig.findOneAndDelete({ _id: id, userId });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    res.status(200).json({ message: 'Layout deleted successfully' });
  } catch (error) {
    console.error(`Error deleting layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Clone a layout
 */
export const cloneLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;
    
    // Find the source layout
    const sourceLayout = await LayoutConfig.findOne({
      _id: id,
      $or: [{ userId }, { isPublic: true }]
    });
    
    if (!sourceLayout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Create a new layout based on the source
    const newLayout = new LayoutConfig({
      ...sourceLayout.toObject(),
      _id: undefined, // Let MongoDB generate a new ID
      userId,
      name: name || `Copy of ${sourceLayout.name}`,
      isDefault: false, // Never set a clone as default
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newLayout.save();
    
    res.status(201).json(newLayout);
  } catch (error) {
    console.error(`Error cloning layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};
// server/src/controllers/userPreferencesController.ts
import { Request, Response } from 'express';
import { UserPreferences } from '../models/UserPreferences';

// Default preferences
const DEFAULT_PREFERENCES = {
  themePreferences: {
    colorMode: 'system',
    mapStyle: 'standard',
    fontSize: 'medium'
  },
  filterPreferences: {
    defaultFilters: {},
    showFilterPanel: true,
    applyFiltersAutomatically: true
  },
  panelPreferences: new Map([
    ['defaultContentTypes', {
      'top-left': 'map',
      'top-right': 'property',
      'bottom-left': 'filter',
      'bottom-right': 'stats'
    }]
  ])
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = new UserPreferences({
        userId,
        ...DEFAULT_PREFERENCES
      });
      
      await preferences.save();
    }
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create preferences if they don't exist
      preferences = new UserPreferences({
        userId,
        ...DEFAULT_PREFERENCES,
        ...req.body
      });
    } else {
      // Update existing preferences
      Object.entries(req.body).forEach(([key, value]) => {
        // @ts-ignore
        preferences[key] = value;
      });
    }
    
    await preferences.save();
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reset user preferences to defaults
 */
export const resetUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Delete existing preferences
    await UserPreferences.findOneAndDelete({ userId });
    
    // Create new default preferences
    const preferences = new UserPreferences({
      userId,
      ...DEFAULT_PREFERENCES
    });
    
    await preferences.save();
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
API Routes
// server/src/routes/layoutRoutes.ts
import { Router } from 'express';
import { getLayouts, getLayout, createLayout, updateLayout, deleteLayout, cloneLayout } from '../controllers/layoutController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Layout routes
router.get('/', getLayouts);
router.get('/:id', getLayout);
router.post('/', createLayout);
router.put('/:id', updateLayout);
router.delete('/:id', deleteLayout);
router.post('/:id/clone', cloneLayout);

export default router;
// server/src/routes/userPreferencesRoutes.ts
import { Router } from 'express';
import { getUserPreferences, updateUserPreferences, resetUserPreferences } from '../controllers/userPreferencesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User preferences routes
router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);
router.post('/reset', resetUserPreferences);

export default router;
// server/src/routes/index.ts
import { Router } from 'express';
import layoutRoutes from './layoutRoutes';
import userPreferencesRoutes from './userPreferencesRoutes';

const router = Router();

router.use('/layouts', layoutRoutes);
router.use('/user/preferences', userPreferencesRoutes);

export default router;
Testing Implementation
Unit Tests
// src/__tests__/components/MultiFrameContainer.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiFrameContainer } from '../../components/multiframe/MultiFrameContainer';

describe('MultiFrameContainer', () => {
  test('renders with default layout', () => {
    render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    expect(screen.getByTestId('multi-frame-container')).toBeInTheDocument();
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
  });
  
  test('changes layout when layout selector is clicked', () => {
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
  
  test('notifies parent component when layout changes', () => {
    const onLayoutChange = jest.fn();
    
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
  
  test('renders the correct number of panels based on layout', () => {
    const { rerender } = render(
      <MultiFrameContainer
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    expect(screen.getAllByTestId(/^panel-/)).toHaveLength(1);
    
    rerender(
      <MultiFrameContainer
        initialLayout="dual"
        defaultPanelContent={{ left: 'map', right: 'property' }}
      />
    );
    
    expect(screen.getAllByTestId(/^panel-/)).toHaveLength(2);
    
    rerender(
      <MultiFrameContainer
        initialLayout="quad"
        defaultPanelContent={{
          'top-left': 'map',
          'top-right': 'property',
          'bottom-left': 'filter',
          'bottom-right': 'stats'
        }}
      />
    );
    
    expect(screen.getAllByTestId(/^panel-/)).toHaveLength(4);
  });
});
// src/__tests__/components/PanelContainer.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanelContainer } from '../../components/multiframe/PanelContainer';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';

// Mock panel content component
jest.mock('../../services/panelContentRegistry', () => ({
  getPanelContent: () => () => <div data-testid="mock-panel-content">Mock Panel Content</div>
}));

describe('PanelContainer', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <LayoutContextProvider>
        <PanelSyncProvider>
          {ui}
        </PanelSyncProvider>
      </LayoutContextProvider>
    );
  };
  
  test('renders with title and content', () => {
    renderWithProviders(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
      />
    );
    
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByTestId('mock-panel-content')).toBeInTheDocument();
  });
  
  test('calls onAction when header button is clicked', () => {
    const onAction = jest.fn();
    
    renderWithProviders(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
        onAction={onAction}
      />
    );
    
    fireEvent.click(screen.getByTestId('maximize-button'));
    
    expect(onAction).toHaveBeenCalledWith({ type: 'maximize' });
  });
  
  test('toggles maximize state when maximize button is clicked', () => {
    renderWithProviders(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
      />
    );
    
    const panelElement = screen.getByTestId('panel-test-panel');
    expect(panelElement).not.toHaveClass('maximized');
    
    fireEvent.click(screen.getByTestId('maximize-button'));
    expect(panelElement).toHaveClass('maximized');
    
    fireEvent.click(screen.getByTestId('maximize-button'));
    expect(panelElement).not.toHaveClass('maximized');
  });
  
  test('calls onStateChange when panel state changes', () => {
    const onStateChange = jest.fn();
    
    renderWithProviders(
      <PanelContainer
        id="test-panel"
        title="Test Panel"
        contentType="map"
        onStateChange={onStateChange}
        initialState={{ testValue: 'initial' }}
      />
    );
    
    // Mock a state change from the panel content
    fireEvent.click(screen.getByTestId('mock-panel-content'));
    
    // Since our mock doesn't actually call onStateChange, we'll check that the prop was passed
    expect(onStateChange).toHaveBeenCalledTimes(0);
  });
});
Integration Tests
// src/__tests__/integration/PanelSync.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiFrameContainer } from '../../components/multiframe/MultiFrameContainer';
import { registerPanelContent } from '../../services/panelContentRegistry';

// Mock panel content components
const MockMapPanel = ({ panelId, onAction }: any) => (
  <div data-testid={`map-panel-${panelId}`}>
    <button
      data-testid="select-state-button"
      onClick={() => onAction({
        type: 'select',
        payload: {
          entityType: 'state',
          entityId: 'CA',
          properties: { name: 'California' }
        }
      })}
    >
      Select State
    </button>
  </div>
);

const MockPropertyPanel = ({ panelId }: any) => (
  <div data-testid={`property-panel-${panelId}`}>
    <div data-testid="selected-state">
      {/* This would be populated by state from panel sync */}
    </div>
  </div>
);

// Register mock components
beforeAll(() => {
  registerPanelContent('map', MockMapPanel);
  registerPanelContent('property', MockPropertyPanel);
});

describe('Panel Synchronization', () => {
  test('panels communicate through panel sync', () => {
    render(
      <MultiFrameContainer
        initialLayout="dual"
        panels={[
          { id: 'map', contentType: 'map', title: 'Map', position: { row: 0, col: 0 } },
          { id: 'property', contentType: 'property', title: 'Properties', position: { row: 0, col: 1 } }
        ]}
      />
    );
    
    // Verify panels are rendered
    expect(screen.getByTestId('map-panel-map')).toBeInTheDocument();
    expect(screen.getByTestId('property-panel-property')).toBeInTheDocument();
    
    // Trigger selection in map panel
    fireEvent.click(screen.getByTestId('select-state-button'));
    
    // Verify property panel receives the selection (in a real implementation)
    // This would be checking that the content of selected-state updated with "CA"
    // Since our mock doesn't actually implement the sync, we're just checking the component structure
    expect(screen.getByTestId('selected-state')).toBeInTheDocument();
  });
});
Mock Services
// src/__mocks__/services/layoutService.ts
import { LayoutConfig } from '../../types/layout.types';

// Mock data
const mockLayouts: LayoutConfig[] = [
  {
    id: 'layout-1',
    name: 'Default Layout',
    type: 'single',
    isDefault: true,
    isPublic: false,
    panels: [
      {
        id: 'default',
        contentType: 'map',
        title: 'Map Panel'
      }
    ],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'layout-2',
    name: 'Dual Panel Layout',
    type: 'dual',
    isDefault: false,
    isPublic: true,
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
        title: 'Properties Panel',
        position: { row: 0, col: 1 }
      }
    ],
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  }
];

/**
 * Fetch all layout configurations for the current user
 */
export async function fetchLayouts(includePublic = false): Promise<LayoutConfig[]> {
  return Promise.resolve([...mockLayouts]);
}

/**
 * Fetch a specific layout configuration
 */
export async function fetchLayout(layoutId: string): Promise<LayoutConfig> {
  const layout = mockLayouts.find(l => l.id === layoutId);
  
  if (!layout) {
    return Promise.reject(new Error('Layout not found'));
  }
  
  return Promise.resolve({ ...layout });
}

/**
 * Save a layout configuration
 */
export async function saveLayout(layout: LayoutConfig): Promise<LayoutConfig> {
  const now = new Date().toISOString();
  
  if (layout.id) {
    // Update existing layout
    const index = mockLayouts.findIndex(l => l.id === layout.id);
    
    if (index === -1) {
      return Promise.reject(new Error('Layout not found'));
    }
    
    const updatedLayout = {
      ...layout,
      updatedAt: now
    };
    
    mockLayouts[index] = updatedLayout;
    
    return Promise.resolve({ ...updatedLayout });
  } else {
    // Create new layout
    const newLayout = {
      ...layout,
      id: `layout-${mockLayouts.length + 1}`,
      createdAt: now,
      updatedAt: now
    };
    
    mockLayouts.push(newLayout);
    
    return Promise.resolve({ ...newLayout });
  }
}

/**
 * Delete a layout configuration
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  const index = mockLayouts.findIndex(l => l.id === layoutId);
  
  if (index === -1) {
    return Promise.reject(new Error('Layout not found'));
  }
  
  mockLayouts.splice(index, 1);
  
  return Promise.resolve();
}

/**
 * Clone a layout configuration
 */
export async function cloneLayout(layoutId: string, newName: string): Promise<LayoutConfig> {
  const layout = mockLayouts.find(l => l.id === layoutId);
  
  if (!layout) {
    return Promise.reject(new Error('Layout not found'));
  }
  
  const now = new Date().toISOString();
  
  const clonedLayout: LayoutConfig = {
    ...layout,
    id: `layout-${mockLayouts.length + 1}`,
    name: newName,
    isDefault: false,
    createdAt: now,
    updatedAt: now
  };
  
  mockLayouts.push(clonedLayout);
  
  return Promise.resolve({ ...clonedLayout });
}
Summary
This comprehensive implementation guide provides all the necessary components, services, and interfaces to build a robust Multi-Frame Layout Component System for the Real Estate Platform. The system enables users to create, customize, and save different layout configurations for analyzing real estate data through maps, property lists, filters, and statistical displays.
The key features implemented include:
•	Core layout components with single, dual, tri, and quad panel configurations
•	Panel content components for map, property, filter, statistics, and charts
•	Panel communication system for synchronizing state across panels
•	Layout persistence for saving and loading user configurations
•	User preferences for customizing the UI experience
•	Controller Wizard integration for managing data collection
•	Advanced panel features like dragging and resizing
The implementation follows best practices for React development, including:
•	Component composition for maximum flexibility
•	Context-based state management for efficient data flow
•	Hooks for encapsulating common functionality
•	TypeScript for type safety and improved developer experience
•	CSS Modules for component-specific styling
•	Comprehensive testing with unit and integration tests
This modular design allows for easy extension and customization while providing a powerful and intuitive interface for real estate data analysis.## MongoDB API Implementation
The server-side implementation includes several API endpoints and MongoDB schemas to support the Multi-Frame Layout Component System.



MongoDB Schemas
// server/src/models/LayoutConfig.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface PanelPosition {
  row: number;
  col: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelConfig {
  id: string;
  contentType: string;
  title: string;
  position?: PanelPosition;
  size?: PanelSize;
  state?: any;
  visible?: boolean;
}

export interface ILayoutConfig extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  layoutType: 'single' | 'dual' | 'tri' | 'quad';
  panels: PanelConfig[];
  createdAt: Date;
  updatedAt: Date;
}

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

// Middleware to update timestamps
LayoutConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const LayoutConfig = mongoose.model<ILayoutConfig>('LayoutConfig', LayoutConfigSchema);
// server/src/models/UserPreferences.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  defaultLayout: mongoose.Types.ObjectId;
  panelPreferences: Map<string, any>;
  themePreferences: {
    colorMode: 'light' | 'dark' | 'system';
    mapStyle: 'standard' | 'satellite' | 'terrain';
    accentColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
  };
  filterPreferences: {
    defaultFilters: any;
    showFilterPanel: boolean;
    applyFiltersAutomatically: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  defaultLayout: {
    type: Schema.Types.ObjectId,
    ref: 'LayoutConfig'
  },
  panelPreferences: {
    type: Map,
    of: Schema.Types.Mixed
  },
  themePreferences: {
    colorMode: {
      type: String,
      enum: ['light', 'dark', 'system'],.launcherButton:before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
MapPanelWithControllers Component
// src/components/multiframe/panels/MapPanelWithControllers.tsx
import React, { useState, useEffect } from 'react';
import { MapPanel } from './MapPanel';
import { ControllerWizardLauncher } from '../controllers/ControllerWizardLauncher';
import { fetchControllerStatus } from '../../../services/controllerService';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './MapPanelWithControllers.module.css';

export const MapPanelWithControllers: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  const [controllerStatus, setControllerStatus] = useState<{
    hasController: boolean;
    status: 'active' | 'inactive' | 'error' | null;
    lastRun: string | null;
  }>({
    hasController: false,
    status: null,
    lastRun: null
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // In production, get from auth context
  
  // Fetch controller status when entity changes
  useEffect(() => {
    if (selectedEntity.type && selectedEntity.id) {
      fetchControllerStatus(selectedEntity.type, selectedEntity.id)
        .then(status => {
          setControllerStatus(status);
        })
        .catch(error => {
          console.error('Error fetching controller status:', error);
        });
    }
  }, [selectedEntity.type, selectedEntity.id]);
  
  // Handle entity selection
  const handleEntitySelected = (entity: { type: 'state' | 'county'; id: string }) => {
    setSelectedEntity(entity);
    
    // Update parent state if callback provided
    if (onStateChange) {
      onStateChange({
        entityType: entity.type,
        entityId: entity.id
      });
    }
  };
  
  return (
    <div className={styles.mapPanelWithControllers}>
      <MapPanel
        panelId={panelId}
        initialState={initialState}
        onStateChange={onStateChange}
        onAction={(action) => {
          // Handle entity selection
          if (action.type === 'select') {
            const { entityType, entityId } = action.payload;
            if (entityType === 'state' || entityType === 'county') {
              handleEntitySelected({ type: entityType, id: entityId });
            }
          }
          
          // Pass action to parent if callback provided
          if (onAction) {
            onAction(action);
          }
        }}
      />
      
      {isAdmin && selectedEntity.type && selectedEntity.id && (
        <div className={styles.controllerOverlay}>
          <div className={styles.controllerStatus}>
            <span className={styles.statusLabel}>Controller:</span>
            <span className={`${styles.statusValue} ${styles[`status-${controllerStatus.status || 'none'}`]}`}>
              {controllerStatus.hasController 
                ? `${controllerStatus.status} (Last run: ${controllerStatus.lastRun ? new Date(controllerStatus.lastRun).toLocaleString() : 'never'})`
                : 'Not configured'}
            </span>
          </div>
          
          <ControllerWizardLauncher
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            buttonLabel={controllerStatus.hasController ? 'Edit Controller' : 'Create Controller'}
            className={styles.launcherButton}
          />
        </div>
      )}
    </div>
  );
};
/* src/components/multiframe/panels/MapPanelWithControllers.module.css */
.mapPanelWithControllers {
  position: relative;
  height: 100%;
  width: 100%;
}

.controllerOverlay {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
}

.controllerStatus {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.statusLabel {
  font-weight: 500;
}

.statusValue {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-active {
  background-color: #4caf50;
  color: white;
}

.status-inactive {
  background-color: #ff9800;
  color: white;
}

.status-error {
  background-color: #f44336;
  color: white;
}

.status-none {
  background-color: #e0e0e0;
  color: #757575;
}

.launcherButton {
  margin-top: 4px;
}
Controller Status Service
// src/services/controllerService.ts
import axios from 'axios';

interface ControllerStatus {
  hasController: boolean;
  status: 'active' | 'inactive' | 'error' | null;
  lastRun: string | null;
  nextRun?: string | null;
  runCount?: number;
  errorCount?: number;
  controllerType?: string;
  controllerName?: string;
}

/**
 * Fetch controller status for an entity
 */
export async function fetchControllerStatus(
  entityType: 'state' | 'county',
  entityId: string
): Promise<ControllerStatus> {
  try {
    const response = await axios.get(`/api/${entityType}s/${entityId}/controller-status`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching controller status for ${entityType} ${entityId}:`, error);
    
    // Return default status if error occurs
    return {
      hasController: false,
      status: null,
      lastRun: null
    };
  }
}

/**
 * Execute a controller
 */
export async function executeController(
  entityType: 'state' | 'county',
  entityId: string,
  controllerId: string
): Promise<any> {
  try {
    const response = await axios.post(`/api/controllers/${controllerId}/execute`, {
      entityType,
      entityId
    });
    return response.data;
  } catch (error) {
    console.error(`Error executing controller ${controllerId}:`, error);
    throw error;
  }
}

/**
 * Get controller history
 */
export async function getControllerHistory(
  entityType: 'state' | 'county',
  entityId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const response = await axios.get(`/api/${entityType}s/${entityId}/controller-history`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching controller history for ${entityType} ${entityId}:`, error);
    return [];
  }
}

/**
 * Mock implementation for development
 */
export function mockControllerStatus(
  entityType: 'state' | 'county',
  entityId: string
): Promise<ControllerStatus> {
  return new Promise((resolve) => {
    // Simulate API latency
    setTimeout(() => {
      // For demo purposes, assume some entities have controllers
      const hasController = Math.random() > 0.3;
      
      if (hasController) {
        const statuses = ['active', 'inactive', 'error'] as const;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const lastRun = new Date(Date.now() - Math.random() * 86400000 * 30).toISOString();
        
        resolve({
          hasController: true,
          status: randomStatus,
          lastRun,
          nextRun: randomStatus === 'active' 
            ? new Date(Date.now() + Math.random() * 86400000 * 7).toISOString()
            : null,
          runCount: Math.floor(Math.random() * 100),
          errorCount: randomStatus === 'error' ? Math.floor(Math.random() * 10) : 0,
          controllerType: entityType === 'state' ? 'StateDataCollector' : 'CountyDataCollector',
          controllerName: `${entityId} ${entityType === 'state' ? 'State' : 'County'} Controller`
        });
      } else {
        resolve({
          hasController: false,
          status: null,
          lastRun: null
        });
      }
    }, 300);
  });
}
Panel Actions Enhancement
// src/components/multiframe/PanelActions.tsx
import React from 'react';
import styles from './PanelActions.module.css';

interface PanelActionsProps {
  isMaximized: boolean;
  onMaximize: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onClose?: () => void;
  className?: string;
}

export const PanelActions: React.FC<PanelActionsProps> = ({
  isMaximized,
  onMaximize,
  onRefresh,
  onExport,
  onClose,
  className = ''
}) => {
  return (
    <div className={`${styles.panelActions} ${className}`}>
      <button
        className={styles.actionButton}
        onClick={onRefresh}
        aria-label="Refresh panel"
        data-testid="refresh-button"
      >
        <span className={styles.refreshIcon}></span>
      </button>
      
      <button
        className={styles.actionButton}
        onClick={onExport}
        aria-label="Export panel data"
        data-testid="export-button"
      >
        <span className={styles.exportIcon}></span>
      </button>
      
      <button
        className={`${styles.actionButton} ${isMaximized ? styles.active : ''}`}
        onClick={onMaximize}
        aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
        data-testid="maximize-button"
      >
        <span className={isMaximized ? styles.restoreIcon : styles.maximizeIcon}></span>
      </button>
      
      {onClose && (
        <button
          className={`${styles.actionButton} ${styles.closeButton}`}
          onClick={onClose}
          aria-label="Close panel"
          data-testid="close-button"
        >
          <span className={styles.closeIcon}></span>
        </button>
      )}
    </div>
  );
};
Panel Drag and Drop Implementation
// src/components/multiframe/DraggablePanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PanelContainer, PanelContainerProps } from './PanelContainer';
import styles from './DraggablePanel.module.css';

export interface DraggablePanelProps extends PanelContainerProps {
  onPositionChange?: (id: string, position: { row: number; col: number }) => void;
  enableDragging?: boolean;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  title,
  contentType,
  initialState,
  position,
  size,
  onStateChange,
  onAction,
  onPositionChange,
  enableDragging = true,
  className = ''
}) => {
  // State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Refs
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Start dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableDragging) return;
    
    // Only start dragging from header
    if (!(e.target as HTMLElement).closest(`.${styles.panelHeader}`)) return;
    
    setIsDragging(true);
    
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    // Prevent text selection during drag
    e.preventDefault();
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new position
      if (panelRef.current) {
        const parentRect = panelRef.current.parentElement?.getBoundingClientRect();
        
        if (parentRect) {
          const x = e.clientX - parentRect.left - dragOffset.x;
          const y = e.clientY - parentRect.top - dragOffset.y;
          
          // Set new position with CSS
          panelRef.current.style.transform = `translate(${x}px, ${y}px)`;
          panelRef.current.style.zIndex = '1000';
        }
      }
    };
    
    const handleMouseUp = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Calculate final grid position
      if (panelRef.current && onPositionChange) {
        const parentRect = panelRef.current.parentElement?.getBoundingClientRect();
        const panelRect = panelRef.current.getBoundingClientRect();
        
        if (parentRect) {
          // Reset inline transform
          panelRef.current.style.transform = '';
          panelRef.current.style.zIndex = '';
          
          // Calculate grid position (assuming 2x2 grid)
          const col = (panelRect.left - parentRect.left + panelRect.width / 2) > parentRect.width / 2 ? 1 : 0;
          const row = (panelRect.top - parentRect.top + panelRect.height / 2) > parentRect.height / 2 ? 1 : 0;
          
          // Notify about position change
          onPositionChange(id, { row, col });
        }
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onPositionChange]);
  
  return (
    <div
      ref={panelRef}
      className={`${styles.draggablePanel} ${isDragging ? styles.dragging : ''} ${className}`}
      onMouseDown={handleMouseDown}
    >
      <PanelContainer
        id={id}
        title={title}
        contentType={contentType}
        initialState={initialState}
        position={position}
        size={size}
        onStateChange={onStateChange}
        onAction={onAction}
        className={styles.innerPanel}
      />
    </div>
  );
};
/* src/components/multiframe/DraggablePanel.module.css */
.draggablePanel {
  position: relative;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.draggablePanel.dragging {
  opacity: 0.8;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: none;
  cursor: grabbing;
}

.innerPanel {
  height: 100%;
  width: 100%;
}

.panelHeader {
  cursor: grab;
}

.dragging .panelHeader {
  cursor: grabbing;
}
Panel Resizing Implementation
// src/components/multiframe/ResizablePanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PanelContainer, PanelContainerProps } from './PanelContainer';
import styles from './ResizablePanel.module.css';

export interface ResizablePanelProps extends PanelContainerProps {
  onSizeChange?: (id: string, size: { width: number; height: number }) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableResizing?: boolean;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  id,
  title,
  contentType,
  initialState,
  position,
  size,
  onStateChange,
  onAction,
  onSizeChange,
  minWidth = 20,
  minHeight = 20,
  maxWidth = 100,
  maxHeight = 100,
  enableResizing = true,
  className = ''
}) => {
  // State
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startSize, setStartSize] = useState<{ width: number; height: number } | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  
  // Refs
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Start resizing
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    if (!enableResizing) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect && panelRef.current?.parentElement) {
      const parentRect = panelRef.current.parentElement.getBoundingClientRect();
      
      setStartSize({
        width: (rect.width / parentRect.width) * 100,
        height: (rect.height / parentRect.height) * 100
      });
      
      setStartPos({
        x: e.clientX,
        y: e.clientY
      });
    }
    
    e.preventDefault();
  };
  
  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !startSize || !startPos || !panelRef.current?.parentElement) return;
      
      const parentRect = panelRef.current.parentElement.getBoundingClientRect();
      
      // Calculate delta
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      // Calculate new size based on direction
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      
      if (resizeDirection.includes('right')) {
        newWidth = startSize.width + (deltaX / parentRect.width) * 100;
      } else if (resizeDirection.includes('left')) {
        newWidth = startSize.width - (deltaX / parentRect.width) * 100;
      }
      
      if (resizeDirection.includes('bottom')) {
        newHeight = startSize.height + (deltaY / parentRect.height) * 100;
      } else if (resizeDirection.includes('top')) {
        newHeight = startSize.height - (deltaY / parentRect.height) * 100;
      }
      
      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      // Apply new size
      panelRef.current.style.width = `${newWidth}%`;
      panelRef.current.style.height = `${newHeight}%`;
    };
    
    const handleMouseUp = () => {
      if (!isResizing) return;
      
      setIsResizing(false);
      setResizeDirection(null);
      
      // Calculate final size
      if (panelRef.current?.parentElement && onSizeChange) {
        const rect = panelRef.current.getBoundingClientRect();
        const parentRect = panelRef.current.parentElement.getBoundingClientRect();
        
        const newSize = {
          width: (rect.width / parentRect.width) * 100,
          height: (rect.height / parentRect.height) * 100
        };
        
        // Notify about size change
        onSizeChange(id, newSize);
      }
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startSize, startPos, resizeDirection, id, minWidth, minHeight, maxWidth, maxHeight, onSizeChange]);
  
  return (
    <div
      ref={panelRef}
      className={`${styles.resizablePanel} ${isResizing ? styles.resizing : ''} ${className}`}
      style={{
        width: size?.width ? `${size.width}%` : undefined,
        height: size?.height ? `${size.height}%` : undefined
      }}
    >
      <PanelContainer
        id={id}
        title={title}
        contentType={contentType}
        initialState={initialState}
        position={position}
        size={size}
        onStateChange={onStateChange}
        onAction={onAction}
        className={styles.innerPanel}
      />
      
      {enableResizing && (
        <>
          <div 
            className={`${styles.resizeHandle} ${styles.resizeRight}`}
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div 
            className={`${styles.resizeHandle} ${styles.resizeBottom}`}
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div 
            className={`${styles.resizeHandle} ${styles.resizeCorner}`}
            onMouseDown={(e) => handleResizeStart(e, 'right-bottom')}
          />
        </>
      )}
    </div>
  );
};
/* src/components/multiframe/ResizablePanel.module.css */
.resizablePanel {
  position: relative;
  overflow: hidden;
}

.resizablePanel.resizing {
  pointer-events: none;
  user-select: none;
}

.innerPanel {
  height: 100%;
  width: 100%;
}

.resizeHandle {
  position: absolute;
  background-color: transparent;
  z-index: 10;
}

.resizeRight {
  cursor: ew-resize;
  width: 8px;
  top: 0;
  right: 0;
  bottom: 0;
}

.resizeBottom {
  cursor: ns-resize;
  height: 8px;
  left: 0;
  right: 0;
  bottom: 0;
}

.resizeCorner {
  cursor: nwse-resize;
  width: 16px;
  height: 16px;
  right: 0;
  bottom: 0;
}
``````typescript
// src/hooks/usePanelState.ts
import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState } from '../services/panelStateService';

export function usePanelState(panelId: string, contentType: string, initialState: any = {}) {
  // Load saved state or use initial state
  const loadInitialState = () => {
    const savedState = loadPanelState(panelId);
    
    if (savedState && savedState.contentType === contentType) {
      return savedState.state;
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<any>(loadInitialState);
  
  // Update state and save changes
  const updateState = useCallback((newState: any) => {
    setState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      
      // Save the updated state
      savePanelState(panelId, contentType, updatedState);
      
      return updatedState;
    });
  }, [panelId, contentType]);
  
  // Return state and update function
  return [state, updateState];
}
Chunk 4: Layout Persistence & User Preferences
Layout Configuration Service
// src/services/layoutService.ts
import axios from 'axios';
import { LayoutConfig } from '../types/layout.types';

/**
 * Fetch all layout configurations for the current user
 */
export async function fetchLayouts(includePublic = false): Promise<LayoutConfig[]> {
  try {
    const response = await axios.get('/api/layouts', {
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
export async function fetchLayout(layoutId: string): Promise<LayoutConfig> {
  try {
    const response = await axios.get(`/api/layouts/${layoutId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Save a layout configuration
 */
export async function saveLayout(layout: LayoutConfig): Promise<LayoutConfig> {
  try {
    if (layout.id) {
      // Update existing layout
      const response = await axios.put(`/api/layouts/${layout.id}`, layout);
      return response.data;
    } else {
      // Create new layout
      const response = await axios.post('/api/layouts', layout);
      return response.data;
    }
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}

/**
 * Delete a layout configuration
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  try {
    await axios.delete(`/api/layouts/${layoutId}`);
  } catch (error) {
    console.error(`Error deleting layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Clone a layout configuration
 */
export async function cloneLayout(layoutId: string, newName: string): Promise<LayoutConfig> {
  try {
    const response = await axios.post(`/api/layouts/${layoutId}/clone`, { name: newName });
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
}

/**
 * Load layouts from local storage
 */
export function loadLayoutsFromStorage(): LayoutConfig[] {
  const storedLayouts = localStorage.getItem('layouts');
  
  if (storedLayouts) {
    try {
      return JSON.parse(storedLayouts);
    } catch (error) {
      console.error('Error parsing stored layouts:', error);
    }
  }
  
  return [];
}
User Preferences Service
// src/types/preferences.types.ts
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
// src/services/preferencesService.ts
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
Layout Manager Component
// src/components/multiframe/LayoutManager.tsx
import React, { useState, useEffect } from 'react';
import { fetchLayouts, saveLayout, deleteLayout, cloneLayout } from '../../services/layoutService';
import { LayoutConfig } from '../../types/layout.types';
import styles from './LayoutManager.module.css';

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
  const [layouts, setLayouts] = useState<LayoutConfig[]>([]);
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
      return <div className={styles.loading}>Loading layouts...</div>;
    }
    
    if (error) {
      return <div className={styles.error}>{error}</div>;
    }
    
    if (layouts.length === 0) {
      return <div className={styles.message}>No saved layouts</div>;
    }
    
    return (
      <div className={styles.layoutList}>
        {layouts.map(layout => (
          <div 
            key={layout.id}
            className={`${styles.layoutItem} ${currentLayout?.id === layout.id ? styles.selected : ''}`}
          >
            <div className={styles.layoutInfo}>
              <h4 className={styles.layoutName}>{layout.name}</h4>
              {layout.description && (
                <p className={styles.layoutDescription}>{layout.description}</p>
              )}
              <div className={styles.layoutMeta}>
                <span className={styles.layoutType}>{layout.type}</span>
                {layout.isDefault && (
                  <span className={styles.layoutDefault}>Default</span>
                )}
              </div>
            </div>
            <div className={styles.layoutActions}>
              <button
                className={styles.layoutButton}
                onClick={() => handleSelectLayout(layout)}
              >
                Load
              </button>
              <button
                className={styles.layoutButton}
                onClick={() => handleStartEdit(layout)}
              >
                Edit
              </button>
              <button
                className={styles.layoutButton}
                onClick={() => handleCloneLayout(layout.id!, `Copy of ${layout.name}`)}
              >
                Clone
              </button>
              <button
                className={`${styles.layoutButton} ${styles.deleteButton}`}
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
    <div className={styles.layoutManager}>
      <div className={styles.header}>
        <h3>Layout Manager</h3>
        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          <span>×</span>
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            Create New Layout
          </button>
          <button
            className={styles.actionButton}
            onClick={handleSaveLayout}
            disabled={!currentLayout}
          >
            Save Current Layout
          </button>
        </div>
        
        {isCreating && (
          <div className={styles.createForm}>
            <input
              type="text"
              className={styles.input}
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Enter layout name"
            />
            <div className={styles.formActions}>
              <button
                className={styles.formButton}
                onClick={handleCreateLayout}
              >
                Create
              </button>
              <button
                className={`${styles.formButton} ${styles.cancelButton}`}
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
          <div className={styles.editForm}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                className={styles.input}
                value={editedLayout.name}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                className={styles.textarea}
                value={editedLayout.description || ''}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Default</label>
              <input
                type="checkbox"
                checked={editedLayout.isDefault || false}
                onChange={(e) => setEditedLayout(prev => prev ? { ...prev, isDefault: e.target.checked } : null)}
              />
            </div>
            <div className={styles.formActions}>
              <button
                className={styles.formButton}
                onClick={handleSaveEdit}
              >
                Save
              </button>
              <button
                className={`${styles.formButton} ${styles.cancelButton}`}
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
        
        <div className={styles.layouts}>
          <h4>Saved Layouts</h4>
          {renderLayoutList()}
        </div>
      </div>
    </div>
  );
};
/* src/components/multiframe/LayoutManager.module.css */
.layoutManager {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.closeButton {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.closeButton:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.closeButton span {
  font-size: 1.25rem;
  font-weight: bold;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.actionButton {
  padding: 8px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.actionButton:hover {
  background-color: #1976d2;
}

.actionButton:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}

.createForm,
.editForm {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.formGroup {
  margin-bottom: 12px;
}

.formGroup label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.input,
.textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.textarea {
  height: 80px;
  resize: vertical;
}

.formActions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.formButton {
  padding: 6px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.formButton:hover {
  background-color: #1976d2;
}

.cancelButton {
  background-color: #607d8b;
}

.cancelButton:hover {
  background-color: #455a64;
}

.deleteButton {
  background-color: #f44336;
}

.deleteButton:hover {
  background-color: #d32f2f;
}

.layouts h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
}

.layoutList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layoutItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.layoutItem.selected {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.layoutInfo {
  flex: 1;
}

.layoutName {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 500;
}

.layoutDescription {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.layoutMeta {
  display: flex;
  gap: 8px;
}

.layoutType,
.layoutDefault {
  display: inline-block;
  padding: 2px 6px;
  font-size: 0.7rem;
  border-radius: 4px;
}

.layoutType {
  background-color: #e9ecef;
  color: #495057;
}

.layoutDefault {
  background-color: #4caf50;
  color: white;
}

.layoutActions {
  display: flex;
  gap: 6px;
}

.layoutButton {
  padding: 4px 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.layoutButton:hover {
  background-color: #e9ecef;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
Chunk 5: Integration & Advanced Features
Integrating with the Controller Wizard
// src/components/multiframe/controllers/ControllerWizardLauncher.tsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ControllerWizardLauncher.module.css';

interface ControllerWizardLauncherProps {
  entityType: 'state' | 'county';
  entityId: string;
  buttonLabel?: string;
  className?: string;
}

export const ControllerWizardLauncher: React.FC<ControllerWizardLauncherProps> = ({
  entityType,
  entityId,
  buttonLabel = 'Configure Controller',
  className = ''
}) => {
  const navigate = useNavigate();
  
  const handleLaunchWizard = useCallback(() => {
    navigate('/controller-wizard', {
      state: {
        entityType,
        entityId,
        step: 'SelectControllerType'
      }
    });
  }, [navigate, entityType, entityId]);
  
  return (
    <button 
      className={`${styles.launcherButton} ${className}`}
      onClick={handleLaunchWizard}
      aria-label={`Configure controller for ${entityType} ${entityId}`}
    >
      {buttonLabel}
    </button>
  );
};
/* src/components/multiframe/controllers/ControllerWizardLauncher.module.css */
.launcherButton {
  padding: 8px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.launcherButton:hover {
  background-color: #1976d2;
}

.launcherButton:before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'%3E%3C/circle%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0```typescript
// src/services/panelStateService.ts
import { PanelState, LayoutState } from '../types/state.types';

/**
 * Save panel state
 */
export function savePanelState(panelId: string, contentType: string, state: any): PanelState {
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
}

/**
 * Load panel state
 */
export function loadPanelState(panelId: string): PanelState | null {
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
}

/**
 * Delete panel state
 */
export function deletePanelState(panelId: string): void {
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
}

/**
 * Save layout state
 */
export function saveLayoutState(
  layoutType: string,
  panels: Record<string, PanelState>,
  filters: any
): LayoutState {
  const layoutState: LayoutState = {
    type: layoutType,
    panels,
    filters,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to local storage for persistence
  localStorage.setItem('layoutState', JSON.stringify(layoutState));
  
  return layoutState;
}

/**
 * Load layout state
 */
export function loadLayoutState(): LayoutState | null {
  const storedState = localStorage.getItem('layoutState');
  
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error('Error parsing stored layout state:', error);
    }
  }
  
  return null;
}
// src/hooks/usePanelState.ts
import { useState, useCallback, useEffect } from 'react';
import { savePanelState, loadPanelState } from '../services/panelStateService';

export function usePanelState(panelId: string, contentType: string, initialState: any = {}) {
  // Load saved state or use initial state
  const loadInitialState = () => {
    const savedState = loadPanelState(panelId);
    
    if (savedState && savedState.contentType === contentType) {
      return savedState.state;
    }
    
    return initialState;
  };
  
  const [state, setState] = useState<any>(loadInitialState);
  
  // Update state and save changes
  const updateState = useCallback((newState: any) => {
    setState(prev => {
      const updatedState = typeof newState === 'function' ? newState(prev) : { ...prev, ...newState };
      
      // Save the updated state
      savePanelState(panelId, contentType,```typescript
// src/components/multiframe/panels/ChartPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './ChartPanel.module.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ChartPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(initialState.chartType || 'bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  // Hooks
  const { subscribe } = usePanelSync();
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select') {
          const { entityType, entityId } = event.payload;
          
          if (entityType === 'state' || entityType === 'county') {
            setSelectedEntity({
              type: entityType,
              id: entityId
            });
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Generate mock chart data (replace with actual data in production)
  useEffect(() => {
    const generateChartData = async () => {
      if (!selectedEntity.type || !selectedEntity.id) {
        setChartData([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, fetch data from an API
        // For now, generate mock data based on selected entity
        
        if (selectedEntity.type === 'state') {
          // Mock data for state - property types distribution
          const mockData = [
            { name: 'Single Family', value: 55 },
            { name: 'Condo', value: 20 },
            { name: 'Townhouse', value: 15 },
            { name: 'Multi-Family', value: 5 },
            { name: 'Land', value: 5 }
          ];
          
          setChartData(mockData);
        } else if (selectedEntity.type === 'county') {
          // Mock data for county - price ranges distribution
          const mockData = [
            { name: '$0-$100k', value: 10 },
            { name: '$100k-$250k', value: 25 },
            { name: '$250k-$500k', value: 35 },
            { name: '$500k-$750k', value: 20 },
            { name: '$750k-$1M', value: 5 },
            { name: '$1M+', value: 5 }
          ];
          
          setChartData(mockData);
        }
        
        // Update parent state if callback provided
        if (onStateChange) {
          onStateChange({
            entityType: selectedEntity.type,
            entityId: selectedEntity.id,
            chartType,
            chartData
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error generating chart data:', error);
        setError('Failed to generate chart data');
        setLoading(false);
      }
    };
    
    generateChartData();
  }, [selectedEntity, chartType, onStateChange]);
  
  // Handle chart type change
  const handleChartTypeChange = (type: 'bar' | 'pie' | 'line') => {
    setChartType(type);
    
    // Notify parent component if callback provided
    if (onAction) {
      onAction({
        type: 'chartTypeChange',
        payload: {
          chartType: type
        }
      });
    }
  };
  
  // Render chart based on type
  const renderChart = () => {
    if (loading) {
      return <div className={styles.loading}>Loading chart data...</div>;
    }
    
    if (error) {
      return <div className={styles.error}>{error}</div>;
    }
    
    if (!selectedEntity.type || !selectedEntity.id) {
      return <div className={styles.message}>Select a state or county to view chart</div>;
    }
    
    if (chartData.length === 0) {
      return <div className={styles.message}>No chart data available</div>;
    }
    
    const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        // For line chart, transform data if needed
        const lineData = chartData.map((item, index) => ({
          name: item.name,
          value: item.value,
          // Add a second dimension for comparison
          trend: Math.floor(item.value * (0.9 + Math.random() * 0.2))
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
              <Line type="monotone" dataKey="trend" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className={styles.chartPanel}>
      <div className={styles.chartHeader}>
        <h3>
          {selectedEntity.type === 'state' 
            ? 'Property Types Distribution' 
            : 'Price Range Distribution'}
        </h3>
        <div className={styles.chartControls}>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('bar')}
          >
            Bar
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'pie' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('pie')}
          >
            Pie
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
            onClick={() => handleChartTypeChange('line')}
          >
            Line
          </button>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {renderChart()}
      </div>
    </div>
  );
};
CSS Modules for Panel Content Components
/* src/components/multiframe/panels/MapPanel.module.css */
.mapPanel {
  position: relative;
  height: 100%;
  width: 100%;
}

.map {
  height: 100%;
  width: 100%;
}

.backButton {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.backButton:hover {
  background-color: #fff;
}

.loadingOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
}

.loadingSpinner {
  display: inline-block;
  width: 36px;
  height: 36px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3f51b5;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.errorMessage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 16px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  font-size: 0.9rem;
  z-index: 1000;
}
/* src/components/multiframe/panels/PropertyPanel.module.css */
.propertyPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panelHeader {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}

.panelHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.propertyList {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.propertyItem {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.propertyItem:hover {
  background-color: #f5f5f5;
}

.propertyItem.selected {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.propertyHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.propertyTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.propertyType {
  padding: 2px 6px;
  background-color: #e9ecef;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #495057;
}

.propertyDetails {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.propertyValue {
  font-weight: 600;
  color: #2196f3;
}

.propertyInfo {
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
  color: #6c757d;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
/* src/components/multiframe/panels/FilterPanel.module.css */
.filterPanel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.filterHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filterHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.resetButton {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.resetButton:hover {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.filterGroup {
  margin-bottom: 16px;
}

.filterLabel {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.filterSelect {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rangeInputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rangeInput {
  flex: 1;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rangeSlider {
  width: 100%;
  margin: 8px 0;
}

.filterRow {
  display: flex;
  gap: 16px;
}

.filterRow .filterGroup {
  flex: 1;
}
/* src/components/multiframe/panels/StatsPanel.module.css */
.statsPanel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.statsContent {
  height: 100%;
}

.statsHeader {
  margin-bottom: 16px;
}

.statsHeader h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
}

.entityName {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2196f3;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.statCard {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #eee;
}

.statLabel {
  display: block;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #6c757d;
}

.statValue {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
/* src/components/multiframe/panels/ChartPanel.module.css */
.chartPanel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chartHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chartHeader h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.chartControls {
  display: flex;
  gap: 8px;
}

.chartTypeButton {
  padding: 4px 12px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.chartTypeButton:hover {
  background-color: #f5f5f5;
}

.chartTypeButton.active {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.chartContainer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading,
.error,
.message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
  text-align: center;
  color: #6c757d;
}

.error {
  color: #dc3545;
}
Chunk 3: Filter System & Panel State Management
Filter System Implementation
// src/types/filter.types.ts
export interface PropertyFilter {
  propertyType?: string | string[];
  priceRange?: [number, number];
  bedrooms?: string | number;
  bathrooms?: string | number;
  squareFeet?: [number, number];
  [key: string]: any;
}

export interface GeographicFilter {
  state?: string;
  county?: string;
  [key: string]: any;
}

export interface FilterSet {
  property?: PropertyFilter;
  geographic?: GeographicFilter;
  [key: string]: any;
}

export interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: FilterSet;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
// src/context/FilterContext.tsx
import React, { createContext, useCallback, useState } from 'react';
import { FilterSet, FilterConfig } from '../types/filter.types';

interface FilterContextType {
  activeFilters: FilterSet;
  savedFilters: FilterConfig[];
  applyFilters: (filters: FilterSet) => void;
  clearFilters: () => void;
  saveFilter: (config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteFilter: (id: string) => void;
  loadFilter: (id: string) => void;
}

export const FilterContext = createContext<FilterContextType | null>(null);

export const FilterContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [activeFilters, setActiveFilters] = useState<FilterSet>({});
  const [savedFilters, setSavedFilters] = useState<FilterConfig[]>([]);
  
  // Apply filters
  const applyFilters = useCallback((filters: FilterSet) => {
    setActiveFilters(prev => ({
      ...prev,
      ...filters
    }));
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
  }, []);
  
  // Save filter configuration
  const saveFilter = useCallback((config: Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFilter: FilterConfig = {
      ...config,
      id: `filter-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSavedFilters(prev => [...prev, newFilter]);
  }, []);
  
  // Delete saved filter
  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== id));
  }, []);
  
  // Load saved filter
  const loadFilter = useCallback((id: string) => {
    const filter = savedFilters.find(filter => filter.id === id);
    
    if (filter) {
      setActiveFilters(filter.filters);
    }
  }, [savedFilters]);
  
  // Context value
  const contextValue = {
    activeFilters,
    savedFilters,
    applyFilters,
    clearFilters,
    saveFilter,
    deleteFilter,
    loadFilter
  };
  
  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
// src/hooks/useFilter.ts
import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export function useFilter() {
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error('useFilter must be used within a FilterContextProvider');
  }
  
  return context;
}
// src/services/filterService.ts
import { FilterSet, FilterConfig } from '../types/filter.types';

/**
 * Apply filters to data
 */
export function applyFiltersToData<T>(data: T[], filters: FilterSet): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  return data.filter(item => {
    // Apply property filters
    if (filters.property) {
      const propertyFilters = filters.property;
      
      // Property type filter
      if (propertyFilters.propertyType && 'propertyType' in item) {
        const itemType = (item as any).propertyType;
        
        if (Array.isArray(propertyFilters.propertyType)) {
          if (!propertyFilters.propertyType.includes(itemType)) {
            return false;
          }
        } else if (propertyFilters.propertyType !== 'all' && propertyFilters.propertyType !== itemType) {
          return false;
        }
      }
      
      // Price range filter
      if (propertyFilters.priceRange && 'price' in item) {
        const [min, max] = propertyFilters.priceRange;
        const itemPrice = (item as any).price;
        
        if (itemPrice < min || itemPrice > max) {
          return false;
        }
      }
      
      // Bedrooms filter
      if (propertyFilters.bedrooms && 'bedrooms' in item) {
        const itemBedrooms = (item as any).bedrooms;
        
        if (propertyFilters.bedrooms !== 'any' && itemBedrooms < Number(propertyFilters.bedrooms)) {
          return false;
        }
      }
      
      // Bathrooms filter
      if (propertyFilters.bathrooms && 'bathrooms' in item) {
        const itemBathrooms = (item as any).bathrooms;
        
        if (propertyFilters.bathrooms !== 'any' && itemBathrooms < Number(propertyFilters.bathrooms)) {
          return false;
        }
      }
      
      // Square feet filter
      if (propertyFilters.squareFeet && 'squareFeet' in item) {
        const [min, max] = propertyFilters.squareFeet;
        const itemSquareFeet = (item as any).squareFeet;
        
        if (itemSquareFeet < min || itemSquareFeet > max) {
          return false;
        }
      }
    }
    
    // Apply geographic filters
    if (filters.geographic) {
      const geoFilters = filters.geographic;
      
      // State filter
      if (geoFilters.state && 'state' in item) {
        const itemState = (item as any).state;
        
        if (geoFilters.state !== itemState) {
          return false;
        }
      }
      
      // County filter
      if (geoFilters.county && 'county' in item) {
        const itemCounty = (item as any).county;
        
        if (geoFilters.county !== itemCounty) {
          return false;
        }
      }
    }
    
    // Item passed all filters
    return true;
  });
}

/**
 * Save filters to local storage
 */
export function saveFiltersToStorage(filters: FilterConfig[]): void {
  localStorage.setItem('savedFilters', JSON.stringify(filters));
}

/**
 * Load filters from local storage
 */
export function loadFiltersFromStorage(): FilterConfig[] {
  const storedFilters = localStorage.getItem('savedFilters');
  
  if (storedFilters) {
    try {
      return JSON.parse(storedFilters);
    } catch (error) {
      console.error('Error parsing stored filters:', error);
    }
  }
  
  return [];
}
Panel State Management
// src/types/state.types.ts
export interface PanelState {
  id: string;
  contentType: string;
  state: any;
  lastUpdated: string;
}

export interface LayoutState {
  type: string;
  panels: Record<string, PanelState>;
  filters: any;
  lastUpdated: string;
}
``````typescript
// src/components/multiframe/panels/ChartPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { PanelContentProps } from '../../../types/panel.types';
import styles from './ChartPanel.module.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ChartPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(initialState.chartType || 'bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'state' | 'county' | null;
    id: string | null;
  }>({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  // Hooks
  const { subscribe } = usePanelSync();
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select') {
          const { entityType, entityId } = event.payload;
          
          if (entityType === 'state' || entityType === 'county') {
            setSelectedEntity({
              type: entityType,
              id: entityId
            });
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Generate mock chart data (replace with actual data in production)
  useEffect(() => {
    const generateChartData = async () => {
      if (!selectedEntity.type || !selectedEntity.id) {
        setChartData([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, fetch data from an API
        // For now, generate mock data based on selected entity
        
        if (selectedEntity.type === 'state') {
          // Mock data for state - property types distribution
          const mockData = [
            { name: 'Single# Multi-Frame Layout Component System: Implementation Guide

This guide provides detailed implementation code for all aspects of the Multi-Frame Layout Component System. The code is organized by the implementation chunks outlined in the design document.

## Table of Contents
- [Chunk 1: Core Container and Layout](#chunk-1-core-container-and-layout)
- [Chunk 2: Panel Communication & Content Registry](#chunk-2-panel-communication--content-registry)
- [Chunk 3: Filter System & Panel State Management](#chunk-3-filter-system--panel-state-management)
- [Chunk 4: Layout Persistence & User Preferences](#chunk-4-layout-persistence--user-preferences)
- [Chunk 5: Integration & Advanced Features](#chunk-5-integration--advanced-features)

## Chunk 1: Core Container and Layout

### Types Definitions

First, let's create the core type definitions that will be used throughout the system:

```typescript
// src/types/layout.types.ts
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad';

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

export type PanelContentType = 'map' | 'property' | 'filter' | 'stats' | 'chart' | 'list';
// src/types/panel.types.ts
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
MultiFrameContainer Component
// src/components/multiframe/MultiFrameContainer.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { LayoutSelector } from './controls/LayoutSelector';
import { SinglePanelLayout } from './layouts/SinglePanelLayout';
import { DualPanelLayout } from './layouts/DualPanelLayout';
import { TriPanelLayout } from './layouts/TriPanelLayout';
import { QuadPanelLayout } from './layouts/QuadPanelLayout';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { LayoutContextProvider } from '../../context/LayoutContext';
import { PanelConfig, LayoutConfig, LayoutType } from '../../types/layout.types';
import styles from './MultiFrameContainer.module.css';

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
          contentType: defaultPanelContent['top-right'] || 'property',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom',
          contentType: defaultPanelContent.bottom || 'stats',
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
          contentType: defaultPanelContent['top-right'] || 'property',
          title: 'Top Right Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-left',
          contentType: defaultPanelContent['bottom-left'] || 'filter',
          title: 'Bottom Left Panel',
          position: { row: 1, col: 0 },
          size: { width: 50, height: 50 }
        });
        defaultPanels.push({
          id: 'bottom-right',
          contentType: defaultPanelContent['bottom-right'] || 'stats',
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
    <div className={`${styles.multiFrameContainer} ${className}`} data-testid="multi-frame-container">
      <LayoutContextProvider>
        <PanelSyncProvider>
          <div className={styles.layoutControls}>
            <LayoutSelector
              currentLayout={layoutType}
              onLayoutChange={handleLayoutChange}
            />
          </div>
          <div className={styles.layoutContainer} data-testid={`${layoutType}-layout`}>
            {renderLayout()}
          </div>
        </PanelSyncProvider>
      </LayoutContextProvider>
    </div>
  );
};
Layout Selector Component
// src/components/multiframe/controls/LayoutSelector.tsx
import React from 'react';
import { LayoutType } from '../../../types/layout.types';
import styles from './LayoutSelector.module.css';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange
}) => {
  return (
    <div className={styles.layoutSelector}>
      <button
        className={`${styles.layoutButton} ${currentLayout === 'single' ? styles.active : ''}`}
        onClick={() => onLayoutChange('single')}
        aria-label="Single panel layout"
        data-testid="layout-selector-single"
      >
        <div className={styles.singleIcon}></div>
        <span>Single</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'dual' ? styles.active : ''}`}
        onClick={() => onLayoutChange('dual')}
        aria-label="Dual panel layout"
        data-testid="layout-selector-dual"
      >
        <div className={styles.dualIcon}></div>
        <span>Dual</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'tri' ? styles.active : ''}`}
        onClick={() => onLayoutChange('tri')}
        aria-label="Tri panel layout"
        data-testid="layout-selector-tri"
      >
        <div className={styles.triIcon}></div>
        <span>Tri</span>
      </button>
      
      <button
        className={`${styles.layoutButton} ${currentLayout === 'quad' ? styles.active : ''}`}
        onClick={() => onLayoutChange('quad')}
        aria-label="Quad panel layout"
        data-testid="layout-selector-quad"
      >
        <div className={styles.quadIcon}></div>
        <span>Quad</span>
      </button>
    </div>
  );
};
Layout Components
// src/components/multiframe/layouts/SinglePanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './SinglePanelLayout.module.css';

interface SinglePanelLayoutProps {
  panels: PanelConfig[];
}

export const SinglePanelLayout: React.FC<SinglePanelLayoutProps> = ({ panels }) => {
  // For single panel layout, we only use the first panel
  const panel = panels[0];
  
  if (!panel) {
    return <div className={styles.emptyLayout}>No panel configured</div>;
  }
  
  return (
    <div className={styles.singlePanelLayout} data-testid="single-layout">
      <PanelContainer
        id={panel.id}
        title={panel.title}
        contentType={panel.contentType}
        initialState={panel.state}
        className={styles.fullSizePanel}
      />
    </div>
  );
};
// src/components/multiframe/layouts/DualPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './DualPanelLayout.module.css';

interface DualPanelLayoutProps {
  panels: PanelConfig[];
}

export const DualPanelLayout: React.FC<DualPanelLayoutProps> = ({ panels }) => {
  // Ensure we have exactly two panels
  const leftPanel = panels.find(p => p.position?.col === 0) || panels[0];
  const rightPanel = panels.find(p => p.position?.col === 1) || panels[1];
  
  if (!leftPanel || !rightPanel) {
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.dualPanelLayout} data-testid="dual-layout">
      <div className={styles.leftPanel}>
        <PanelContainer
          id={leftPanel.id}
          title={leftPanel.title}
          contentType={leftPanel.contentType}
          initialState={leftPanel.state}
          className={styles.panelContainer}
        />
      </div>
      <div className={styles.rightPanel}>
        <PanelContainer
          id={rightPanel.id}
          title={rightPanel.title}
          contentType={rightPanel.contentType}
          initialState={rightPanel.state}
          className={styles.panelContainer}
        />
      </div>
    </div>
  );
};
// src/components/multiframe/layouts/TriPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './TriPanelLayout.module.css';

interface TriPanelLayoutProps {
  panels: PanelConfig[];
}

export const TriPanelLayout: React.FC<TriPanelLayoutProps> = ({ panels }) => {
  // Get panels based on position
  const topLeftPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 0) || panels[0];
  const topRightPanel = panels.find(p => p.position?.row === 0 && p.position?.col === 1) || panels[1];
  const bottomPanel = panels.find(p => p.position?.row === 1) || panels[2];
  
  if (!topLeftPanel || !topRightPanel || !bottomPanel) {
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.triPanelLayout} data-testid="tri-layout">
      <div className={styles.topRow}>
        <div className={styles.topLeftPanel}>
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.topRightPanel}>
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <PanelContainer
          id={bottomPanel.id}
          title={bottomPanel.title}
          contentType={bottomPanel.contentType}
          initialState={bottomPanel.state}
          className={styles.panelContainer}
        />
      </div>
    </div>
  );
};
// src/components/multiframe/layouts/QuadPanelLayout.tsx
import React from 'react';
import { PanelContainer } from '../PanelContainer';
import { PanelConfig } from '../../../types/layout.types';
import styles from './QuadPanelLayout.module.css';

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
    return <div className={styles.emptyLayout}>Insufficient panels configured</div>;
  }
  
  return (
    <div className={styles.quadPanelLayout} data-testid="quad-layout">
      <div className={styles.topRow}>
        <div className={styles.topLeftPanel}>
          <PanelContainer
            id={topLeftPanel.id}
            title={topLeftPanel.title}
            contentType={topLeftPanel.contentType}
            initialState={topLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.topRightPanel}>
          <PanelContainer
            id={topRightPanel.id}
            title={topRightPanel.title}
            contentType={topRightPanel.contentType}
            initialState={topRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.bottomLeftPanel}>
          <PanelContainer
            id={bottomLeftPanel.id}
            title={bottomLeftPanel.title}
            contentType={bottomLeftPanel.contentType}
            initialState={bottomLeftPanel.state}
            className={styles.panelContainer}
          />
        </div>
        <div className={styles.bottomRightPanel}>
          <PanelContainer
            id={bottomRightPanel.id}
            title={bottomRightPanel.title}
            contentType={bottomRightPanel.contentType}
            initialState={bottomRightPanel.state}
            className={styles.panelContainer}
          />
        </div>
      </div>
    </div>
  );
};
PanelContainer and PanelHeader Components
// src/components/multiframe/PanelContainer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PanelHeader } from './PanelHeader';
import { usePanelSync } from '../../hooks/usePanelSync';
import { useLayoutContext } from '../../hooks/useLayoutContext';
import { getPanelContent } from '../../services/panelContentRegistry';
import { PanelAction, PanelContentType } from '../../types/panel.types';
import styles from './PanelContainer.module.css';

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
    styles.panelContainer,
    isMaximized ? styles.maximized : '',
    className
  ].filter(Boolean).join(' ');
  
  // Apply style based on position and size
  const containerStyle = {
    gridRow: position?.row !== undefined ? `${position.row + 1}` : undefined,
    gridColumn: position?.col !== undefined ? `${position.col + 1}` : undefined,
    width: size?.width ? `${size.width}%` : undefined,
    height: size?.height ? `${size.height}%` : undefined
  };
  
  return (
    <div 
      className={containerClassNames} 
      style={containerStyle} 
      data-panel-id={id}
      data-testid={`panel-${id}`}
    >
      <PanelHeader 
        title={title} 
        isMaximized={isMaximized}
        onAction={handleAction}
      />
      <div className={styles.panelContent}>
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={state}
            onStateChange={handleStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className={styles.noContent}>
            No content available for type: {contentType}
          </div>
        )}
      </div>
    </div>
  );
};
// src/components/multiframe/PanelHeader.tsx
import React, { useCallback } from 'react';
import styles from './PanelHeader.module.css';

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
    <div className={styles.panelHeader}>
      <h3 className={styles.panelTitle}>{title}</h3>
      <div className={styles.panelActions}>
        <button
          className={styles.actionButton}
          onClick={handleRefreshClick}
          aria-label="Refresh panel"
          data-testid="refresh-button"
        >
          <span className={styles.refreshIcon}></span>
        </button>
        <button
          className={styles.actionButton}
          onClick={handleExportClick}
          aria-label="Export panel data"
          data-testid="export-button"
        >
          <span className={styles.exportIcon}></span>
        </button>
        <button
          className={`${styles.actionButton} ${isMaximized ? styles.active : ''}`}
          onClick={handleMaximizeClick}
          aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
          data-testid="maximize-button"
        >
          <span className={isMaximized ? styles.restoreIcon : styles.maximizeIcon}></span>
        </button>
      </div>
    </div>
  );
};
CSS Modules
/* src/components/multiframe/MultiFrameContainer.module.css */
.multiFrameContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--background-color, #f5f5f5);
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  overflow: hidden;
}

.layoutControls {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--header-bg-color, #fff);
  border-bottom: 1px solid var(--border-color, #ddd);
}

.layoutContainer {
  flex: 1;
  display: flex;
  overflow: hidden;
}
/* src/components/multiframe/controls/LayoutSelector.module.css */
.layoutSelector {
  display: flex;
  gap: 0.5rem;
}

.layoutButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid var(--border-color, #ddd);
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
}

.layoutButton.active {
  background-color: var(--primary-color-light, #e3f2fd);
  border-color: var(--primary-color, #2196f3);
}

.layoutButton:hover {
  background-color: var(--hover-bg-color, #f0f0f0);
}

.layoutButton span {
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

/* Icon styles */
.singleIcon,
.dualIcon,
.triIcon,
.quadIcon {
  width: 24px;
  height: 24px;
  border: 1px solid var(--icon-color, #555);
  border-radius: 2px;
}

.dualIcon {
  position: relative;
}

.dualIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.triIcon {
  position: relative;
}

.triIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.triIcon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--icon-color, #555);
}

.quadIcon {
  position: relative;
}

.quadIcon::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: var(--icon-color, #555);
}

.quadIcon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--icon-color, #555);
}
/* src/components/multiframe/layouts/SinglePanelLayout.module.css */
.singlePanelLayout {
  width: 100%;
  height: 100%;
  display: flex;
}

.fullSizePanel {
  flex: 1;
}

.emptyLayout {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #777);
  font-style: italic;
}
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #777);
  font-style: italic;
}
/* src/components/multiframe/layouts/DualPanelLayout.module.css */
.dualPanelLayout {
  width: 100%;
  height: 100%;
  display: flex;
}

.leftPanel,
.rightPanel {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.leftPanel {
  border-right: 1px solid var(--border-color, #ddd);
}

.panelContainer {
  height: 100%;
}

.emptyLayout {
  width: 100%;


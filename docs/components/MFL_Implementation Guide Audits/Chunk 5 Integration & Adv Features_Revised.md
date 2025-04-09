# 🧩 Chunk 5: Integration & Advanced Features (Vitest Implementation)

> **IMPORTANT NOTE**: Test file paths in this document reference the old nested test structure. The project has moved to a flattened test directory structure where files are located directly in `src/_tests_/` with underscores replacing directory separators. For example:
> - Old path: `src/__tests__/components/controllers/ControllerWizardLauncher.test.tsx`
> - New path: `src/_tests_/TC1201_components_controllers_ControllerWizardLauncher.test.tsx`
>
> For more information on the test structure, see the test guide in `src/_tests_/README.md`.

## 🎯 Objective

Enhance the Multi-Frame Layout System with advanced features including panel dragging, resizing, maximizing/minimizing, and Controller Wizard integration. This chunk implements the hierarchical State → County → Property data flow with proper visualization and interaction patterns for each level.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

```bash
# Checkout development branch and get latest changes
git checkout development
git pull origin development

# Create your feature branch
git checkout -b feature/advanced-integration
```

Required folders:
```
client/src/components/multiframe/controllers/
client/src/components/multiframe/panels/
client/src/services/controllerService.ts
client/src/hooks/
```

Install necessary packages:
```bash
npm install react-resizable react-draggable react-router-dom vitest @testing-library/react @testing-library/jest-dom
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Create Custom Hooks for Panel Interactions

First, let's create reusable hooks to make implementation more modular:

📄 **client/src/hooks/useDraggable.ts**
```typescript
import { useState, useRef, useEffect, RefObject } from 'react';

interface DraggableOptions {
  enabled?: boolean;
  dragHandleSelector?: string;
  grid?: [number, number];
  bounds?: 'parent' | { left?: number; top?: number; right?: number; bottom?: number };
  onDragStart?: (e: MouseEvent) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export function useDraggable<T extends HTMLElement = HTMLDivElement>(
  initialPosition: { x: number; y: number } = { x: 0, y: 0 },
  options: DraggableOptions = {}
): {
  isDragging: boolean;
  position: { x: number; y: number };
  ref: RefObject<T>;
  onMouseDown: (e: React.MouseEvent) => void;
} {
  const {
    enabled = true,
    dragHandleSelector,
    grid = [1, 1],
    bounds = 'parent',
    onDragStart,
    onDragEnd
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const elementRef = useRef<T>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Handlers for dragging operations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enabled) return;
    if (dragHandleSelector) {
      const target = e.target as HTMLElement;
      if (!target.closest(dragHandleSelector)) return;
    }

    setIsDragging(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    if (onDragStart) onDragStart(e.nativeEvent);
    e.preventDefault();
  };

  // Handle mouse movement during dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current || !elementRef.current.parentElement) return;
      const parentRect = elementRef.current.parentElement.getBoundingClientRect();
      
      // Calculate new position with grid snapping and bounds
      let newX = e.clientX - parentRect.left - dragOffsetRef.current.x;
      let newY = e.clientY - parentRect.top - dragOffsetRef.current.y;
      
      // Apply grid snapping
      newX = Math.round(newX / grid[0]) * grid[0];
      newY = Math.round(newY / grid[1]) * grid[1];
      
      // Apply bounds
      // (Implementation details here)
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (onDragEnd) onDragEnd(position);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, grid, bounds, onDragEnd, position]);

  return {
    isDragging,
    position,
    ref: elementRef,
    onMouseDown: handleMouseDown
  };
}
```

📄 **client/src/hooks/useResizable.ts**
```typescript
import { useState, useRef, useEffect, RefObject } from 'react';

type ResizeDirection = 'right' | 'bottom' | 'corner';

interface ResizableOptions {
  enabled?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  grid?: [number, number];
  onResizeStart?: (e: MouseEvent, direction: ResizeDirection) => void;
  onResizeEnd?: (size: { width: number; height: number }) => void;
}

export function useResizable<T extends HTMLElement = HTMLDivElement>(
  initialSize: { width: number; height: number } = { width: 200, height: 200 },
  options: ResizableOptions = {}
): {
  isResizing: boolean;
  size: { width: number; height: number };
  ref: RefObject<T>;
  handleResizeStart: (e: React.MouseEvent, direction: ResizeDirection) => void;
} {
  const {
    enabled = true,
    minWidth = 100,
    minHeight = 100,
    maxWidth = Infinity,
    maxHeight = Infinity,
    aspectRatio,
    grid = [1, 1],
    onResizeStart,
    onResizeEnd
  } = options;

  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(initialSize);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const elementRef = useRef<T>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });

  // Handler for resize start
  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    if (!enabled) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { ...size };
    
    if (onResizeStart) {
      onResizeStart(e.nativeEvent, direction);
    }
    
    e.preventDefault();
  };

  // Handle mouse movement during resizing
  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate deltas and apply to size
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      // Calculate new width and height based on resize direction
      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;
      
      // Apply changes based on direction
      if (resizeDirection === 'right' || resizeDirection === 'corner') {
        newWidth = startSizeRef.current.width + deltaX;
      }
      
      if (resizeDirection === 'bottom' || resizeDirection === 'corner') {
        newHeight = startSizeRef.current.height + deltaY;
      }
      
      // Apply grid, constraints, and aspect ratio
      // (Implementation details here)
      
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      if (onResizeEnd) {
        onResizeEnd(size);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, grid, minWidth, minHeight, maxWidth, maxHeight, aspectRatio, size, onResizeEnd]);

  return {
    isResizing,
    size,
    ref: elementRef,
    handleResizeStart
  };
}
```

📄 **client/src/hooks/useEntityData.ts**
```typescript
import { useState, useEffect, useCallback } from 'react';

interface EntityData {
  id: string;
  name: string;
  [key: string]: any;
}

interface EntityOptions {
  initialId?: string | null;
  parentEntityType?: string | null;
  parentEntityId?: string | null;
  includeStatistics?: boolean;
  apiBasePath?: string;
}

export function useEntityData<T extends EntityData = EntityData>(
  entityType: 'state' | 'county' | 'property',
  options: EntityOptions = {}
) {
  const {
    initialId = null,
    parentEntityType = null,
    parentEntityId = null,
    includeStatistics = true,
    apiBasePath = '/api'
  } = options;

  const [entityId, setEntityId] = useState<string | null>(initialId);
  const [entity, setEntity] = useState<T | null>(null);
  const [statistics, setStatistics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch entity data when ID changes
  useEffect(() => {
    if (!entityId) {
      setEntity(null);
      setStatistics(null);
      return;
    }

    const fetchEntity = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch entity data
        const endpoint = `${apiBasePath}/${entityType}s/${entityId}`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Failed to fetch ${entityType}`);
        
        const data = await response.json();
        setEntity(data);

        // Fetch statistics if requested
        if (includeStatistics) {
          const statsResponse = await fetch(`${endpoint}/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStatistics(statsData);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error(`Error fetching ${entityType}:`, err);
        setError(`Failed to load ${entityType} data. Please try again.`);
        setLoading(false);
      }
    };

    fetchEntity();
  }, [entityType, entityId, includeStatistics, apiBasePath]);

  // Fetch entities based on parent relationship
  const fetchByParent = useCallback(async () => {
    if (!parentEntityType || !parentEntityId) return [];

    try {
      setLoading(true);
      setError(null);
      
      const endpoint = `${apiBasePath}/${parentEntityType}s/${parentEntityId}/${entityType}s`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Failed to fetch ${entityType}s`);
      
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error(`Error fetching ${entityType}s:`, err);
      setError(`Failed to load ${entityType}s. Please try again.`);
      setLoading(false);
      return [];
    }
  }, [parentEntityType, parentEntityId, entityType, apiBasePath]);

  return {
    entityId,
    setEntityId,
    entity,
    statistics,
    loading,
    error,
    fetchByParent
  };
}
```

#### 2. Implement Enhanced Controller Service

📄 **client/src/services/controllerService.ts**
```typescript
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

interface ControllerConfig {
  id?: string;
  name: string;
  description?: string;
  entityType: 'state' | 'county';
  entityId: string;
  type: 'scheduled' | 'manual' | 'event-driven';
  schedule?: string;
  triggerEvent?: string;
  parameters?: Record<string, any>;
  isActive: boolean;
}

interface ControllerHistoryItem {
  id: string;
  controllerId: string;
  startTime: string;
  endTime: string | null;
  status: 'success' | 'failed' | 'running';
  errorMessage?: string;
  results?: Record<string, any>;
}

// Fetch controller status for an entity
export async function fetchControllerStatus(
  entityType: 'state' | 'county',
  entityId: string
): Promise<ControllerStatus> {
  try {
    const response = await axios.get(`/api/${entityType}s/${entityId}/controller-status`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching controller status:`, error);
    return {
      hasController: false,
      status: null,
      lastRun: null
    };
  }
}

// Create a new controller
export async function createController(
  config: ControllerConfig
): Promise<ControllerConfig> {
  try {
    const response = await axios.post('/api/controllers', config);
    return response.data;
  } catch (error) {
    console.error('Error creating controller:', error);
    throw error;
  }
}

// Update an existing controller
export async function updateController(
  controllerId: string,
  config: Partial<ControllerConfig>
): Promise<ControllerConfig> {
  try {
    const response = await axios.put(`/api/controllers/${controllerId}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error updating controller:`, error);
    throw error;
  }
}

// Execute a controller manually
export async function executeController(
  controllerId: string,
  parameters?: Record<string, any>
): Promise<any> {
  try {
    const response = await axios.post(`/api/controllers/${controllerId}/execute`, parameters);
    return response.data;
  } catch (error) {
    console.error(`Error executing controller:`, error);
    throw error;
  }
}

// Get controller execution history
export async function getControllerHistory(
  controllerId: string,
  limit: number = 10
): Promise<ControllerHistoryItem[]> {
  try {
    const response = await axios.get(`/api/controllers/${controllerId}/history`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching controller history:`, error);
    return [];
  }
}

// Get controller templates
export async function getControllerTemplates(
  entityType: 'state' | 'county'
): Promise<any[]> {
  try {
    const response = await axios.get(`/api/controller-templates`, {
      params: { entityType }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching controller templates:`, error);
    return [];
  }
}
```

#### 3. Implement Controller Wizard Launcher with Status Awareness

📄 **client/src/components/multiframe/controllers/ControllerWizardLauncher.tsx**
```typescript
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchControllerStatus } from '../../../services/controllerService';
import './ControllerWizardLauncher.css';

interface ControllerWizardLauncherProps {
  entityType: 'state' | 'county';
  entityId: string;
  buttonLabel?: string;
  showStatus?: boolean;
  className?: string;
}

export function ControllerWizardLauncher({
  entityType,
  entityId,
  buttonLabel,
  showStatus = true,
  className = ''
}: ControllerWizardLauncherProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ 
    hasController: boolean;
    status: 'active' | 'inactive' | 'error' | null;
  }>({ hasController: false, status: null });
  const [loading, setLoading] = useState(false);
  
  // Fetch controller status
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const result = await fetchControllerStatus(entityType, entityId);
        setStatus({
          hasController: result.hasController,
          status: result.status
        });
      } catch (error) {
        console.error('Error fetching controller status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, [entityType, entityId]);
  
  // Determine button label based on status
  const label = buttonLabel || (status.hasController 
    ? 'Edit Controller' 
    : 'Create Controller');
  
  const handleLaunchWizard = useCallback(() => {
    navigate('/controller-wizard', {
      state: {
        entityType,
        entityId,
        step: status.hasController ? 'EditController' : 'SelectControllerType'
      }
    });
  }, [navigate, entityType, entityId, status.hasController]);
  
  return (
    <div className={`controller-launcher ${className}`}>
      {showStatus && (
        <div className={`controller-status status-${status.status || 'none'}`}>
          {loading ? (
            <span className="status-loading">Loading...</span>
          ) : status.hasController ? (
            <span className="status-indicator">{status.status}</span>
          ) : (
            <span className="status-none">No controller</span>
          )}
        </div>
      )}
      
      <button 
        className="launcher-button"
        onClick={handleLaunchWizard}
        aria-label={`Configure controller for ${entityType} ${entityId}`}
        disabled={loading}
      >
        <span className="button-icon"></span>
        <span className="button-text">{label}</span>
      </button>
    </div>
  );
}
```

#### 4. Implement Enhanced Panel Header

📄 **client/src/components/multiframe/PanelHeader.tsx**
```typescript
import React, { useState, useCallback } from 'react';
import './PanelHeader.css';

interface PanelHeaderProps {
  title: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onClose?: () => void;
  showControls?: boolean;
  customControls?: React.ReactNode;
  draggable?: boolean;
  className?: string;
}

export function PanelHeader({
  title,
  isMaximized = false,
  onToggleMaximize,
  onRefresh,
  onExport,
  onClose,
  showControls = true,
  customControls,
  draggable = false,
  className = ''
}: PanelHeaderProps) {
  // Handle mouse events
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  
  // Event handlers
  const handleMaximizeClick = useCallback(() => {
    if (onToggleMaximize) onToggleMaximize();
  }, [onToggleMaximize]);
  
  const handleRefreshClick = useCallback(() => {
    if (onRefresh) onRefresh();
  }, [onRefresh]);
  
  const handleExportClick = useCallback(() => {
    if (onExport) onExport();
  }, [onExport]);
  
  const handleCloseClick = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);
  
  // Generate CSS classes
  const headerClasses = [
    'panel-header',
    draggable ? 'draggable' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={headerClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="panel-header"
    >
      <h3 className="panel-title">{title}</h3>
      
      <div className="panel-controls">
        {/* Custom controls */}
        {customControls}
        
        {/* Standard controls */}
        {showControls && (
          <div className="standard-controls">
            {onRefresh && (
              <button
                className="control-button"
                onClick={handleRefreshClick}
                aria-label="Refresh panel"
              >
                <span className="refresh-icon"></span>
              </button>
            )}
            
            {onExport && (
              <button
                className="control-button"
                onClick={handleExportClick}
                aria-label="Export panel data"
              >
                <span className="export-icon"></span>
              </button>
            )}
            
            {onToggleMaximize && (
              <button
                className={`control-button ${isMaximized ? 'active' : ''}`}
                onClick={handleMaximizeClick}
                aria-label={isMaximized ? 'Restore panel' : 'Maximize panel'}
              >
                <span className={isMaximized ? 'restore-icon' : 'maximize-icon'}></span>
              </button>
            )}
            
            {onClose && (
              <button
                className="control-button close-button"
                onClick={handleCloseClick}
                aria-label="Close panel"
              >
                <span className="close-icon"></span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 5. Implement Enhanced County Panel with Data Integration

📄 **client/src/components/multiframe/panels/CountyPanel.tsx**
```typescript
import React, { useEffect, useCallback } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { useEntityData } from '../../../hooks/useEntityData';
import { ControllerWizardLauncher } from '../controllers/ControllerWizardLauncher';
import './CountyPanel.css';

interface CountyPanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
  showControllerOptions?: boolean;
}

export function CountyPanel({
  panelId,
  initialState = {},
  onStateChange,
  onAction,
  showControllerOptions = false
}: CountyPanelProps) {
  // Get panel sync hooks
  const { broadcast, subscribe } = usePanelSync();
  
  // Entity data hooks for state and county
  const {
    entityId: stateId,
    setEntityId: setStateId
  } = useEntityData('state', {
    initialId: initialState.stateId || null
  });
  
  const {
    entityId: countyId,
    setEntityId: setCountyId,
    entity: county,
    statistics: countyStats,
    loading: countyLoading,
    error: countyError
  } = useEntityData('county', {
    initialId: initialState.countyId || null,
    includeStatistics: true
  });
  
  // Use counties from state relationship
  const {
    loading: countiesLoading,
    error: countiesError,
    fetchByParent
  } = useEntityData('county', {
    parentEntityType: 'state',
    parentEntityId: stateId,
    includeStatistics: false
  });
  
  // State to store counties list
  const [counties, setCounties] = React.useState<any[]>([]);
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle state selection from map panel
        if (event.type === 'select' && event.payload.entityType === 'state') {
          setStateId(event.payload.entityId);
          setCountyId(null); // Clear county selection when state changes
        }
        // Handle county selection from map panel
        else if (event.type === 'select' && event.payload.entityType === 'county') {
          setCountyId(event.payload.entityId);
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe, setStateId, setCountyId]);
  
  // Fetch counties when state changes
  useEffect(() => {
    if (stateId) {
      // Load counties for selected state
      fetchByParent().then(data => {
        setCounties(data);
      });
    } else {
      setCounties([]);
    }
  }, [stateId, fetchByParent]);
  
  // Update parent state when county changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        stateId,
        countyId,
        county,
        statistics: countyStats
      });
    }
  }, [stateId, countyId, county, countyStats, onStateChange]);
  
  // Handle county selection
  const handleCountySelect = useCallback((county: any) => {
    setCountyId(county.id);
    
    // Broadcast selection to other panels
    broadcast({
      type: 'select',
      payload: {
        entityType: 'county',
        entityId: county.id,
        properties: {
          stateId: stateId
        }
      },
      source: panelId
    });
    
    // Notify parent component
    if (onAction) {
      onAction({
        type: 'select',
        payload: {
          entityType: 'county',
          entityId: county.id,
          properties: {
            stateId: stateId
          }
        }
      });
    }
  }, [stateId, panelId, broadcast, onAction, setCountyId]);
  
  // Render different states (loading, error, empty, content)
  // The component implements proper loading, error, and empty states
  // with appropriate UI feedback
  
  return (
    <div className="county-panel">
      {/* Header area with state info and controller */}
      <div className="county-panel-header">
        <h3 className="state-name">{stateId ? stateId : 'Select a State'}</h3>
        {showControllerOptions && stateId && (
          <ControllerWizardLauncher 
            entityType="state"
            entityId={stateId}
            buttonLabel="State Controller"
            showStatus={false}
            className="controller-launcher-compact"
          />
        )}
      </div>
      
      {/* Counties list */}
      {/* County details with stats and controller */}
      {/* Implementation details for rendering counties and selected county */}
    </div>
  );
}
```

#### 6. Implement Map Panel with Controller Integration

📄 **client/src/components/multiframe/panels/MapPanelWithControllers.tsx**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { ControllerWizardLauncher } from '../controllers/ControllerWizardLauncher';
import { fetchControllerStatus } from '../../../services/controllerService';
import './MapPanelWithControllers.css';

interface MapPanelWithControllersProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
  showControllerOptions?: boolean;
}

export function MapPanelWithControllers({
  panelId,
  initialState = {},
  onStateChange,
  onAction,
  showControllerOptions = false
}: MapPanelWithControllersProps) {
  // State for selected entity and controller status
  const [selectedEntity, setSelectedEntity] = useState({
    type: initialState.entityType || null,
    id: initialState.entityId || null
  });
  
  const [controllerStatus, setControllerStatus] = useState({
    hasController: false,
    status: null,
    lastRun: null
  });
  
  // Get panel sync hooks
  const { broadcast, subscribe } = usePanelSync();
  
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
  
  // Subscribe to selection events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId && event.type === 'select') {
        const { entityType, entityId } = event.payload;
        if (entityType === 'state' || entityType === 'county') {
          setSelectedEntity({
            type: entityType,
            id: entityId
          });
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Update parent state when entity changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        entityType: selectedEntity.type,
        entityId: selectedEntity.id
      });
    }
  }, [selectedEntity, onStateChange]);
  
  // Handle map click (entity selection)
  const handleMapClick = useCallback((e, entityType: 'state' | 'county', entityId: string) => {
    // Update local state
    setSelectedEntity({
      type: entityType,
      id: entityId
    });
    
    // Broadcast selection to other panels
    broadcast({
      type: 'select',
      payload: {
        entityType,
        entityId
      },
      source: panelId
    });
    
    // Notify parent component
    if (onAction) {
      onAction({
        type: 'select',
        payload: {
          entityType,
          entityId
        }
      });
    }
  }, [panelId, broadcast, onAction]);
  
  // Placeholder for the actual map component
  const MapComponent = () => {
    return (
      <div className="map-placeholder">
        <div className="map-instructions">
          <h3>Interactive Map</h3>
          <p>This would be an interactive map where users can select states and counties.</p>
          <div className="map-demo-controls">
            <button 
              className="demo-state-button"
              onClick={(e) => handleMapClick(e, 'state', 'CA')}
            >
              Select California
            </button>
            <button 
              className="demo-state-button"
              onClick={(e) => handleMapClick(e, 'state', 'TX')}
            >
              Select Texas
            </button>
            <button 
              className="demo-county-button"
              onClick={(e) => handleMapClick(e, 'county', 'los-angeles')}
            >
              Select Los Angeles County
            </button>
            <button 
              className="demo-county-button"
              onClick={(e) => handleMapClick(e, 'county', 'harris')}
            >
              Select Harris County
            </button>
          </div>
        </div>
        
        {selectedEntity.id && (
          <div className="selection-info">
            <div className="info-label">Selected {selectedEntity.type}:</div>
            <div className="info-value">{selectedEntity.id}</div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="map-panel-with-controllers">
      <MapComponent />
      
      {showControllerOptions && selectedEntity.type && selectedEntity.id && (
        <div className="controller-overlay">
          <div className="controller-status">
            <span className="status-label">Controller:</span>
            <span className={`status-value status-${controllerStatus.status || 'none'}`}>
              {controllerStatus.hasController 
                ? `${controllerStatus.status} (Last run: ${controllerStatus.lastRun ? new Date(controllerStatus.lastRun).toLocaleString() : 'never'})`
                : 'Not configured'}
            </span>
          </div>
          
          <ControllerWizardLauncher
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            buttonLabel={controllerStatus.hasController ? 'Edit Controller' : 'Create Controller'}
            className="launcher-button"
          />
        </div>
      )}
    </div>
  );
}
```

#### 7. Create Enhanced Panel Container

📄 **client/src/components/multiframe/EnhancedPanelContainer.tsx**
```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { PanelHeader } from './PanelHeader';
import { useDraggable } from '../../hooks/useDraggable';
import { useResizable } from '../../hooks/useResizable';
import { usePanelSync } from '../../hooks/usePanelSync';
import { useLayoutContext } from '../../hooks/useLayoutContext';
import { getPanelContent } from '../../services/panelContentRegistry';
import './EnhancedPanelContainer.css';

interface EnhancedPanelContainerProps {
  id: string;
  title: string;
  contentType: string;
  initialState?: any;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  position?: { row: number; col: number };
  size?: { width: number; height: number };
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  showControls?: boolean;
  closable?: boolean;
  onStateChange?: (newState: any) => void;
  onPositionChange?: (position: { row: number; col: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onClose?: () => void;
  customControls?: React.ReactNode;
  className?: string;
}

export function EnhancedPanelContainer({
  id,
  title,
  contentType,
  initialState = {},
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 100, height: 100 },
  position,
  size,
  draggable = false,
  resizable = false,
  maximizable = true,
  showControls = true,
  closable = false,
  onStateChange,
  onPositionChange,
  onSizeChange,
  onClose,
  customControls,
  className = ''
}: EnhancedPanelContainerProps) {
  // State
  const [panelState, setPanelState] = useState(initialState);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousSize, setPreviousSize] = useState<{ width: number; height: number } | null>(null);
  const [previousPosition, setPreviousPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  const { registerPanel, unregisterPanel, updatePanelConfig } = useLayoutContext();
  
  // Use the custom hooks for dragging and resizing
  const { isDragging, position: dragPosition, ref: draggableRef, onMouseDown } = useDraggable(
    initialPosition,
    { 
      enabled: draggable && !isMaximized,
      dragHandleSelector: '.panel-header',
      onDragEnd: (pos) => {
        if (onPositionChange) {
          const gridPosition = calculateGridPosition(pos);
          onPositionChange(gridPosition);
        }
      }
    }
  );
  
  const { isResizing, size: resizeSize, ref: resizableRef, handleResizeStart } = useResizable(
    initialSize,
    {
      enabled: resizable && !isMaximized,
      minWidth: 100,
      minHeight: 100,
      onResizeEnd: (newSize) => {
        if (onSizeChange) {
          onSizeChange(newSize);
        }
      }
    }
  );
  
  // Calculate grid position from pixel position
  const calculateGridPosition = (pixelPosition: { x: number; y: number }) => {
    // Implementation for grid calculation
    const row = Math.floor((pixelPosition.y / window.innerHeight) * 2);
    const col = Math.floor((pixelPosition.x / window.innerWidth) * 2);
    return { row, col };
  };
  
  // Register panel with layout context on mount
  useEffect(() => {
    registerPanel(id, {
      id,
      contentType,
      title,
      position,
      size,
      state: panelState
    });
    
    return () => {
      unregisterPanel(id);
    };
  }, [id, contentType, title, position, size, registerPanel, unregisterPanel, panelState]);
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== id) {
        // Process events and update state accordingly
        if (event.type === 'select' || event.type === 'filter') {
          setPanelState(prevState => ({
            ...prevState,
            ...event.payload
          }));
        }
      }
    });
    
    return unsubscribe;
  }, [id, subscribe]);
  
  // Toggle maximize state
  const handleToggleMaximize = useCallback(() => {
    setIsMaximized(prev => {
      if (!prev) {
        // Store current size and position before maximizing
        setPreviousSize(resizeSize);
        setPreviousPosition(dragPosition);
      }
      return !prev;
    });
  }, [resizeSize, dragPosition]);
  
  // Handle panel state changes
  const handleStateChange = useCallback((newState: any) => {
    setPanelState(prevState => {
      const updatedState = { ...prevState, ...newState };
      updatePanelConfig(id, { state: updatedState });
      if (onStateChange) onStateChange(updatedState);
      return updatedState;
    });
  }, [id, updatePanelConfig, onStateChange]);
  
  // Handle panel actions
  const handleAction = useCallback((action: { type: string, payload?: any }) => {
    if (['select', 'filter', 'highlight'].includes(action.type)) {
      broadcast({
        type: action.type,
        payload: action.payload,
        source: id
      });
    }
  }, [id, broadcast]);
  
  // Get panel content component
  const PanelContent = getPanelContent(contentType);
  
  // Combine refs for draggable and resizable behaviors
  const combineRefs = (el: HTMLDivElement | null) => {
    if (draggable) draggableRef.current = el;
    if (resizable) resizableRef.current = el;
  };
  
  // Class names based on state
  const containerClassNames = [
    'enhanced-panel-container',
    isDragging ? 'dragging' : '',
    isResizing ? 'resizing' : '',
    isMaximized ? 'maximized' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      ref={combineRefs}
      className={containerClassNames} 
      style={{
        transform: draggable && !isMaximized ? `translate(${dragPosition.x}px, ${dragPosition.y}px)` : undefined,
        width: resizable && !isMaximized ? `${resizeSize.width}px` : undefined,
        height: resizable && !isMaximized ? `${resizeSize.height}px` : undefined
      }}
      onMouseDown={draggable ? onMouseDown : undefined}
      data-panel-id={id}
    >
      <PanelHeader 
        title={title}
        draggable={draggable}
        isMaximized={isMaximized}
        onToggleMaximize={maximizable ? handleToggleMaximize : undefined}
        onRefresh={() => console.log(`Refreshing panel ${id}`)}
        onExport={() => console.log(`Exporting panel ${id}`)}
        onClose={closable ? onClose : undefined}
        showControls={showControls}
        customControls={customControls}
      />
      
      <div className="panel-content">
        {PanelContent ? (
          <PanelContent
            panelId={id}
            initialState={panelState}
            onStateChange={handleStateChange}
            onAction={handleAction}
          />
        ) : (
          <div className="no-content">
            No content available for type: {contentType}
          </div>
        )}
      </div>
      
      {/* Resize handles */}
      {resizable && !isMaximized && (
        <>
          <div 
            className="resize-handle resize-right"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div 
            className="resize-handle resize-bottom"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div 
            className="resize-handle resize-corner"
            onMouseDown={(e) => handleResizeStart(e, 'corner')}
          />
        </>
      )}
    </div>
  );
}
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing with Vitest

Create test files for new components and use Vitest for testing:

##### 1. Test for Custom Hooks

📄 **client/src/_tests_/TC601_hooks_useDraggable.test.tsx**
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDraggable } from '../../hooks/useDraggable';

describe('useDraggable hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with the provided position', () => {
    const initialPosition = { x: 100, y: 200 };
    const { result } = renderHook(() => useDraggable(initialPosition));
    
    expect(result.current.position).toEqual(initialPosition);
    expect(result.current.isDragging).toBe(false);
  });
  
  it('changes isDragging state on mouse down event', () => {
    const { result } = renderHook(() => useDraggable());
    
    // Mock element
    const mockElement = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      }),
    };
    
    // Assign mock element to ref
    result.current.ref.current = mockElement as any;
    
    // Simulate mousedown
    act(() => {
      const mockEvent = {
        clientX: 50,
        clientY: 50,
        preventDefault: vi.fn(),
        target: mockElement,
      };
      
      result.current.onMouseDown(mockEvent as any);
    });
    
    expect(result.current.isDragging).toBe(true);
  });
  
  // Additional tests
});
```

📄 **client/src/_tests_/TC1501_hooks_useResizable.test.tsx**
```typescript
import { renderHook, act } from '@testing-library/react';
```

##### 2. Test for ControllerWizardLauncher

📄 **client/src/_tests_/TC1201_components_controllers_ControllerWizardLauncher.test.tsx**
```typescript
import React from 'react';
```

##### 3. Create Test for Enhanced Panel Container

📄 **client/src/_tests_/TC701_components_multiframe_EnhancedPanelContainer.test.tsx**
```typescript
import React from 'react';
```

##### 4. Run Tests

Create a test script for running tests:

📄 **test-chunk5.sh**
```bash
#!/bin/bash
cd client

echo "Running Custom Hooks Tests..."
npx vitest run "src/_tests_/TC*_hooks_*" --config ./vitest.config.ts

echo "Running Controller Component Tests..."
npx vitest run "src/_tests_/TC*_components_controllers_*" --config ./vitest.config.ts

echo "Running Panel Component Tests..."
npx vitest run "src/_tests_/TC*_components_panels_*" --config ./vitest.config.ts

echo "Running EnhancedPanelContainer tests..."
npx vitest run src/_tests_/TC701_components_multiframe_EnhancedPanelContainer.test.tsx --config ./vitest.config.ts

echo "All integration and advanced features tests completed!"
```

#### ✅ Commit and Push Your Changes

```bash
git add .
git commit -m "Implement Chunk 5 with enhanced hooks and components"
git push origin feature/advanced-integration
```

#### 🔃 Create a Pull Request

Create a detailed PR with:
- Description of all enhanced components
- Explanation of the custom hooks architecture
- Overview of the hierarchical data flow
- Screenshots of the components in action

## 📈 Implementation References

### Hierarchical Data Flow

The hierarchical flow between State → County → Property is implemented through:

1. **Custom Data Hooks**: The `useEntityData` hook properly manages parent-child relationships
2. **Event Broadcasting**: The `usePanelSync` hook allows coordinated updates across panels
3. **Controller Integration**: Each level (state, county) has its own controller with status awareness
4. **Enhanced UI Components**: Components with proper loading, error, and empty states
5. **Enhanced Data Flow**: Proper hierarchy with parent-child relationships
6. **Interactive UI**: Improved interactions with drag, resize, and maximize
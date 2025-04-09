# 🧩 Chunk 2: Panel Communication & Content Registry - Revised Implementation Guide v2

## 📋 Document Overview

This revised implementation guide addresses issues identified in the audit report for Chunk 2, including placeholder functions, memory leaks, race conditions, and documentation needs for the panel communication system and content registry.

The guide is structured in logical sections to improve readability and implementation flow:
- Section 1: Preparation and setup (Environment, Git, Dependencies)
- Section 2: Core Context Implementation (PanelSyncContext, LayoutContext)
- Section 3: Hooks Implementation (usePanelSync, useLayoutContext, useEntityData)
- Section 4: Panel Registry Enhancement
- Section 5: Panel Component Implementation
- Section 6: Testing Framework
- Section 7: Documentation Requirements
- Section 8: Validation Checklist

## 🔖 Section 1: Preparation and Setup

### 1.1 Environment Configuration

#### 1.1.1 Required Folder Structure
Verify that the following folders exist in your project:
```
client/src/context/
client/src/hooks/
client/src/services/
client/src/components/multiframe/panels/
client/src/__tests__/context/
client/src/__tests__/hooks/
client/src/__tests__/services/
client/src/__tests__/integration/
```

Create any missing folders:
```bash
# Execute from the client directory
mkdir -p src/context src/hooks src/services src/components/multiframe/panels
mkdir -p src/__tests__/context src/__tests__/hooks src/__tests__/services src/__tests__/integration
```

#### 1.1.2 Required Dependencies
Install necessary packages:
```bash
npm install react-leaflet leaflet 
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 1.2 Git Configuration

Follow these steps to create a proper branch for your implementation:

```bash
# Ensure you're in the project root directory
cd path/to/your/project

# Update your local development branch
git checkout development
git pull origin development

# Create a dedicated feature branch
git checkout -b feature/panel-communication-fix-v2

# Verify your branch
git branch
```

### 1.3 Testing Environment Setup

Create or update the Vitest configuration file:

```bash
# Navigate to client directory
cd client

# Create Vitest configuration file if it doesn't exist
touch vitest.config.ts
```

Add the following configuration to `vitest.config.ts`:

```typescript
// client/vitest.config.ts
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

Create the setup file for tests:

```bash
# Create setup file if it doesn't exist
touch src/setupTests.ts
```

Add the following to `setupTests.ts`:

```typescript
// client/src/setupTests.ts
import '@testing-library/jest-dom'
```

## 🔖 Section 2: Core Context Implementation

### 2.1 PanelSyncContext Implementation

Create the enhanced version of PanelSyncContext with proper event handling and memory management:

```bash
# Create or open the file
touch src/context/PanelSyncContext.tsx
```

Implement the following in `PanelSyncContext.tsx`:

```typescript
// client/src/context/PanelSyncContext.tsx
import React, { createContext, useCallback, useRef, useState, useEffect } from 'react';

// Define Event Interfaces with proper typing
export interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
  timestamp: number;
  sequenceId?: number; // For ordered event processing
  priority?: 'high' | 'normal' | 'low'; // For prioritizing critical events
}

export type PanelSyncCallback = (event: PanelSyncEvent) => void;

// Subscription interface for better tracking
interface Subscription {
  id: string;
  callback: PanelSyncCallback;
  active: boolean;
}

// Enhanced context type with proper event handling
export interface PanelSyncContextType {
  broadcast: (event: Omit<PanelSyncEvent, 'timestamp' | 'sequenceId'>) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
  getEventHistory: () => PanelSyncEvent[]; // For debugging
  clearEventHistory: () => void; // For cleanup
  getActiveSubscriptionCount: () => number; // For debugging
}

// Create context with null default
export const PanelSyncContext = createContext<PanelSyncContextType | null>(null);

// Enhanced provider with event queuing and subscription management
export const PanelSyncProvider: React.FC<{ 
  children: React.ReactNode,
  historyLimit?: number, // Maximum events to keep in history
  debug?: boolean // Enable debug logging
}> = ({ 
  children, 
  historyLimit = 100,
  debug = false
}) => {
  // Use ref for listeners to avoid re-renders
  const subscriptionsRef = useRef<Subscription[]>([]);
  const eventQueueRef = useRef<PanelSyncEvent[]>([]);
  const sequenceCounterRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);
  const [eventHistory, setEventHistory] = useState<PanelSyncEvent[]>([]);
  
  // Process event queue to handle race conditions
  const processEventQueue = useCallback(() => {
    if (processingRef.current || eventQueueRef.current.length === 0) {
      return;
    }
    
    processingRef.current = true;
    
    try {
      // Sort by priority first, then by sequence ID
      const sortedEvents = [...eventQueueRef.current].sort((a, b) => {
        // Sort by priority (high to low)
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const aPriority = a.priority || 'normal';
        const bPriority = b.priority || 'normal';
        
        const priorityDiff = priorityOrder[aPriority] - priorityOrder[bPriority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by sequence ID (maintain order of events with same priority)
        return (a.sequenceId || 0) - (b.sequenceId || 0);
      });
      
      // Process the first event in the queue
      const event = sortedEvents[0];
      
      // Remove the event from the queue
      eventQueueRef.current = eventQueueRef.current.filter(e => 
        e.sequenceId !== event.sequenceId);
      
      // Add to history with limit
      setEventHistory(prev => {
        const updated = [event, ...prev].slice(0, historyLimit);
        return updated;
      });
      
      // Notify all active subscribers
      subscriptionsRef.current
        .filter(sub => sub.active)
        .forEach(sub => {
          try {
            sub.callback(event);
          } catch (error) {
            console.error(`Error in panel sync listener (ID: ${sub.id}):`, error);
          }
        });
    } finally {
      processingRef.current = false;
      
      // Check if there are more events to process
      if (eventQueueRef.current.length > 0) {
        // Use setTimeout to prevent call stack overflow with many events
        setTimeout(processEventQueue, 0);
      }
    }
  }, [historyLimit]);
  
  // Enhanced broadcast with event queuing
  const broadcast = useCallback((eventData: Omit<PanelSyncEvent, 'timestamp' | 'sequenceId'>) => {
    const sequenceId = ++sequenceCounterRef.current;
    
    // Create full event with timestamp and sequence ID
    const event: PanelSyncEvent = {
      ...eventData,
      timestamp: Date.now(),
      sequenceId
    };
    
    if (debug) {
      console.log(`[PanelSync] Broadcasting event: ${event.type} from ${event.source}`);
    }
    
    // Add to queue
    eventQueueRef.current.push(event);
    
    // Process queue
    processEventQueue();
  }, [processEventQueue, debug]);
  
  // Enhanced subscribe with proper cleanup and subscription tracking
  const subscribe = useCallback((callback: PanelSyncCallback) => {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: Subscription = {
      id: subscriptionId,
      callback,
      active: true
    };
    
    subscriptionsRef.current.push(subscription);
    
    if (debug) {
      console.log(`[PanelSync] New subscription added: ${subscriptionId}`);
      console.log(`[PanelSync] Active subscriptions: ${subscriptionsRef.current.filter(s => s.active).length}`);
    }
    
    // Return unsubscribe function with proper cleanup
    return () => {
      // Mark as inactive first (for safety with concurrent events)
      const sub = subscriptionsRef.current.find(s => s.id === subscriptionId);
      if (sub) {
        sub.active = false;
      }
      
      // Then filter out from array
      subscriptionsRef.current = subscriptionsRef.current
        .filter(s => s.id !== subscriptionId);
      
      if (debug) {
        console.log(`[PanelSync] Subscription removed: ${subscriptionId}`);
        console.log(`[PanelSync] Active subscriptions: ${subscriptionsRef.current.filter(s => s.active).length}`);
      }
    };
  }, [debug]);
  
  // Get event history (for debugging)
  const getEventHistory = useCallback(() => {
    return [...eventHistory];
  }, [eventHistory]);
  
  // Clear event history (for cleanup)
  const clearEventHistory = useCallback(() => {
    setEventHistory([]);
  }, []);
  
  // Get active subscription count (for debugging)
  const getActiveSubscriptionCount = useCallback(() => {
    return subscriptionsRef.current.filter(s => s.active).length;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debug) {
        console.log(`[PanelSync] Provider unmounting. Cleaning up ${subscriptionsRef.current.length} subscriptions`);
      }
      
      // Clear subscriptions
      subscriptionsRef.current = [];
      // Clear event queue
      eventQueueRef.current = [];
    };
  }, [debug]);
  
  // Context value
  const contextValue: PanelSyncContextType = {
    broadcast,
    subscribe,
    getEventHistory,
    clearEventHistory,
    getActiveSubscriptionCount
  };
  
  return (
    <PanelSyncContext.Provider value={contextValue}>
      {children}
    </PanelSyncContext.Provider>
  );
};
```

### 2.2 LayoutContext Implementation

Create the enhanced version of LayoutContext with proper panel management:

```bash
# Create or open the file
touch src/context/LayoutContext.tsx
```

Implement the following in `LayoutContext.tsx`:

```typescript
// client/src/context/LayoutContext.tsx
import React, { createContext, useCallback, useState, useEffect, useRef } from 'react';

// Enhanced panel and layout types
export type LayoutType = 'single' | 'dual' | 'tri' | 'quad' | 'custom';

export interface PanelConfig {
  id: string;
  contentType: string;
  title: string;
  position?: { row: number; col: number };
  size?: { width: number; height: number };
  state?: any;
  visible?: boolean;
  minimized?: boolean;
  maximized?: boolean;
  lastUpdated?: number;
}

export interface LayoutConfig {
  type: LayoutType;
  panels: Record<string, PanelConfig>;
  lastUpdated?: number;
}

// Enhanced context interface with proper panel management
export interface LayoutContextType {
  layoutType: LayoutType;
  panels: Record<string, PanelConfig>;
  registerPanel: (id: string, config: PanelConfig) => void;
  unregisterPanel: (id: string) => void;
  updatePanelConfig: (id: string, updates: Partial<PanelConfig>) => void;
  setLayoutType: (type: LayoutType) => void;
  saveLayout: (name?: string) => string; // Save current layout, returns layout ID
  loadLayout: (layoutId: string) => boolean; // Load saved layout, returns success
  getSavedLayouts: () => string[]; // Get list of saved layout names
  getPanelById: (id: string) => PanelConfig | null; // Get panel by ID
  getVisiblePanels: () => PanelConfig[]; // Get all visible panels
}

// Create context with null default
export const LayoutContext = createContext<LayoutContextType | null>(null);

// Storage key for layouts
const LAYOUT_STORAGE_KEY = 'app_saved_layouts';

// Enhanced provider with proper state management and persistence
export const LayoutContextProvider: React.FC<{ 
  children: React.ReactNode,
  initialLayout?: LayoutType,
  persistLayouts?: boolean, // Enable layout persistence
  debug?: boolean // Enable debug logging
}> = ({ 
  children, 
  initialLayout = 'single',
  persistLayouts = true,
  debug = false
}) => {
  // State
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [panels, setPanels] = useState<Record<string, PanelConfig>>({});
  const [savedLayouts, setSavedLayouts] = useState<Record<string, LayoutConfig>>({});
  const panelUpdatesRef = useRef<Record<string, number>>({});
  
  // Load saved layouts from storage on mount
  useEffect(() => {
    if (persistLayouts) {
      try {
        const savedLayoutsStr = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (savedLayoutsStr) {
          const layouts = JSON.parse(savedLayoutsStr);
          setSavedLayouts(layouts);
          
          if (debug) {
            console.log(`[Layout] Loaded ${Object.keys(layouts).length} saved layouts`);
          }
        }
      } catch (error) {
        console.error('Error loading saved layouts:', error);
      }
    }
  }, [persistLayouts, debug]);
  
  // Save layouts to storage when they change
  useEffect(() => {
    if (persistLayouts && Object.keys(savedLayouts).length > 0) {
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(savedLayouts));
        
        if (debug) {
          console.log(`[Layout] Saved ${Object.keys(savedLayouts).length} layouts to storage`);
        }
      } catch (error) {
        console.error('Error saving layouts:', error);
      }
    }
  }, [savedLayouts, persistLayouts, debug]);
  
  // Enhanced panel registration with validation
  const registerPanel = useCallback((id: string, config: PanelConfig) => {
    if (!id || typeof id !== 'string') {
      console.error('[Layout] Invalid panel ID:', id);
      return;
    }
    
    if (!config.contentType) {
      console.error('[Layout] Panel must have a contentType:', config);
      return;
    }
    
    setPanels(prev => {
      // If panel already exists, merge with existing
      if (prev[id]) {
        return {
          ...prev,
          [id]: {
            ...prev[id],
            ...config,
            lastUpdated: Date.now()
          }
        };
      }
      
      // New panel
      return {
        ...prev,
        [id]: {
          ...config,
          visible: config.visible ?? true,
          minimized: config.minimized ?? false,
          maximized: config.maximized ?? false,
          lastUpdated: Date.now()
        }
      };
    });
    
    if (debug) {
      console.log(`[Layout] Panel registered: ${id} (${config.contentType})`);
    }
  }, [debug]);
  
  // Enhanced panel unregistration with cleanup
  const unregisterPanel = useCallback((id: string) => {
    setPanels(prev => {
      const newPanels = { ...prev };
      delete newPanels[id];
      return newPanels;
    });
    
    // Clean up update tracking
    if (panelUpdatesRef.current[id]) {
      delete panelUpdatesRef.current[id];
    }
    
    if (debug) {
      console.log(`[Layout] Panel unregistered: ${id}`);
    }
  }, [debug]);
  
  // Enhanced panel config update with change tracking
  const updatePanelConfig = useCallback((id: string, updates: Partial<PanelConfig>) => {
    // Track update count for this panel
    panelUpdatesRef.current[id] = (panelUpdatesRef.current[id] || 0) + 1;
    
    setPanels(prev => {
      const panel = prev[id];
      
      if (!panel) {
        console.warn(`[Layout] Attempted to update non-existent panel: ${id}`);
        return prev;
      }
      
      return {
        ...prev,
        [id]: {
          ...panel,
          ...updates,
          lastUpdated: Date.now()
        }
      };
    });
    
    if (debug) {
      console.log(`[Layout] Panel updated: ${id}`, updates);
    }
  }, [debug]);
  
  // Change layout type
  const handleSetLayoutType = useCallback((type: LayoutType) => {
    setLayoutType(type);
    
    if (debug) {
      console.log(`[Layout] Layout type changed to: ${type}`);
    }
  }, [debug]);
  
  // Save current layout
  const saveLayout = useCallback((name?: string) => {
    const layoutId = name || `layout_${Date.now()}`;
    
    const layoutConfig: LayoutConfig = {
      type: layoutType,
      panels: { ...panels },
      lastUpdated: Date.now()
    };
    
    setSavedLayouts(prev => ({
      ...prev,
      [layoutId]: layoutConfig
    }));
    
    if (debug) {
      console.log(`[Layout] Layout saved: ${layoutId}`);
    }
    
    return layoutId;
  }, [layoutType, panels, debug]);
  
  // Load saved layout
  const loadLayout = useCallback((layoutId: string) => {
    const layout = savedLayouts[layoutId];
    
    if (!layout) {
      console.warn(`[Layout] Layout not found: ${layoutId}`);
      return false;
    }
    
    setLayoutType(layout.type);
    setPanels(layout.panels);
    
    if (debug) {
      console.log(`[Layout] Layout loaded: ${layoutId}`);
    }
    
    return true;
  }, [savedLayouts, debug]);
  
  // Get list of saved layout names
  const getSavedLayouts = useCallback(() => {
    return Object.keys(savedLayouts);
  }, [savedLayouts]);
  
  // Get panel by ID
  const getPanelById = useCallback((id: string) => {
    return panels[id] || null;
  }, [panels]);
  
  // Get all visible panels
  const getVisiblePanels = useCallback(() => {
    return Object.values(panels).filter(panel => panel.visible !== false);
  }, [panels]);
  
  // Context value
  const contextValue: LayoutContextType = {
    layoutType,
    panels,
    registerPanel,
    unregisterPanel,
    updatePanelConfig,
    setLayoutType: handleSetLayoutType,
    saveLayout,
    loadLayout,
    getSavedLayouts,
    getPanelById,
    getVisiblePanels
  };
  
  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};
```

## 🔖 Section 3: Hooks Implementation

### 3.1 usePanelSync Hook

Create an enhanced version of the usePanelSync hook:

```bash
# Create or open the file
touch src/hooks/usePanelSync.ts
```

Implement the following in `usePanelSync.ts`:

```typescript
// client/src/hooks/usePanelSync.ts
import { useContext, useEffect, useRef, useCallback } from 'react';
import { 
  PanelSyncContext, 
  PanelSyncContextType, 
  PanelSyncEvent,
  PanelSyncCallback
} from '../context/PanelSyncContext';

// Enhanced hook with type filtering and source tracking
export function usePanelSync(options?: {
  panelId?: string;
  filterTypes?: string[];
  debug?: boolean;
}): PanelSyncContextType & {
  subscribeToType: (type: string, callback: (event: PanelSyncEvent) => void) => () => void;
  broadcastTyped: <T>(type: string, payload: T, priority?: 'high' | 'normal' | 'low') => void;
} {
  const context = useContext(PanelSyncContext);
  const { panelId, filterTypes, debug = false } = options || {};
  
  // Track subscriptions for cleanup
  const subscriptionsRef = useRef<Array<() => void>>([]);
  
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  
  // Enhanced subscribe with type filtering
  const subscribeToType = useCallback((
    type: string,
    callback: (event: PanelSyncEvent) => void
  ) => {
    const wrappedCallback: PanelSyncCallback = (event) => {
      // Filter by type and source
      if (event.type === type && (!panelId || event.source !== panelId)) {
        if (debug) {
          console.log(`[usePanelSync] Panel ${panelId || 'unknown'} received event: ${event.type}`);
        }
        callback(event);
      }
    };
    
    // Use the context subscribe
    const unsubscribe = context.subscribe(wrappedCallback);
    
    // Track for cleanup
    subscriptionsRef.current.push(unsubscribe);
    
    return unsubscribe;
  }, [context, panelId, debug]);
  
  // Enhanced broadcast with panel ID and typing
  const broadcastTyped = useCallback(<T>(
    type: string,
    payload: T,
    priority?: 'high' | 'normal' | 'low'
  ) => {
    if (!panelId) {
      console.warn('[usePanelSync] Broadcasting without panelId. Consider providing panelId in options.');
    }
    
    context.broadcast({
      type,
      payload,
      source: panelId || 'unknown',
      priority
    });
    
    if (debug) {
      console.log(`[usePanelSync] Panel ${panelId || 'unknown'} broadcasted event: ${type}`);
    }
  }, [context, panelId, debug]);
  
  // Clean up subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('[usePanelSync] Error unsubscribing:', error);
        }
      });
      subscriptionsRef.current = [];
      
      if (debug) {
        console.log(`[usePanelSync] Cleaned up ${subscriptionsRef.current.length} subscriptions for panel ${panelId || 'unknown'}`);
      }
    };
  }, [panelId, debug]);
  
  // Return enhanced context
  return {
    ...context,
    subscribeToType,
    broadcastTyped
  };
}
```

### 3.2 useLayoutContext Hook

Create an enhanced version of the useLayoutContext hook:

```bash
# Create or open the file
touch src/hooks/useLayoutContext.ts
```

Implement the following in `useLayoutContext.ts`:

```typescript
// client/src/hooks/useLayoutContext.ts
import { useContext, useCallback, useEffect, useState } from 'react';
import { LayoutContext, PanelConfig } from '../context/LayoutContext';

// Enhanced hook with panel tracking
export function useLayoutContext(options?: {
  panelId?: string;
  autoRegister?: boolean;
  panelConfig?: Partial<PanelConfig>;
  debug?: boolean;
}) {
  const context = useContext(LayoutContext);
  const { panelId, autoRegister = false, panelConfig = {}, debug = false } = options || {};
  
  // Track if this panel is registered
  const [isRegistered, setIsRegistered] = useState(false);
  
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutContextProvider');
  }
  
  // Auto-register panel if requested
  useEffect(() => {
    if (autoRegister && panelId && !isRegistered) {
      // Ensure required fields are present
      if (!panelConfig.contentType) {
        console.error('[useLayoutContext] Cannot auto-register without contentType');
        return;
      }
      
      if (!panelConfig.title) {
        console.warn('[useLayoutContext] Auto-registering panel without title');
      }
      
      // Register the panel
      context.registerPanel(panelId, {
        id: panelId,
        contentType: panelConfig.contentType,
        title: panelConfig.title || panelId,
        ...panelConfig
      });
      
      setIsRegistered(true);
      
      if (debug) {
        console.log(`[useLayoutContext] Auto-registered panel: ${panelId}`);
      }
      
      // Unregister on unmount
      return () => {
        context.unregisterPanel(panelId);
        setIsRegistered(false);
        
        if (debug) {
          console.log(`[useLayoutContext] Auto-unregistered panel: ${panelId}`);
        }
      };
    }
  }, [
    autoRegister, 
    context, 
    debug, 
    isRegistered, 
    panelId, 
    panelConfig
  ]);
  
  // Enhanced panel update with validation
  const updatePanel = useCallback((updates: Partial<PanelConfig>) => {
    if (!panelId) {
      console.error('[useLayoutContext] Cannot update panel without panelId');
      return;
    }
    
    context.updatePanelConfig(panelId, updates);
    
    if (debug) {
      console.log(`[useLayoutContext] Updated panel: ${panelId}`, updates);
    }
  }, [context, panelId, debug]);
  
  // Get current panel config
  const getPanelConfig = useCallback(() => {
    if (!panelId) return null;
    return context.getPanelById?.(panelId) || null;
  }, [context, panelId]);
  
  // Return enhanced context
  return {
    ...context,
    updatePanel,
    getPanelConfig,
    isRegistered
  };
}
```

### 3.3 useEntityData Hook

Create the useEntityData hook that was identified as missing in the documentation:

```bash
# Create or open the file
touch src/hooks/useEntityData.ts
```

Implement the following in `useEntityData.ts`:

```typescript
// client/src/hooks/useEntityData.ts
import { useState, useCallback, useEffect } from 'react';
import { usePanelSync } from './usePanelSync';

// Define entity types
export type EntityType = 'state' | 'county' | 'property' | 'filter';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  properties?: Record<string, any>;
  parent?: { id: string; type: EntityType };
  children?: Array<{ id: string; type: EntityType }>;
  lastUpdated?: number;
}

export interface EntityDataOptions {
  panelId: string;
  initialEntity?: Entity | null;
  loadEntity?: (id: string, type: EntityType) => Promise<Entity | null>;
  autoSync?: boolean;
  syncTypes?: EntityType[];
  debug?: boolean;
}

/**
 * Hook for managing entity data with panel synchronization
 * 
 * This hook provides a way to load, update, and sync entity data between panels.
 * It handles entity loading, change detection, and broadcasting changes to other panels.
 */
export function useEntityData({
  panelId,
  initialEntity = null,
  loadEntity,
  autoSync = true,
  syncTypes = ['state', 'county', 'property', 'filter'],
  debug = false
}: EntityDataOptions) {
  // State
  const [entity, setEntity] = useState<Entity | null>(initialEntity);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get panel sync
  const { subscribe, broadcast } = usePanelSync({ panelId, debug });
  
  // Load entity by ID and type
  const fetchEntity = useCallback(async (
    id: string,
    type: EntityType,
    options?: { silent?: boolean; parentId?: string; parentType?: EntityType }
  ) => {
    if (!loadEntity) {
      return null;
    }
    
    const { silent = false, parentId, parentType } = options || {};
    
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const data = await loadEntity(id, type);
      
      if (data) {
        // Add parent info if provided
        if (parentId && parentType) {
          data.parent = { id: parentId, type: parentType };
        }
        
        // Add updated timestamp
        data.lastUpdated = Date.now();
        
        setEntity(data);
        
        if (debug) {
          console.log(`[useEntityData] Loaded entity: ${type}/${id}`);
        }
        
        return data;
      }
      
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`[useEntityData] Error loading ${type}/${id}:`, error);
      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [loadEntity, debug]);
  
  // Update entity data
  const updateEntity = useCallback((updates: Partial<Entity>) => {
    setEntity(prev => {
      if (!prev) return null;
      
      const updated = {
        ...prev,
        ...updates,
        lastUpdated: Date.now()
      };
      
      // If this is a synced type and autoSync is enabled, broadcast the update
      if (autoSync && updated.type && syncTypes.includes(updated.type)) {
        broadcast({
          type: `entity_updated_${updated.type}`,
          payload: updated,
          source: panelId
        });
        
        if (debug) {
          console.log(`[useEntityData] Broadcasted entity update: ${updated.type}/${updated.id}`);
        }
      }
      
      return updated;
    });
  }, [broadcast, panelId, autoSync, syncTypes, debug]);
  
  // Select entity (load and broadcast)
  const selectEntity = useCallback(async (
    id: string,
    type: EntityType,
    options?: { silent?: boolean; parentId?: string; parentType?: EntityType }
  ) => {
    const data = await fetchEntity(id, type, options);
    
    if (data && autoSync) {
      broadcast({
        type: `entity_selected_${type}`,
        payload: data,
        source: panelId
      });
      
      if (debug) {
        console.log(`[useEntityData] Broadcasted entity selection: ${type}/${id}`);
      }
    }
    
    return data;
  }, [fetchEntity, broadcast, panelId, autoSync, debug]);
  
  // Clear entity
  const clearEntity = useCallback(() => {
    setEntity(null);
    setError(null);
    
    if (debug) {
      console.log(`[useEntityData] Cleared entity data`);
    }
  }, [debug]);
  
  // Subscribe to entity events
  useEffect(() => {
    if (!autoSync) return;
    
    const unsubscribe = subscribe((event) => {
      // Only process events from other panels
      if (event.source === panelId) {
        return;
      }
      
      // Handle entity selection events
      if (event.type.startsWith('entity_selected_')) {
        const type = event.type.replace('entity_selected_', '') as EntityType;
        
        // Only process events for synced types
        if (syncTypes.includes(type)) {
          const entityData = event.payload as Entity;
          
          if (debug) {
            console.log(`[useEntityData] Received entity selection: ${type}/${entityData.id}`);
          }
          
          // Update our entity if it's the same type
          if (entity?.type === type || !entity) {
            setEntity(entityData);
          }
        }
      }
      
      // Handle entity update events
      if (event.type.startsWith('entity_updated_')) {
        const type = event.type.replace('entity_updated_', '') as EntityType;
        
        // Only process events for synced types
        if (syncTypes.includes(type)) {
          const updatedEntity = event.payload as Entity;
          
          // Only update if we have the same entity loaded
          if (entity?.id === updatedEntity.id && entity?.type === updatedEntity.type) {
            setEntity(updatedEntity);
            
            if (debug) {
              console.log(`[useEntityData] Updated entity from broadcast: ${type}/${updatedEntity.id}`);
            }
          }
        }
      }
    });
    
    return unsubscribe;
  }, [subscribe, panelId, entity, syncTypes, autoSync, debug]);
  
  return {
    entity,
    loading,
    error,
    fetchEntity,
    updateEntity,
    selectEntity,
    clearEntity
  };
}
```

### 3.4 useLoadingState Hook (NEW)

Create a utility hook for managing loading states:

```bash
# Create or open the file
touch src/hooks/useLoadingState.ts
```

Implement the following in `useLoadingState.ts`:

```typescript
// client/src/hooks/useLoadingState.ts
import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  lastLoaded: number | null;
}

export function useLoadingState(initialState?: Partial<LoadingState>) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialState?.isLoading || false,
    error: initialState?.error || null,
    lastLoaded: initialState?.lastLoaded || null
  });
  
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
      ...(isLoading ? {} : { lastLoaded: Date.now() })
    }));
  }, []);
  
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
  }, []);
  
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastLoaded: null
    });
  }, []);
  
  // Wrap an async function with loading state management
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);
  
  return {
    ...state,
    setLoading,
    setError,
    reset,
    withLoading
  };
}
```

## 🔖 Section 4: Panel Registry Enhancement

### 4.1 PanelRegistry Implementation

Create an enhanced version of the panel registry with lazy loading and caching:

```bash
# Create or open the file
touch src/services/PanelRegistry.ts
```

Implement the following in `PanelRegistry.ts`:

```typescript
// client/src/services/PanelRegistry.ts
import React from 'react';

export type PanelContentType = 
  | 'map' 
  | 'state' 
  | 'county' 
  | 'property' 
  | 'filter' 
  | 'stats' 
  | string;

export interface PanelRegistryOptions {
  enableLazyLoading?: boolean;
  enableCaching?: boolean;
  debug?: boolean;
}

/**
 * Panel Registry class for managing panel component registration and retrieval
 */
class PanelRegistry {
  // Store for registered components
  private components: Record<string, React.ComponentType<any>> = {};
  
  // Lazy loading promises
  private lazyComponents: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {};
  
  // Component cache for lazy loaded components
  private componentCache: Record<string, React.ComponentType<any>> = {};
  
  // Options
  private options: Required<PanelRegistryOptions>;
  
  constructor(options?: PanelRegistryOptions) {
    this.options = {
      enableLazyLoading: options?.enableLazyLoading ?? true,
      enableCaching: options?.enableCaching ?? true,
      debug: options?.debug ?? false
    };
  }
  
  /**
   * Register a panel component
   * 
   * @param contentType - Type identifier for the panel content
   * @param Component - React component to render for this content type
   */
  registerComponent(
    contentType: PanelContentType,
    Component: React.ComponentType<any>
  ): void {
    if (this.components[contentType]) {
      console.warn(`[PanelRegistry] Overwriting existing panel component: ${contentType}`);
    }
    
    this.components[contentType] = Component;
    
    if (this.options.debug) {
      console.log(`[PanelRegistry] Registered component: ${contentType}`);
    }
  }
  
  /**
   * Register a lazy-loaded panel component
   * 
   * @param contentType - Type identifier for the panel content
   * @param importFn - Function that returns import promise
   */
  registerLazyComponent(
    contentType: PanelContentType,
    importFn: () => Promise<{ default: React.ComponentType<any> }>
  ): void {
    if (this.lazyComponents[contentType]) {
      console.warn(`[PanelRegistry] Overwriting existing lazy component: ${contentType}`);
    }
    
    this.lazyComponents[contentType] = importFn;
    
    if (this.options.debug) {
      console.log(`[PanelRegistry] Registered lazy component: ${contentType}`);
    }
  }
  
  /**
   * Get a panel component by type
   * 
   * @param contentType - Type identifier for the panel content
   * @returns React component or null if not found
   */
  async getComponent(
    contentType: PanelContentType
  ): Promise<React.ComponentType<any> | null> {
    // Check regular components first
    if (this.components[contentType]) {
      return this.components[contentType];
    }
    
    // Check cache if enabled
    if (this.options.enableCaching && this.componentCache[contentType]) {
      return this.componentCache[contentType];
    }
    
    // Check lazy components if enabled
    if (this.options.enableLazyLoading && this.lazyComponents[contentType]) {
      try {
        const module = await this.lazyComponents[contentType]();
        const Component = module.default;
        
        // Cache the component if caching is enabled
        if (this.options.enableCaching) {
          this.componentCache[contentType] = Component;
        }
        
        if (this.options.debug) {
          console.log(`[PanelRegistry] Lazy loaded component: ${contentType}`);
        }
        
        return Component;
      } catch (error) {
        console.error(`[PanelRegistry] Error lazy loading component: ${contentType}`, error);
        return null;
      }
    }
    
    // Not found
    if (this.options.debug) {
      console.warn(`[PanelRegistry] Component not found: ${contentType}`);
    }
    
    return null;
  }
  
  /**
   * Get a panel component synchronously (no lazy loading)
   * 
   * @param contentType - Type identifier for the panel content
   * @returns React component or null if not found
   */
  getComponentSync(
    contentType: PanelContentType
  ): React.ComponentType<any> | null {
    // Check regular components first
    if (this.components[contentType]) {
      return this.components[contentType];
    }
    
    // Check cache if enabled
    if (this.options.enableCaching && this.componentCache[contentType]) {
      return this.componentCache[contentType];
    }
    
    // Not found
    if (this.options.debug) {
      console.warn(`[PanelRegistry] Component not found synchronously: ${contentType}`);
    }
    
    return null;
  }
  
  /**
   * Check if a component is registered (either directly or lazy)
   * 
   * @param contentType - Type identifier for the panel content
   * @returns boolean indicating if component is registered
   */
  hasComponent(contentType: PanelContentType): boolean {
    return (
      !!this.components[contentType] ||
      !!this.componentCache[contentType] ||
      !!this.lazyComponents[contentType]
    );
  }
  
  /**
   * Get all registered content types
   * 
   * @returns Array of registered content types
   */
  getRegisteredContentTypes(): PanelContentType[] {
    const directTypes = Object.keys(this.components);
    const lazyTypes = Object.keys(this.lazyComponents);
    const cachedTypes = Object.keys(this.componentCache);
    
    // Combine all types, removing duplicates
    return Array.from(new Set([...directTypes, ...lazyTypes, ...cachedTypes])) as PanelContentType[];
  }
  
  /**
   * Clear component cache
   */
  clearCache(): void {
    this.componentCache = {};
    
    if (this.options.debug) {
      console.log(`[PanelRegistry] Component cache cleared`);
    }
  }
  
  /**
   * Clear all registered components and cache
   */
  clear(): void {
    this.components = {};
    this.lazyComponents = {};
    this.componentCache = {};
    
    if (this.options.debug) {
      console.log(`[PanelRegistry] Registry cleared`);
    }
  }
}

// Create singleton instance
const panelRegistry = new PanelRegistry();

// Export instance and class
export { panelRegistry, PanelRegistry };
```

### 4.2 Panel Registry Initialization

Create an initialization function for the panel registry:

```bash
# Create or open the file
touch src/services/panelRegistryInit.ts
```

Implement the following in `panelRegistryInit.ts`:

```typescript
// client/src/services/panelRegistryInit.ts
import { panelRegistry } from './PanelRegistry';

/**
 * Initialize the content registry with default components
 */
export function initializePanelRegistry(): void {
  // Register lazy-loaded components
  panelRegistry.registerLazyComponent('map', () => 
    import('../components/multiframe/panels/MapPanel').then(
      module => ({ default: module.MapPanel })
    )
  );
  
  panelRegistry.registerLazyComponent('state', () => 
    import('../components/multiframe/panels/StatePanel').then(
      module => ({ default: module.StatePanel })
    )
  );
  
  panelRegistry.registerLazyComponent('county', () => 
    import('../components/multiframe/panels/CountyPanel').then(
      module => ({ default: module.CountyPanel })
    )
  );
  
  panelRegistry.registerLazyComponent('property', () => 
    import('../components/multiframe/panels/PropertyPanel').then(
      module => ({ default: module.PropertyPanel })
    )
  );
  
  panelRegistry.registerLazyComponent('filter', () => 
    import('../components/multiframe/panels/FilterPanel').then(
      module => ({ default: module.FilterPanel })
    )
  );
  
  panelRegistry.registerLazyComponent('stats', () => 
    import('../components/multiframe/panels/StatsPanel').then(
      module => ({ default: module.StatsPanel })
    )
  );
}

/**
 * Panel registry hook for components
 */
export async function getPanelComponent(contentType: string): Promise<React.ComponentType<any> | null> {
  return panelRegistry.getComponent(contentType);
}

/**
 * Synchronous version of getPanelComponent
 */
export function getPanelComponentSync(contentType: string): React.ComponentType<any> | null {
  return panelRegistry.getComponentSync(contentType);
}
```

## 🔖 Section 5: Panel Component Implementation

### 5.1 CountyPanel Implementation

Create an enhanced version of the CountyPanel component:

```bash
# Create or open the file
mkdir -p src/components/multiframe/panels
touch src/components/multiframe/panels/CountyPanel.tsx
```

Implement the following in `CountyPanel.tsx`:

```typescript
// client/src/components/multiframe/panels/CountyPanel.tsx
import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { useEntityData } from '../../../hooks/useEntityData';
import { useLoadingState } from '../../../hooks/useLoadingState';
import { useLayoutContext } from '../../../hooks/useLayoutContext';
import './CountyPanel.css';

interface CountyData {
  id: string;
  name: string;
  state: string;
  stateId: string;
  population: number;
  properties: number;
  lastUpdated: string;
  propertyTypes: {
    type: string;
    count: number;
  }[];
}

export interface CountyPanelProps {
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
  // Panel sync hook
  const { subscribeToType, broadcastTyped } = usePanelSync({
    panelId,
    debug: false
  });
  
  // Layout context for panel registration
  const { updatePanel } = useLayoutContext({
    panelId,
    autoRegister: true,
    panelConfig: {
      contentType: 'county',
      title: initialState.title || 'County View'
    }
  });
  
  // Loading state
  const {
    isLoading: loading,
    error,
    setLoading,
    setError,
    withLoading
  } = useLoadingState();
  
  // Entity data hook
  const {
    entity: county,
    selectEntity,
    updateEntity
  } = useEntityData({
    panelId,
    autoSync: true,
    syncTypes: ['county'],
    loadEntity: async (id, type) => {
      if (type !== 'county') return null;
      
      // Mock function to load county data
      return new Promise<CountyData | null>((resolve) => {
        setTimeout(() => {
          // Mock data
          const countyData: CountyData = {
            id,
            name: id,
            state: initialState.stateId || 'Unknown',
            stateId: initialState.stateId || 'Unknown',
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
          
          resolve(countyData);
        }, 500);
      });
    }
  });
  
  // Subscribe to state selection events
  useEffect(() => {
    const unsubscribe = subscribeToType('select', (event) => {
      if (event.payload?.entityType === 'county') {
        // Load county data
        selectEntity(
          event.payload.entityId,
          'county',
          { 
            parentId: event.payload.properties?.stateId,
            parentType: 'state'
          }
        );
      }
      
      if (event.payload?.entityType === 'state') {
        // Update panel title to reflect state
        updatePanel({
          title: `Counties in ${event.payload.entityName || event.payload.entityId}`
        });
        
        // Clear county selection when state changes
        if (county && county.stateId !== event.payload.entityId) {
          // TODO: Load counties for the selected state
        }
      }
    });
    
    return unsubscribe;
  }, [county, selectEntity, subscribeToType, updatePanel]);
  
  // Load initial county if provided
  useEffect(() => {
    if (initialState.countyId && initialState.stateId) {
      selectEntity(
        initialState.countyId,
        'county',
        { 
          parentId: initialState.stateId,
          parentType: 'state'
        }
      );
    }
  }, [initialState.countyId, initialState.stateId, selectEntity]);
  
  // Update parent component with state changes
  useEffect(() => {
    if (county && onStateChange) {
      onStateChange({
        countyId: county.id,
        stateId: county.stateId,
        countyData: county
      });
    }
  }, [county, onStateChange]);
  
  // Handle property type selection
  const handlePropertyTypeSelect = (propertyType: string) => {
    if (!county) return;
    
    // Broadcast filter event to other panels
    broadcastTyped('filter', {
      propertyType,
      county: county.name,
      countyId: county.id,
      state: county.state,
      stateId: county.stateId
    });
    
    // Notify parent
    if (onAction) {
      onAction({
        type: 'filter',
        payload: {
          propertyType,
          county: county.name,
          countyId: county.id,
          state: county.state,
          stateId: county.stateId
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
      return <div className="county-error">{error.message}</div>;
    }
    
    if (!county) {
      return <div className="county-empty">Select a county to view data</div>;
    }
    
    return (
      <div className="county-data" data-testid="county-data">
        <h3 className="county-name" data-testid="county-name">
          {county.name} County, {county.state}
        </h3>
        
        <div className="county-info">
          <div className="info-item">
            <span className="info-label">Population:</span>
            <span className="info-value" data-testid="county-population">
              {county.population.toLocaleString()}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Properties:</span>
            <span className="info-value" data-testid="county-properties">
              {county.properties.toLocaleString()}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value" data-testid="county-last-updated">
              {county.lastUpdated}
            </span>
          </div>
        </div>
        
        <div className="county-property-types">
          <h4>Property Types</h4>
          <div className="property-type-list" data-testid="property-type-list">
            {county.propertyTypes.map((type) => (
              <div 
                key={type.type}
                className="property-type-item"
                onClick={() => handlePropertyTypeSelect(type.type)}
                data-testid={`property-type-${type.type}`}
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

### 5.2 CountyPanel CSS

Create the CSS for the CountyPanel component:

```bash
# Create or open the file
touch src/components/multiframe/panels/CountyPanel.css
```

Implement the following in `CountyPanel.css`:

```css
/* client/src/components/multiframe/panels/CountyPanel.css */
.county-panel {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
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
  text-align: center;
  padding: 2rem;
}

.county-error {
  color: var(--error-color, #f44336);
}

.county-data {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.county-name {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color, #2196f3);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color-light, #eee);
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
  align-items: center;
  padding: 0.25rem 0;
}

.info-label {
  font-weight: 500;
  color: var(--text-muted, #777);
}

.info-value {
  font-weight: 600;
}

.county-property-types {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.county-property-types h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted, #777);
}

.property-type-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.property-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: var(--panel-bg-light, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--border-color-light, #eee);
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.property-type-item:hover {
  background-color: var(--hover-bg-color, #e3f2fd);
  transform: translateY(-1px);
}

.property-type-item:active {
  transform: translateY(0);
}

.property-type-name {
  font-weight: 500;
}

.property-type-count {
  font-weight: 600;
  color: var(--primary-color, #2196f3);
  background-color: rgba(33, 150, 243, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .county-panel {
    padding: 0.5rem;
  }
  
  .county-name {
    font-size: 1.1rem;
  }
  
  .info-item {
    font-size: 0.9rem;
  }
}
```

## 🔖 Section 6: Testing Framework

### 6.1 PanelSyncContext Tests

Create tests for the PanelSyncContext:

```bash
# Create or open the file
mkdir -p src/__tests__/context
touch src/__tests__/context/PanelSyncContext.test.tsx
```

Implement the following in `PanelSyncContext.test.tsx`:

```typescript
// client/src/__tests__/context/PanelSyncContext.test.tsx
import React, { useEffect } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PanelSyncProvider, PanelSyncContext, PanelSyncEvent } from '../../../src/context/PanelSyncContext';

// Mock callback component
const TestCallback = ({ onEvent, testId }: { onEvent: (event: PanelSyncEvent) => void, testId: string }) => {
  const context = React.useContext(PanelSyncContext);
  
  useEffect(() => {
    if (!context) return;
    return context.subscribe(onEvent);
  }, [context, onEvent]);
  
  return <div data-testid={testId}>Test Callback</div>;
};

// Broadcast component
const TestBroadcaster = ({ eventData, testId }: { eventData: Omit<PanelSyncEvent, 'timestamp' | 'sequenceId'>, testId: string }) => {
  const context = React.useContext(PanelSyncContext);
  
  const handleClick = () => {
    if (context) {
      context.broadcast(eventData);
    }
  };
  
  return (
    <button data-testid={testId} onClick={handleClick}>
      Broadcast Event
    </button>
  );
};

describe('PanelSyncContext', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Clear timeouts
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('broadcasts events to subscribers', async () => {
    const mockCallback = vi.fn();
    
    render(
      <PanelSyncProvider>
        <TestCallback onEvent={mockCallback} testId="callback" />
        <TestBroadcaster 
          eventData={{ type: 'test', payload: { value: 'test-value' }, source: 'test-source' }}
          testId="broadcaster"
        />
      </PanelSyncProvider>
    );
    
    // Verify components rendered
    expect(screen.getByTestId('callback')).toBeInTheDocument();
    expect(screen.getByTestId('broadcaster')).toBeInTheDocument();
    
    // Click broadcast button to send event
    fireEvent.click(screen.getByTestId('broadcaster'));
    
    // Allow any timeouts to execute
    vi.runAllTimers();
    
    // Verify callback was called with event
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback.mock.calls[0][0].type).toBe('test');
    expect(mockCallback.mock.calls[0][0].payload).toEqual({ value: 'test-value' });
    expect(mockCallback.mock.calls[0][0].source).toBe('test-source');
    expect(mockCallback.mock.calls[0][0].timestamp).toBeDefined();
    expect(mockCallback.mock.calls[0][0].sequenceId).toBeDefined();
  });
  
  it('unsubscribes correctly', async () => {
    const mockCallback = vi.fn();
    
    const TestUnsubscriber = () => {
      const context = React.useContext(PanelSyncContext);
      const [subscribed, setSubscribed] = React.useState(true);
      
      useEffect(() => {
        if (!context || !subscribed) return;
        const unsubscribe = context.subscribe(mockCallback);
        return unsubscribe;
      }, [context, subscribed, mockCallback]);
      
      return (
        <div>
          <button 
            data-testid="unsubscribe-button" 
            onClick={() => setSubscribed(false)}
          >
            Unsubscribe
          </button>
          {subscribed ? 'Subscribed' : 'Unsubscribed'}
        </div>
      );
    };
    
    render(
      <PanelSyncProvider>
        <TestUnsubscriber />
        <TestBroadcaster 
          eventData={{ type: 'test', payload: { value: 'test-value' }, source: 'test-source' }}
          testId="broadcaster"
        />
      </PanelSyncProvider>
    );
    
    // First broadcast - should be received
    fireEvent.click(screen.getByTestId('broadcaster'));
    vi.runAllTimers();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // Unsubscribe
    fireEvent.click(screen.getByTestId('unsubscribe-button'));
    
    // Reset mock to clear previous call
    mockCallback.mockReset();
    
    // Second broadcast - should not be received
    fireEvent.click(screen.getByTestId('broadcaster'));
    vi.runAllTimers();
    
    // Callback should not be called
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  it('handles error in subscriber without breaking', async () => {
    const mockCallback1 = vi.fn().mockImplementation(() => {
      throw new Error('Test error in subscriber');
    });
    
    const mockCallback2 = vi.fn();
    
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <PanelSyncProvider>
        <TestCallback onEvent={mockCallback1} testId="callback1" />
        <TestCallback onEvent={mockCallback2} testId="callback2" />
        <TestBroadcaster 
          eventData={{ type: 'test', payload: { value: 'test-value' }, source: 'test-source' }}
          testId="broadcaster"
        />
      </PanelSyncProvider>
    );
    
    // Broadcast event
    fireEvent.click(screen.getByTestId('broadcaster'));
    vi.runAllTimers();
    
    // First callback should have been called and errored
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain('Error in panel sync listener');
    
    // Second callback should still be called despite error in first
    expect(mockCallback2).toHaveBeenCalledTimes(1);
    
    errorSpy.mockRestore();
  });
  
  it('maintains proper event order with priorities', async () => {
    const mockCallback = vi.fn();
    const events: PanelSyncEvent[] = [];
    
    // Component that broadcasts multiple events with different priorities
    const PriorityBroadcaster = () => {
      const context = React.useContext(PanelSyncContext);
      
      const broadcastEvents = () => {
        if (!context) return;
        
        // Low priority event
        context.broadcast({
          type: 'low',
          payload: { priority: 'low' },
          source: 'test',
          priority: 'low'
        });
        
        // Normal priority event (default)
        context.broadcast({
          type: 'normal',
          payload: { priority: 'normal' },
          source: 'test'
        });
        
        // High priority event
        context.broadcast({
          type: 'high',
          payload: { priority: 'high' },
          source: 'test',
          priority: 'high'
        });
      };
      
      return (
        <button data-testid="priority-broadcaster" onClick={broadcastEvents}>
          Broadcast Priority Events
        </button>
      );
    };
    
    // Collect events in order
    const collectEvent = (event: PanelSyncEvent) => {
      mockCallback(event);
      events.push(event);
    };
    
    render(
      <PanelSyncProvider>
        <TestCallback onEvent={collectEvent} testId="callback" />
        <PriorityBroadcaster />
      </PanelSyncProvider>
    );
    
    // Broadcast events
    fireEvent.click(screen.getByTestId('priority-broadcaster'));
    
    // Process all queued events
    vi.runAllTimers();
    
    // All events should be processed
    expect(mockCallback).toHaveBeenCalledTimes(3);
    
    // Check correct order by priority (high, normal, low)
    expect(events[0].type).toBe('high');
    expect(events[1].type).toBe('normal');
    expect(events[2].type).toBe('low');
  });
  
  it('maintains event history with limit', async () => {
    const historyLimit = 3;
    
    // Component to access event history
    const HistoryAccessor = ({ onHistoryCheck }: { onHistoryCheck: (history: PanelSyncEvent[]) => void }) => {
      const context = React.useContext(PanelSyncContext);
      
      const checkHistory = () => {
        if (context) {
          onHistoryCheck(context.getEventHistory());
        }
      };
      
      return (
        <button data-testid="check-history" onClick={checkHistory}>
          Check History
        </button>
      );
    };
    
    const mockHistoryCheck = vi.fn();
    
    render(
      <PanelSyncProvider historyLimit={historyLimit}>
        <TestBroadcaster 
          eventData={{ type: 'test1', payload: { id: 1 }, source: 'test' }}
          testId="broadcaster1" 
        />
        <TestBroadcaster 
          eventData={{ type: 'test2', payload: { id: 2 }, source: 'test' }}
          testId="broadcaster2" 
        />
        <TestBroadcaster 
          eventData={{ type: 'test3', payload: { id: 3 }, source: 'test' }}
          testId="broadcaster3" 
        />
        <TestBroadcaster 
          eventData={{ type: 'test4', payload: { id: 4 }, source: 'test' }}
          testId="broadcaster4" 
        />
        <HistoryAccessor onHistoryCheck={mockHistoryCheck} />
      </PanelSyncProvider>
    );
    
    // Broadcast events
    fireEvent.click(screen.getByTestId('broadcaster1'));
    vi.runAllTimers();
    
    fireEvent.click(screen.getByTestId('broadcaster2'));
    vi.runAllTimers();
    
    fireEvent.click(screen.getByTestId('broadcaster3'));
    vi.runAllTimers();
    
    // Check history - should have 3 events
    fireEvent.click(screen.getByTestId('check-history'));
    expect(mockHistoryCheck).toHaveBeenCalledTimes(1);
    expect(mockHistoryCheck.mock.calls[0][0].length).toBe(3);
    expect(mockHistoryCheck.mock.calls[0][0][0].type).toBe('test3'); // Most recent first
    expect(mockHistoryCheck.mock.calls[0][0][1].type).toBe('test2');
    expect(mockHistoryCheck.mock.calls[0][0][2].type).toBe('test1');
    
    // Add one more event
    fireEvent.click(screen.getByTestId('broadcaster4'));
    vi.runAllTimers();
    
    // Check history again - should still have 3 events but oldest should be dropped
    mockHistoryCheck.mockReset();
    fireEvent.click(screen.getByTestId('check-history'));
    expect(mockHistoryCheck).toHaveBeenCalledTimes(1);
    expect(mockHistoryCheck.mock.calls[0][0].length).toBe(3);
    expect(mockHistoryCheck.mock.calls[0][0][0].type).toBe('test4');
    expect(mockHistoryCheck.mock.calls[0][0][1].type).toBe('test3');
    expect(mockHistoryCheck.mock.calls[0][0][2].type).toBe('test2');
    // test1 should be dropped
  });
});
```

### 6.2 useEntityData Hook Tests

Create tests for the useEntityData hook:

```bash
# Create or open the file
mkdir -p src/__tests__/hooks
touch src/__tests__/hooks/useEntityData.test.tsx
```

Implement the following in `useEntityData.test.tsx`:

```typescript
// client/src/__tests__/hooks/useEntityData.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEntityData, EntityType } from '../../../src/hooks/useEntityData';
import { PanelSyncProvider } from '../../../src/context/PanelSyncContext';

// Test component using the hook
const TestComponent = ({ 
  panelId, 
  initialEntity = null,
  onEntityLoaded = () => {},
  onError = () => {}
}: { 
  panelId: string,
  initialEntity?: any,
  onEntityLoaded?: (entity: any) => void,
  onError?: (error: Error) => void
}) => {
  const {
    entity,
    loading,
    error,
    fetchEntity,
    updateEntity,
    selectEntity,
    clearEntity
  } = useEntityData({
    panelId,
    initialEntity,
    loadEntity: async (id: string, type: EntityType) => {
      // Mock entity loader
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id === 'error') {
            reject(new Error('Test error loading entity'));
            return;
          }
          
          resolve({
            id,
            type,
            name: `Test ${type} ${id}`,
            properties: { test: true }
          });
        }, 100);
      });
    },
    autoSync: true
  });
  
  // Call callback when entity is loaded
  React.useEffect(() => {
    if (entity && !loading) {
      onEntityLoaded(entity);
    }
  }, [entity, loading, onEntityLoaded]);
  
  // Call callback on error
  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);
  
  return (
    <div>
      <div data-testid="entity-state">
        {loading ? 'Loading...' : entity ? 'Loaded' : 'No entity'}
      </div>
      
      {entity && (
        <div data-testid="entity-data">
          {entity.name} ({entity.type}/{entity.id})
        </div>
      )}
      
      {error && (
        <div data-testid="entity-error">
          {error.message}
        </div>
      )}
      
      <button 
        data-testid="load-county"
        onClick={() => fetchEntity('test-county', 'county')}
      >
        Load County
      </button>
      
      <button 
        data-testid="load-state"
        onClick={() => fetchEntity('test-state', 'state')}
      >
        Load State
      </button>
      
      <button 
        data-testid="select-county"
        onClick={() => selectEntity('test-county', 'county')}
      >
        Select County
      </button>
      
      <button 
        data-testid="update-entity"
        onClick={() => updateEntity({ name: 'Updated Name' })}
      >
        Update Entity
      </button>
      
      <button 
        data-testid="clear-entity"
        onClick={() => clearEntity()}
      >
        Clear Entity
      </button>
      
      <button 
        data-testid="load-error"
        onClick={() => fetchEntity('error', 'county')}
      >
        Load Error
      </button>
    </div>
  );
};

// Component to listen for broadcasted entity events
const EntityListener = ({ 
  panelId,
  onEntityEvent = () => {}
}: {
  panelId: string,
  onEntityEvent: (event: any) => void
}) => {
  useEntityData({
    panelId,
    autoSync: true,
    syncTypes: ['county', 'state'],
    loadEntity: async () => null
  });
  
  return <div data-testid="entity-listener">Listening</div>;
};

describe('useEntityData Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('loads and updates entity data', async () => {
    const mockEntityLoaded = vi.fn();
    
    render(
      <PanelSyncProvider>
        <TestComponent 
          panelId="test-panel" 
          onEntityLoaded={mockEntityLoaded}
        />
      </PanelSyncProvider>
    );
    
    // Initial state
    expect(screen.getByTestId('entity-state')).toHaveTextContent('No entity');
    
    // Load county
    fireEvent.click(screen.getByTestId('load-county'));
    expect(screen.getByTestId('entity-state')).toHaveTextContent('Loading...');
    
    // Advance timers to complete loading
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      expect(screen.getByTestId('entity-state')).toHaveTextContent('Loaded');
    });
    
    // Entity data should be displayed
    expect(screen.getByTestId('entity-data')).toHaveTextContent('Test county test-county');
    
    // Callback should be called
    expect(mockEntityLoaded).toHaveBeenCalledTimes(1);
    expect(mockEntityLoaded.mock.calls[0][0].id).toBe('test-county');
    expect(mockEntityLoaded.mock.calls[0][0].type).toBe('county');
    
    // Update entity
    fireEvent.click(screen.getByTestId('update-entity'));
    
    // Entity should be updated
    await waitFor(() => {
      expect(screen.getByTestId('entity-data')).toHaveTextContent('Updated Name');
    });
    
    // Callback should be called again
    expect(mockEntityLoaded).toHaveBeenCalledTimes(2);
    expect(mockEntityLoaded.mock.calls[1][0].name).toBe('Updated Name');
  });
  
  it('handles errors in entity loading', async () => {
    const mockError = vi.fn();
    
    render(
      <PanelSyncProvider>
        <TestComponent 
          panelId="test-panel" 
          onError={mockError}
        />
      </PanelSyncProvider>
    );
    
    // Load entity with error
    fireEvent.click(screen.getByTestId('load-error'));
    expect(screen.getByTestId('entity-state')).toHaveTextContent('Loading...');
    
    // Advance timers to complete loading
    vi.advanceTimersByTime(200);
    
    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('entity-error')).toHaveTextContent('Test error loading entity');
    });
    
    // Error callback should be called
    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError.mock.calls[0][0].message).toBe('Test error loading entity');
  });
  
  it('broadcasts entity selection to other panels', async () => {
    const mockEntityEvent = vi.fn();
    
    render(
      <PanelSyncProvider>
        <TestComponent panelId="panel1" />
        <EntityListener panelId="panel2" onEntityEvent={mockEntityEvent} />
      </PanelSyncProvider>
    );
    
    // Select county
    fireEvent.click(screen.getByTestId('select-county'));
    expect(screen.getByTestId('entity-state')).toHaveTextContent('Loading...');
    
    // Advance timers to complete loading
    vi.advanceTimersByTime(200);
    
    // Entity should be loaded in TestComponent
    await waitFor(() => {
      expect(screen.getByTestId('entity-data')).toHaveTextContent('Test county test-county');
    });
    
    // TODO: Complete test for checking event broadcast
    // This would require extending EntityListener to capture events
  });
  
  it('clears entity data', async () => {
    render(
      <PanelSyncProvider>
        <TestComponent panelId="test-panel" />
      </PanelSyncProvider>
    );
    
    // Load county
    fireEvent.click(screen.getByTestId('load-county'));
    
    // Advance timers to complete loading
    vi.advanceTimersByTime(200);
    
    await waitFor(() => {
      expect(screen.getByTestId('entity-data')).toBeInTheDocument();
    });
    
    // Clear entity
    fireEvent.click(screen.getByTestId('clear-entity'));
    
    // Entity should be cleared
    await waitFor(() => {
      expect(screen.getByTestId('entity-state')).toHaveTextContent('No entity');
    });
    
    expect(screen.queryByTestId('entity-data')).not.toBeInTheDocument();
  });
});
```

### 6.3 PanelRegistry Tests

Create tests for the PanelRegistry:

```bash
# Create or open the file
mkdir -p src/__tests__/services
touch src/__tests__/services/PanelRegistry.test.ts
```

Implement the following in `PanelRegistry.test.ts`:

```typescript
// client/src/__tests__/services/PanelRegistry.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PanelRegistry } from '../../../src/services/PanelRegistry';
import React from 'react';

describe('PanelRegistry', () => {
  let registry: PanelRegistry;
  
  beforeEach(() => {
    registry = new PanelRegistry({ debug: false });
  });
  
  it('registers and retrieves components synchronously', () => {
    const TestComponent = () => React.createElement('div');
    
    // Register component
    registry.registerComponent('test', TestComponent);
    
    // Retrieve component
    const retrieved = registry.getComponentSync('test');
    
    // Verify component is retrieved
    expect(retrieved).toBe(TestComponent);
  });
  
  it('registers and retrieves lazy components asynchronously', async () => {
    const TestComponent = () => React.createElement('div');
    const importFn = vi.fn().mockResolvedValue({ default: TestComponent });
    
    // Register lazy component
    registry.registerLazyComponent('lazy-test', importFn);
    
    // Sync retrieval should return null
    const syncRetrieved = registry.getComponentSync('lazy-test');
    expect(syncRetrieved).toBeNull();
    
    // Async retrieval should work
    const asyncRetrieved = await registry.getComponent('lazy-test');
    
    // Verify import function was called
    expect(importFn).toHaveBeenCalledTimes(1);
    
    // Verify component is retrieved
    expect(asyncRetrieved).toBe(TestComponent);
  });
  
  it('caches lazy components after first retrieval', async () => {
    const TestComponent = () => React.createElement('div');
    const importFn = vi.fn().mockResolvedValue({ default: TestComponent });
    
    // Register lazy component
    registry.registerLazyComponent('lazy-test', importFn);
    
    // First retrieval
    await registry.getComponent('lazy-test');
    expect(importFn).toHaveBeenCalledTimes(1);
    
    // Reset mock
    importFn.mockClear();
    
    // Second retrieval - should use cache
    await registry.getComponent('lazy-test');
    expect(importFn).not.toHaveBeenCalled();
    
    // Sync retrieval should now work from cache
    const syncRetrieved = registry.getComponentSync('lazy-test');
    expect(syncRetrieved).toBe(TestComponent);
  });
  
  it('can check if components are registered', () => {
    const TestComponent = () => React.createElement('div');
    
    // Initially not registered
    expect(registry.hasComponent('test')).toBe(false);
    
    // Register component
    registry.registerComponent('test', TestComponent);
    
    // Should now be registered
    expect(registry.hasComponent('test')).toBe(true);
    
    // Register lazy component
    registry.registerLazyComponent('lazy-test', () => 
      Promise.resolve({ default: TestComponent })
    );
    
    // Lazy component should also be registered
    expect(registry.hasComponent('lazy-test')).toBe(true);
  });
  
  it('returns all registered content types', async () => {
    const TestComponent = () => React.createElement('div');
    
    // Register components
    registry.registerComponent('test1', TestComponent);
    registry.registerComponent('test2', TestComponent);
    registry.registerLazyComponent('lazy-test', () => 
      Promise.resolve({ default: TestComponent })
    );
    
    // Get registered types
    const types = registry.getRegisteredContentTypes();
    
    // Should include all registered types
    expect(types).toContain('test1');
    expect(types).toContain('test2');
    expect(types).toContain('lazy-test');
    expect(types.length).toBe(3);
  });
  
  it('handles errors in lazy loading', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Register lazy component that throws
    registry.registerLazyComponent('error-test', () => 
      Promise.reject(new Error('Test error'))
    );
    
    // Attempt to retrieve
    const component = await registry.getComponent('error-test');
    
    // Should return null on error
    expect(component).toBeNull();
    
    // Should log error
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain('Error lazy loading component');
    
    errorSpy.mockRestore();
  });
  
  it('clears cache when requested', async () => {
    const TestComponent = () => React.createElement('div');
    const importFn = vi.fn().mockResolvedValue({ default: TestComponent });
    
    // Register and load component
    registry.registerLazyComponent('lazy-test', importFn);
    await registry.getComponent('lazy-test');
    expect(importFn).toHaveBeenCalledTimes(1);
    
    // Clear cache
    registry.clearCache();
    
    // Reset mock
    importFn.mockClear();
    
    // Load again - should call import again
    await registry.getComponent('lazy-test');
    expect(importFn).toHaveBeenCalledTimes(1);
  });
  
  it('clears all components when requested', () => {
    const TestComponent = () => React.createElement('div');
    
    // Register components
    registry.registerComponent('test1', TestComponent);
    registry.registerComponent('test2', TestComponent);
    
    // Verify registration
    expect(registry.hasComponent('test1')).toBe(true);
    expect(registry.hasComponent('test2')).toBe(true);
    
    // Clear registry
    registry.clear();
    
    // Components should be gone
    expect(registry.hasComponent('test1')).toBe(false);
    expect(registry.hasComponent('test2')).toBe(false);
    expect(registry.getRegisteredContentTypes().length).toBe(0);
  });
});
```

### 6.4 Integration Tests

Create integration tests for panel communication:

```bash
# Create or open the file
mkdir -p src/__tests__/integration
touch src/__tests__/integration/PanelCommunication.test.tsx
```

Implement the following in `PanelCommunication.test.tsx`:

```typescript
// client/src/__tests__/integration/PanelCommunication.test.tsx
import React, { useEffect } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PanelSyncProvider } from '../../../src/context/PanelSyncContext';
import { LayoutContextProvider } from '../../../src/context/LayoutContext';
import { usePanelSync } from '../../../src/hooks/usePanelSync';

// Mock panel component that can broadcast events
const MockSenderPanel = ({ 
  panelId, 
  eventType, 
  eventPayload 
}: { 
  panelId: string, 
  eventType: string, 
  eventPayload: any 
}) => {
  const { broadcastTyped } = usePanelSync({ panelId });
  
  const handleClick = () => {
    broadcastTyped(eventType, eventPayload);
  };
  
  return (
    <div data-testid={`panel-${panelId}`} className="mock-panel">
      <h3>{panelId} Panel</h3>
      <button data-testid={`broadcast-${panelId}`} onClick={handleClick}>
        Broadcast {eventType}
      </button>
    </div>
  );
};

// Mock panel component that receives events
const MockReceiverPanel = ({ 
  panelId, 
  listenFor, 
  onReceive 
}: { 
  panelId: string, 
  listenFor: string, 
  onReceive: (payload: any) => void 
}) => {
  const { subscribeToType } = usePanelSync({ panelId });
  const [lastEvent, setLastEvent] = React.useState<any>(null);
  
  useEffect(() => {
    return subscribeToType(listenFor, (event) => {
      setLastEvent(event.payload);
      onReceive(event.payload);
    });
  }, [listenFor, onReceive, subscribeToType]);
  
  return (
    <div data-testid={`panel-${panelId}`} className="mock-panel">
      <h3>{panelId} Panel</h3>
      <div data-testid={`last-event-${panelId}`}>
        {lastEvent ? JSON.stringify(lastEvent) : 'No events'}
      </div>
    </div>
  );
};

// Container to hold multiple panels
const PanelContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="panel-container" data-testid="panel-container">
      {children}
    </div>
  );
};

describe('Panel Communication Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('correctly broadcasts events between panels', async () => {
    const mockReceive = vi.fn();
    
    render(
      <LayoutContextProvider>
        <PanelSyncProvider>
          <PanelContainer>
            <MockSenderPanel 
              panelId="sender" 
              eventType="test-event" 
              eventPayload={{ message: 'Hello from sender!' }}
            />
            <MockReceiverPanel 
              panelId="receiver" 
              listenFor="test-event" 
              onReceive={mockReceive}
            />
          </PanelContainer>
        </PanelSyncProvider>
      </LayoutContextProvider>
    );
    
    // Verify panels are rendered
    expect(screen.getByTestId('panel-sender')).toBeInTheDocument();
    expect(screen.getByTestId('panel-receiver')).toBeInTheDocument();
    
    // Initially no events
    expect(screen.getByTestId('last-event-receiver')).toHaveTextContent('No events');
    
    // Broadcast event
    fireEvent.click(screen.getByTestId('broadcast-sender'));
    
    // Process any timeouts
    vi.runAllTimers();
    
    // Event should be received
    await waitFor(() => {
      expect(mockReceive).toHaveBeenCalledTimes(1);
    });
    
    expect(mockReceive).toHaveBeenCalledWith({ message: 'Hello from sender!' });
    expect(screen.getByTestId('last-event-receiver')).toHaveTextContent('Hello from sender');
  });
  
  it('correctly filters events by type', async () => {
    const mockReceive1 = vi.fn();
    const mockReceive2 = vi.fn();
    
    render(
      <LayoutContextProvider>
        <PanelSyncProvider>
          <PanelContainer>
            <MockSenderPanel 
              panelId="sender" 
              eventType="event-type-1" 
              eventPayload={{ message: 'Event type 1' }}
            />
            <MockReceiverPanel 
              panelId="receiver1" 
              listenFor="event-type-1" 
              onReceive={mockReceive1}
            />
            <MockReceiverPanel 
              panelId="receiver2" 
              listenFor="event-type-2" 
              onReceive={mockReceive2}
            />
          </PanelContainer>
        </PanelSyncProvider>
      </LayoutContextProvider>
    );
    
    // Broadcast event
    fireEvent.click(screen.getByTestId('broadcast-sender'));
    
    // Process any timeouts
    vi.runAllTimers();
    
    // Only receiver1 should receive event
    await waitFor(() => {
      expect(mockReceive1).toHaveBeenCalledTimes(1);
    });
    
    expect(mockReceive1).toHaveBeenCalledWith({ message: 'Event type 1' });
    expect(mockReceive2).not.toHaveBeenCalled();
    
    expect(screen.getByTestId('last-event-receiver1')).toHaveTextContent('Event type 1');
    expect(screen.getByTestId('last-event-receiver2')).toHaveTextContent('No events');
  });
  
  it('does not send events back to the sender', async () => {
    const mockReceive = vi.fn();
    
    // Component that both sends and receives
    const DualPanel = ({ panelId }: { panelId: string }) => {
      const { broadcastTyped, subscribeToType } = usePanelSync({ panelId });
      const [lastEvent, setLastEvent] = React.useState<any>(null);
      const [broadcastCount, setBroadcastCount] = React.useState(0);
      
      useEffect(() => {
        return subscribeToType('dual-event', (event) => {
          setLastEvent(event.payload);
          mockReceive(event.payload);
        });
      }, [subscribeToType]);
      

      const handleBroadcast = () => {
        setBroadcastCount(prev => prev + 1);
        broadcastTyped('dual-event', { 
          message: `Broadcast ${broadcastCount + 1} from ${panelId}` 
        });
      };
      
      return (
        <div data-testid={`panel-${panelId}`} className="mock-panel">
          <h3>{panelId} Panel</h3>
          <button data-testid={`broadcast-${panelId}`} onClick={handleBroadcast}>
            Broadcast Event
          </button>
          <div data-testid={`last-event-${panelId}`}>
            {lastEvent ? JSON.stringify(lastEvent) : 'No events'}
          </div>
        </div>
      );
    };
    
    render(
      <LayoutContextProvider>
        <PanelSyncProvider>
          <PanelContainer>
            <DualPanel panelId="panel1" />
            <DualPanel panelId="panel2" />
          </PanelContainer>
        </PanelSyncProvider>
      </LayoutContextProvider>
    );
    
    // Broadcast from panel1
    fireEvent.click(screen.getByTestId('broadcast-panel1'));
    
    // Process any timeouts
    vi.runAllTimers();
    
    // panel2 should receive the event
    await waitFor(() => {
      expect(mockReceive).toHaveBeenCalledTimes(1);
    });
    
    // panel1 should not receive its own event
    expect(screen.getByTestId('last-event-panel1')).toHaveTextContent('No events');
    
    // panel2 should have received the event
    expect(screen.getByTestId('last-event-panel2')).toHaveTextContent('Broadcast 1 from panel1');
    
    // Reset mock
    mockReceive.mockReset();
    
    // Broadcast from panel2
    fireEvent.click(screen.getByTestId('broadcast-panel2'));
    
    // Process any timeouts
    vi.runAllTimers();
    
    // panel1 should receive the event
    await waitFor(() => {
      expect(mockReceive).toHaveBeenCalledTimes(1);
    });
    
    // panel2 should not receive its own event
    expect(screen.getByTestId('last-event-panel2')).toHaveTextContent('Broadcast 1 from panel1');
    
    // panel1 should have received the event
    expect(screen.getByTestId('last-event-panel1')).toHaveTextContent('Broadcast 1 from panel2');
  });
});
```

## 🔖 Section 7: Documentation Requirements

### 7.1 useEntityData Hook Documentation

Create documentation for the useEntityData hook:

```bash
# Create or open the documentation file
mkdir -p docs/hooks
touch docs/hooks/useEntityData.md
```

Add the following to `useEntityData.md`:

```markdown
# useEntityData Hook

## Overview

The `useEntityData` hook provides a mechanism for loading, managing, and synchronizing entity data between panels. It integrates with the panel communication system to allow panels to share entity state changes such as selections and updates.

## Features

- Load entity data by ID and type
- Update entity properties
- Broadcast entity selections and updates to other panels
- Subscribe to entity events from other panels
- Handle loading states and errors
- Automatically sync entities between panels

## Installation

The hook is part of the panel communication system and requires the `PanelSyncProvider` to be available in the component tree.

## Usage

```tsx
import { useEntityData } from '../hooks/useEntityData';

function CountyPanel({ panelId }) {
  const {
    entity,          // The currently loaded entity
    loading,         // Loading state
    error,           // Error state
    fetchEntity,     // Function to load an entity
    updateEntity,    // Function to update the entity
    selectEntity,    // Function to load and broadcast an entity
    clearEntity      // Function to clear the current entity
  } = useEntityData({
    panelId,
    autoSync: true,
    syncTypes: ['county'],
    loadEntity: async (id, type) => {
      // Load entity data from API or other source
      const response = await api.getEntity(id, type);
      return response.data;
    }
  });

  // Handle entity selection
  const handleSelect = (id) => {
    selectEntity(id, 'county');
  };

  // Render component
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {entity && (
        <div>
          <h2>{entity.name}</h2>
          <button onClick={() => updateEntity({ active: true })}>
            Mark Active
          </button>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### Hook Parameters

The `useEntityData` hook accepts an options object with the following properties:

```tsx
interface EntityDataOptions {
  panelId: string;                      // Required: ID of the panel
  initialEntity?: Entity | null;        // Optional: Initial entity to use
  loadEntity?: (                        // Optional: Function to load entity data
    id: string, 
    type: EntityType
  ) => Promise<Entity | null>;
  autoSync?: boolean;                   // Optional: Auto-sync with other panels
  syncTypes?: EntityType[];             // Optional: Entity types to sync
  debug?: boolean;                      // Optional: Enable debug logging
}
```

### Return Values

The hook returns an object with the following properties:

```tsx
interface EntityDataReturn {
  entity: Entity | null;                // Current entity data
  loading: boolean;                     // Loading state
  error: Error | null;                  // Error state
  fetchEntity: (                        // Function to load an entity
    id: string, 
    type: EntityType,
    options?: {
      silent?: boolean;
      parentId?: string;
      parentType?: EntityType;
    }
  ) => Promise<Entity | null>;
  updateEntity: (                       // Function to update entity data
    updates: Partial<Entity>
  ) => void;
  selectEntity: (                       // Function to load and broadcast
    id: string, 
    type: EntityType,
    options?: {
      silent?: boolean;
      parentId?: string;
      parentType?: EntityType;
    }
  ) => Promise<Entity | null>;
  clearEntity: () => void;              // Function to clear entity data
}
```

### Entity Type

The entity data type is defined as:

```tsx
interface Entity {
  id: string;                          // Unique identifier
  type: EntityType;                    // Entity type
  name: string;                        // Display name
  properties?: Record<string, any>;    // Entity properties
  parent?: {                          // Parent entity reference
    id: string; 
    type: EntityType;
  };
  children?: Array<{                  // Child entity references
    id: string; 
    type: EntityType;
  }>;
  lastUpdated?: number;               // Timestamp
}
```

Where `EntityType` is:

```tsx
type EntityType = 'state' | 'county' | 'property' | 'filter';
```

## Event Types

The hook broadcasts and listens for the following event types:

- `entity_selected_[type]`: Broadcast when an entity is selected
- `entity_updated_[type]`: Broadcast when an entity is updated

Where `[type]` is the entity type (e.g., `entity_selected_county`).

## Integration with Panel Sync System

The hook integrates with the panel communication system by:

1. Using the `usePanelSync` hook to subscribe to and broadcast events
2. Broadcasting entity selections and updates to other panels
3. Listening for entity events from other panels
4. Updating local entity state based on events

## Example: Syncing Entity Selection Between Panels

```tsx
// Panel 1
const MapPanel = ({ panelId }) => {
  const { selectEntity } = useEntityData({
    panelId,
    syncTypes: ['county']
  });

  const handleMapClick = (countyId) => {
    // This will load the county and broadcast to other panels
    selectEntity(countyId, 'county');
  };
  
  return <Map onCountyClick={handleMapClick} />;
};

// Panel 2
const CountyPanel = ({ panelId }) => {
  const { entity } = useEntityData({
    panelId,
    syncTypes: ['county']
  });
  
  // This panel will automatically receive the county
  // selected in the MapPanel
  return entity ? <CountyDetails county={entity} /> : <div>Select a county</div>;
};
```

## Best Practices

1. **Always provide a panelId**: Required for proper event source tracking
2. **Limit sync types**: Only sync the entity types relevant to your panel
3. **Handle loading and error states**: Always check loading and error states before using entity data
4. **Provide a loadEntity function**: Implement this to load entity data when needed
5. **Use silent options for internal updates**: Use the `silent` option to avoid showing loading indicators for background updates

## Additional Notes

- The hook automatically cleans up subscriptions when the component unmounts
- Events from the same panel (same panelId) are ignored to prevent feedback loops
- The hook batches updates to avoid performance issues with rapid changes
```

### 7.2 Panel Communication System Documentation

Create documentation for the panel communication system:

```bash
# Create or open the documentation file
mkdir -p docs/architecture
touch docs/architecture/panel-communication.md
```

Add the following to `panel-communication.md`:

```markdown
# Panel Communication System

## Architecture Overview

The panel communication system enables synchronization and data sharing between different panel components in the multi-frame layout. It provides a publish-subscribe pattern for panels to broadcast and receive events, along with a registry for dynamically loading panel content.

The system consists of several key components:

1. **PanelSyncContext**: Manages event broadcasting and subscription
2. **LayoutContext**: Handles panel registration and layout configuration
3. **PanelRegistry**: Provides dynamic component loading and registration
4. **Custom Hooks**: Simplifies interaction with the communication system

## Component Breakdown

### PanelSyncContext

The `PanelSyncContext` provides the core event broadcasting and subscription functionality:

- **Event Broadcasting**: Panels can broadcast events to all other panels
- **Event Subscription**: Panels can subscribe to events from other panels
- **Event Prioritization**: Events can be prioritized (high, normal, low)
- **Error Handling**: Errors in event handlers are isolated and logged
- **Event History**: Maintains a history of recent events for debugging

```tsx
// Example: Broadcasting an event
const { broadcast } = usePanelSync();

broadcast({
  type: 'select',
  payload: { entityId: 'county-123', entityType: 'county' },
  source: 'map-panel'
});
```

### LayoutContext

The `LayoutContext` manages the layout configuration and panel registration:

- **Panel Registration**: Panels register themselves with the layout
- **Layout Configuration**: Maintains the current layout type and panel arrangement
- **Layout Persistence**: Saves and loads layout configurations
- **Panel Updates**: Allows panels to update their configuration

```tsx
// Example: Registering a panel
const { registerPanel } = useLayoutContext();

registerPanel('map-panel', {
  id: 'map-panel',
  contentType: 'map',
  title: 'Map View',
  position: { row: 0, col: 0 },
  size: { width: 2, height: 1 }
});
```

### PanelRegistry

The `PanelRegistry` manages panel component registration and retrieval:

- **Component Registration**: Register panel component implementations
- **Lazy Loading**: Support for lazily loading panel components
- **Component Caching**: Caches loaded components for performance
- **Type Safety**: Ensures components match expected interfaces

```tsx
// Example: Registering a component
import { panelRegistry } from 'services/PanelRegistry';

panelRegistry.registerComponent('county', CountyPanel);

// Example: Lazy registration
panelRegistry.registerLazyComponent('map', () => 
  import('./MapPanel').then(module => ({ default: module.MapPanel }))
);
```

## Event Flow Diagram

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
       │  3. Queue and process event            
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

## Custom Hooks

The system provides several custom hooks to simplify interaction with the communication system:

### usePanelSync

Provides simplified access to the PanelSyncContext with enhanced features:

- Type filtering: Subscribe to specific event types
- Source tracking: Identify the source panel
- Typed broadcast: Type-safe event broadcasting

```tsx
const { 
  subscribeToType,
  broadcastTyped 
} = usePanelSync({ panelId: 'county-panel' });

// Subscribe to specific event type
useEffect(() => {
  return subscribeToType('select', (event) => {
    if (event.payload.entityType === 'county') {
      // Handle county selection
    }
  });
}, [subscribeToType]);

// Broadcast typed event
broadcastTyped('filter', { 
  propertyType: 'residential',
  countyId: 'county-123'
});
```

### useLayoutContext

Provides simplified access to the LayoutContext with enhanced features:

- Auto-registration: Automatically register panels
- Panel updates: Simplified panel config updates
- Panel config access: Easy access to panel configuration

```tsx
const {
  updatePanel,
  getPanelConfig
} = useLayoutContext({
  panelId: 'county-panel',
  autoRegister: true,
  panelConfig: {
    contentType: 'county',
    title: 'County View'
  }
});

// Update panel title
updatePanel({ title: 'Counties in California' });

// Get current panel config
const config = getPanelConfig();
```

### useEntityData

Provides data management for entities with synchronization:

- Entity loading: Load entity data by ID and type
- Entity updates: Update entity properties
- Entity selection: Select entities and broadcast to other panels
- Auto-sync: Automatically sync entity data between panels

```tsx
const {
  entity,
  loading,
  selectEntity
} = useEntityData({
  panelId: 'map-panel',
  syncTypes: ['county', 'state'],
  loadEntity: async (id, type) => {
    // Load entity data
    return api.getEntity(id, type);
  }
});

// Select and broadcast entity
selectEntity('county-123', 'county');
```

## Implementation Details

### Event Handling and Race Conditions

The system uses an event queue with priority sorting to handle race conditions:

1. Events are added to a queue with a sequence ID and timestamp
2. Events are processed in order of priority and sequence
3. A single event is processed at a time to prevent race conditions
4. Error handling ensures one subscriber cannot break the entire system

### Memory Management

The system includes safeguards against memory leaks:

1. All subscriptions return cleanup functions
2. Subscriptions are tracked with unique IDs
3. The `useEffect` cleanup functions properly unsubscribe
4. Inactive subscriptions are filtered out during broadcasting

### Component Loading Strategies

The PanelRegistry supports multiple loading strategies:

1. **Direct Registration**: Components are registered directly
2. **Lazy Loading**: Components are loaded on demand
3. **Caching**: Loaded components are cached for performance
4. **Error Handling**: Failed loads are handled gracefully

## Testing

The system includes comprehensive testing:

1. **Unit Tests**: Test individual components and hooks
2. **Integration Tests**: Test interaction between components
3. **Memory Tests**: Verify no memory leaks occur
4. **Race Condition Tests**: Verify event ordering is maintained
5. **Error Handling Tests**: Verify errors are contained

## Performance Considerations

1. **Event Batching**: Events are batched to reduce render cycles
2. **Component Caching**: Loaded components are cached
3. **Subscription Filtering**: Events are filtered by type and source
4. **Lazy Loading**: Components are loaded only when needed
5. **Memory Management**: Subscriptions are properly cleaned up
```

## 🔖 Section 8: Validation Checklist

Create a validation checklist for the implementation:

```bash
# Create or open the validation checklist file
mkdir -p docs/validation
touch docs/validation/chunk2-validation-checklist.md
```

Add the following to `chunk2-validation-checklist.md`:

```markdown
# Chunk 2: Panel Communication & Content Registry - Validation Checklist

## Core Implementation Validation

### PanelSyncContext
- [ ] Implementation includes proper event broadcasting
- [ ] Implementation includes proper event subscription
- [ ] Implementation includes error handling for subscribers
- [ ] Implementation includes event prioritization
- [ ] Implementation includes event history tracking
- [ ] Implementation handles race conditions correctly
- [ ] Implementation cleans up subscriptions properly
- [ ] Unit tests pass for all functionality

### LayoutContext
- [ ] Implementation includes panel registration
- [ ] Implementation includes panel configuration updates
- [ ] Implementation includes layout type management
- [ ] Implementation includes layout persistence
- [ ] Implementation validates panel configurations
- [ ] Unit tests pass for all functionality

### PanelRegistry
- [ ] Implementation includes component registration
- [ ] Implementation includes lazy component loading
- [ ] Implementation includes component caching
- [ ] Implementation handles errors in lazy loading
- [ ] Unit tests pass for all functionality

### Custom Hooks
- [ ] usePanelSync implementation is complete
- [ ] useLayoutContext implementation is complete
- [ ] useEntityData implementation is complete
- [ ] Hook cleanup functions work correctly
- [ ] Unit tests pass for all hooks

### Panel Components
- [ ] CountyPanel implementation is complete
- [ ] CountyPanel correctly uses panel communication
- [ ] CountyPanel correctly uses entity data
- [ ] CountyPanel styling is complete
- [ ] Unit tests pass for CountyPanel

## Integration Validation

- [ ] Panels can communicate via events
- [ ] Events are correctly broadcasted and received
- [ ] Event types are correctly filtered
- [ ] Entity data is correctly synchronized
- [ ] Panel registry correctly loads components
- [ ] Integration tests pass for all functionality

## Documentation Validation

- [ ] useEntityData hook documentation is complete
- [ ] Panel communication system documentation is complete
- [ ] Code comments are comprehensive
- [ ] Event flow diagram is accurate
- [ ] API reference is complete

## Performance Validation

- [ ] Event broadcasting has acceptable performance
- [ ] Component loading has acceptable performance
- [ ] Memory usage is acceptable
- [ ] No memory leaks are detected
- [ ] Event handling does not cause unnecessary renders

## Error Handling Validation

- [ ] Errors in subscribers are properly contained
- [ ] Errors in lazy loading are properly handled
- [ ] Errors in entity loading are properly handled
- [ ] Error messages are clear and actionable
- [ ] Error states are properly displayed in UI

## Browser Compatibility

- [ ] Implementation works in Chrome
- [ ] Implementation works in Firefox
- [ ] Implementation works in Safari
- [ ] Implementation works in Edge

## Accessibility

- [ ] Components are properly labeled
- [ ] Keyboard navigation works correctly
- [ ] Focus management is appropriate
- [ ] Color contrast is sufficient
- [ ] Screen reader compatibility is verified

## Final Verification

- [ ] All tests pass
- [ ] Code quality checks pass
- [ ] Documentation is complete
- [ ] PR approval received
- [ ] Demo successful
```

## 📋 Example MongoDB Schema Changes

Create a MongoDB schema definition for the panel layout configurations:

```bash
# Create or open the MongoDB schema file
mkdir -p docs/schemas
touch docs/schemas/layout-config-schema.md
```

Add the following to `layout-config-schema.md`:

```markdown
# MongoDB Schema - Panel Layout Configurations

## Overview

This schema defines the structure for storing panel layout configurations in MongoDB. The schema supports saving user-specific or global layout configurations that can be loaded later.

## Schema Definition

```javascript
const LayoutConfigSchema = new mongoose.Schema({
  // Unique identifier for the layout configuration
  layoutId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User ID if this is a user-specific layout
  userId: {
    type: String,
    index: true,
    sparse: true  // Index is sparse because not all layouts are user-specific
  },
  
  // Is this a global layout template?
  isGlobal: {
    type: Boolean,
    default: false
  },
  
  // Display name for the layout
  name: {
    type: String,
    required: true
  },
  
  // Description of the layout
  description: {
    type: String
  },
  
  // Layout type
  layoutType: {
    type: String,
    enum: ['single', 'dual', 'tri', 'quad', 'custom'],
    required: true
  },
  
  // Panel configurations
  panels: {
    type: Map,
    of: {
      // Panel ID
      id: {
        type: String,
        required: true
      },
      
      // Content type
      contentType: {
        type: String,
        required: true
      },
      
      // Panel title
      title: {
        type: String,
        required: true
      },
      
      // Panel position
      position: {
        row: {
          type: Number,
          default: 0
        },
        col: {
          type: Number,
          default: 0
        }
      },
      
      // Panel size
      size: {
        width: {
          type: Number,
          default: 1
        },
        height: {
          type: Number,
          default: 1
        }
      },
      
      // Panel state (stored as JSON)
      state: {
        type: mongoose.Schema.Types.Mixed
      },
      
      // Panel visibility
      visible: {
        type: Boolean,
        default: true
      },
      
      // Panel is minimized
      minimized: {
        type: Boolean,
        default: false
      },
      
      // Panel is maximized
      maximized: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Layout tags for filtering
  tags: {
    type: [String],
    default: []
  },
  
  // Custom configuration (stored as JSON)
  customConfig: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Automatically manage createdAt and updatedAt
});

// Indexes
LayoutConfigSchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true });  // Each user can have uniquely named layouts
LayoutConfigSchema.index({ isGlobal: 1, name: 1 }, { unique: true, sparse: true });  // Global layouts must have unique names
LayoutConfigSchema.index({ tags: 1 });  // Index tags for filtering

// Create the model
const LayoutConfig = mongoose.model('LayoutConfig', LayoutConfigSchema);
```

## Example Document

```javascript
{
  "_id": ObjectId("5f7b5d3e9d3e6a2b7c8b4567"),
  "layoutId": "user_123_county_analysis",
  "userId": "user_123",
  "isGlobal": false,
  "name": "County Analysis Layout",
  "description": "Layout for analyzing county data with map, stats, and property panels",
  "layoutType": "tri",
  "panels": {
    "map-panel": {
      "id": "map-panel",
      "contentType": "map",
      "title": "County Map",
      "position": { "row": 0, "col": 0 },
      "size": { "width": 2, "height": 1 },
      "state": {
        "center": [37.7749, -122.4194],
        "zoom": 6,
        "layers": ["counties", "properties"]
      },
      "visible": true,
      "minimized": false,
      "maximized": false
    },
    "county-panel": {
      "id": "county-panel",
      "contentType": "county",
      "title": "County Details",
      "position": { "row": 0, "col": 2 },
      "size": { "width": 1, "height": 1 },
      "state": {
        "selectedCounty": "06075"
      },
      "visible": true,
      "minimized": false,
      "maximized": false
    },
    "stats-panel": {
      "id": "stats-panel",
      "contentType": "stats",
      "title": "County Statistics",
      "position": { "row": 1, "col": 0 },
      "size": { "width": 3, "height": 1 },
      "state": {
        "metrics": ["population", "properties", "land_value"],
        "chartType": "bar"
      },
      "visible": true,
      "minimized": false,
      "maximized": false
    }
  },
  "tags": ["analysis", "counties", "california"],
  "customConfig": {
    "theme": "light",
    "refreshInterval": 300000
  },
  "createdAt": ISODate("2023-10-15T14:22:30.123Z"),
  "updatedAt": ISODate("2023-11-20T09:45:12.456Z")
}
```

## API Usage Examples

### Saving a Layout Configuration

```javascript
const saveLayoutConfig = async (userId, name, layoutType, panels, options = {}) => {
  const layoutId = `user_${userId}_${name.toLowerCase().replace(/\s+/g, '_')}`;
  
  const layoutConfig = new LayoutConfig({
    layoutId,
    userId,
    name,
    layoutType,
    panels,
    description: options.description || '',
    tags: options.tags || [],
    customConfig: options.customConfig || {}
  });
  
  await layoutConfig.save();
  return layoutId;
};
```

### Loading a Layout Configuration

```javascript
const loadLayoutConfig = async (layoutId) => {
  const layoutConfig = await LayoutConfig.findOne({ layoutId });
  
  if (!layoutConfig) {
    throw new Error(`Layout configuration not found: ${layoutId}`);
  }
  
  return {
    layoutType: layoutConfig.layoutType,
    panels: layoutConfig.panels.toObject(),
    customConfig: layoutConfig.customConfig
  };
};
```

### Finding User Layouts

```javascript
const getUserLayouts = async (userId) => {
  return await LayoutConfig.find({ userId })
    .select('layoutId name description layoutType tags updatedAt')
    .sort({ updatedAt: -1 });
};
```

### Finding Layouts by Tags

```javascript
const getLayoutsByTags = async (tags, options = {}) => {
  const query = { tags: { $all: tags } };
  
  if (options.userId) {
    query.userId = options.userId;
  }
  
  if (options.isGlobal !== undefined) {
    query.isGlobal = options.isGlobal;
  }
  
  return await LayoutConfig.find(query)
    .select('layoutId name description layoutType tags updatedAt userId isGlobal')
    .sort({ updatedAt: -1 });
};
```
```

## 📋 API Testing Changes

Create Swagger and Postman documentation for the layout API:

```bash
# Create or open the Swagger specification file
mkdir -p docs/api
touch docs/api/layout-api-swagger.yaml
```

Add the following to `layout-api-swagger.yaml`:

```yaml
openapi: 3.0.0
info:
  title: Layout Configuration API
  description: API for managing panel layout configurations
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://api-staging.example.com/v1
    description: Staging server
  - url: http://localhost:3000/api/v1
    description: Local development server
tags:
  - name: Layouts
    description: Layout configuration operations
  - name: Panels
    description: Panel configuration operations
paths:
  /layouts:
    get:
      tags:
        - Layouts
      summary: Get all layouts for the authenticated user
      description: Returns a list of all layout configurations accessible by the user
      parameters:
        - in: query
          name: includeGlobal
          schema:
            type: boolean
          description: Include global layouts
          required: false
        - in: query
          name: tags
          schema:
            type: array
            items:
              type: string
          description: Filter by tags
          required: false
        - in: query
          name: layoutType
          schema:
            type: string
            enum: [single, dual, tri, quad, custom]
          description: Filter by layout type
          required: false
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/LayoutSummary'
        '401':
          description: Unauthorized
    post:
      tags:
        - Layouts
      summary: Create a new layout
      description: Creates a new layout configuration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LayoutCreateRequest'
      responses:
        '201':
          description: Layout created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LayoutResponse'
        '400':
          description: Invalid request
        '401':
          description: Unauthorized
  /layouts/{layoutId}:
    get:
      tags:
        - Layouts
      summary: Get layout by ID
      description: Returns a layout configuration by ID
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LayoutResponse'
        '404':
          description: Layout not found
        '401':
          description: Unauthorized
    put:
      tags:
        - Layouts
      summary: Update layout
      description: Updates an existing layout configuration
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LayoutUpdateRequest'
      responses:
        '200':
          description: Layout updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LayoutResponse'
        '400':
          description: Invalid request
        '404':
          description: Layout not found
        '401':
          description: Unauthorized
    delete:
      tags:
        - Layouts
      summary: Delete layout
      description: Deletes a layout configuration
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
      responses:
        '204':
          description: Layout deleted

  /layouts/clone/{layoutId}:
    post:
      tags:
        - Layouts
      summary: Clone layout
      description: Creates a new layout by cloning an existing one
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Source layout ID
        - in: query
          name: newName
          schema:
            type: string
          required: true
          description: Name for the cloned layout
      responses:
        '201':
          description: Layout cloned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LayoutResponse'
        '404':
          description: Source layout not found
        '401':
          description: Unauthorized
        
  /layouts/{layoutId}/panels:
    get:
      tags:
        - Panels
      summary: Get panels for layout
      description: Returns all panel configurations for a layout
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  $ref: '#/components/schemas/PanelConfig'
        '404':
          description: Layout not found
        '401':
          description: Unauthorized
    post:
      tags:
        - Panels
      summary: Add panel to layout
      description: Adds a new panel to a layout configuration
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PanelConfig'
      responses:
        '201':
          description: Panel added
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PanelConfig'
        '400':
          description: Invalid request
        '404':
          description: Layout not found
        '401':
          description: Unauthorized
          
  /layouts/{layoutId}/panels/{panelId}:
    get:
      tags:
        - Panels
      summary: Get panel by ID
      description: Returns a panel configuration by ID
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
        - in: path
          name: panelId
          schema:
            type: string
          required: true
          description: Panel ID
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PanelConfig'
        '404':
          description: Layout or panel not found
        '401':
          description: Unauthorized
    put:
      tags:
        - Panels
      summary: Update panel
      description: Updates an existing panel configuration
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
        - in: path
          name: panelId
          schema:
            type: string
          required: true
          description: Panel ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PanelUpdateRequest'
      responses:
        '200':
          description: Panel updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PanelConfig'
        '400':
          description: Invalid request
        '404':
          description: Layout or panel not found
        '401':
          description: Unauthorized
    delete:
      tags:
        - Panels
      summary: Delete panel
      description: Removes a panel from a layout configuration
      parameters:
        - in: path
          name: layoutId
          schema:
            type: string
          required: true
          description: Layout ID
        - in: path
          name: panelId
          schema:
            type: string
          required: true
          description: Panel ID
      responses:
        '204':
          description: Panel deleted
        '404':
          description: Layout or panel not found
        '401':
          description: Unauthorized

components:
  schemas:
    LayoutSummary:
      type: object
      properties:
        layoutId:
          type: string
          example: "user_123_analysis_layout"
        name:
          type: string
          example: "Analysis Layout"
        description:
          type: string
          example: "Layout for data analysis"
        layoutType:
          type: string
          enum: [single, dual, tri, quad, custom]
          example: "tri"
        isGlobal:
          type: boolean
          example: false
        tags:
          type: array
          items:
            type: string
          example: ["analysis", "counties"]
        panelCount:
          type: integer
          example: 3
        updatedAt:
          type: string
          format: date-time
          example: "2023-11-20T09:45:12.456Z"
    
    LayoutCreateRequest:
      type: object
      required:
        - name
        - layoutType
        - panels
      properties:
        name:
          type: string
          example: "County Analysis Layout"
        description:
          type: string
          example: "Layout for analyzing county data"
        layoutType:
          type: string
          enum: [single, dual, tri, quad, custom]
          example: "tri"
        isGlobal:
          type: boolean
          default: false
          example: false
        tags:
          type: array
          items:
            type: string
          example: ["analysis", "counties"]
        panels:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/PanelConfig'
        customConfig:
          type: object
          example: { "theme": "light", "refreshInterval": 300000 }
    
    LayoutUpdateRequest:
      type: object
      properties:
        name:
          type: string
          example: "Updated Layout Name"
        description:
          type: string
          example: "Updated layout description"
        layoutType:
          type: string
          enum: [single, dual, tri, quad, custom]
          example: "quad"
        isGlobal:
          type: boolean
          example: false
        tags:
          type: array
          items:
            type: string
          example: ["analysis", "counties", "updated"]
        customConfig:
          type: object
          example: { "theme": "dark", "refreshInterval": 600000 }
    
    LayoutResponse:
      type: object
      properties:
        layoutId:
          type: string
          example: "user_123_county_analysis"
        userId:
          type: string
          example: "user_123"
        name:
          type: string
          example: "County Analysis Layout"
        description:
          type: string
          example: "Layout for analyzing county data"
        layoutType:
          type: string
          enum: [single, dual, tri, quad, custom]
          example: "tri"
        isGlobal:
          type: boolean
          example: false
        tags:
          type: array
          items:
            type: string
          example: ["analysis", "counties"]
        panels:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/PanelConfig'
        customConfig:
          type: object
          example: { "theme": "light", "refreshInterval": 300000 }
        createdAt:
          type: string
          format: date-time
          example: "2023-10-15T14:22:30.123Z"
        updatedAt:
          type: string
          format: date-time
          example: "2023-11-20T09:45:12.456Z"
    
    PanelConfig:
      type: object
      required:
        - id
        - contentType
        - title
      properties:
        id:
          type: string
          example: "map-panel"
        contentType:
          type: string
          example: "map"
        title:
          type: string
          example: "County Map"
        position:
          type: object
          properties:
            row:
              type: integer
              example: 0
            col:
              type: integer
              example: 0
        size:
          type: object
          properties:
            width:
              type: integer
              example: 2
            height:
              type: integer
              example: 1
        state:
          type: object
          example: { "center": [37.7749, -122.4194], "zoom": 6 }
        visible:
          type: boolean
          default: true
          example: true
        minimized:
          type: boolean
          default: false
          example: false
        maximized:
          type: boolean
          default: false
          example: false
    
    PanelUpdateRequest:
      type: object
      properties:
        title:
          type: string
          example: "Updated Map Panel"
        position:
          type: object
          properties:
            row:
              type: integer
              example: 1
            col:
              type: integer
              example: 1
        size:
          type: object
          properties:
            width:
              type: integer
              example: 3
            height:
              type: integer
              example: 2
        state:
          type: object
          example: { "center": [34.0522, -118.2437], "zoom": 8 }
        visible:
          type: boolean
          example: true
        minimized:
          type: boolean
          example: false
        maximized:
          type: boolean
          example: true

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

## 📋 Recommended Next Steps

Based on the implementation guide, here's a summary of the steps to successfully implement and validate Chunk 2:

1. **Environment Setup**
   - Set up all required folders and dependencies
   - Configure Git branching correctly
   - Set up the testing environment with Vitest

2. **Core Implementation**
   - Implement the enhanced PanelSyncContext with event queuing
   - Implement the enhanced LayoutContext with persistence
   - Create all required custom hooks with proper cleanup
   - Implement the PanelRegistry with caching and lazy loading
   - Implement the CountyPanel component with proper panel syncing

3. **Testing**
   - Run unit tests for all components
   - Run integration tests for panel communication
   - Test memory management for leaks
   - Test event handling for race conditions
   - Test API endpoints with Postman

4. **Documentation**
   - Complete all required documentation
   - Update API specifications
   - Define MongoDB schema changes
   - Create diagrams for event flow

5. **Validation**
   - Use the validation checklist to verify all requirements
   - Conduct a comprehensive code review
   - Verify performance benchmarks
   - Check for cross-browser compatibility

6. **Final Steps**
   - Prepare pull request with descriptive message
   - Include screenshots or recordings of working implementation
   - Request code review from team members
   - Update project documentation

By following this comprehensive implementation guide, you should be able to address all the issues identified in the audit report and create a robust panel communication framework that resolves the placeholder functions, memory leaks, race conditions, and documentation needs.
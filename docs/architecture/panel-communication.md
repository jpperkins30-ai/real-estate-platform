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
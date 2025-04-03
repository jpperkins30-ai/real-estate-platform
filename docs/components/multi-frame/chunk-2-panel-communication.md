# Panel Communication and Content Registry System

## Overview

The panel communication system enables seamless interaction between different panels in the multi-frame layout. It provides a robust event-based communication mechanism that allows panels to broadcast and subscribe to events, maintaining state synchronization across the application.

## Architecture

### Context Providers

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

### Event Flow

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

## Panel Communication System

### PanelSyncContext

The `PanelSyncContext` provides the core communication infrastructure:

```typescript
interface PanelEvent {
  type: string;
  payload: any;
  source: string;
}

interface PanelSyncContextValue {
  broadcast: (event: PanelEvent) => void;
  subscribe: (callback: (event: PanelEvent) => void) => () => void;
}
```

### Using Panel Communication

```typescript
import { usePanelSync } from '../../../hooks/usePanelSync';

export const ExamplePanel = ({ panelId }) => {
  const { broadcast, subscribe } = usePanelSync();
  
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId && event.type === 'select') {
        // Handle selection event
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  const handleSelection = (item) => {
    broadcast({
      type: 'select',
      payload: item,
      source: panelId
    });
  };
  
  return <div>{/* Panel content */}</div>;
};
```

## Panel Content Registry

The panel content registry system manages the registration and retrieval of panel components:

```typescript
interface PanelContentRegistry {
  [key: string]: React.ComponentType<PanelContentProps>;
}

export const registerPanelContent = (
  type: string,
  component: React.ComponentType<PanelContentProps>
) => {
  registry[type] = component;
};

export const getPanelContent = (type: string) => {
  return registry[type] || null;
};
```

### Registering Panel Content

```typescript
import { CountyPanel } from './panels/CountyPanel';
import { PropertyPanel } from './panels/PropertyPanel';

registerPanelContent('county', CountyPanel);
registerPanelContent('property', PropertyPanel);
```

## Layout Context Integration

The `LayoutContext` works in conjunction with panel communication:

```typescript
interface LayoutContextValue {
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
  panelStates: Record<string, any>;
  updatePanelState: (panelId: string, state: any) => void;
}
```

### Managing Panel State

```typescript
const { updatePanelState } = useLayoutContext();

// In a panel component
useEffect(() => {
  updatePanelState(panelId, {
    selectedItem: currentSelection,
    filters: activeFilters
  });
}, [currentSelection, activeFilters]);
```

## CountyPanel Implementation

The CountyPanel serves as a reference implementation:

```typescript
export const CountyPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState,
  onStateChange,
  onAction
}) => {
  const { broadcast, subscribe } = usePanelSync();
  const [county, setCounty] = useState<CountyData | null>(null);
  
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId && event.type === 'select') {
        loadCountyData(event.payload.entityId);
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // ... rest of implementation
};
```

## Testing

The system includes comprehensive tests for panel communication:

```typescript
describe('Panel Communication', () => {
  it('broadcasts events between panels', () => {
    const { result } = renderHook(() => usePanelSync());
    const mockCallback = vi.fn();
    
    const unsubscribe = result.current.subscribe(mockCallback);
    result.current.broadcast({
      type: 'test',
      payload: { data: 'test' },
      source: 'panel1'
    });
    
    expect(mockCallback).toHaveBeenCalled();
    unsubscribe();
  });
});
```

## Integration Points

1. **Core Container and Layout (Chunk 1)**
   - Builds on the foundation of panel containers
   - Extends layout management with state

2. **Panel State Management (Chunk 3)**
   - Enables state persistence across layout changes
   - Provides state synchronization between panels

3. **Layout Persistence (Chunk 4)**
   - Supports saving panel communication state
   - Restores panel relationships on load

4. **Controller Integration (Chunk 5)**
   - Enables external control of panel communication
   - Supports programmatic event broadcasting

## Best Practices

1. **Event Design**
   - Use clear, descriptive event types
   - Include necessary context in payloads
   - Handle source panel to prevent loops

2. **State Management**
   - Keep panel state minimal and focused
   - Clean up subscriptions on unmount
   - Use appropriate state update patterns

3. **Performance**
   - Filter events by type and source
   - Batch related state updates
   - Optimize event payload size

## Future Enhancements

1. **Event Validation**
   - Type-safe event payloads
   - Runtime payload validation
   - Event schema definitions

2. **Advanced Features**
   - Event queuing and batching
   - Prioritized event handling
   - Event replay capabilities

3. **Developer Tools**
   - Event debugging utilities
   - Panel communication inspector
   - State time-travel debugging

[Add screenshots of panel communication in action here] 
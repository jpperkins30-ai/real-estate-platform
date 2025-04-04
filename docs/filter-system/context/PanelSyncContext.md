# Panel Synchronization Context

The Panel Synchronization Context facilitates communication between different panels in a multi-panel application.

## Overview

PanelSyncContext implements a publish/subscribe (pub/sub) pattern that enables panels to communicate with each other by broadcasting events and subscribing to events from other panels. This is essential for maintaining synchronized state across multiple independent components.

## Implementation

```tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface SyncEvent {
  type: string;
  source: string;
  payload: any;
  metadata?: {
    timestamp: number;
    version?: number;
  };
}

interface PanelSyncContextValue {
  broadcast: (event: SyncEvent) => void;
  subscribe: (callback: (event: SyncEvent) => void) => () => void;
}

const PanelSyncContext = createContext<PanelSyncContextValue | null>(null);

export const PanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Implementation details
  
  return (
    <PanelSyncContext.Provider value={{ broadcast, subscribe }}>
      {children}
    </PanelSyncContext.Provider>
  );
};
```

## Features

### Event Broadcasting

Panels can broadcast events to all other panels:

```tsx
broadcast({
  type: 'filter',           // Event type
  source: 'panel-1',        // Source panel ID
  payload: { filters: {} }, // Event data
  metadata: {               // Optional metadata
    timestamp: Date.now(),
    version: 2
  }
});
```

### Event Subscription

Panels can subscribe to events from other panels:

```tsx
const unsubscribe = subscribe((event) => {
  if (event.type === 'filter' && event.source !== 'my-panel-id') {
    // Handle filter event from another panel
  }
});

// Clean up subscription when component unmounts
useEffect(() => {
  return () => unsubscribe();
}, [unsubscribe]);
```

### Event Types

The context supports different event types:

- `filter`: Filter changes
- `selection`: Selection changes
- `layout`: Layout changes
- `view`: View state changes
- Custom event types for specialized needs

## Usage

Wrap your application or container component with the provider:

```tsx
import { PanelSyncProvider } from '../context/PanelSyncContext';

function App() {
  return (
    <PanelSyncProvider>
      <MultiPanelLayout />
    </PanelSyncProvider>
  );
}
```

Access the panel sync context using the `usePanelSync` hook in your components.

## Event Filtering

Events can be filtered based on various criteria:

- By event type: `event.type === 'filter'`
- By source: `event.source !== myPanelId`
- By payload properties: `event.payload.filters.propertyType`
- By timestamp: `event.metadata.timestamp > lastSyncTime`

## Performance Considerations

- Events are processed synchronously to ensure order
- Large payloads should be kept to a minimum
- Consider debouncing frequent events
- Subscribers should perform minimal work in their handlers

## Error Handling

The context includes error handling for various scenarios:

- Invalid event formats are filtered out
- Broadcast errors are caught and logged
- Subscribe errors don't affect other subscribers

## Example: Synchronizing Two Panels

```tsx
// Panel A
function PanelA() {
  const { broadcast, subscribe } = usePanelSync();
  const [count, setCount] = useState(0);
  
  // Listen for count updates from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'count' && event.source !== 'panel-a') {
        setCount(event.payload.count);
      }
    });
    
    return () => unsubscribe();
  }, [subscribe]);
  
  // Broadcast count updates to other panels
  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    broadcast({
      type: 'count',
      source: 'panel-a',
      payload: { count: newCount }
    });
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}

// Panel B - Similar implementation
function PanelB() {
  // Similar code as PanelA, but with source: 'panel-b'
}
```

## Related Components

- [usePanelSync Hook](../hooks/usePanelSync.md)
- [Filter Context](./FilterContext.md)
- [Filter Panel Component](../components/FilterPanel.md) 
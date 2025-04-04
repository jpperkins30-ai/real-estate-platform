# usePanelSync Hook

The `usePanelSync` hook provides a mechanism for panels to communicate and synchronize state with each other.

## Overview

This hook facilitates communication between different panels in a multi-panel application. It implements a publish/subscribe pattern that allows panels to broadcast events and listen for events from other panels.

## Implementation

```tsx
import { useContext } from 'react';
import { PanelSyncContext } from '../context/PanelSyncContext';

export function usePanelSync() {
  const context = useContext(PanelSyncContext);
  
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  
  return context;
}
```

## Returns

The hook returns an object with the following methods:

| Method | Type | Description |
|--------|------|-------------|
| `broadcast` | `(event: SyncEvent) => void` | Broadcast an event to all subscribed panels |
| `subscribe` | `(callback: (event: SyncEvent) => void) => () => void` | Subscribe to events from other panels |

## Event Structure

The `SyncEvent` object has the following structure:

```typescript
interface SyncEvent {
  type: string;         // Event type (e.g., 'filter', 'layout', 'selection')
  source: string;       // Source panel ID
  payload: any;         // Event data
  metadata?: {          // Optional metadata
    timestamp: number;  // Event creation time
    version?: number;   // For versioned events
  };
}
```

## Usage

```tsx
import { useEffect } from 'react';
import { usePanelSync } from '../hooks/usePanelSync';
import { useFilter } from '../hooks/useFilter';

function SynchronizedPanel({ panelId }) {
  const { broadcast, subscribe } = usePanelSync();
  const { activeFilters, applyFilters } = useFilter();
  
  // Subscribe to filter events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'filter' && event.source !== panelId) {
        // Apply filters from another panel
        applyFilters(event.payload.filters);
      }
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [panelId, subscribe, applyFilters]);
  
  // Broadcast filter changes to other panels
  const handleFilterChange = (newFilters) => {
    // Update local filters
    applyFilters(newFilters);
    
    // Broadcast to other panels
    broadcast({
      type: 'filter',
      source: panelId,
      payload: { filters: newFilters },
      metadata: {
        timestamp: Date.now(),
        version: activeFilters.version
      }
    });
  };
  
  return (
    <div>
      {/* Panel content */}
    </div>
  );
}
```

## Synchronization Strategies

The hook supports different synchronization strategies:

1. **Immediate Sync**: Broadcast changes as they happen
2. **Deferred Sync**: Broadcast changes after a delay or user confirmation
3. **Conditional Sync**: Only broadcast changes that meet certain criteria

## Error Handling

The hook includes error handling to prevent event propagation failures:

- Failed subscriptions are automatically cleaned up
- Broadcast errors are caught and reported
- Invalid event formats are filtered out

## Related Components

- [Panel Sync Context](../context/PanelSyncContext.md)
- [useFilter Hook](./useFilter.md)
- [usePanelState Hook](./usePanelState.md) 
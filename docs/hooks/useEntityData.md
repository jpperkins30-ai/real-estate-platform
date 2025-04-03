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

## Related Documentation

For a more detailed understanding of the panel communication architecture that powers this hook, see the [Panel Communication System Documentation](../architecture/panel-communication.md). 
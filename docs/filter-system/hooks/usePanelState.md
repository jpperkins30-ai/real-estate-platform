# usePanelState Hook

The `usePanelState` hook manages state for individual panels in the application, with built-in persistence and versioning.

## Overview

This hook provides a way to manage local panel state with automatic persistence to browser storage. It includes version tracking to handle potential conflicts when the same panel is open in multiple views.

## Implementation

```tsx
import { useState, useEffect } from 'react';
import { panelStateService } from '../services/panelStateService';

export function usePanelState<T = any>(
  panelId: string,
  contentType: string,
  options: UsePanelStateOptions<T> = {}
): UsePanelStateResult<T> {
  // Implementation details
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `panelId` | `string` | Unique identifier for the panel |
| `contentType` | `string` | Type of content stored (e.g., 'filter', 'map', 'layout') |
| `options` | `UsePanelStateOptions<T>` | Configuration options |

## Options

The `options` parameter accepts the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `initialState` | `T` | Default state if none is stored |
| `storageType` | `'localStorage' \| 'sessionStorage'` | Storage mechanism to use |
| `enablePersistence` | `boolean` | Whether to persist state (default: true) |
| `version` | `number` | Initial version number (default: 1) |

## Returns

The hook returns a tuple with the following elements:

```typescript
[
  state,            // Current panel state (T)
  setState,         // Function to update state ((value: T | ((prev: T) => T)) => void)
  resetState,       // Function to reset state to initial value (() => void)
  metadata          // Object containing metadata { isLoading, hasError, version }
]
```

## Usage

```tsx
import { usePanelState } from '../hooks/usePanelState';

function FilterPanel({ panelId }) {
  // Set up panel state with type 'filter' and default values
  const [state, setState, resetState, { isLoading }] = usePanelState(
    panelId,
    'filter',
    { initialState: { category: 'all', sortBy: 'price' } }
  );
  
  // Update a specific part of the state
  const handleCategoryChange = (category) => {
    setState(prev => ({ ...prev, category }));
  };
  
  // Reset state to initial values
  const handleReset = () => {
    resetState();
  };
  
  return (
    <div className="panel">
      {isLoading ? (
        <p>Loading panel state...</p>
      ) : (
        <div>
          <h2>Filter Panel</h2>
          <select 
            value={state.category} 
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
          <button onClick={handleReset}>Reset</button>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

The hook automatically handles storage errors:

1. If `localStorage` fails, it falls back to `sessionStorage`
2. If all storage fails, it uses in-memory state
3. Error state is tracked in the returned metadata object

## Version Management

Each state update increments the version number, which is stored with the state. This enables conflict detection and resolution when the same panel is updated in different contexts.

## Related Components

- [Panel State Service](../services/panelStateService.md)
- [useFilter Hook](./useFilter.md)
- [usePanelSync Hook](./usePanelSync.md) 
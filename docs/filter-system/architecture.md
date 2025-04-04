# Filter System Architecture

## Overview

The Filter System architecture is designed to provide robust filtering capabilities across multiple panels with synchronized state, persistence, and conflict resolution. The system integrates several components to create a cohesive filtering experience:

- **Filter Context**: Global state management for filter configurations
- **Panel State Management**: Local state for individual panel configurations
- **Panel Synchronization**: Communication between panels
- **Storage Layer**: Persistence of filter states and configurations
- **UI Components**: User interface for filter interaction

## Architecture Components

### 1. Filter Context Layer

The Filter Context provides application-wide filter state management:

```jsx
<FilterContextProvider>
  <MultiFrameContainer />
</FilterContextProvider>
```

**Key features:**
- Centralized storage for active filters
- Management of filter presets/saved configurations
- API for applying, merging, and clearing filters
- Version tracking for conflict resolution

### 2. Panel State Management

Each panel maintains its local state using the `usePanelState` hook:

```typescript
const { state, updateState } = usePanelState({
  panelId: 'filter-panel',
  initialState: {},
  contentType: 'filter'
});
```

**Key features:**
- Local state persistence per panel
- Content type-specific storage
- Version tracking for conflict detection
- Automatic merging of remote changes

### 3. Panel Synchronization

Panels communicate filter changes using the `PanelSyncContext`:

```typescript
const { broadcast, subscribe } = usePanelSync();

// Broadcasting filter changes
broadcast('filter', { filters }, panelId);

// Subscribing to filter events
subscribe((event) => {
  if (event.type === 'filter' && event.source !== panelId) {
    // Handle incoming filter update
  }
});
```

## Data Flow

1. **User Interaction**:
   - User modifies filters in UI
   - Changes tracked in local panel state
   - "Apply" action commits changes

2. **State Propagation**:
   - FilterPanel updates global FilterContext
   - Change broadcast to other panels
   - Other panels merge changes with local state

3. **Persistence**:
   - Filter state saved to storage (localStorage/sessionStorage)
   - Panel state saved separately
   - Versioned storage format for conflict detection

## Persistence Strategy

The system uses a multi-tiered persistence approach:

### Storage Keys

- Filter state: `activeFilters`
- Filter presets: `filterPresets`
- Panel state: `panelState_<panelId>`

### Storage Format

All persisted data follows the versioned format:

```typescript
{
  version: 'v1',
  updatedAt: '2023-10-25T12:34:56.789Z',
  data: { /* actual state */ }
}
```

### Fallback Mechanism

1. Primary storage: localStorage
2. Fallback storage: sessionStorage (if localStorage fails)
3. In-memory state (if all persistence fails)

## Error Handling

The Filter System implements a comprehensive error handling strategy:

1. **Component Level**: try/catch blocks in event handlers
2. **Service Level**: Error handling in all storage operations
3. **Hook Level**: Error state tracking in usePanelState with `metadata.hasError`
4. **Recovery Mechanisms**: Fallback to sessionStorage or default values

## Versioning and Conflict Resolution

The system uses version-based conflict resolution:

1. **Version Tracking**: Each filter state and panel state has a version number
2. **Conflict Detection**: Version comparison on state merges
3. **Resolution Strategy**: Higher version wins with smart property merging
4. **Timestamps**: `updatedAt` tracking for audit and debugging

## Code Structure

```
client/src/
├── context/
│   └── FilterContext.tsx   # Global filter state provider
├── hooks/
│   ├── useFilter.ts        # Hook to access filter context
│   └── usePanelState.ts    # Hook for panel-specific state
├── services/
│   ├── filterService.ts    # Filter utilities and storage
│   └── panelStateService.ts # Panel state persistence
├── components/
│   └── multiframe/
│       └── filters/
│           └── FilterPanel.tsx # UI for filter interaction
└── types/
    ├── filter.types.ts     # Filter-related type definitions
    └── layout.types.ts     # Layout and panel type definitions
```

## Cross-Component Communication

![Filter System Communication Flow](../assets/filter-system-communication.png)

1. FilterPanel → FilterContext: Direct context updates
2. FilterPanel → Other Panels: Via PanelSyncContext
3. FilterContext → Storage: Via filter services
4. FilterPanel → Panel State: Via usePanelState hook

## Integration Points

- **MultiFrameContainer**: Root container with FilterContextProvider
- **Panel Layout**: Contains individual panels
- **FilterPanel**: UI component for filter interaction
- **Data Panels**: Consume filters via useFilter hook

## Related Documentation

- [Filter System API Reference](../api/filter-system.md)
- [Filter System Best Practices](./best-practices.md)
- [Panel State Management](../panel-system/state-management.md)
- [MultiFrame Container Architecture](../components/multiframe-container.md) 
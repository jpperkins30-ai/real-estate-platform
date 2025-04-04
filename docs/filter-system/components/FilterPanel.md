# FilterPanel Component

The FilterPanel component is the primary user interface for interacting with the filter system.

## Overview

FilterPanel provides a UI for users to create, modify, apply, and reset filters. It integrates with the filter context to manage filter state and with panel synchronization to coordinate changes across multiple panels.

## Implementation

```tsx
import React, { useState, useEffect } from 'react';
import { useFilter } from '../hooks/useFilter';
import { usePanelState } from '../hooks/usePanelState';
import { usePanelSync } from '../hooks/usePanelSync';

interface FilterPanelProps {
  panelId: string;
  title?: string;
  initialSyncEnabled?: boolean;
  filterOptions?: FilterOptions;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  panelId,
  title = 'Filters',
  initialSyncEnabled = true,
  filterOptions = {}
}) => {
  // Implementation details
  
  return (
    <div className="filter-panel" data-testid="filter-panel">
      {/* Component JSX */}
    </div>
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `panelId` | `string` | Unique identifier for the panel |
| `title` | `string` | Panel title (default: "Filters") |
| `initialSyncEnabled` | `boolean` | Whether panel should sync with others initially (default: true) |
| `filterOptions` | `FilterOptions` | Configuration for filters |

## Features

### Filter Controls

The panel provides controls for various filter types:

- Range filters (e.g., price, date ranges)
- Selection filters (e.g., checkboxes, radio buttons)
- Text filters (e.g., search fields)
- Toggle filters (e.g., on/off switches)

### Panel Actions

Users can perform several actions:

- Apply filters: Update the active filters
- Reset filters: Clear all filters to default values
- Save presets: Save the current filter configuration
- Load presets: Apply a previously saved configuration

### Synchronization

The panel can be configured to synchronize with other panels:

- Sync toggle: Enable/disable synchronization
- Bi-directional sync: Changes propagate to and from other panels
- Conflict resolution: Smart handling of conflicting changes

## State Management

The component uses several hooks for state management:

- `useFilter`: Access to global filter context
- `usePanelState`: Local panel state management
- `usePanelSync`: Communication with other panels

## Example Usage

```tsx
import { FilterPanel } from '../components/multiframe/filters/FilterPanel';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="sidebar">
        <FilterPanel 
          panelId="sidebar-filters"
          title="Property Filters"
          initialSyncEnabled={true}
          filterOptions={{
            enabledFilters: ['priceRange', 'propertyType', 'bedrooms'],
            defaultValues: {
              priceRange: [100000, 500000]
            }
          }}
        />
      </div>
      <div className="main-content">
        {/* Other panels that consume filters */}
      </div>
    </div>
  );
}
```

## UI Structure

```
┌─────────────────────────────────┐
│ Property Filters        ⟲ Reset │
├─────────────────────────────────┤
│                                 │
│ Price Range                     │
│ ┌───────────┐     ┌───────────┐ │
│ │ $100,000  │  -  │ $500,000  │ │
│ └───────────┘     └───────────┘ │
│                                 │
│ Property Type                   │
│ ☑ House    ☑ Condo              │
│ ☐ Townhouse ☐ Multi-family      │
│                                 │
│ Bedrooms                        │
│ ☐ 1  ☑ 2  ☑ 3  ☐ 4+             │
│                                 │
│ ┌──────────────────────────┐    │
│ │       Apply Filters      │    │
│ └──────────────────────────┘    │
│                                 │
│ [✓] Sync with other panels      │
│                                 │
└─────────────────────────────────┘
```

## Styling

The component uses CSS modules for styling:

```css
.filterPanel {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

/* Additional styles... */
```

## Accessibility

The component implements the following accessibility features:

- ARIA attributes for screen readers
- Keyboard navigation support
- High-contrast mode compatibility
- Focus management

## Testing

The component includes data attributes for testing:

```tsx
<div data-testid="filter-panel">
  <button data-testid="apply-filters-button">Apply Filters</button>
  <button data-testid="reset-filters-button">Reset</button>
  <div data-testid="filter-sync-toggle">
    <input type="checkbox" checked={syncEnabled} />
    <label>Sync with other panels</label>
  </div>
</div>
```

## Related Components

- [Filter Context](../context/FilterContext.md)
- [useFilter Hook](../hooks/useFilter.md)
- [usePanelSync Hook](../hooks/usePanelSync.md) 
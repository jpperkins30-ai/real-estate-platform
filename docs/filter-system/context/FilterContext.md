# Filter Context

The Filter Context is the central state management component in the filter system. It provides a React context for managing and accessing filter state throughout the application.

## Overview

Filter Context uses React's Context API to manage global filter state, handling persistence, updates, and providing access to filter data for components throughout the application.

## Implementation

```tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { FilterSet, FilterPreset } from '../types/filter.types';
import { filterService } from '../services/filterService';

// Context interface and implementation details go here
```

## Features

- Global state management for active filters
- Filter preset management
- Persistence to localStorage/sessionStorage
- Version tracking for conflict resolution
- Fallback mechanisms for storage failures

## Usage

Wrap your application or container component with the provider:

```tsx
import { FilterContextProvider } from '../context/FilterContext';

function App() {
  return (
    <FilterContextProvider>
      <YourAppContent />
    </FilterContextProvider>
  );
}
```

Access the filter context using the `useFilter` hook in your components.

## Configuration Options

The `FilterContextProvider` accepts several configuration options:

- `initialFilters`: Initial filter state
- `storageKey`: Custom storage key
- `versionStrategy`: Configuration for version tracking and conflict resolution

## Related Components

- [useFilter Hook](../hooks/useFilter.md)
- [Filter Types](../types/filter.types.md)
- [Filter Service](../services/filterService.md) 
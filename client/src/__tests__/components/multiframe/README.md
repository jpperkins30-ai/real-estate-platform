# Multiframe Components Testing Guide

This document provides guidance on testing the multiframe components in the application, including proper setup, known issues, and best practices.

## Components Overview

The multiframe system consists of several key components:

- `MultiFrameContainer`: The main container managing layout and panels
- `EnhancedMultiFrameContainer`: An extended version with additional features
- `LayoutSelector`: Controls for selecting different layout types
- Layout Components:
  - `SinglePanelLayout`
  - `DualPanelLayout`
  - `TriPanelLayout`
  - `QuadPanelLayout`
  - `AdvancedLayout`

## Testing Strategy

### Test Isolation

Each component has its own test file focusing on its specific functionality. We use mocks to isolate components from their dependencies, especially for child components.

### Special Testing Considerations

#### MultiFrameContainer Testing

The `MultiFrameContainer` component has special testing considerations due to potential infinite re-render issues. When testing this component:

1. Always use the `_isTestingMode={true}` prop when rendering the component in tests
2. Mock child components properly to avoid state update loops
3. Use properly typed mock implementations as shown in the test file

Example:

```tsx
render(
  <MultiFrameContainer 
    initialLayout="single" 
    onLayoutChange={mockLayoutChange}
    _isTestingMode={true}  // Important to prevent infinite re-renders
  />
);
```

**Important Note**: The `_isTestingMode` prop is a temporary solution that should eventually be replaced with a better component design that doesn't require special testing flags.

## Test Setup and Teardown

### Global Setup

The test environment is configured in `vitest.config.ts` at the project root. This includes:
- React Testing Library setup
- DOM environment configuration
- Mock resetting between tests

### Component-Specific Setup

For multiframe component tests:

1. Import and configure mocks at the top of the test file
2. Use `beforeEach(() => { vi.clearAllMocks(); })` to reset mocks between tests
3. When testing `MultiFrameContainer`, ensure you pass the `_isTestingMode` flag

### Proper Mock Implementation

For multiframe tests, make sure your mocks:

1. Have proper TypeScript typing 
2. Don't trigger state updates during render
3. Return simple placeholder UI elements with appropriate `data-testid` attributes

Example of proper mock implementation:

```tsx
// Define types for the mocked components
interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange?: (layout: LayoutType) => void;
  enableAdvancedLayout?: boolean;
}

// Mock with stable implementations that don't trigger re-renders
vi.mock('../../components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ currentLayout, enableAdvancedLayout }: LayoutSelectorProps) => (
    <div data-testid="mock-layout-selector">
      Layout: {currentLayout}
      {enableAdvancedLayout === false && <span>Advanced disabled</span>}
    </div>
  )
}));
```

## Running the Tests

To run all multiframe component tests:

```
npm test -- --filter multiframe
```

To run a specific component test:

```
npm test -- MultiFrameContainer.test
```

## Known Issues and Future Improvements

### Infinite Re-render Issue

The `MultiFrameContainer` component can cause infinite re-render loops in tests due to how it manages state and interacts with child components. This is currently addressed with the `_isTestingMode` flag, but a better solution would involve refactoring the component to:

1. Move state initialization logic out of the render cycle
2. Use a more sophisticated state management approach that avoids re-renders
3. Create a clearer separation between component logic and rendering

### Future Improvements

- Replace the `_isTestingMode` flag with a better component architecture
- Add more integration tests between multiframe components
- Implement a testing utility library specific to multiframe components

## Related Documentation

See also:
- [Main Testing Guide](../../../docs/testing.md)
- [Component Architecture](../../../docs/architecture/components.md)
- [State Management Guide](../../../docs/architecture/state-management.md) 
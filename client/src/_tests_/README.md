# Test Directory Structure

This directory contains all tests for the Real Estate Platform client application. We use a **test case ID based naming convention** for all test files.

## Directory Structure

```
src/_tests_/
├── TC101_components_multiframe_controls_LayoutSelector.test.tsx  # Layout selector tests
├── TC201_components_multiframe_MultiFrameContainer.test.tsx      # MultiFrameContainer tests
├── TC201_components_multiframe_EnhancedMultiFrameContainer.test.tsx # EnhancedMultiFrameContainer tests
├── TC401_components_multiframe_layouts_AdvancedLayout.test.tsx   # Advanced layout tests
├── ...
```

## Naming Convention

Tests follow a strict naming convention:

1. All test files are stored directly in the `src/_tests_/` directory
2. File names start with a test case ID (TCnnn_)
3. Format: `TCnnn_category_component_name.test.tsx`

## Test Format Requirements

Every test file must:

1. Include test case IDs in test descriptions: `it('TCnnn: should do x when y happens')`
2. Have at least one assertion (`expect()` statement)
3. Use proper import paths (always use `../../src/` when importing components)
4. Mock dependencies appropriately (especially for component tests)

## Running Tests

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- src/_tests_/TC101_components_multiframe_controls_LayoutSelector.test.tsx

# Run tests for a specific group (using pattern matching)
npm test -- "src/_tests_/TC*_components_multiframe_*"
```

## Special Testing Considerations for Multiframe Components

### MultiFrameContainer Testing

The `MultiFrameContainer` component has special testing considerations due to potential infinite re-render issues. When testing this component:

1. Always use the `_isTestingMode={true}` prop when rendering the component in tests
2. Mock child components properly to avoid state update loops
3. Use properly typed mock implementations

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
vi.mock('../../src/components/multiframe/controls/LayoutSelector', () => ({
  LayoutSelector: ({ currentLayout, enableAdvancedLayout }: LayoutSelectorProps) => (
    <div data-testid="layout-selector-mock">
      Layout: {currentLayout}
      {enableAdvancedLayout === false && <span>Advanced disabled</span>}
    </div>
  )
}));
```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Test cannot find component" | Check import paths (should be `../../src/components/...`) |
| "Cannot find module" | Check path spelling and file name in imports |
| "Infinite re-render" | Use `_isTestingMode` prop in `MultiFrameContainer` tests |
| "Missing test case ID" | Add `TCnnn:` prefix to test descriptions |
| "Mock component not working" | Ensure mocks have proper TypeScript typing and don't trigger state updates |

## Known Issues

### Infinite Re-render Issue

The `MultiFrameContainer` component can cause infinite re-render loops in tests due to how it manages state and interacts with child components. This is currently addressed with the `_isTestingMode` flag.

### enableAdvancedLayout Property Note

The `MultiFrameContainer` component uses `enableAdvancedLayout={true}` by default, while the `LayoutSelector` component uses `enableAdvancedLayout={false}` by default. This difference is intentional and tests should account for it.

## Resources

For more information on testing standards, see:
- [testing.md](../../docs/testing.md) - Complete testing documentation
- [test-plan.md](../../docs/test-plan.md) - Test case catalog

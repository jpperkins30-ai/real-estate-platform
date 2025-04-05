# Test Directory Structure

This directory contains all tests for the Real Estate Platform client application. We use a **flattened directory structure** with underscores to separate path components.

## Directory Structure

```
src/__tests__/
├── components_*.test.tsx       # Component tests
├── hooks_*.test.tsx            # Hook tests
├── services_*.test.tsx         # Service tests
├── context_*.test.tsx          # Context tests
├── integration_*.test.tsx      # Integration tests
└── setup/                      # Test setup files (only subdirectory allowed)
```

## Naming Convention

Tests follow a strict naming convention:

1. All test files are stored directly in the `src/__tests__/` directory (no nested directories except setup)
2. File names reflect the path to the component/module being tested, with underscores replacing directory separators
3. Format: `category_[path_components]_[filename].test.tsx`

## Examples

| Component/Module Path | Test File Path |
|-----------------------|---------------|
| `src/components/multiframe/PanelHeader.tsx` | `src/__tests__/components_multiframe_PanelHeader.test.tsx` |
| `src/components/MultiFrameContainer.tsx` | `src/__tests__/components_MultiFrameContainer.test.tsx` |
| `src/hooks/useAdvancedLayout.ts` | `src/__tests__/hooks_useAdvancedLayout.test.tsx` |
| `src/services/panelContentRegistry.ts` | `src/__tests__/services_panelContentRegistry.test.tsx` |
| `src/context/FilterContext.tsx` | `src/__tests__/context_FilterContext.test.tsx` |

## Test Format Requirements

Every test file must:

1. Include test case IDs in test descriptions: `it('TC101: should do x when y happens')`
2. Have at least one assertion (`expect()` statement)
3. Use proper import paths (always use `../../src/` when importing components)
4. Mock dependencies appropriately (especially for component tests)

## Running Tests

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- src/__tests__/components_multiframe_PanelHeader.test.tsx

# Run tests for a specific group (using pattern matching)
npm test -- "src/__tests__/components_multiframe_*"
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
    <div data-testid="mock-layout-selector">
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
| "Cannot find module" | Check path spelling and underscores in imports |
| "Infinite re-render" | Use `_isTestingMode` prop in `MultiFrameContainer` tests |
| "Missing test case ID" | Add `TC123:` prefix to test descriptions |
| "Mock component not working" | Ensure mocks have proper TypeScript typing and don't trigger state updates |

## Known Issues

### Infinite Re-render Issue

The `MultiFrameContainer` component can cause infinite re-render loops in tests due to how it manages state and interacts with child components. This is currently addressed with the `_isTestingMode` flag.

### Panel State Version Conflicts

The `FilterPanel` component may show "Panel state version conflict" warnings in tests. These are expected and don't affect test functionality but indicate areas for future improvement in state management.

## Resources

For more information on testing standards, see:
- [TEST-GUIDE.md](../../TEST-GUIDE.md) - Quick reference guide
- [TESTING.md](../../TESTING.md) - Complete testing documentation
- [test-plan.json](../../test-plan.json) - Test case catalog

## Adding New Tests

Use the test generator to create properly structured test files:

```bash
node create-test.js --component=components/path/to/component --testid=TC101
```

This will create a test file with the correct naming convention and test case IDs. 
# Filter System Testing Guide

This document covers testing strategies and best practices for the Filter System components.

## Contents

1. [Testing Approach](#testing-approach)
2. [Test Categories](#test-categories)
3. [Running Tests](#running-tests)
4. [Common Test Issues](#common-test-issues)
5. [Test Coverage](#test-coverage)

## Testing Approach

The Filter System follows a comprehensive testing approach that includes:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between related components
- **Service Tests**: Verify storage and utility function behavior
- **Hook Tests**: Validate React hook behavior with and without context

## Test Categories

### Service Tests

Tests for filter service and panel state service:

- `filterService.test.ts`: Tests filter application, storage, and utilities
- `panelStateService.test.ts`: Tests panel state persistence and operations

### Hook Tests

Tests for React hooks:

- `useFilter.test.tsx`: Tests the useFilter and useFilteredData hooks
- `usePanelState.test.tsx`: Tests the usePanelState hook

### Component Tests

Tests for UI components:

- `FilterPanel.test.tsx`: Tests the FilterPanel component

### Context Tests 

Tests for context providers:

- `FilterContext.test.tsx`: Tests the FilterContextProvider

### Integration Tests

Cross-component tests:

- `FilterSystemIntegration.test.tsx`: Tests filter system components working together

## Running Tests

You can run the filter system tests using the provided script:

```powershell
# From the project root
./test-filters.ps1
```

Or run individual tests:

```bash
# Run specific test
cd client
npx vitest run src/_tests_/TC2301_services_filterService.test.ts

# Run with watch mode for development
npx vitest watch src/_tests_/TC1301_hooks_useFilter.test.tsx
```

## Common Test Issues

### Storage Key Format Issues

If tests fail with errors about storage keys not matching:

- Ensure all code uses the standardized key format: `panelState_<panelId>`
- Update tests to use the same format
- Check for hardcoded key references in both code and tests

### Mock Implementation Problems

If tests fail due to mock functions not working as expected:

- Use `vi.mock()` at the top level, not inside test functions
- Reset mocks in `beforeEach()` with `vi.resetAllMocks()`
- For complex mocks, use `mockImplementation()` instead of `mockReturnValue()`

### React Testing Library Issues

If components don't update as expected during tests:

- Wrap state changes in `act()` to ensure React processes updates
- Use `waitFor()` for asynchronous operations
- Check that event handlers are properly triggered with `fireEvent`

### Context Provider Issues

If hooks fail with "must be used within Provider" errors:

- Always wrap test components in the appropriate providers
- Use the `wrapper` option in `renderHook()` for testing hooks
- Ensure providers are nested in the correct order

## Test Coverage

The filter system tests aim for high coverage across:

| Category | Target Coverage |
|----------|----------------|
| Services | 90%+ |
| Hooks | 85%+ |
| Components | 80%+ |
| Integration | Key workflows |

Current coverage can be checked with:

```bash
cd client
npx vitest run --coverage
```

## Best Practices

### Test in Isolation

- Use mocks to isolate the component under test
- Don't rely on external services or APIs
- Test one thing at a time

### Use Descriptive Test Names

- Test names should describe what is being tested
- Use a consistent naming convention
- Group related tests using describe blocks

### Test Edge Cases

- Test error handling
- Test with empty or invalid data
- Test with large datasets

### Keep Tests DRY

- Use `beforeEach` to set up common test fixtures
- Create helper functions for common test operations
- Use shared mocks for common dependencies

## Related Documentation

- [Filter System Architecture](./architecture.md)
- [Filter System API Reference](../api/filter-system.md)
- [Using Filters in Components](../guides/using-filters.md)

Tests are organized in the `_tests_` directory, which contains test files with TC IDs:

```
client/src/_tests_/
├── TC*_components_*       # Component tests with flattened structure using underscores
├── TC*_hooks_*            # Custom React hook tests with flattened structure
├── TC*_integration_*      # Integration tests with flattened structure
├── TC*_services_*         # Service layer tests with flattened structure
└── README.md              # Test setup documentation
``` 
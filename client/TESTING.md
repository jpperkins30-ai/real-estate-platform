# Testing Guidelines

## Test Organization

All tests for the Real Estate Platform client application should be placed in the central test directory:

```
src/__tests__/
```

We use a flattened test structure, where all test files reside directly in the `src/__tests__/` directory. 
Test files are named descriptively with test case references to ensure traceability to requirements.

## Test File Naming

Test files should follow this naming convention:

1. Test case reference: `TC{ID}_` prefix
   - Example: `TC123_PanelHeader.test.tsx` for test case #123

2. Component/category: `[Category_]ComponentName.test.tsx`
   - Examples: `TC101_PanelHeader.test.tsx`, `TC202_multiframe_DraggablePanel.test.tsx`

3. Hooks: `TC{ID}_[Category_]hookName.test.ts`
   - Examples: `TC301_useResizable.test.ts`, `TC305_panels_usePanelState.test.ts`

4. Services: `TC{ID}_[Category_]serviceName.test.ts`
   - Examples: `TC401_apiService.test.ts`, `TC405_data_propertyService.test.ts`

The naming convention provides the following benefits:
- Traceability to test case documentation
- Easy identification of test purpose
- Clear categorization by module or functionality
- Simplified test reporting and requirement mapping

## Running Tests

To run all tests:

```
npm test
```

To run tests only in the standardized central test directory:

```
npm run test:standard
```

To run tests for a specific test case:

```
npm test -- TC123
```

To watch tests during development:

```
npm run test:watch
```

To generate a coverage report:

```
npm run test:coverage
```

## Test Quality Guidelines

1. Each test should be focused on a single behavior or functionality
2. Use descriptive test names that explain what is being tested
3. Follow the Arrange-Act-Assert pattern
4. Mock external dependencies appropriately
5. Use data-testid attributes for component querying
6. Avoid testing implementation details, focus on behavior
7. Keep tests independent from each other

## Test Case Mapping

Test files should reference the test cases they implement. The first line of the test file should include a comment that references the test case description:

```tsx
// Test Case 123: Verify that PanelHeader correctly displays the title and action buttons
import { render, screen, fireEvent } from '@testing-library/react';
import PanelHeader from '../components/multiframe/PanelHeader';
```

## Component Testing Example

```tsx
// Test Case 101: Verify MyComponent renders and handles events correctly
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders the component with default props', () => {
    render(<MyComponent />);
    expect(screen.getByTestId('my-component')).toBeInTheDocument();
  });

  it('handles button click correctly', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Hook Testing Example

```tsx
// Test Case 201: Verify useMyHook state management functionality
import { renderHook, act } from '@testing-library/react-hooks';
import useMyHook from '../hooks/useMyHook';

describe('useMyHook', () => {
  it('returns the initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });

  it('updates state when action is called', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.value).toBe(1);
  });
});
```

## Test Process Enforcement

To ensure consistent test organization and standards, we've implemented several tools:

### Creating New Tests

Always use the test generator script to create new test files:

```bash
npm run create-test
```

This interactive script will:
1. Prompt you for test case details
2. Generate a properly named file in the correct location
3. Add the required test case documentation
4. Set up the basic test structure based on the type of test

### Test Structure Validation

#### Windows Users

Before committing your changes, run the pre-commit check to validate your test files:

```powershell
npm run precommit
```

This will scan all test files and report any that don't follow the standardized format. The check verifies:

1. Files are in the correct location (directly in `src/__tests__/`)
2. Files have the proper naming format (`TCxxx_description.test.ts`)
3. Files include the test case description comment on the first line

#### GitHub Integration

A GitHub Actions workflow will automatically run on pull requests to verify all test files follow the standardized structure. Tests that don't comply will cause the workflow to fail, preventing merges until the issues are resolved.

### VS Code Snippets

We've provided VS Code snippets to help create properly structured tests. In a test file, type:

- `tccomp` - For component tests
- `tchook` - For hook tests
- `tcutil` - For utility function tests
- `tcpage` - For page tests

These snippets will create the proper test structure with all required elements.

## Important Notes

- ⚠️ **DO NOT** create tests in component-level `__tests__` directories
- ⚠️ **DO NOT** create nested test directories in `src/__tests__/`
- ⚠️ **DO NOT** manually create test files, use `npm run create-test`
- ✅ **DO** follow the flattened test structure pattern
- ✅ **DO** include test case references in file names
- ✅ **DO** add test case description comments to test files 
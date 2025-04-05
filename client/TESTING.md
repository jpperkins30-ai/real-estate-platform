# Testing Documentation and Guidelines

## Overview

This document outlines the testing approach, structure, and best practices for the Real Estate Platform client application. Following these guidelines ensures consistent, maintainable, and effective tests across the codebase.

## Test Structure

We use a **flattened test directory structure** with test case IDs in the filenames, which helps with traceability and organization.

### Directory Structure

```
client/
├── src/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── ...
│   └── _tests_/              # All tests live here
│       ├── README.md         # Testing guidelines
│       ├── TC101_*.test.*    # Component tests with Test Case IDs
│       ├── TC201_*.test.*    # More component tests
│       ├── TC2301_*.test.*   # Service tests
│       └── ...
├── test-core-layout.ps1      # Script to run core layout tests
├── test-plan.json            # Test plan with test case IDs
└── TESTING.md                # This file
```

### Naming Convention

Test files follow this naming pattern:
```
TC{ID}_{category}_{component_path}.test.{js|ts|tsx}
```

Where:
- `TC{ID}` is the test case ID from the test plan
- `category` is the type of module being tested (components, services, hooks, etc.)
- `component_path` is the path segments of the component joined by underscores
- File extension matches the source file being tested

Examples:
- `TC201_components_multiframe_layouts_TriPanelLayout.test.tsx`
- `TC2201_services_dbConnection.test.ts`
- `TC601_hooks_useDraggable.test.tsx`

### Test Case IDs

All test files and test descriptions must include a test case ID that references the test plan. This ensures traceability between tests and requirements.

Test case IDs follow this format:
```
TC{ID}
```

Where `{ID}` is a numeric identifier that matches an entry in the test plan.

Example test with test case ID:
```typescript
// In file TC931_components_multiframe_layouts_SinglePanelLayout.test.tsx
describe('SinglePanelLayout', () => {
  it('TC931: renders a panel container with the correct props', () => {
    // test implementation
  });
  
  it('TC932: shows empty message when no panels are provided', () => {
    // test implementation
  });
});
```

### Test Plan

All tests must reference test case IDs from the `test-plan.json` file. This file contains:
- Test case IDs
- Test descriptions
- Requirements traceability
- Priority level

Before creating new tests, check the test plan to find an appropriate test case ID. If you need to create tests not covered by the test plan, consult with the tech lead to update the test plan first.

## Test Tools and Setup

### Core Technologies

- **Testing Framework**: Vitest
- **UI Testing**: React Testing Library
- **Mocking**: Vitest mocking utilities
- **Database Testing**: mongodb-memory-server

### Setting Up Tests

1. MongoDB tests are configured in test setup files
2. Component tests should mock dependencies to focus on isolated behavior
3. Use `beforeEach`/`afterEach` hooks for setup/teardown logic
4. Use the test utilities in `src/test/` directory for common testing operations

## Testing Standards

### Coverage Requirements

- **Components**: 80% line coverage minimum
- **Services**: 90% line coverage minimum
- **Hooks**: 85% line coverage minimum
- **Utils**: 95% line coverage minimum

### Test Organization

1. Group related tests using `describe` blocks
2. Use clear, descriptive test names with the pattern: "TC{ID}: should [expected behavior] when [condition]"
3. Separate setup, action, and assertion phases in tests

```typescript
// Good example
it('TC931: should show empty message when no panels are provided', () => {
  // Setup
  render(<SinglePanelLayout panels={[]} />);
  
  // Assert
  expect(screen.getByTestId('empty-single-layout')).toBeInTheDocument();
  expect(screen.getByText('No panel configured')).toBeInTheDocument();
});
```

### Mocking Best Practices

1. Always use the correct source path when mocking:
```typescript
// CORRECT
vi.mock('../components/multiframe/PanelContainer', () => ({...}));
```

2. Only mock what is necessary for the test
3. Add types to mock functions to avoid TypeScript errors
4. Reset mocks between tests to avoid interference
5. Use the test utilities in `src/test/mocks/` directory for common mocking operations

## Test Automation Tools

We provide several tools to ensure test quality and consistency:

### 1. Pre-commit Validation

Run `pre-commit-check.ps1` before committing to verify tests meet standards:

```powershell
./pre-commit-check.ps1
```

### 2. Test Generator

Use `create-test.js` to generate properly structured test files:

```bash
node create-test.js --component=components/multiframe/layouts/QuadPanelLayout --testid=TC123
```

### 3. Test Validation

The `validate-all-tests.js` script ensures existing tests meet our standards:

```bash
node validate-all-tests.js
```

This checks for:
- Proper file naming
- Correct import paths
- Required assertions
- Mock usage patterns
- Test case ID inclusion
- Test case ID validation against the test plan

### 4. CI Integration

Our GitHub workflow (`test-validation.yml`) automatically runs tests on pull requests to ensure quality.

## Test Case Management

### Adding New Test Cases

1. First check if an existing test case ID covers your test in the `test-plan.json` file
2. If not, consult with the tech lead to add a new test case to the test plan
3. Only after the test plan is updated should you create a new test with that ID

### Test Plan Format

The `test-plan.json` file follows this structure:

```json
{
  "testCases": [
    {
      "id": "TC101",
      "description": "Verify SinglePanelLayout renders correctly",
      "requirements": ["REQ-UI-001"],
      "priority": "high"
    },
    {
      "id": "TC102",
      "description": "Verify SinglePanelLayout shows empty state message",
      "requirements": ["REQ-UI-002"],
      "priority": "medium"
    }
  ]
}
```

## Debugging Tests

1. Use the `--debug` flag with Vitest to debug tests in browser:
```bash
npx vitest --debug
```

2. For component tests, use screen.debug() to output DOM:
```typescript
render(<MyComponent />);
screen.debug();
```

3. Use `it.only()` to run a specific test in isolation

## FAQ and Troubleshooting

### Q: Why use a flattened test structure?
A: It simplifies test file organization, avoids deep nesting, and makes it easier to find tests.

### Q: How do I mock a component that has many dependencies?
A: Create a separate mock file in `src/test/mocks/` and import it in your test.

### Q: How do I test asynchronous components?
A: Use `await` with React Testing Library's `findBy*` queries, or wrap assertions in `waitFor()`.

### Q: What if I need to test something not in the test plan?
A: Work with the tech lead to update the test plan first, then create your test with the new test case ID.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
- [Jest DOM Custom Matchers](https://github.com/testing-library/jest-dom) 
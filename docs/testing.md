# Testing Guide

## Overview
This guide covers the testing infrastructure and best practices for the real estate platform, with a focus on the enhanced panel system and controller integration.

## Testing Stack
- **Vitest**: Main testing framework
- **@testing-library/react**: React component testing
- **@testing-library/jest-dom**: DOM testing utilities
- **@testing-library/user-event**: User interaction simulation

## Test Structure

### Directory Organization
```
src/
├── __tests__/
│   ├── components/
│   │   ├── EnhancedPanelContainer.test.tsx
│   │   └── controllers/
│   │       └── ControllerWizardLauncher.test.tsx
│   └── hooks/
│       ├── useDraggable.test.tsx
│       └── useResizable.test.tsx
└── components/
    └── multiframe/
        └── __tests__/
            ├── DraggablePanel.test.tsx
            └── PanelHeader.test.tsx
```

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `hookName.test.tsx`
- Service tests: `serviceName.test.ts`

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npx vitest run src/path/to/test.tsx
```

### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    },
    globals: true
  }
});
```

## Writing Tests

### Component Testing

#### Basic Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { DraggablePanel } from '../components/multiframe';

describe('DraggablePanel', () => {
  it('renders with title', () => {
    render(
      <DraggablePanel
        id="test-panel"
        title="Test Panel"
        initialPosition={{ x: 0, y: 0 }}
      >
        Content
      </DraggablePanel>
    );

    expect(screen.getByText('Test Panel')).toBeInTheDocument();
  });
});
```

#### Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event';

describe('PanelHeader', () => {
  it('handles close button click', async () => {
    const onClose = vi.fn();
    render(<PanelHeader title="Test" onClose={onClose} />);
    
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Hook Testing

#### Custom Hook Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useResizable } from '../hooks/useResizable';

describe('useResizable', () => {
  it('updates size on resize', () => {
    const { result } = renderHook(() => useResizable({
      initialSize: { width: 100, height: 100 }
    }));

    act(() => {
      result.current.onResize({ width: 200, height: 200 });
    });

    expect(result.current.size).toEqual({ width: 200, height: 200 });
  });
});
```

### Service Testing

#### API Service Test
```typescript
import { ControllerService } from '../services/controllerService';

describe('ControllerService', () => {
  it('fetches controller status', async () => {
    const service = new ControllerService();
    const response = await service.fetchControllerStatus('property', '123');
    
    expect(response.data).toMatchObject({
      hasController: true,
      status: 'active'
    });
  });
});
```

## Mocking

### Function Mocks
```typescript
import { vi } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'test' })
});
```

### Module Mocks
```typescript
vi.mock('../services/controllerService', () => ({
  ControllerService: vi.fn().mockImplementation(() => ({
    fetchControllerStatus: vi.fn().mockResolvedValue({
      data: { status: 'active' }
    })
  }))
}));
```

### Component Mocks
```typescript
vi.mock('../components/PanelHeader', () => ({
  PanelHeader: ({ title }: { title: string }) => (
    <div data-testid="mock-header">{title}</div>
  )
}));
```

## Test Utilities

### Custom Render
```typescript
// test/utils.tsx
import { render } from '@testing-library/react';
import { LayoutProvider } from '../context/LayoutContext';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LayoutProvider>
      {ui}
    </LayoutProvider>
  );
};
```

### Custom Matchers
```typescript
// test/setup.ts
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
```

## Best Practices

### Component Testing
1. Test component rendering
2. Test user interactions
3. Test prop changes
4. Test error states
5. Test loading states

### Hook Testing
1. Test initial state
2. Test state updates
3. Test cleanup
4. Test error handling
5. Test side effects

### Service Testing
1. Test API calls
2. Test error handling
3. Test response parsing
4. Test retry logic
5. Test caching

## Common Patterns

### Testing Async Operations
```typescript
it('loads data asynchronously', async () => {
  render(<AsyncComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await screen.findByText('Data loaded');
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### Testing Error Boundaries
```typescript
it('handles errors gracefully', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  render(
    <ErrorBoundary>
      <ComponentThatThrows />
    </ErrorBoundary>
  );
  
  expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument();
  spy.mockRestore();
});
```

## Coverage Requirements
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Debugging Tests

### Debug Output
```typescript
screen.debug(); // Print current DOM
console.log(prettyDOM(container)); // Print formatted DOM
```

### Test Environment
```typescript
// Enable debugging in test environment
localStorage.debug = 'app:*';
```

## Continuous Integration
- Tests run on every pull request
- Coverage reports generated
- Test results published
- Failed tests block merging

## Resources
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest DOM Documentation](https://github.com/testing-library/jest-dom)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro/) 
# Multi-Frame System Test Methodology

## Overview

This document outlines the testing methodology for the multi-frame system components. It serves as a reference for implementing tests across all chunks of the system.

## Test Structure

### 1. Unit Tests

Each component should have comprehensive unit tests covering:

```typescript
describe('Component', () => {
  describe('Core Functionality', () => {
    it('renders without crashing', () => {
      // Basic render test
    });
    
    it('handles props correctly', () => {
      // Props validation
    });
    
    it('maintains internal state', () => {
      // State management
    });
  });

  describe('Event Handling', () => {
    it('handles user interactions', () => {
      // User events
    });
    
    it('calls callbacks appropriately', () => {
      // Callback execution
    });
  });

  describe('Error Cases', () => {
    it('handles invalid props gracefully', () => {
      // Error handling
    });
    
    it('recovers from state errors', () => {
      // Error recovery
    });
  });
});
```

### 2. Integration Tests

Integration tests should verify component interactions:

```typescript
describe('Component Integration', () => {
  describe('Panel Communication', () => {
    it('broadcasts events to other panels', async () => {
      // Event broadcasting
    });
    
    it('receives events from other panels', async () => {
      // Event reception
    });
  });

  describe('Layout Integration', () => {
    it('updates layout state correctly', async () => {
      // Layout changes
    });
    
    it('persists panel state during layout changes', async () => {
      // State persistence
    });
  });
});
```

### 3. Timer and Async Testing

For components with timers or async operations:

```typescript
describe('Async Operations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('handles async state updates', async () => {
    render(Component);
    await act(async () => {
      vi.runAllTimers();
    });
    // Assert state after timer
  });
});
```

## Testing Guidelines

### 1. Test Setup

Each test file should:
1. Import required testing utilities
2. Set up mocks before tests
3. Clean up after tests
4. Use appropriate test doubles

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
vi.mock('../../hooks/usePanelSync', () => ({
  usePanelSync: vi.fn()
}));

describe('Component', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });
});
```

### 2. React Testing Best Practices

1. **Component Rendering**
   ```typescript
   it('renders correctly', () => {
     render(<Component {...props} />);
     expect(screen.getByRole('button')).toBeInTheDocument();
   });
   ```

2. **User Interactions**
   ```typescript
   it('handles user input', async () => {
     render(<Component />);
     await act(async () => {
       fireEvent.click(screen.getByRole('button'));
     });
     expect(screen.getByText('Clicked')).toBeInTheDocument();
   });
   ```

3. **State Updates**
   ```typescript
   it('updates state', async () => {
     render(<Component />);
     await act(async () => {
       // Trigger state update
     });
     await waitFor(() => {
       expect(screen.getByText('Updated')).toBeInTheDocument();
     });
   });
   ```

### 3. Panel Communication Testing

Test panel communication using the following patterns:

```typescript
describe('Panel Communication', () => {
  const mockBroadcast = vi.fn();
  const mockSubscribe = vi.fn();

  beforeEach(() => {
    (usePanelSync as any).mockReturnValue({
      broadcast: mockBroadcast,
      subscribe: mockSubscribe
    });
  });

  it('subscribes to events on mount', () => {
    render(<Panel panelId="test" />);
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('broadcasts events correctly', async () => {
    render(<Panel panelId="test" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(mockBroadcast).toHaveBeenCalledWith({
      type: 'event',
      payload: expect.any(Object),
      source: 'test'
    });
  });
});
```

## Test Coverage Requirements

Each chunk should maintain the following coverage metrics:

1. **Statements**: > 80%
2. **Branches**: > 75%
3. **Functions**: > 80%
4. **Lines**: > 80%

## Testing Chunks

### Chunk 1: Core Layout
- Test layout rendering
- Test panel container functionality
- Test layout switching
- Test basic panel content loading

### Chunk 2: Panel Communication
- Test event broadcasting
- Test event subscription
- Test panel state updates
- Test content registry functionality

### Chunk 3: Filter System
- Test filter context implementation
- Test panel state persistence
- Test filter synchronization between panels
- Test property and geographic filter functionality
- Test filter preset saving and loading
- Test filter application to data sets

### Chunk 4: Layout Persistence
- Test layout saving
- Test layout loading
- Test layout migration
- Test default layout handling

### Chunk 5: Panel Drag and Resize
- Test drag operations
- Test resize operations
- Test layout constraints
- Test panel snapping

## Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific chunk
npm test -- --grep "Chunk 1"

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Debugging Tests

1. Use the `debug()` utility:
   ```typescript
   it('debugs rendering', () => {
     render(<Component />);
     screen.debug();
   });
   ```

2. Use browser devtools:
   ```typescript
   it('debugs in browser', () => {
     render(<Component />);
     // Add debugger statement
     debugger;
   });
   ```

## Common Testing Patterns

### 1. Testing Layout Changes

```typescript
it('handles layout changes', async () => {
  render(<MultiFrameContainer />);
  
  // Change layout
  await act(async () => {
    fireEvent.click(screen.getByText('Dual Layout'));
  });
  
  // Verify layout change
  expect(screen.getAllByTestId('panel-container')).toHaveLength(2);
});
```

### 2. Testing Panel State

```typescript
it('maintains panel state', async () => {
  render(<Panel initialState={{ data: 'test' }} />);
  
  // Trigger state change
  await act(async () => {
    fireEvent.click(screen.getByText('Update'));
  });
  
  // Verify state persistence
  expect(screen.getByText('Updated Data')).toBeInTheDocument();
});
```

### 3. Testing Error Boundaries

```typescript
it('handles errors gracefully', async () => {
  const ErrorComponent = () => {
    throw new Error('Test Error');
  };
  
  render(
    <ErrorBoundary>
      <ErrorComponent />
    </ErrorBoundary>
  );
  
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

## Continuous Integration

Tests should be run in CI with the following workflow:

1. Install dependencies
2. Run linting
3. Run type checking
4. Run tests with coverage
5. Upload coverage reports
6. Fail if coverage thresholds not met

## Test Maintenance

1. Keep tests focused and atomic
2. Use meaningful test descriptions
3. Update tests when component behavior changes
4. Remove obsolete tests
5. Document complex test scenarios 
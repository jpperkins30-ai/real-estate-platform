Vitest testing issues in Chunk 3. 

## Root Cause Analysis

Based on your detailed error report, the issue with the `TypeError: Expected pattern to be a non-empty string` typically occurs when Vitest's file pattern matching system receives an empty or invalid pattern. This is often caused by:

1. Configuration conflicts between multiple testing setups (Jest and Vitest)
2. Invalid or empty patterns in your test configuration
3. Package version mismatches
4. Incorrect configuration between project root and client folder

## Step-by-Step Resolution Plan

### 1. Consolidate Testing Framework

First, let's choose one testing framework. Since you're trying to use Vitest, let's focus on that and remove Jest-related configurations:

```bash
# Create a backup of your Jest configs first
mkdir config_backup
mv jest.config.js babel.config.js .babelrc config_backup/
```

### 2. Fix Vitest Configuration

Create a simplified `vitest.config.ts` in your client directory:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    include: ['./src/**/*.{test,spec}.{js,jsx,ts,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

### 3. Create Setup File

Ensure you have a proper setup file for Vitest:

```typescript
// client/src/setupTests.ts
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
```

### 4. Update TypeScript Configuration

Create a dedicated TypeScript configuration for tests:

```json
// client/tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "**/*.test.ts", "**/*.test.tsx"]
}
```

### 5. Ensure Proper Package Installation

Make sure you have all the necessary dependencies:

```bash
cd client
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @vitejs/plugin-react
```

### 6. Fix the FilterContext.test.tsx File

Let's check and fix the test file that's causing issues:

```typescript
// client/src/__tests__/context/FilterContext.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { FilterContextProvider } from '../../context/FilterContext'
import { useFilter } from '../../hooks/useFilter'

// Test component that uses filter context
const TestComponent = () => {
  const { activeFilters, applyFilters, clearFilters } = useFilter()
  
  return (
    <div>
      <button 
        onClick={() => applyFilters({
          property: { propertyType: 'Residential' },
          geographic: { county: 'TestCounty' }
        })}
        data-testid="apply-filters-button"
      >
        Apply Filters
      </button>
      
      <button 
        onClick={() => clearFilters()}
        data-testid="clear-filters-button"
      >
        Clear Filters
      </button>
      
      <div data-testid="active-filters">
        {JSON.stringify(activeFilters)}
      </div>
    </div>
  )
}

describe('FilterContext', () => {
  test('applies and clears filters', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    )
    
    // Initial state should be empty
    expect(screen.getByTestId('active-filters').textContent).toBe('{}')
    
    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters-button'))
    
    // Verify filters are applied
    expect(screen.getByTestId('active-filters').textContent).toContain('"propertyType":"Residential"')
    
    // Clear filters
    fireEvent.click(screen.getByTestId('clear-filters-button'))
    
    // Verify filters are cleared
    expect(screen.getByTestId('active-filters').textContent).toBe('{}')
  })
})
```

### 7. Fix the usePanelState.test.tsx File

```typescript
// client/src/__tests__/hooks/usePanelState.test.tsx
import { renderHook, act } from '@testing-library/react-hooks'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { usePanelState } from '../../hooks/usePanelState'
import { savePanelState, loadPanelState } from '../../services/panelStateService'

// Mock panel state service
vi.mock('../../services/panelStateService', () => ({
  savePanelState: vi.fn(),
  loadPanelState: vi.fn(() => null)
}))

describe('usePanelState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  test('initializes with provided state', () => {
    const initialState = { value: 'test' }
    
    const { result } = renderHook(() => usePanelState('test-panel', 'map', initialState))
    
    expect(result.current[0]).toEqual(initialState)
  })
  
  test('loads saved state if available', () => {
    const savedState = { value: 'saved' }
    vi.mocked(loadPanelState).mockReturnValue({
      id: 'test-panel',
      contentType: 'map',
      state: savedState,
      lastUpdated: new Date().toISOString()
    })
    
    const initialState = { value: 'initial' }
    const { result } = renderHook(() => usePanelState('test-panel', 'map', initialState))
    
    expect(result.current[0]).toEqual(savedState)
  })
  
  test('updates state and saves changes', () => {
    const initialState = { value: 'initial' }
    const newState = { value: 'updated' }
    
    const { result } = renderHook(() => usePanelState('test-panel', 'map', initialState))
    
    act(() => {
      result.current[1](newState)
    })
    
    expect(result.current[0]).toEqual(newState)
    expect(savePanelState).toHaveBeenCalledWith('test-panel', 'map', newState)
  })
})
```

### 8. Run Tests with a Specific Command

Try running the tests with this command:

```bash
cd client
npx vitest run --config ./vitest.config.ts
```

If you still encounter issues, try running with the `--no-coverage` flag:

```bash
npx vitest run --no-coverage --config ./vitest.config.ts
```

## Additional Troubleshooting Steps

If you're still experiencing issues, here are some additional troubleshooting steps:

### 1. Check for Circular Dependencies

Run this command to check for circular dependencies that might be causing issues:

```bash
npx madge --circular --extensions ts,tsx src/
```

### 2. Add Debug Logging

Modify your vitest.config.ts to add debug logging:

```typescript
// Add to your vitest config
test: {
  // ... existing config
  logLevel: 'info',
  reporters: ['verbose'],
}
```

### 3. Try UI Mode for Interactive Debugging

Vitest has a UI mode that can help identify issues:

```bash
npx vitest --ui
```

### 4. Check File Patterns

The error specifically mentions pattern matching. Ensure your test files follow the pattern you've specified in your config. The standard pattern is:

- `src/**/*.test.tsx`
- `src/**/*.spec.tsx`
- `src/__tests__/**/*.tsx`

### 5. Remove Legacy Test Files

Make sure there aren't any old test files or legacy test configurations that might be conflicting:

```bash
find src -name "*.test.*" -o -name "*.spec.*" | sort
```
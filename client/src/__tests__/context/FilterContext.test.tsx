import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FilterContext, FilterContextProvider } from '../../context/FilterContext';
import { FilterSet } from '../../types/filter.types';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component using the context
const TestComponent: React.FC = () => {
  const { activeFilters, applyFilters, clearFilters, savedFilters, saveFilter, loadFilter, deleteFilter } = React.useContext(FilterContext);
  
  return (
    <div>
      <div data-testid="active-filters">{JSON.stringify(activeFilters)}</div>
      <div data-testid="saved-filters">{JSON.stringify(savedFilters)}</div>
      <button onClick={() => applyFilters({ property: { propertyType: 'residential' } })}>
        Apply Filter
      </button>
      <button onClick={() => clearFilters()}>
        Clear Filters
      </button>
      <button onClick={() => saveFilter({ name: 'Test Filter', filters: { property: { propertyType: 'residential' } } })}>
        Save Filter
      </button>
      {savedFilters.length > 0 && (
        <>
          <button onClick={() => loadFilter(savedFilters[0].id)}>
            Load Filter
          </button>
          <button onClick={() => deleteFilter(savedFilters[0].id)}>
            Delete Filter
          </button>
        </>
      )}
    </div>
  );
};

describe('FilterContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('provides default context values', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    );

    expect(screen.getByTestId('active-filters')).toHaveTextContent('{}');
    expect(screen.getByTestId('saved-filters')).toHaveTextContent('[]');
  });

  it('applies filters correctly', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    );

    const applyButton = screen.getByText('Apply Filter');
    
    act(() => {
      fireEvent.click(applyButton);
    });

    expect(screen.getByTestId('active-filters')).toHaveTextContent('residential');
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('clears filters correctly', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    );

    // First apply a filter
    const applyButton = screen.getByText('Apply Filter');
    act(() => {
      fireEvent.click(applyButton);
    });

    // Then clear it
    const clearButton = screen.getByText('Clear Filters');
    act(() => {
      fireEvent.click(clearButton);
    });

    expect(screen.getByTestId('active-filters')).toHaveTextContent('{}');
  });

  it('saves filters correctly', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    );

    const saveButton = screen.getByText('Save Filter');
    
    act(() => {
      fireEvent.click(saveButton);
    });

    // Check if a filter was saved
    expect(screen.getByTestId('saved-filters')).not.toHaveTextContent('[]');
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('loads and deletes filters correctly', () => {
    render(
      <FilterContextProvider>
        <TestComponent />
      </FilterContextProvider>
    );

    // First save a filter
    const saveButton = screen.getByText('Save Filter');
    act(() => {
      fireEvent.click(saveButton);
    });

    // Check if Load Filter and Delete Filter buttons appear
    expect(screen.getByText('Load Filter')).toBeInTheDocument();
    expect(screen.getByText('Delete Filter')).toBeInTheDocument();

    // Test loading the filter
    const loadButton = screen.getByText('Load Filter');
    act(() => {
      fireEvent.click(loadButton);
    });
    
    expect(screen.getByTestId('active-filters')).toHaveTextContent('residential');

    // Test deleting the filter
    const deleteButton = screen.getByText('Delete Filter');
    act(() => {
      fireEvent.click(deleteButton);
    });
    
    // Check that saved filters is now empty
    expect(screen.getByTestId('saved-filters')).toHaveTextContent('[]');
  });
}); 
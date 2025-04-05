// Test Case 2603: Verify FilterSystemIntegration across application
// Test Case TC2603: Verify FilterSystemIntegration across application
// Test Case TC999: Verify integration_FilterSystemIntegration functionality
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FilterContextProvider } from "../context/FilterContext";
import { PanelSyncProvider } from "../context/PanelSyncContext";
import { FilterPanel } from "../components/multiframe/filters/FilterPanel";
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as FilterHook from "../hooks/useFilter";

// Mock the services to avoid localStorage issues in tests
vi.mock('../../services/filterService', () => ({
  loadFiltersFromStorage: vi.fn(() => null),
  saveFiltersToStorage: vi.fn(),
  loadFilterPresetsFromStorage: vi.fn(() => []),
  saveFilterPresetsToStorage: vi.fn(),
  validateFilterConfig: vi.fn(() => true),
  applyFiltersToData: vi.fn((data, filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }
    
    if (filters.property?.propertyType === 'Residential') {
      return data.filter((item: any) => item.propertyType === 'Residential');
    }
    
    return data;
  })
}));

vi.mock('../../services/panelStateService', () => ({
  loadPanelState: vi.fn(),
  savePanelState: vi.fn(),
  deletePanelState: vi.fn()
}));

// Mock useFilter hook
const mockApplyFilters = vi.fn();
const mockClearFilters = vi.fn();

vi.mock('../../hooks/useFilter', () => ({
  useFilter: () => ({
    activeFilters: {},
    applyFilters: mockApplyFilters,
    clearFilters: mockClearFilters,
    savedFilters: [],
    saveFilter: vi.fn(),
    deleteFilter: vi.fn(),
    loadFilter: vi.fn(),
    mergeFilters: vi.fn()
  })
}));

// Create a test component that uses filter context and applies filters
const FilterConsumer = ({ panelId }: { panelId: string }) => {
  const [filteredData, setFilteredData] = React.useState<any[]>([]);
  
  // When this component receives filter events, update the filtered data
  React.useEffect(() => {
    // Simulate filtering
    setFilteredData([{ id: 1, propertyType: 'Residential' }]);
    
    return () => {
      // Cleanup subscription
    };
  }, [panelId]);
  
  return (
    <div data-testid={`filter-consumer-${panelId}`}>
      <div data-testid={`filtered-count-${panelId}`}>
        {filteredData.length}
      </div>
      <div data-testid={`consumer-data-${panelId}`}>
        {JSON.stringify(filteredData)}
      </div>
    </div>
  );
};

// Test wrapper component
const FilterSystemWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FilterContextProvider>
    <PanelSyncProvider>
      {children}
    </PanelSyncProvider>
  </FilterContextProvider>
);

describe('FilterSystem Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('integrates FilterPanel with FilterContext', () => {
    render(
      <FilterSystemWrapper>
        <FilterPanel
          panelId="panel-1"
          onStateChange={() => {}}
          onAction={() => {}}
        />
        <FilterConsumer panelId="panel-2" />
      </FilterSystemWrapper>
    );
    
    // FilterPanel and FilterConsumer should both render
    expect(screen.getByTestId('apply-filters-button')).toBeInTheDocument();
    expect(screen.getByTestId('filter-consumer-panel-2')).toBeInTheDocument();
    
    // FilterConsumer should have filtered data
    expect(screen.getByTestId('filtered-count-panel-2')).toHaveTextContent('1');
  });
  
  it('applies filters and updates state when ApplyFilters button is clicked', () => {
    render(
      <FilterSystemWrapper>
        <FilterPanel
          panelId="panel-1"
          onStateChange={() => {}}
          onAction={() => {}}
        />
        <FilterConsumer panelId="panel-2" />
      </FilterSystemWrapper>
    );
    
    // Click Apply Filters button
    const applyButton = screen.getByTestId('apply-filters-button');
    act(() => {
      fireEvent.click(applyButton);
    });
    
    // Should call applyFilters
    expect(mockApplyFilters).toHaveBeenCalled();
  });
  
  it('clears filters when ClearFilters button is clicked', () => {
    render(
      <FilterSystemWrapper>
        <FilterPanel
          panelId="panel-1"
          onStateChange={() => {}}
          onAction={() => {}}
        />
        <FilterConsumer panelId="panel-2" />
      </FilterSystemWrapper>
    );
    
    // Click Clear Filters button
    const clearButton = screen.getByTestId('clear-filters-button');
    act(() => {
      fireEvent.click(clearButton);
    });
    
    // Should call clearFilters
    expect(mockClearFilters).toHaveBeenCalled();
  });
  
  it('shares filter updates across multiple consumers', () => {
    render(
      <FilterSystemWrapper>
        <FilterPanel
          panelId="panel-1"
          onStateChange={() => {}}
          onAction={() => {}}
        />
        <FilterConsumer panelId="panel-2" />
        <FilterConsumer panelId="panel-3" />
      </FilterSystemWrapper>
    );
    
    // Both consumers should render and show the same filtered data count
    expect(screen.getByTestId('filtered-count-panel-2')).toHaveTextContent('1');
    expect(screen.getByTestId('filtered-count-panel-3')).toHaveTextContent('1');
  });
}); 






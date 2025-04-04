import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../../../../components/multiframe/filters/FilterPanel';
import { FilterContextProvider } from '../../../../context/FilterContext';
import { PanelSyncProvider } from '../../../../context/PanelSyncContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock local storage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Wrapper component for providing context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FilterContextProvider>
    <PanelSyncProvider>
      {children}
    </PanelSyncProvider>
  </FilterContextProvider>
);

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('renders correctly with default props', () => {
    render(
      <TestWrapper>
        <FilterPanel panelId="test-panel" />
      </TestWrapper>
    );

    // Check if the component renders correctly
    expect(screen.getByText(/Property Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Geographic Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Filter/i)).toBeInTheDocument();
  });

  it('handles property filter changes', () => {
    render(
      <TestWrapper>
        <FilterPanel panelId="test-panel" />
      </TestWrapper>
    );

    // Select property type
    const propertyTypeSelect = screen.getByLabelText(/Property Type:/i);
    fireEvent.change(propertyTypeSelect, { target: { value: 'residential' } });
    
    // Apply filters
    const applyButton = screen.getByText(/Apply Filters/i);
    fireEvent.click(applyButton);

    // Check if filters were saved to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('handles clear filters correctly', () => {
    render(
      <TestWrapper>
        <FilterPanel panelId="test-panel" />
      </TestWrapper>
    );

    // Set some filter values first
    const propertyTypeSelect = screen.getByLabelText(/Property Type:/i);
    fireEvent.change(propertyTypeSelect, { target: { value: 'residential' } });

    // Clear filters
    const clearButton = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearButton);

    // Check if the value was cleared
    expect(propertyTypeSelect).toHaveValue('');
  });

  it('shows save filter form when Save Filter button is clicked', () => {
    render(
      <TestWrapper>
        <FilterPanel panelId="test-panel" />
      </TestWrapper>
    );

    // Click save filter button
    const saveButton = screen.getByText(/Save Filter/i);
    fireEvent.click(saveButton);

    // Check if save filter form is shown
    expect(screen.getByText(/Save Current Filter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
  });
}); 
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountyPanel } from '../../../../components/multiframe/panels/CountyPanel';
import { render, user, waitForElement, debugDOM } from '../../../../test/test-utils';
import { useEntityData } from '../../../../hooks/useEntityData';

// Mock hooks
vi.mock('../../../../hooks/usePanelSync', () => ({
  usePanelSync: () => ({
    broadcast: vi.fn(),
    subscribe: () => vi.fn()
  })
}));

// Mock entity data hook
const mockSetStateId = vi.fn();
const mockSetCountyId = vi.fn();
const mockFetchByParent = vi.fn();

const baseEntityData = {
  entityId: null,
  setEntityId: vi.fn(),
  entity: null,
  statistics: null,
  loading: false,
  error: null,
  fetchByParent: undefined
};

vi.mock('../../../../hooks/useEntityData', () => ({
  useEntityData: vi.fn().mockImplementation((entityType, options = {}) => {
    if (entityType === 'county' && options?.parentEntityType) {
      return {
        ...baseEntityData,
        entityId: options?.initialId || null,
        loading: options?.loading || false,
        error: options?.error || null,
        fetchByParent: mockFetchByParent
      };
    }

    if (entityType === 'state') {
      return {
        ...baseEntityData,
        entityId: options?.initialId || null,
        setEntityId: mockSetStateId,
        entity: options?.initialId ? { id: options.initialId, name: 'Test State' } : null
      };
    }

    return {
      ...baseEntityData,
      entityId: options?.initialId || null,
      setEntityId: mockSetCountyId,
      entity: options?.initialId ? { id: options.initialId, name: 'Test County' } : null,
      statistics: options?.initialId ? {
        totalProperties: 50000,
        averagePrice: 500000,
        activeListings: 1000,
        pendingSales: 200
      } : null
    };
  })
}));

describe('CountyPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchByParent.mockResolvedValue([]);
  });

  it('renders no state selected message', () => {
    render(<CountyPanel panelId="test-panel" />);
    expect(screen.getByText('Select a state to view counties')).toBeInTheDocument();
  });
  
  it('fetches counties when state is selected', async () => {
    // Create counties with the correct structure
    const mockCounties = [
      { 
        id: 'county1', 
        name: 'County 1', 
        population: 100000, 
        statistics: { totalProperties: 50000 } 
      }
    ];
    
    // Mock fetchByParent to return the correctly structured data
    mockFetchByParent.mockResolvedValue(mockCounties);
    
    // Don't mock useState directly
    render(<CountyPanel panelId="test-panel" initialState={{ stateId: 'CA' }} />);
    
    // Increase timeout and check for function call first
    try {
      await waitFor(() => {
        expect(mockFetchByParent).toHaveBeenCalled();
      }, { timeout: 5000 });
    } catch (error) {
      // Print debug info
      console.error('Test failure diagnostics:');
      console.error(`mockFetchByParent called: ${mockFetchByParent.mock.calls.length} times`);
      screen.debug(); // Dump current DOM
      throw error; // Re-throw to fail the test
    }
    
    // Look for rendered data rather than state updates
    try {
      await waitFor(() => {
        // Look for something in the rendered output that indicates success
        const countyElements = screen.getAllByRole('listitem'); // Assuming counties are in list items
        console.log(`Found ${countyElements.length} county elements`);
        expect(countyElements.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    } catch (error) {
      console.error('Failed to find county elements:');
      console.error('Current DOM:');
      screen.debug();
      console.error('Looking for county text directly:');
      try {
        const countyText = screen.getByText(/County 1/i);
        console.log('County text found:', countyText);
      } catch (e) {
        console.error('County text not found');
      }
      throw error;
    }
  });

  it('displays loading state while fetching counties', async () => {
    vi.mocked(useEntityData).mockImplementation((entityType, options) => {
      if (entityType === 'county' && options?.parentEntityType) {
        return {
          ...baseEntityData,
          loading: true,
          error: null,
          fetchByParent: mockFetchByParent
        };
      }
      if (entityType === 'state') {
        return {
          ...baseEntityData,
          entityId: 'CA',
          setEntityId: mockSetStateId,
          entity: { id: 'CA', name: 'California' }
        };
      }
      return baseEntityData;
    });
    
    render(<CountyPanel panelId="test-panel" initialState={{ stateId: 'CA' }} />);
    
    expect(screen.getByText('Loading counties...')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', async () => {
    vi.mocked(useEntityData).mockImplementation((entityType, options) => {
      if (entityType === 'county' && options?.parentEntityType) {
        return {
          ...baseEntityData,
          loading: false,
          error: new Error('Failed to fetch'),
          fetchByParent: mockFetchByParent
        };
      }
      if (entityType === 'state') {
        return {
          ...baseEntityData,
          entityId: 'CA',
          setEntityId: mockSetStateId,
          entity: { id: 'CA', name: 'California' }
        };
      }
      return baseEntityData;
    });
    
    render(<CountyPanel panelId="test-panel" initialState={{ stateId: 'CA' }} />);
    
    expect(screen.getByText('Error loading counties. Please try again.')).toBeInTheDocument();
  });

  it('displays county list when data is loaded', async () => {
    const mockCounties = [
      { id: 'county1', name: 'County 1', statistics: { totalProperties: 50000 } },
      { id: 'county2', name: 'County 2', statistics: { totalProperties: 75000 } }
    ];
    
    mockFetchByParent.mockResolvedValueOnce(mockCounties);
    
    vi.mocked(useEntityData).mockImplementation((entityType, options) => {
      if (entityType === 'county' && options?.parentEntityType) {
        return {
          ...baseEntityData,
          loading: false,
          error: null,
          fetchByParent: mockFetchByParent
        };
      }
      if (entityType === 'state') {
        return {
          ...baseEntityData,
          entityId: 'CA',
          setEntityId: mockSetStateId,
          entity: { id: 'CA', name: 'California' }
        };
      }
      return baseEntityData;
    });
    
    render(<CountyPanel panelId="test-panel" initialState={{ stateId: 'CA' }} />);
    
    await waitFor(() => {
      expect(mockFetchByParent).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      mockCounties.forEach(county => {
        expect(screen.getByText(county.name)).toBeInTheDocument();
        expect(screen.getByText(`${county.statistics.totalProperties} properties`)).toBeInTheDocument();
      });
    });
  });

  it('handles county selection', async () => {
    const mockCounties = [
      { id: 'county1', name: 'County 1', statistics: { totalProperties: 50000 } }
    ];
    
    mockFetchByParent.mockResolvedValueOnce(mockCounties);
    
    vi.mocked(useEntityData).mockImplementation((entityType, options) => {
      if (entityType === 'county' && options?.parentEntityType) {
        return {
          ...baseEntityData,
          loading: false,
          error: null,
          fetchByParent: mockFetchByParent
        };
      }
      if (entityType === 'state') {
        return {
          ...baseEntityData,
          entityId: 'CA',
          setEntityId: mockSetStateId,
          entity: { id: 'CA', name: 'California' }
        };
      }
      if (entityType === 'county' && !options?.parentEntityType) {
        const selectedCounty = options?.initialId ? mockCounties.find(c => c.id === options.initialId) : null;
        return {
          ...baseEntityData,
          entityId: options?.initialId || null,
          setEntityId: mockSetCountyId,
          entity: selectedCounty || null,
          statistics: selectedCounty?.statistics || null
        };
      }
      return baseEntityData;
    });
    
    render(<CountyPanel panelId="test-panel" initialState={{ stateId: 'CA' }} />);
    
    await waitFor(() => {
      expect(mockFetchByParent).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.getByText('County 1')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('County 1'));
    
    expect(mockSetCountyId).toHaveBeenCalledWith('county1');
  });

  it('displays county statistics when selected', async () => {
    const mockCounty = {
      id: 'county1',
      name: 'County 1',
      statistics: {
        totalProperties: 50000,
        averagePrice: 500000,
        activeListings: 1000,
        pendingSales: 200
      }
    };
    
    mockFetchByParent.mockResolvedValueOnce([mockCounty]);
    
    vi.mocked(useEntityData).mockImplementation((entityType, options) => {
      if (entityType === 'county' && options?.parentEntityType) {
        return {
          ...baseEntityData,
          loading: false,
          error: null,
          fetchByParent: mockFetchByParent
        };
      }
      if (entityType === 'state') {
        return {
          ...baseEntityData,
          entityId: 'CA',
          setEntityId: mockSetStateId,
          entity: { id: 'CA', name: 'California' }
        };
      }
      if (entityType === 'county' && !options?.parentEntityType) {
        return {
          ...baseEntityData,
          entityId: 'county1',
          setEntityId: mockSetCountyId,
          entity: mockCounty,
          statistics: mockCounty.statistics
        };
      }
      return baseEntityData;
    });
    
    render(<CountyPanel panelId="test-panel" initialState={{ stateId: 'CA', countyId: 'county1' }} />);
    
    // Wait for initial fetch and state updates
    await waitFor(() => {
      expect(mockFetchByParent).toHaveBeenCalled();
    });

    // Wait for all expected content to be present
    await waitFor(() => {
      // Check for county name and header
      expect(screen.getByText('County 1')).toBeInTheDocument();
      expect(screen.getByText('County 1 Details')).toBeInTheDocument();
      
      // Check for all statistics labels
      expect(screen.getByText('Total Properties')).toBeInTheDocument();
      expect(screen.getByText('Average Price')).toBeInTheDocument();
      expect(screen.getByText('Active Listings')).toBeInTheDocument();
      expect(screen.getByText('Pending Sales')).toBeInTheDocument();
      
      // Check for all statistics values (using more flexible approach)
      expect(screen.getByText('50000')).toBeInTheDocument();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 
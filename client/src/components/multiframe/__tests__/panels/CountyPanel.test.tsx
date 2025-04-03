import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountyPanel } from '../../panels/CountyPanel';
import { useEntityData } from '../../../../hooks/useEntityData';
import { usePanelSync } from '../../../../hooks/usePanelSync';
import { 
  render, 
  defaultEntityDataMock, 
  defaultPanelSyncMock,
  UseEntityDataResult,
  UsePanelSyncReturn
} from '../../../../test/test-utils';
import { PanelConfig } from '../../../types/layout.types';

// Mock the hooks
vi.mock('../../../../hooks/useEntityData', () => ({
  useEntityData: vi.fn()
}));

vi.mock('../../../../hooks/usePanelSync', () => ({
  usePanelSync: vi.fn()
}));

const mockCountyData = {
  id: '12345',
  name: 'Los Angeles County',
  stateId: 'CA',
  population: 123456,
  area: 4567.89,
  medianHomePrice: 750000,
  medianRent: 2500
};

describe('CountyPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset hook mocks with proper types
    vi.mocked(useEntityData).mockReset();
    vi.mocked(usePanelSync).mockReset();
    
    // Default mock implementations with proper types
    vi.mocked(useEntityData).mockReturnValue(defaultEntityDataMock);
    vi.mocked(usePanelSync).mockReturnValue(defaultPanelSyncMock);
  });

  it('shows message when no state is selected', () => {
    render(<CountyPanel panelId="test" initialState={{}} />);
    expect(screen.getByText('Please select a state to view counties')).toBeInTheDocument();
  });

  it('shows loading state while fetching counties', () => {
    vi.mocked(useEntityData).mockReturnValue({
      ...defaultEntityDataMock,
      loading: true
    });

    render(<CountyPanel panelId="test" initialState={{ stateId: 'CA' }} />);
    
    expect(screen.getByText('Loading counties...')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    const error = new Error('Failed to fetch counties');
    vi.mocked(useEntityData).mockReturnValue({
      ...defaultEntityDataMock,
      error
    });

    render(<CountyPanel panelId="test" initialState={{ stateId: 'CA' }} />);
    
    expect(screen.getByText('Error: Failed to fetch counties')).toBeInTheDocument();
  });

  it('renders county list when data is loaded', async () => {
    vi.mocked(useEntityData).mockReturnValue({
      ...defaultEntityDataMock,
      entity: mockCountyData,
      statistics: {
        totalProperties: 50000,
        averagePrice: 750000,
        activeListings: 1000,
        pendingSales: 200
      }
    });

    render(<CountyPanel panelId="test" initialState={{ stateId: 'CA' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Los Angeles County')).toBeInTheDocument();
      expect(screen.getByText('Population: 123,456')).toBeInTheDocument();
      expect(screen.getByText('Area: 4,567.89 sq mi')).toBeInTheDocument();
      expect(screen.getByText('Median Home Price: $750,000')).toBeInTheDocument();
      expect(screen.getByText('Median Rent: $2,500')).toBeInTheDocument();
    });
  });

  it('handles county selection', async () => {
    const setCountyId = vi.fn();
    vi.mocked(useEntityData).mockReturnValue({
      ...defaultEntityDataMock,
      entity: mockCountyData,
      setEntityId: setCountyId
    });

    render(<CountyPanel panelId="test" initialState={{ stateId: 'CA' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Los Angeles County')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Los Angeles County'));

    expect(setCountyId).toHaveBeenCalledWith('12345');
  });

  it('handles refresh action', async () => {
    const fetchByParent = vi.fn();
    vi.mocked(useEntityData).mockReturnValue({
      ...defaultEntityDataMock,
      entity: mockCountyData,
      fetchByParent
    });

    render(<CountyPanel panelId="test" initialState={{ stateId: 'CA' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Los Angeles County')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('refresh-button'));

    expect(fetchByParent).toHaveBeenCalledWith('CA');
  });
}); 
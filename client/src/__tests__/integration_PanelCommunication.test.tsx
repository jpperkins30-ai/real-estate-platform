import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PanelSyncProvider, usePanelSync } from 'src/context/PanelSyncContext';
import { getPanelContent, registerPanelContent } from 'src/services/panelContentRegistry';
import { PanelContentType } from '../../types/layout.types';

// Mock panel components
const MockCountyPanel = ({ 
  panelId = 'county-panel',
  onAction
}: { 
  panelId?: string,
  onAction?: (data: any) => void 
}) => {
  const { broadcast } = usePanelSync();
  
  const handleFilter = () => {
    const filterData = {
      type: 'filter',
      propertyType: 'Residential',
      county: 'Sample County',
      state: 'Sample State'
    };
    
    broadcast(
      'filter',
      filterData,
      panelId
    );
    
    if (onAction) {
      onAction(filterData);
    }
  };
  
  return (
    <div data-testid={`county-panel-${panelId}`}>
      <h3>County Panel</h3>
      <button 
        data-testid={`county-filter-button-${panelId}`}
        onClick={handleFilter}
      >
        Filter Properties
      </button>
    </div>
  );
};

const MockPropertyPanel = ({ 
  panelId = 'property-panel'
}: { 
  panelId?: string
}) => {
  const { subscribe } = usePanelSync();
  const [filter, setFilter] = React.useState<any>(null);
  
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.type === 'filter') {
        setFilter(event.payload);
      }
    });
    
    return unsubscribe;
  }, [subscribe]);
  
  return (
    <div data-testid={`property-panel-${panelId}`}>
      <h3>Property Panel</h3>
      <div data-testid={`property-filter-${panelId}`}>
        {filter ? JSON.stringify(filter) : 'No filter applied'}
      </div>
    </div>
  );
};

// The most basic container to show panels
const SimplePanelContainer = ({ panels }: { panels: Array<{ id: string, type: PanelContentType }> }) => {
  return (
    <div className="simple-panel-container">
      {panels.map(panel => {
        const PanelComponent = getPanelContent(panel.type);
        return PanelComponent ? (
          <div key={panel.id} className="panel-wrapper">
            <PanelComponent panelId={panel.id} />
          </div>
        ) : (
          <div key={panel.id}>Panel type {panel.type} not found</div>
        );
      })}
    </div>
  );
};

describe('Panel Communication Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Register panel components
    registerPanelContent('county' as PanelContentType, MockCountyPanel);
    registerPanelContent('property' as PanelContentType, MockPropertyPanel);
  });
  
  it('allows panels to communicate via the PanelSyncContext', async () => {
    render(
      <PanelSyncProvider>
        <SimplePanelContainer 
          panels={[
            { id: 'county1', type: 'county' as PanelContentType },
            { id: 'property1', type: 'property' as PanelContentType }
          ]}
        />
      </PanelSyncProvider>
    );
    
    // Check that panels are rendered
    expect(screen.getByTestId('county-panel-county1')).toBeInTheDocument();
    expect(screen.getByTestId('property-panel-property1')).toBeInTheDocument();
    
    // Initially, no filter applied
    expect(screen.getByTestId('property-filter-property1')).toHaveTextContent('No filter applied');
    
    // Click filter button in county panel
    fireEvent.click(screen.getByTestId('county-filter-button-county1'));
    
    // Wait for property panel to receive the filter event
    await waitFor(() => {
      const propertyFilter = screen.getByTestId('property-filter-property1');
      expect(propertyFilter).not.toHaveTextContent('No filter applied');
      expect(propertyFilter).toHaveTextContent('Residential');
      expect(propertyFilter).toHaveTextContent('Sample County');
    });
  });
  
  it('handles multiple panel instances with correct event routing', async () => {
    const countyActionHandler1 = vi.fn();
    const countyActionHandler2 = vi.fn();
    
    // Extended container that passes handlers to panels
    const TestContainer = () => {
      return (
        <div>
          <MockCountyPanel panelId="county1" onAction={countyActionHandler1} />
          <MockCountyPanel panelId="county2" onAction={countyActionHandler2} />
          <MockPropertyPanel panelId="property1" />
          <MockPropertyPanel panelId="property2" />
        </div>
      );
    };
    
    render(
      <PanelSyncProvider>
        <TestContainer />
      </PanelSyncProvider>
    );
    
    // Click filter button in first county panel
    fireEvent.click(screen.getByTestId('county-filter-button-county1'));
    
    // Wait for property panels to receive the filter event
    await waitFor(() => {
      // Both property panels should receive the event
      expect(screen.getByTestId('property-filter-property1')).toHaveTextContent('Residential');
      expect(screen.getByTestId('property-filter-property2')).toHaveTextContent('Residential');
      
      // Only the first county panel's action handler should be called
      expect(countyActionHandler1).toHaveBeenCalledTimes(1);
      expect(countyActionHandler2).not.toHaveBeenCalled();
    });
    
    // Click filter button in second county panel
    fireEvent.click(screen.getByTestId('county-filter-button-county2'));
    
    // Wait for property panels to receive the second filter event
    await waitFor(() => {
      // Second county panel's action handler should now be called
      expect(countyActionHandler2).toHaveBeenCalledTimes(1);
    });
  });
}); 


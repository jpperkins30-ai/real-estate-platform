// docs/examples/panel-sync-example.tsx
import React, { useEffect, useState } from 'react';
import { usePanelSync } from '../../client/src/hooks/usePanelSync';
import { useEntityData } from '../../client/src/hooks/useEntityData';
import { useLayoutContext } from '../../client/src/hooks/useLayoutContext';
import { PanelSyncProvider } from '../../client/src/context/PanelSyncContext';
import { LayoutContextProvider } from '../../client/src/context/LayoutContext';
import { panelRegistry } from '../../client/src/services/PanelRegistry';

/**
 * Example of a County Panel that syncs with other panels
 */
export const CountyPanel: React.FC<{ panelId: string; title: string }> = ({ 
  panelId, 
  title 
}) => {
  // Entity data hook for managing county data
  const { 
    entity: county,
    loading,
    error,
    selectEntity,
    updateEntity,
    clearEntity
  } = useEntityData({
    panelId,
    entityType: 'county',
    autoSync: true
  });
  
  // Register panel with layout context
  const { registerPanel, updatePanelConfig } = useLayoutContext();
  
  // Status message for user feedback
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Register panel on mount
  useEffect(() => {
    registerPanel(panelId, {
      id: panelId,
      contentType: 'county',
      title,
      visible: true
    });
    
    // Cleanup function
    return () => {
      // No explicit unregister needed as the context handles this
    };
  }, [panelId, registerPanel, title]);
  
  // Example of a county selection
  const handleCountySelect = async (countyId: string) => {
    setStatusMessage(`Loading county ${countyId}...`);
    
    try {
      await selectEntity(countyId, 'county');
      setStatusMessage(`County ${countyId} loaded`);
    } catch (error) {
      setStatusMessage(`Error loading county: ${error.message}`);
    }
  };
  
  // Example of updating county data
  const handleUpdateCounty = (updates: any) => {
    updateEntity({
      ...county,
      ...updates
    });
    
    setStatusMessage(`County updated: ${updates.name || county.name}`);
  };
  
  // Example of changing panel state
  const handleMinimize = () => {
    updatePanelConfig(panelId, {
      minimized: true
    });
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="county-panel loading">
        <div className="loading-spinner" />
        <p>Loading county data...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="county-panel error">
        <h3>Error Loading County</h3>
        <p>{error.message}</p>
        <button onClick={() => clearEntity()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className="county-panel">
      <div className="panel-header">
        <h3>{title}</h3>
        <div className="panel-controls">
          <button onClick={handleMinimize}>
            Minimize
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        {county ? (
          <div className="county-details">
            <h4>{county.name}</h4>
            <div className="county-stats">
              <div>Population: {county.properties?.population || 'N/A'}</div>
              <div>Area: {county.properties?.area || 'N/A'} sq mi</div>
            </div>
            <button 
              onClick={() => handleUpdateCounty({ 
                properties: { 
                  ...county.properties,
                  lastViewed: new Date().toISOString()
                }
              })}
            >
              Mark as Viewed
            </button>
          </div>
        ) : (
          <div className="county-selection">
            <p>Select a county to view details</p>
            <div className="county-list">
              <button onClick={() => handleCountySelect('county-001')}>
                Sample County 1
              </button>
              <button onClick={() => handleCountySelect('county-002')}>
                Sample County 2
              </button>
            </div>
          </div>
        )}
      </div>
      
      {statusMessage && (
        <div className="status-message">{statusMessage}</div>
      )}
    </div>
  );
};

/**
 * Example of how to wrap the application with the required providers
 */
export const AppWithPanelSync: React.FC = () => {
  return (
    <PanelSyncProvider>
      <LayoutContextProvider>
        <div className="multi-panel-container">
          <CountyPanel panelId="county-panel-1" title="County Explorer" />
          <PropertyPanel panelId="property-panel-1" title="Property Details" />
        </div>
      </LayoutContextProvider>
    </PanelSyncProvider>
  );
};

/**
 * Example of a Property Panel that receives county selections
 */
const PropertyPanel: React.FC<{ panelId: string; title: string }> = ({
  panelId,
  title
}) => {
  // Get panel sync capabilities
  const { subscribe } = usePanelSync({ panelId });
  
  // State for properties
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
  
  // Register with layout
  const { registerPanel } = useLayoutContext();
  
  // Register panel on mount
  useEffect(() => {
    registerPanel(panelId, {
      id: panelId,
      contentType: 'property',
      title,
      visible: true
    });
  }, [panelId, registerPanel, title]);
  
  // Subscribe to county selection events
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      // Handle county selection
      if (event.type === 'entity_selected_county') {
        const county = event.payload;
        setSelectedCounty(county);
        
        // Simulate loading properties for this county
        fetchPropertiesForCounty(county.id).then(setProperties);
      }
    });
    
    return unsubscribe;
  }, [subscribe]);
  
  // Mock function to fetch properties
  const fetchPropertiesForCounty = async (countyId: string) => {
    // Simulate API call
    return new Promise<any[]>((resolve) => {
      setTimeout(() => {
        resolve([
          { id: `prop-${countyId}-001`, name: 'Property 1', value: 250000 },
          { id: `prop-${countyId}-002`, name: 'Property 2', value: 350000 },
          { id: `prop-${countyId}-003`, name: 'Property 3', value: 450000 },
        ]);
      }, 500);
    });
  };
  
  return (
    <div className="property-panel">
      <div className="panel-header">
        <h3>{title}</h3>
      </div>
      
      <div className="panel-content">
        {selectedCounty ? (
          <>
            <div className="selected-county">
              Selected County: {selectedCounty.name}
            </div>
            
            <div className="property-list">
              {properties.length > 0 ? (
                <ul>
                  {properties.map(property => (
                    <li key={property.id}>
                      {property.name} - ${property.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Loading properties...</p>
              )}
            </div>
          </>
        ) : (
          <p>No county selected. Select a county to view properties.</p>
        )}
      </div>
    </div>
  );
};

/**
 * Example initialization code for the panel registry
 */
export const initializePanelRegistry = () => {
  // Register eagerly loaded components
  panelRegistry.registerComponent('county', CountyPanel);
  
  // Register lazily loaded components
  panelRegistry.registerLazyComponent('property', () => 
    import('./PropertyPanel').then(module => module)
  );
  
  // More component registrations...
  
  console.log('Panel registry initialized with components:',
    panelRegistry.getRegisteredContentTypes()
  );
}; 
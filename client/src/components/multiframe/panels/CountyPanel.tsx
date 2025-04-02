import React, { useEffect, useCallback } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { useEntityData } from '../../../hooks/useEntityData';
import { ControllerWizardLauncher } from '../controllers/ControllerWizardLauncher';
import './CountyPanel.css';

interface CountyPanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
  showControllerOptions?: boolean;
}

export function CountyPanel({
  panelId,
  initialState = {},
  onStateChange,
  onAction,
  showControllerOptions = false
}: CountyPanelProps) {
  // Get panel sync hooks
  const { broadcast, subscribe } = usePanelSync();
  
  // Entity data hooks for state and county
  const {
    entityId: stateId,
    setEntityId: setStateId
  } = useEntityData('state', {
    initialId: initialState.stateId || null
  });
  
  const {
    entityId: countyId,
    setEntityId: setCountyId,
    entity: county,
    statistics: countyStats,
    loading: countyLoading,
    error: countyError
  } = useEntityData('county', {
    initialId: initialState.countyId || null,
    includeStatistics: true
  });
  
  // Use counties from state relationship
  const {
    loading: countiesLoading,
    error: countiesError,
    fetchByParent
  } = useEntityData('county', {
    parentEntityType: 'state',
    parentEntityId: stateId,
    includeStatistics: false
  });
  
  // State to store counties list
  const [counties, setCounties] = React.useState<any[]>([]);
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle state selection from map panel
        if (event.type === 'select' && event.payload.entityType === 'state') {
          setStateId(event.payload.entityId);
          setCountyId(null); // Clear county selection when state changes
        }
        // Handle county selection from map panel
        else if (event.type === 'select' && event.payload.entityType === 'county') {
          setCountyId(event.payload.entityId);
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe, setStateId, setCountyId]);
  
  // Fetch counties when state changes
  useEffect(() => {
    if (stateId) {
      // Load counties for selected state
      fetchByParent().then(data => {
        setCounties(data);
      });
    } else {
      setCounties([]);
    }
  }, [stateId, fetchByParent]);
  
  // Update parent state when county changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        stateId,
        countyId,
        county,
        statistics: countyStats
      });
    }
  }, [stateId, countyId, county, countyStats, onStateChange]);
  
  // Handle county selection
  const handleCountySelect = useCallback((county: any) => {
    setCountyId(county.id);
    
    // Broadcast selection to other panels
    broadcast({
      type: 'select',
      payload: {
        entityType: 'county',
        entityId: county.id,
        properties: {
          stateId: stateId
        }
      },
      source: panelId
    });
    
    // Notify parent component
    if (onAction) {
      onAction({
        type: 'select',
        payload: {
          entityType: 'county',
          entityId: county.id,
          properties: {
            stateId: stateId
          }
        }
      });
    }
  }, [stateId, panelId, broadcast, onAction, setCountyId]);

  // Render loading state
  if (countiesLoading || countyLoading) {
    return (
      <div className="county-panel loading">
        <div className="loading-spinner"></div>
        <p>Loading counties...</p>
      </div>
    );
  }

  // Render error state
  if (countiesError || countyError) {
    return (
      <div className="county-panel error">
        <div className="error-icon"></div>
        <p>Error loading counties. Please try again.</p>
      </div>
    );
  }

  // Render empty state
  if (!stateId) {
    return (
      <div className="county-panel empty">
        <div className="empty-icon"></div>
        <p>Select a state to view counties</p>
      </div>
    );
  }
  
  return (
    <div className="county-panel">
      {/* Header area with state info and controller */}
      <div className="county-panel-header">
        <h3 className="state-name">{stateId ? stateId : 'Select a State'}</h3>
        {showControllerOptions && stateId && (
          <ControllerWizardLauncher 
            entityType="state"
            entityId={stateId}
            buttonLabel="State Controller"
            showStatus={false}
            className="controller-launcher-compact"
          />
        )}
      </div>
      
      {/* Counties list */}
      <div className="counties-list">
        {counties.length === 0 ? (
          <div className="no-counties">
            <p>No counties found for this state</p>
          </div>
        ) : (
          counties.map(county => (
            <div 
              key={county.id}
              className={`county-item ${county.id === countyId ? 'selected' : ''}`}
              onClick={() => handleCountySelect(county)}
            >
              <div className="county-info">
                <h4>{county.name}</h4>
                <p className="county-stats">
                  {county.statistics?.totalProperties || 0} properties
                </p>
              </div>
              {showControllerOptions && (
                <ControllerWizardLauncher 
                  entityType="county"
                  entityId={county.id}
                  buttonLabel="County Controller"
                  showStatus={false}
                  className="controller-launcher-compact"
                />
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Selected county details */}
      {county && (
        <div className="county-details">
          <h4>{county.name} Details</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Properties</span>
              <span className="stat-value">{countyStats?.totalProperties || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Price</span>
              <span className="stat-value">
                ${(countyStats?.averagePrice || 0).toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Listings</span>
              <span className="stat-value">{countyStats?.activeListings || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending Sales</span>
              <span className="stat-value">{countyStats?.pendingSales || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
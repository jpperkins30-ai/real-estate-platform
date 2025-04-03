import React, { useState, useEffect, useCallback } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { ControllerWizardLauncher } from '../controllers/ControllerWizardLauncher';
import { fetchControllerStatus } from '../../../services/controllerService';
import type { ControllerStatus } from '../../../services/controllerService';
import './MapPanelWithControllers.css';

// Types
interface MapPanelWithControllersProps {
  panelId: string;
  initialState?: {
    entityType: 'state' | 'county' | null;
    entityId: string | null;
  };
  onStateChange?: (newState: {
    entityType: 'state' | 'county' | null;
    entityId: string | null;
  }) => void;
  onAction?: (action: {
    type: string;
    payload: {
      entityType: 'state' | 'county';
      entityId: string;
    };
  }) => void;
  showControllerOptions?: boolean;
}

interface SelectedEntity {
  type: 'state' | 'county' | null;
  id: string | null;
}

interface PanelEvent {
  type: string;
  payload: {
    entityType: 'state' | 'county';
    entityId: string;
  };
  source: string;
}

export function MapPanelWithControllers({
  panelId,
  initialState = {
    entityType: null,
    entityId: null
  },
  onStateChange,
  onAction,
  showControllerOptions = false
}: MapPanelWithControllersProps) {
  // State for selected entity and controller status
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>({
    type: initialState.entityType,
    id: initialState.entityId
  });
  
  const [controllerStatus, setControllerStatus] = useState<ControllerStatus>({
    hasController: false,
    status: null,
    lastRun: null
  });
  
  // Get panel sync hooks
  const { broadcast, subscribe } = usePanelSync();
  
  // Fetch controller status when entity changes
  useEffect(() => {
    if (selectedEntity.type && selectedEntity.id) {
      fetchControllerStatus(selectedEntity.type, selectedEntity.id)
        .then(status => {
          setControllerStatus(status);
        })
        .catch(error => {
          console.error('Error fetching controller status:', error);
          setControllerStatus({
            hasController: false,
            status: null,
            lastRun: null
          });
        });
    } else {
      setControllerStatus({
        hasController: false,
        status: null,
        lastRun: null
      });
    }
  }, [selectedEntity.type, selectedEntity.id]);
  
  // Subscribe to selection events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event: PanelEvent) => {
      if (event.source !== panelId && event.type === 'select') {
        const { entityType, entityId } = event.payload;
        if (entityType === 'state' || entityType === 'county') {
          setSelectedEntity({
            type: entityType,
            id: entityId
          });
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe]);
  
  // Update parent state when entity changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        entityType: selectedEntity.type,
        entityId: selectedEntity.id
      });
    }
  }, [selectedEntity, onStateChange]);
  
  // Handle map click (entity selection)
  const handleMapClick = useCallback((e: React.MouseEvent, entityType: 'state' | 'county', entityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update local state
    setSelectedEntity({
      type: entityType,
      id: entityId
    });
    
    // Broadcast selection to other panels
    broadcast({
      type: 'select',
      payload: {
        entityType,
        entityId
      }
    });
    
    // Notify parent component
    if (onAction) {
      onAction({
        type: 'select',
        payload: {
          entityType,
          entityId
        }
      });
    }
  }, [broadcast, onAction]);
  
  // Placeholder for the actual map component
  const MapComponent = () => {
    return (
      <div className="map-placeholder">
        <div className="map-instructions">
          <h3>Interactive Map</h3>
          <p>This would be an interactive map where users can select states and counties.</p>
          <div className="map-demo-controls">
            <button 
              className="demo-state-button"
              onClick={(e) => handleMapClick(e, 'state', 'CA')}
            >
              Select California
            </button>
            <button 
              className="demo-state-button"
              onClick={(e) => handleMapClick(e, 'state', 'TX')}
            >
              Select Texas
            </button>
            <button 
              className="demo-county-button"
              onClick={(e) => handleMapClick(e, 'county', 'los-angeles')}
            >
              Select Los Angeles County
            </button>
            <button 
              className="demo-county-button"
              onClick={(e) => handleMapClick(e, 'county', 'harris')}
            >
              Select Harris County
            </button>
          </div>
        </div>
        
        {selectedEntity.id && (
          <div className="selection-info">
            <div className="info-label">Selected {selectedEntity.type}:</div>
            <div className="info-value">{selectedEntity.id}</div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="map-panel-with-controllers">
      <MapComponent />
      
      {showControllerOptions && selectedEntity.type && selectedEntity.id && (
        <div className="controller-overlay">
          <div className="controller-status">
            <span className="status-label">Controller:</span>
            <span className={`status-value status-${controllerStatus.status || 'none'}`}>
              {controllerStatus.hasController 
                ? `${controllerStatus.status} (Last run: ${controllerStatus.lastRun ? new Date(controllerStatus.lastRun).toLocaleString() : 'never'})`
                : 'Not configured'}
            </span>
          </div>
          
          <ControllerWizardLauncher
            entityType={selectedEntity.type}
            entityId={selectedEntity.id}
            buttonLabel={controllerStatus.hasController ? 'Edit Controller' : 'Create Controller'}
            className="launcher-button"
          />
        </div>
      )}
    </div>
  );
} 
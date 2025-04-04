import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { useFilter } from '../../../hooks/useFilter';
import { usePanelState } from '../../../hooks/usePanelState';
import { PanelContentProps } from '../../../types/panel.types';
import { FilterSet, PropertyFilter, GeographicFilter } from '../../../types/filter.types';
import * as filterService from '../../../services/filterService';
import './FilterPanel.css';

// Helper functions for filter panel since they don't exist in filterService
const resolveFilterConflicts = (localFilters: FilterSet, remoteFilters: FilterSet): FilterSet => {
  // Use remote filters if they have a higher version
  if (remoteFilters.version && (!localFilters.version || remoteFilters.version > localFilters.version)) {
    return remoteFilters;
  }
  return localFilters;
};

const hasFilterChanges = (filters1: FilterSet, filters2: FilterSet): boolean => {
  // Compare property filters
  const propertyDiff = JSON.stringify(filters1.property) !== JSON.stringify(filters2.property);
  // Compare geographic filters
  const geoDiff = JSON.stringify(filters1.geographic) !== JSON.stringify(filters2.geographic);
  return propertyDiff || geoDiff;
};

export const FilterPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // Use enhanced panel state hook
  const { state, updateState, resetState } = usePanelState({
    panelId,
    initialState,
    contentType: 'filter',
    onStateChange
  });
  
  // State
  const [filters, setFilters] = useState<FilterSet>({
    property: {},
    geographic: {}
  });
  const [isSyncEnabled, setSyncEnabled] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  const { applyFilters, clearFilters, activeFilters } = useFilter();
  
  // Initialize with any existing filters
  useEffect(() => {
    if (state.filters) {
      // Use filters from panel state
      setFilters(state.filters);
    } else if (Object.keys(activeFilters).length > 0) {
      // If no state filters but active filters exist in context, use those
      setFilters(activeFilters);
      // Update panel state with active filters
      updateState({ filters: activeFilters });
    }
  }, [state.filters, activeFilters, updateState]);
  
  // Subscribe to filter events from other panels
  useEffect(() => {
    if (!isSyncEnabled) return;
    
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        if (event.type === 'filter' && event.payload?.filters) {
          // Validate and resolve conflicts if necessary
          const incomingFilters = event.payload.filters;
          const resolvedFilters = resolveFilterConflicts(filters, incomingFilters);
          
          if (hasFilterChanges(filters, resolvedFilters)) {
            // Update local state with received filters
            setFilters(resolvedFilters);
            updateState({ filters: resolvedFilters });
          }
        } else if (event.type === 'filterCleared') {
          // Clear local filters
          const emptyFilters = {
            property: {},
            geographic: {}
          };
          setFilters(emptyFilters);
          updateState({ filters: emptyFilters });
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [panelId, subscribe, isSyncEnabled, filters, updateState]);
  
  // Monitor filter changes
  useEffect(() => {
    // Check if current filters differ from the ones in active context
    setHasChanges(hasFilterChanges(filters, activeFilters));
  }, [filters, activeFilters]);
  
  // Handle filter changes
  const handlePropertyFilterChange = (changes: Partial<PropertyFilter>) => {
    const updatedFilters = {
      ...filters,
      property: {
        ...filters.property,
        ...changes
      },
      version: Date.now() // Add version for conflict resolution
    };
    
    // No complex validation - just update the filters
    setFilters(updatedFilters);
  };
  
  const handleGeographicFilterChange = (changes: Partial<GeographicFilter>) => {
    const updatedFilters = {
      ...filters,
      geographic: {
        ...filters.geographic,
        ...changes
      },
      version: Date.now() // Add version for conflict resolution
    };
    
    // No complex validation - just update the filters
    setFilters(updatedFilters);
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    try {
      // No validation needed for FilterSet
      
      // Apply filters to the global filter context
      applyFilters(filters);
      
      // Update panel state
      updateState({ filters });
      
      // Broadcast filter changes to other panels if sync is enabled
      if (isSyncEnabled) {
        broadcast('filter', { filters }, panelId);
      }
      
      // Trigger action
      if (onAction) {
        onAction({
          type: 'filter',
          payload: { filters }
        });
      }
      
      // Reset changes flag
      setHasChanges(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      // Handle error appropriately (could show user notification)
    }
  };
  
  // Clear filters
  const handleClearFilters = () => {
    try {
      // Create empty filter set
      const emptyFilters = {
        property: {},
        geographic: {},
        version: Date.now()
      };
      
      // Clear the filters
      setFilters(emptyFilters);
      
      // Clear global filters
      clearFilters();
      
      // Update panel state
      updateState({ filters: emptyFilters });
      
      // Broadcast filter cleared to other panels if sync is enabled
      if (isSyncEnabled) {
        broadcast('filterCleared', {}, panelId);
      }
      
      // Trigger action
      if (onAction) {
        onAction({
          type: 'filterCleared',
          payload: {}
        });
      }
      
      // Reset changes flag
      setHasChanges(false);
    } catch (error) {
      console.error('Error clearing filters:', error);
      // Handle error appropriately
    }
  };
  
  // Reset filters to last applied state
  const handleResetFilters = () => {
    if (state.filters) {
      setFilters(state.filters);
      setHasChanges(false);
    } else {
      handleClearFilters();
    }
  };
  
  // Toggle sync
  const handleToggleSync = () => {
    setSyncEnabled(prev => !prev);
  };
  
  // Component UI implementation...
  return (
    <div className="filter-panel">
      {/* Filter UI implementation */}
      <div className="filter-actions">
        <button
          className="apply-button"
          onClick={handleApplyFilters}
          disabled={!hasChanges}
          data-testid="apply-filters-button"
        >
          Apply Filters
        </button>
        <button
          className="clear-button"
          onClick={handleClearFilters}
          data-testid="clear-filters-button"
        >
          Clear Filters
        </button>
        {hasChanges && (
          <button
            className="reset-button"
            onClick={handleResetFilters}
            data-testid="reset-filters-button"
          >
            Reset Changes
          </button>
        )}
        <div className="sync-toggle">
          <label>
            <input
              type="checkbox"
              checked={isSyncEnabled}
              onChange={handleToggleSync}
              data-testid="sync-toggle"
            />
            Sync with other panels
          </label>
        </div>
      </div>
    </div>
  );
}; 
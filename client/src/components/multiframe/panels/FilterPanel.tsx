import React, { useState, useEffect } from 'react';
import { usePanelSync } from '../../../hooks/usePanelSync';
import { useFilter } from '../../../hooks/useFilter';
import { PanelContentProps } from '../../../types/panel.types';
import { FilterSet, PropertyFilter, GeographicFilter } from '../../../types/filter.types';
import './FilterPanel.css';

export const FilterPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // State
  const [filters, setFilters] = useState<FilterSet>({
    property: {},
    geographic: {}
  });
  const [isSyncEnabled, setSyncEnabled] = useState<boolean>(true);
  
  // Hooks
  const { broadcast, subscribe } = usePanelSync();
  const { applyFilters, clearFilters, activeFilters } = useFilter();
  
  // Initialize with any existing filters
  useEffect(() => {
    if (initialState.filters) {
      setFilters(initialState.filters);
    } else if (Object.keys(activeFilters).length > 0) {
      // If no initial state but active filters exist in context, use those
      setFilters(activeFilters);
    }
  }, [initialState.filters, activeFilters]);
  
  // Subscribe to filter events from other panels
  useEffect(() => {
    if (!isSyncEnabled) return;
    
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        if (event.type === 'filter' && event.payload?.filters) {
          // Update local state with received filters
          setFilters(event.payload.filters);
        } else if (event.type === 'filterCleared') {
          // Clear local filters
          setFilters({
            property: {},
            geographic: {}
          });
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [panelId, subscribe, isSyncEnabled]);
  
  // Handle filter changes
  const handlePropertyFilterChange = (changes: Partial<PropertyFilter>) => {
    setFilters(prev => ({
      ...prev,
      property: {
        ...prev.property,
        ...changes
      }
    }));
  };
  
  const handleGeographicFilterChange = (changes: Partial<GeographicFilter>) => {
    setFilters(prev => ({
      ...prev,
      geographic: {
        ...prev.geographic,
        ...changes
      }
    }));
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    // Apply filters to the global filter context
    applyFilters(filters);
    
    // Broadcast filter changes to other panels if sync is enabled
    if (isSyncEnabled) {
      broadcast('filter', { filters }, panelId);
    }
    
    // Notify parent component
    if (onStateChange) {
      onStateChange({ filters });
    }
    
    // Trigger action
    if (onAction) {
      onAction({
        type: 'filter',
        payload: { filters }
      });
    }
  };
  
  // Clear filters
  const handleClearFilters = () => {
    // Clear the filters
    setFilters({
      property: {},
      geographic: {}
    });
    
    // Clear global filters
    clearFilters();
    
    // Broadcast filter cleared to other panels if sync is enabled
    if (isSyncEnabled) {
      broadcast('filterCleared', {}, panelId);
    }
    
    // Notify parent component
    if (onStateChange) {
      onStateChange({ filters: {} });
    }
    
    // Trigger action
    if (onAction) {
      onAction({
        type: 'filterCleared',
        payload: {}
      });
    }
  };
  
  // Toggle sync
  const handleToggleSync = () => {
    setSyncEnabled(prev => !prev);
  };
  
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3 className="filter-panel-title">Filters</h3>
        <div className="filter-sync-toggle">
          <label className="sync-label">
            <input
              type="checkbox"
              checked={isSyncEnabled}
              onChange={handleToggleSync}
              className="sync-checkbox"
            />
            Sync with other panels
          </label>
        </div>
      </div>
      
      <div className="filter-section">
        <h4 className="filter-section-title">Geographic Filters</h4>
        
        <div className="filter-group">
          <label className="filter-label">State</label>
          <select
            className="filter-select"
            value={filters.geographic?.state || ''}
            onChange={(e) => handleGeographicFilterChange({ state: e.target.value })}
            data-testid="state-filter"
          >
            <option value="">All States</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="NY">New York</option>
            <option value="FL">Florida</option>
            <option value="MD">Maryland</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">County</label>
          <select
            className="filter-select"
            value={filters.geographic?.county || ''}
            onChange={(e) => handleGeographicFilterChange({ county: e.target.value })}
            disabled={!filters.geographic?.state}
            data-testid="county-filter"
          >
            <option value="">All Counties</option>
            
            {filters.geographic?.state === 'MD' && (
              <>
                <option value="Montgomery">Montgomery</option>
                <option value="St. Mary's">St. Mary's</option>
                <option value="Howard">Howard</option>
                <option value="Baltimore">Baltimore</option>
              </>
            )}
            
            {filters.geographic?.state === 'CA' && (
              <>
                <option value="Los Angeles">Los Angeles</option>
                <option value="San Francisco">San Francisco</option>
                <option value="San Diego">San Diego</option>
                <option value="Orange">Orange</option>
              </>
            )}
            
            {/* Add options for other states */}
          </select>
        </div>
      </div>
      
      <div className="filter-section">
        <h4 className="filter-section-title">Property Filters</h4>
        
        <div className="filter-group">
          <label className="filter-label">Property Type</label>
          <select
            className="filter-select"
            value={filters.property?.propertyType as string || ''}
            onChange={(e) => handlePropertyFilterChange({ propertyType: e.target.value })}
            data-testid="property-type-filter"
          >
            <option value="">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Land">Land</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Zoning</label>
          <select
            className="filter-select"
            value={filters.property?.zoning || ''}
            onChange={(e) => handlePropertyFilterChange({ zoning: e.target.value })}
            data-testid="zoning-filter"
          >
            <option value="">All Zoning</option>
            <option value="R1">R1 - Single Family</option>
            <option value="R2">R2 - Multi-Family</option>
            <option value="C1">C1 - Commercial</option>
            <option value="I1">I1 - Industrial</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Sale Type</label>
          <select
            className="filter-select"
            value={filters.property?.saleType || ''}
            onChange={(e) => handlePropertyFilterChange({ saleType: e.target.value })}
            data-testid="sale-type-filter"
          >
            <option value="">All Sales</option>
            <option value="tax">Tax Sale</option>
            <option value="private">Private Sale</option>
            <option value="foreclosure">Foreclosure</option>
            <option value="auction">Auction</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <div className="range-inputs">
            <input
              type="number"
              className="range-input"
              value={(filters.property?.priceRange || [0, 0])[0]}
              onChange={(e) => handlePropertyFilterChange({ 
                priceRange: [parseInt(e.target.value) || 0, (filters.property?.priceRange || [0, 1000000])[1]] 
              })}
              min={0}
              step={10000}
              data-testid="price-min-filter"
            />
            <span>to</span>
            <input
              type="number"
              className="range-input"
              value={(filters.property?.priceRange || [0, 1000000])[1]}
              onChange={(e) => handlePropertyFilterChange({ 
                priceRange: [(filters.property?.priceRange || [0, 0])[0], parseInt(e.target.value) || 0] 
              })}
              min={0}
              step={10000}
              data-testid="price-max-filter"
            />
          </div>
        </div>
      </div>
      
      <div className="filter-actions">
        <button
          className="apply-button"
          onClick={handleApplyFilters}
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
      </div>
    </div>
  );
}; 
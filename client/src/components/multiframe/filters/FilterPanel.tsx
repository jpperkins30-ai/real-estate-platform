import React, { useState, useCallback } from 'react';
import { useFilter } from '../../../hooks/useFilter';
import { FilterSet, PropertyFilter, GeographicFilter } from '../../../types/filter.types';
import { usePanelSync } from '../../../hooks/usePanelSync';
import './FilterPanel.css';

interface FilterPanelProps {
  panelId: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ panelId }) => {
  const { activeFilters, applyFilters, clearFilters, savedFilters, saveFilter, loadFilter, deleteFilter } = useFilter();
  const { broadcast } = usePanelSync();
  
  // Local state for filter form
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>(activeFilters.property || {});
  const [geographicFilter, setGeographicFilter] = useState<GeographicFilter>(activeFilters.geographic || {});
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  
  // Handle property filter changes
  const handlePropertyFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setPropertyFilter(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  }, []);
  
  // Handle geographic filter changes
  const handleGeographicFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setGeographicFilter(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Apply current filters
  const handleApplyFilters = useCallback(() => {
    const filters: FilterSet = {
      property: Object.keys(propertyFilter).length > 0 ? propertyFilter : undefined,
      geographic: Object.keys(geographicFilter).length > 0 ? geographicFilter : undefined
    };
    
    applyFilters(filters);
    
    // Broadcast filter event to other panels
    broadcast({
      type: 'filter',
      source: panelId,
      payload: filters
    });
  }, [applyFilters, propertyFilter, geographicFilter, panelId, broadcast]);
  
  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setPropertyFilter({});
    setGeographicFilter({});
    clearFilters();
    
    // Broadcast clear filter event to other panels
    broadcast({
      type: 'clearFilters',
      source: panelId,
      payload: null
    });
  }, [clearFilters, panelId, broadcast]);
  
  // Save current filter configuration
  const handleSaveFilter = useCallback(() => {
    if (!filterName.trim()) {
      alert('Please provide a name for this filter');
      return;
    }
    
    const filterConfig = {
      name: filterName,
      description: filterDescription,
      filters: {
        property: Object.keys(propertyFilter).length > 0 ? propertyFilter : undefined,
        geographic: Object.keys(geographicFilter).length > 0 ? geographicFilter : undefined
      }
    };
    
    saveFilter(filterConfig);
    setShowSaveForm(false);
    setFilterName('');
    setFilterDescription('');
  }, [filterName, filterDescription, propertyFilter, geographicFilter, saveFilter]);
  
  return (
    <div className="filter-panel">
      <h3>Property Filters</h3>
      <div className="filter-section">
        <div className="filter-row">
          <label>
            Property Type:
            <select 
              name="propertyType" 
              value={propertyFilter.propertyType || ''} 
              onChange={handlePropertyFilterChange}
            >
              <option value="">Any</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="land">Land</option>
            </select>
          </label>
        </div>
        
        <div className="filter-row">
          <label>
            Min Bedrooms:
            <select 
              name="bedrooms" 
              value={propertyFilter.bedrooms || ''} 
              onChange={handlePropertyFilterChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </label>
        </div>
        
        <div className="filter-row">
          <label>
            Min Bathrooms:
            <select 
              name="bathrooms" 
              value={propertyFilter.bathrooms || ''} 
              onChange={handlePropertyFilterChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </label>
        </div>
        
        <div className="filter-row">
          <label>
            Zoning:
            <select 
              name="zoning" 
              value={propertyFilter.zoning || ''} 
              onChange={handlePropertyFilterChange}
            >
              <option value="">Any</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed">Mixed Use</option>
              <option value="industrial">Industrial</option>
              <option value="agricultural">Agricultural</option>
            </select>
          </label>
        </div>
      </div>
      
      <h3>Geographic Filters</h3>
      <div className="filter-section">
        <div className="filter-row">
          <label>
            State:
            <input 
              type="text" 
              name="state" 
              value={geographicFilter.state || ''} 
              onChange={handleGeographicFilterChange}
              placeholder="State Code (e.g. CA)"
            />
          </label>
        </div>
        
        <div className="filter-row">
          <label>
            County:
            <input 
              type="text" 
              name="county" 
              value={geographicFilter.county || ''} 
              onChange={handleGeographicFilterChange}
              placeholder="County Name"
            />
          </label>
        </div>
        
        <div className="filter-row">
          <label>
            City:
            <input 
              type="text" 
              name="city" 
              value={geographicFilter.city || ''} 
              onChange={handleGeographicFilterChange}
              placeholder="City Name"
            />
          </label>
        </div>
        
        <div className="filter-row">
          <label>
            Zip Code:
            <input 
              type="text" 
              name="zipCode" 
              value={geographicFilter.zipCode || ''} 
              onChange={handleGeographicFilterChange}
              placeholder="Zip Code"
            />
          </label>
        </div>
      </div>
      
      <div className="filter-actions">
        <button onClick={handleApplyFilters} className="apply-button">Apply Filters</button>
        <button onClick={handleClearFilters} className="clear-button">Clear Filters</button>
        <button onClick={() => setShowSaveForm(true)} className="save-button">Save Filter</button>
      </div>
      
      {showSaveForm && (
        <div className="save-filter-form">
          <h4>Save Current Filter</h4>
          <div className="filter-row">
            <label>
              Filter Name:
              <input 
                type="text" 
                value={filterName} 
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Name your filter"
              />
            </label>
          </div>
          <div className="filter-row">
            <label>
              Description:
              <textarea 
                value={filterDescription} 
                onChange={(e) => setFilterDescription(e.target.value)}
                placeholder="Optional description"
              />
            </label>
          </div>
          <div className="filter-actions">
            <button onClick={handleSaveFilter} className="save-confirm-button">Save</button>
            <button onClick={() => setShowSaveForm(false)} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
      
      {savedFilters.length > 0 && (
        <div className="saved-filters">
          <h4>Saved Filters</h4>
          <ul>
            {savedFilters.map(filter => (
              <li key={filter.id} className="saved-filter-item">
                <div className="saved-filter-info">
                  <strong>{filter.name}</strong>
                  {filter.description && <p>{filter.description}</p>}
                </div>
                <div className="saved-filter-actions">
                  <button onClick={() => loadFilter(filter.id)} className="load-button">Load</button>
                  <button onClick={() => deleteFilter(filter.id)} className="delete-button">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 
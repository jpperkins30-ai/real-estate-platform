import React from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import Switch from 'react-switch';
import './FilterSettings.css';

export const FilterSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { showFilterPanel, applyFiltersAutomatically } = preferences.filter;
  
  // Handle toggle settings
  const handleToggleSetting = (key: string, value: boolean) => {
    updatePreference('filter', key, value);
  };
  
  return (
    <div className="filter-settings">
      <div className="settings-section">
        <h3>Filter Panel</h3>
        
        <div className="toggle-option">
          <label>Show Filter Panel</label>
          <Switch 
            checked={showFilterPanel} 
            onChange={(checked) => handleToggleSetting('showFilterPanel', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Show the filter panel in layouts by default
          </p>
        </div>
        
        <div className="toggle-option">
          <label>Apply Filters Automatically</label>
          <Switch 
            checked={applyFiltersAutomatically} 
            onChange={(checked) => handleToggleSetting('applyFiltersAutomatically', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Apply filters as soon as they are changed (without clicking Apply button)
          </p>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Default Filters</h3>
        <p>Default filters will be applied when you open a new session</p>
        
        <div className="default-filters">
          <p>No default filters configured.</p>
          <button className="secondary-button">Configure Default Filters</button>
        </div>
      </div>
    </div>
  );
}; 
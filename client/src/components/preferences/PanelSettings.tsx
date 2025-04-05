import React from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import Switch from 'react-switch';
import './PanelSettings.css';

export const PanelSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { defaultContentTypes, showPanelHeader, enablePanelResizing, enablePanelDragging } = preferences.panel;
  
  // Handle panel content type change
  const handleContentTypeChange = (position: string, contentType: string) => {
    const newDefaultContentTypes = {
      ...defaultContentTypes,
      [position]: contentType
    };
    
    updatePreference('panel', 'defaultContentTypes', newDefaultContentTypes);
  };
  
  // Handle toggle settings
  const handleToggleSetting = (key: string, value: boolean) => {
    updatePreference('panel', key, value);
  };
  
  // Available content types
  const contentTypes = [
    { value: 'map', label: 'Map' },
    { value: 'state', label: 'State' },
    { value: 'county', label: 'County' },
    { value: 'property', label: 'Property' },
    { value: 'filter', label: 'Filter' },
    { value: 'stats', label: 'Statistics' },
    { value: 'chart', label: 'Chart' }
  ];
  
  return (
    <div className="panel-settings">
      <div className="settings-section">
        <h3>Default Panel Content Types</h3>
        <p>Select the default content type for each panel position in quad layout</p>
        
        <div className="content-type-grid">
          <div className="grid-cell top-left">
            <label>Top Left</label>
            <select 
              value={defaultContentTypes['top-left'] || 'map'} 
              onChange={(e) => handleContentTypeChange('top-left', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-cell top-right">
            <label>Top Right</label>
            <select 
              value={defaultContentTypes['top-right'] || 'state'} 
              onChange={(e) => handleContentTypeChange('top-right', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-cell bottom-left">
            <label>Bottom Left</label>
            <select 
              value={defaultContentTypes['bottom-left'] || 'county'} 
              onChange={(e) => handleContentTypeChange('bottom-left', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid-cell bottom-right">
            <label>Bottom Right</label>
            <select 
              value={defaultContentTypes['bottom-right'] || 'property'} 
              onChange={(e) => handleContentTypeChange('bottom-right', e.target.value)}
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Panel Display Options</h3>
        
        <div className="toggle-option">
          <label>Show Panel Headers</label>
          <Switch 
            checked={showPanelHeader} 
            onChange={(checked) => handleToggleSetting('showPanelHeader', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
        </div>
        
        <div className="toggle-option">
          <label>Enable Panel Resizing</label>
          <Switch 
            checked={enablePanelResizing} 
            onChange={(checked) => handleToggleSetting('enablePanelResizing', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
        </div>
        
        <div className="toggle-option">
          <label>Enable Panel Dragging</label>
          <Switch 
            checked={enablePanelDragging} 
            onChange={(checked) => handleToggleSetting('enablePanelDragging', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
        </div>
      </div>
    </div>
  );
}; 
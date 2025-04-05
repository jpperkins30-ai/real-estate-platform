import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { fetchLayouts } from '../../services/layoutService';
import Switch from 'react-switch';
import './LayoutSettings.css';

export const LayoutSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { defaultLayout, saveLayoutOnExit, rememberLastLayout } = preferences.layout;
  
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch available layouts on mount
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userLayouts = await fetchLayouts(true); // Include public layouts
        setLayouts(userLayouts);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading layouts:', err);
        setError('Failed to load layouts');
        setLoading(false);
      }
    };
    
    loadLayouts();
  }, []);
  
  // Handle default layout change
  const handleDefaultLayoutChange = (layoutId: string) => {
    updatePreference('layout', 'defaultLayout', layoutId);
  };
  
  // Handle toggle settings
  const handleToggleSetting = (key: string, value: boolean) => {
    updatePreference('layout', key, value);
  };
  
  // Render loading state
  if (loading) {
    return <div className="loading-spinner">Loading layouts...</div>;
  }
  
  // Render error state
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="layout-settings">
      <div className="settings-section">
        <h3>Default Layout</h3>
        
        {layouts.length === 0 ? (
          <p>No saved layouts available. Create and save a layout first.</p>
        ) : (
          <div className="layout-selector">
            <select 
              value={defaultLayout} 
              onChange={(e) => handleDefaultLayoutChange(e.target.value)}
            >
              <option value="">-- Select a default layout --</option>
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>{layout.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="settings-section">
        <h3>Layout Behavior</h3>
        
        <div className="toggle-option">
          <label>Save Layout on Exit</label>
          <Switch 
            checked={saveLayoutOnExit} 
            onChange={(checked) => handleToggleSetting('saveLayoutOnExit', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Automatically save the current layout when you exit the application
          </p>
        </div>
        
        <div className="toggle-option">
          <label>Remember Last Layout</label>
          <Switch 
            checked={rememberLastLayout} 
            onChange={(checked) => handleToggleSetting('rememberLastLayout', checked)} 
            onColor="#2196f3"
            height={22}
            width={44}
          />
          <p className="option-description">
            Start with the last used layout instead of the default layout
          </p>
        </div>
      </div>
    </div>
  );
}; 
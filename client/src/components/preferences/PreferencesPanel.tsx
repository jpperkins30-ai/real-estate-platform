import React, { useState } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { ThemeSettings } from './ThemeSettings';
import { PanelSettings } from './PanelSettings';
import { LayoutSettings } from './LayoutSettings';
import { FilterSettings } from './FilterSettings';
import './PreferencesPanel.css';

interface PreferencesPanelProps {
  onClose: () => void;
}

type TabType = 'theme' | 'panels' | 'layout' | 'filters';

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ onClose }) => {
  const { loading, error, resetPreferences } = usePreferences();
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  
  // Render loading state
  if (loading) {
    return (
      <div className="preferences-panel">
        <div className="loading-spinner">Loading preferences...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="preferences-panel">
        <div className="error-message">{error}</div>
        <button className="primary-button" onClick={onClose}>Close</button>
      </div>
    );
  }
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'theme':
        return <ThemeSettings />;
      case 'panels':
        return <PanelSettings />;
      case 'layout':
        return <LayoutSettings />;
      case 'filters':
        return <FilterSettings />;
      default:
        return null;
    }
  };
  
  return (
    <div className="preferences-panel">
      <div className="preferences-header">
        <h2>User Preferences</h2>
        <button className="close-button" onClick={onClose}>
          <span>×</span>
        </button>
      </div>
      
      <div className="preferences-tabs">
        <button 
          className={`tab-button ${activeTab === 'theme' ? 'active' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          Theme
        </button>
        <button 
          className={`tab-button ${activeTab === 'panels' ? 'active' : ''}`}
          onClick={() => setActiveTab('panels')}
        >
          Panels
        </button>
        <button 
          className={`tab-button ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          Layout
        </button>
        <button 
          className={`tab-button ${activeTab === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          Filters
        </button>
      </div>
      
      <div className="preferences-content">
        {renderTabContent()}
      </div>
      
      <div className="preferences-footer">
        <button className="reset-button" onClick={resetPreferences}>
          Reset to Defaults
        </button>
        <button className="primary-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}; 
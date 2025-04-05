import React from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { HexColorPicker } from 'react-colorful';
import './ThemeSettings.css';

export const ThemeSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();
  const { colorMode, mapStyle, accentColor, fontSize } = preferences.theme;
  
  // Handle color mode change
  const handleColorModeChange = (mode: 'light' | 'dark' | 'system') => {
    updatePreference('theme', 'colorMode', mode);
  };
  
  // Handle map style change
  const handleMapStyleChange = (style: 'standard' | 'satellite' | 'terrain') => {
    updatePreference('theme', 'mapStyle', style);
  };
  
  // Handle accent color change
  const handleAccentColorChange = (color: string) => {
    updatePreference('theme', 'accentColor', color);
  };
  
  // Handle font size change
  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updatePreference('theme', 'fontSize', size);
  };
  
  return (
    <div className="theme-settings">
      <div className="settings-section">
        <h3>Color Mode</h3>
        <div className="button-group">
          <button 
            className={`mode-button ${colorMode === 'light' ? 'active' : ''}`}
            onClick={() => handleColorModeChange('light')}
          >
            Light
          </button>
          <button 
            className={`mode-button ${colorMode === 'dark' ? 'active' : ''}`}
            onClick={() => handleColorModeChange('dark')}
          >
            Dark
          </button>
          <button 
            className={`mode-button ${colorMode === 'system' ? 'active' : ''}`}
            onClick={() => handleColorModeChange('system')}
          >
            System
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Map Style</h3>
        <div className="button-group">
          <button 
            className={`style-button ${mapStyle === 'standard' ? 'active' : ''}`}
            onClick={() => handleMapStyleChange('standard')}
          >
            Standard
          </button>
          <button 
            className={`style-button ${mapStyle === 'satellite' ? 'active' : ''}`}
            onClick={() => handleMapStyleChange('satellite')}
          >
            Satellite
          </button>
          <button 
            className={`style-button ${mapStyle === 'terrain' ? 'active' : ''}`}
            onClick={() => handleMapStyleChange('terrain')}
          >
            Terrain
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Accent Color</h3>
        <div className="color-picker-container">
          <HexColorPicker color={accentColor} onChange={handleAccentColorChange} />
          <div className="color-preview" style={{ backgroundColor: accentColor }}>
            <span>{accentColor}</span>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Font Size</h3>
        <div className="button-group">
          <button 
            className={`size-button ${fontSize === 'small' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('small')}
          >
            Small
          </button>
          <button 
            className={`size-button ${fontSize === 'medium' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('medium')}
          >
            Medium
          </button>
          <button 
            className={`size-button ${fontSize === 'large' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('large')}
          >
            Large
          </button>
        </div>
      </div>
    </div>
  );
}; 
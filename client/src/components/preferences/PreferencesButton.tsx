import React, { useState } from 'react';
import { PreferencesPanel } from './PreferencesPanel';
import { createPortal } from 'react-dom';
import './PreferencesButton.css';

export const PreferencesButton: React.FC = () => {
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  
  const togglePreferences = () => {
    setShowPreferences(prev => !prev);
  };
  
  return (
    <>
      <button 
        className="preferences-button"
        onClick={togglePreferences}
        aria-label="Open preferences"
      >
        <span className="gear-icon"></span>
      </button>
      
      {showPreferences && createPortal(
        <div className="preferences-overlay">
          <PreferencesPanel onClose={() => setShowPreferences(false)} />
        </div>,
        document.body
      )}
    </>
  );
}; 
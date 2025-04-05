import React from 'react';
import './PropertyPanel.css';

interface PropertyPanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // This is a placeholder component
  // Actual property data visualization will be added in a later chunk
  
  return (
    <div className="property-panel" data-testid={`property-panel-${panelId}`}>
      <div className="property-placeholder">
        <h3>Property Panel</h3>
        <p>Property data visualization will be implemented in a later chunk.</p>
      </div>
    </div>
  );
}; 
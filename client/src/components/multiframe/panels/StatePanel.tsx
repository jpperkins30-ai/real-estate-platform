import React from 'react';
import './StatePanel.css';

interface StatePanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const StatePanel: React.FC<StatePanelProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // This is a placeholder component
  // Actual state data visualization will be added in a later chunk
  
  return (
    <div className="state-panel" data-testid={`state-panel-${panelId}`}>
      <div className="state-placeholder">
        <h3>State Panel</h3>
        <p>State data visualization will be implemented in a later chunk.</p>
      </div>
    </div>
  );
}; 
import React from 'react';
import './StatsPanel.css';

interface StatsPanelProps {
  panelId: string;
  initialState?: any;
  onStateChange?: (newState: any) => void;
  onAction?: (action: any) => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  panelId,
  initialState = {},
  onStateChange,
  onAction
}) => {
  // This is a placeholder component
  // Actual stats implementation will be added in a later chunk
  
  return (
    <div className="stats-panel" data-testid={`stats-panel-${panelId}`}>
      <div className="stats-placeholder">
        <h3>Stats Panel</h3>
        <p>Statistics visualization will be added in a later chunk.</p>
      </div>
    </div>
  );
}; 
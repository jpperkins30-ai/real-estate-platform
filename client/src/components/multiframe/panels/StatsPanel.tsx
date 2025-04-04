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
  // Actual stats panel implementation will be added in a later stage
  
  return (
    <div className="stats-panel" data-testid={`stats-panel-${panelId}`}>
      <div className="stats-placeholder">
        <h3>Statistics Panel</h3>
        <p>Property statistics and analytics will be implemented in a later stage.</p>
      </div>
    </div>
  );
}; 